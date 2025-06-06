import React, { useState, useEffect } from 'react';
import './OrderForm.css';
import { orderAPI } from '../services/api';

function OrderForm({ cartItems, onUpdateQuantity, onOrderSuccess }) {
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate total price
  const totalPrice = cartItems.reduce((total, item) => {
    return total + (item.food.price * item.quantity);
  }, 0);

  // Generate time slots (9 AM to 10 PM, 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 22 && minute > 0) break; // Don't go past 10:00 PM
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        slots.push({ value: timeString, label: displayTime });
      }
    }
    return slots;
  };

  // Set minimum delivery date (5 hours from now)
  useEffect(() => {
    const now = new Date();
    const minimumDeliveryTime = new Date(now.getTime() + 5 * 60 * 60 * 1000); // 5 hours from now
    
    // Set minimum date
    const minDate = minimumDeliveryTime.toISOString().split('T')[0];
    setDeliveryDate(minDate);
    
    // Generate time slots
    setTimeSlots(generateTimeSlots());
  }, []);

  const handleInputChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error when user starts typing
  };

  const validateDeliveryTime = (date, time) => {
    const now = new Date();
    const selectedDateTime = new Date(`${date}T${time}`);
    const minimumDateTime = new Date(now.getTime() + 5 * 60 * 60 * 1000);
    
    return selectedDateTime >= minimumDateTime;
  };

  const validateForm = () => {
    if (!customerInfo.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!customerInfo.email.trim() || !/\S+@\S+\.\S+/.test(customerInfo.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!customerInfo.phone.trim() || !/^\d{10,15}$/.test(customerInfo.phone.replace(/\D/g, ''))) {
      setError('Please enter a valid phone number');
      return false;
    }
    if (!customerInfo.address.trim()) {
      setError('Please enter your delivery address');
      return false;
    }
    if (!deliveryDate) {
      setError('Please select a delivery date');
      return false;
    }
    if (!deliveryTime) {
      setError('Please select a delivery time');
      return false;
    }
    if (!validateDeliveryTime(deliveryDate, deliveryTime)) {
      setError('Delivery time must be at least 5 hours from now');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Create proper datetime for local timezone
      const deliveryDateTime = new Date(`${deliveryDate}T${deliveryTime}:00`).toISOString();
      
      const orderData = {
        items: cartItems.map(item => ({
          foodId: item.food._id,
          quantity: item.quantity
        })),
        customerInfo: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone
        },
        deliveryAddress: customerInfo.address,
        deliveryTime: deliveryDateTime,
        numberOfPersons: cartItems.reduce((sum, item) => sum + item.quantity, 0)
      };

      const response = await orderAPI.createOrder(orderData);
      
      // Show success message
      const order = response.data.order || response.data;
      const formattedDeliveryTime = new Date(order.deliveryTime || deliveryDateTime).toLocaleString();
              alert(`🎉 Order placed successfully!\n\nOrder ID: ${order._id}\nCustomer: ${customerInfo.name}\nTotal: Rs. ${order.totalAmount || totalPrice}\nDelivery: ${formattedDeliveryTime}\n\nThank you for your order! You will receive updates on your phone.`);
      
      // Clear form and cart
      setCustomerInfo({ name: '', email: '', phone: '', address: '' });
      setDeliveryDate('');
      setDeliveryTime('');
      onOrderSuccess();
      
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="order-form">
      <h2>🛒 Order Summary</h2>
      
      {/* Cart Items */}
      <div className="cart-items">
        {cartItems.map(item => (
          <div key={item.food._id} className="cart-item">
            <div className="item-info">
              <h4>{item.food.name}</h4>
              <p>Rs. {item.food.price} × {item.quantity}</p>
            </div>
            <div className="item-controls">
              <button 
                onClick={() => onUpdateQuantity(item.food._id, item.quantity - 1)}
                className="qty-btn"
              >
                -
              </button>
              <span className="qty-display">{item.quantity}</span>
              <button 
                onClick={() => onUpdateQuantity(item.food._id, item.quantity + 1)}
                className="qty-btn"
              >
                +
              </button>
            </div>
            <div className="item-total">
              Rs. {item.food.price * item.quantity}
            </div>
          </div>
        ))}
      </div>

      <div className="order-total">
        <h3>Total: Rs. {totalPrice}</h3>
      </div>

      {/* Customer Information */}
      <div className="customer-info">
        <h3>📋 Customer Information</h3>
        <div className="form-row">
          <label>
            Full Name *
            <input 
              type="text" 
              value={customerInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
            />
          </label>
          <label>
            Email *
            <input 
              type="email" 
              value={customerInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Phone Number *
            <input 
              type="tel" 
              value={customerInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your phone number"
            />
          </label>
        </div>
        <label>
          Delivery Address *
          <textarea 
            value={customerInfo.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Enter your complete delivery address"
            rows="3"
          />
        </label>
      </div>

      {/* Delivery Information */}
      <div className="delivery-info">
        <h3>🚚 Delivery Information</h3>
        <p className="delivery-note">⏰ Minimum 5 hours advance booking required</p>
        <div className="form-row">
          <label>
            Delivery Date *
            <input 
              type="date" 
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              min={new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString().split('T')[0]}
            />
          </label>
          <label>
            Delivery Time *
            <select 
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
            >
              <option value="">Select time slot</option>
              {timeSlots.map(slot => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error && <div className="error-message">❌ {error}</div>}

      <button 
        onClick={handlePlaceOrder}
        className="place-order-btn"
        disabled={loading}
      >
        {loading ? '🔄 Placing Order...' : '🛍️ Place Order'}
      </button>
    </div>
  );
}

export default OrderForm;