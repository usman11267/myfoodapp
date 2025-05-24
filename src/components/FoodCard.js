import React from 'react';
import './FoodCard.css';

function FoodCard({ food, onAdd }) {
  return (
    <div className="food-card">
      <img src={food.image} alt={food.name} />
      <h3>{food.name}</h3>
      <p>Rs: {food.price}</p>
      <p>Serves: {food.serves}</p>
      <button onClick={() => onAdd(food)}>Add to Order</button>
    </div>
  );
}

export default FoodCard;