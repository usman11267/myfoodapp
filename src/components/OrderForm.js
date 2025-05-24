import React, { useState } from 'react';
import './OrderForm.css';

function OrderForm({ selectedFood }) {
  const [persons, setPersons] = useState(1);
  const [deliveryTime, setDeliveryTime] = useState('');
  const [address, setAddress] = useState('');

  const total = selectedFood ? (selectedFood.price * persons) : '0.00';

  const handleOrder = () => {
    alert(`Order placed for Rs: ${persons} person(s)\nTotal: Rs:${total}\nDelivery Time: ${deliveryTime}\nAddress: ${address}`);
  };

  if (!selectedFood) return null;

  return (
    <div className="order-form">
      <h2>Order Details</h2>
      <label>
        Number of Persons:
        <input type="number" min="1" value={persons} onChange={(e) => setPersons(e.target.value)} />
      </label>
      <label>
        Delivery Time:
        <input type="time" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} />
      </label>
      <label>
        Delivery Address:
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
      </label>
      <h3>Total Price: Rs:{total}</h3>
      <button onClick={handleOrder}>Place Order</button>
    </div>
  );
}

export default OrderForm;