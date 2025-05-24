import React, { useState } from 'react';
import './App.css';
import FoodCard from './components/FoodCard';
import OrderForm from './components/OrderForm';

const foodItems = [
  {
    id: 1,
    name: 'HomeStyle Chicken Biryani',
    price: 300,
    serves: 1,
    image: '/images/biryani.jpg',
  },
  {
    id: 2,
    name: 'Traditional Beef Karahi',
    price: 800,
    serves: 2,
    image: '/images/karahi.jpg',
  },
  {
    id: 3,
    name: 'Vegetable Pulao',
    price: 250,
    serves: 1,
    image: '/images/pulao.jpg',
  },
];

function App() {
  const [selectedFood, setSelectedFood] = useState(null);

  const handleAddToOrder = (item) => {
    setSelectedFood(item);
  };

  return (
    <div className="App">
      <h1>HomeCook</h1>
      <div className="food-list">
        {foodItems.map(food => (
          <FoodCard key={food.id} food={food} onAdd={handleAddToOrder} />
        ))}
      </div>
      <OrderForm selectedFood={selectedFood} />
    </div>
  );
}

export default App;