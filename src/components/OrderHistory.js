import React, { useState, useEffect } from 'react';
import './OrderHistory.css';
import { orderAPI } from '../services/api';

const OrderHistory = ({ onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await orderAPI.getAllOrders();
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load order history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Placed': '📋',
      'Confirmed': '✅',
      'Preparing': '👨‍🍳',
      'Ready': '🍽️',
      'Out for Delivery': '🚚',
      'Delivered': '✨',
      'Cancelled': '❌'
    };
    return icons[status] || '📋';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Placed': '#3498db',
      'Confirmed': '#27ae60',
      'Preparing': '#f39c12',
      'Ready': '#9b59b6',
      'Out for Delivery': '#e67e22',
      'Delivered': '#2ecc71',
      'Cancelled': '#e74c3c'
    };
    return colors[status] || '#3498db';
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedOrder) {
          setSelectedOrder(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, selectedOrder]);

  const OrderDetails = ({ order }) => (
    <div className="order-details-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedOrder(null)}>
      <div className="order-details-modal">
        <div className="order-details-header">
          <h3>📋 Order Details</h3>
          <button 
            className="close-details-btn" 
            onClick={() => setSelectedOrder(null)}
          >
            ×
          </button>
        </div>
        
        <div className="order-details-content">
          <div className="order-info-grid">
            <div className="order-info-item">
              <span className="info-label">Order ID:</span>
              <span className="info-value">{order._id}</span>
            </div>
            <div className="order-info-item">
              <span className="info-label">Status:</span>
              <span className="info-value status" style={{ color: getStatusColor(order.orderStatus) }}>
                {getStatusIcon(order.orderStatus)} {order.orderStatus}
              </span>
            </div>
            <div className="order-info-item">
              <span className="info-label">Order Date:</span>
              <span className="info-value">{formatDate(order.createdAt)}</span>
            </div>
            <div className="order-info-item">
              <span className="info-label">Delivery Time:</span>
              <span className="info-value">{formatDate(order.deliveryTime)}</span>
            </div>
            <div className="order-info-item">
              <span className="info-label">Total Amount:</span>
              <span className="info-value total">Rs. {order.totalAmount}</span>
            </div>
            <div className="order-info-item">
              <span className="info-label">Number of Persons:</span>
              <span className="info-value">{order.numberOfPersons}</span>
            </div>
          </div>

          {order.customerInfo && (
            <div className="customer-section">
              <h4>👤 Customer Information</h4>
              <div className="customer-info">
                <p><strong>Name:</strong> {order.customerInfo.name}</p>
                <p><strong>Email:</strong> {order.customerInfo.email}</p>
                <p><strong>Phone:</strong> {order.customerInfo.phone}</p>
              </div>
            </div>
          )}

          <div className="delivery-section">
            <h4>🚚 Delivery Address</h4>
            <p className="delivery-address">{order.deliveryAddress}</p>
          </div>

          <div className="items-section">
            <h4>🍽️ Ordered Items</h4>
            <div className="order-items-list">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-details">
                    <h5>{item.food?.name || 'Unknown Item'}</h5>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: Rs. {item.price} each</p>
                  </div>
                  <div className="item-total">
                    Rs. {item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="order-history-overlay" onClick={handleOverlayClick}>
        <div className="order-history-container">
          <div className="order-history-header">
            <h2>📋 Order History</h2>
            <button className="close-history-btn" onClick={onClose}>×</button>
          </div>

          {loading && (
            <div className="loading-container">
              <div className="loading-spinner-large"></div>
              <p>Loading order history...</p>
            </div>
          )}

          {error && (
            <div className="error-container">
              <p>{error}</p>
              <button onClick={fetchOrders} className="retry-btn">
                🔄 Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="orders-content">
              {orders.length === 0 ? (
                <div className="no-orders">
                  <div className="no-orders-icon">🛒</div>
                  <h3>No Orders Yet</h3>
                  <p>You haven't placed any orders yet. Start browsing our delicious food items!</p>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map(order => (
                    <div 
                      key={order._id} 
                      className="order-card"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="order-card-header">
                        <div className="order-id">
                          <strong>Order #{order._id.slice(-8)}</strong>
                        </div>
                        <div 
                          className="order-status"
                          style={{ color: getStatusColor(order.orderStatus) }}
                        >
                          {getStatusIcon(order.orderStatus)} {order.orderStatus}
                        </div>
                      </div>
                      
                      <div className="order-card-body">
                        <div className="order-summary">
                          <p className="order-date">📅 {formatDate(order.createdAt)}</p>
                          <p className="order-items">
                            🍽️ {order.items.length} item{order.items.length > 1 ? 's' : ''}
                          </p>
                          <p className="order-total">💰 Rs. {order.totalAmount}</p>
                        </div>
                        
                        <div className="order-preview">
                          <p className="delivery-time">
                            🚚 Delivery: {formatDate(order.deliveryTime)}
                          </p>
                          {order.customerInfo && (
                            <p className="customer-name">
                              👤 {order.customerInfo.name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="order-card-footer">
                        <span className="view-details">👁️ Click to view details</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedOrder && <OrderDetails order={selectedOrder} />}
    </>
  );
};

export default OrderHistory; 