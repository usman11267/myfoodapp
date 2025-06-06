import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import FoodCard from './components/FoodCard';
import OrderForm from './components/OrderForm';
import LoadingPage from './components/LoadingPage';
import AddFoodForm from './components/AddFoodForm';
import OrderHistory from './components/OrderHistory';
import RemoveFoods from './components/RemoveFoods';
import { foodAPI } from './services/api';

function App() {
  const [foodItems, setFoodItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showRemoveFoods, setShowRemoveFoods] = useState(false);

  // Fetch food items from backend
  const fetchFoodItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await foodAPI.getAllFoods();
      // Backend returns { success: true, count: X, foods: [...] }
      setFoodItems(response.data.foods || response.data);
    } catch (error) {
      console.error('Error fetching food items:', error);
      setError('Failed to load food items. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load food items on component mount
  useEffect(() => {
    fetchFoodItems();
  }, [fetchFoodItems]);

  // Memoized cart quantities
  const cartQuantities = useMemo(() => {
    const quantities = {};
    cartItems.forEach(item => {
      quantities[item.food._id] = item.quantity;
    });
    return quantities;
  }, [cartItems]);

  // Add item to cart
  const handleAddToCart = useCallback((food) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.food._id === food._id);
      if (existingItem) {
        return prevItems.map(item =>
          item.food._id === food._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { food, quantity: 1 }];
      }
    });
  }, []);

  // Remove item from cart
  const handleRemoveFromCart = useCallback((foodId) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.food._id === foodId);
      if (existingItem && existingItem.quantity > 1) {
        return prevItems.map(item =>
          item.food._id === foodId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prevItems.filter(item => item.food._id !== foodId);
      }
    });
  }, []);

  // Update item quantity
  const handleUpdateQuantity = useCallback((foodId, quantity) => {
    if (quantity <= 0) {
      setCartItems(prevItems => prevItems.filter(item => item.food._id !== foodId));
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.food._id === foodId
            ? { ...item, quantity }
            : item
        )
      );
    }
  }, []);

  // Clear cart after successful order
  const handleOrderSuccess = useCallback(() => {
    setCartItems([]);
  }, []);

  // Handle successful food addition
  const handleFoodAdded = useCallback(() => {
    setShowAddForm(false);
    fetchFoodItems(); // Refresh the food list
  }, [fetchFoodItems]);

  // Handle successful food removal
  const handleFoodRemoved = useCallback((removedFoodId) => {
    // Remove from food items
    setFoodItems(prevItems => prevItems.filter(item => item._id !== removedFoodId));
    // Also remove from cart if it exists there
    setCartItems(prevCart => prevCart.filter(item => item.food._id !== removedFoodId));
  }, []);

  // Show loading page
  if (loading) {
    return <LoadingPage />;
  }

  // Show error state
  if (error) {
    return (
      <div className="App">
        <div className="error-container">
          <h2>⚠️ Connection Error</h2>
          <p>{error}</p>
          <button onClick={fetchFoodItems} className="retry-button">
            🔄 Retry
          </button>
          <div className="error-help">
            <p>Make sure to:</p>
            <ul>
              <li>Start MongoDB service</li>
              <li>Run the backend server: <code>cd myfoodapp-backend && npm start</code></li>
              <li>Check if backend is running on port 3001</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>🍽️ HomeCook</h1>
        <p>Delicious homemade food delivered to your door</p>
        <div className="header-buttons">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="add-food-button"
          >
            {showAddForm ? '❌ Cancel' : '➕ Add Food'}
          </button>
          <button 
            onClick={() => setShowOrderHistory(!showOrderHistory)}
            className="order-history-button"
          >
            📋 Order History
          </button>
          <button 
            onClick={() => setShowRemoveFoods(!showRemoveFoods)}
            className="remove-foods-button"
          >
            🗑️ Remove Foods
          </button>
          <div className="cart-summary">
            🛒 Cart: {cartItems.length} items
          </div>
        </div>
      </header>

      {showAddForm && (
        <AddFoodForm 
          onFoodAdded={handleFoodAdded}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {showOrderHistory && (
        <OrderHistory 
          onClose={() => setShowOrderHistory(false)}
        />
      )}

      {showRemoveFoods && (
        <RemoveFoods 
          onClose={() => setShowRemoveFoods(false)}
          onFoodRemoved={handleFoodRemoved}
        />
      )}

      <main className="main-content">
        {foodItems.length === 0 ? (
          <div className="empty-state">
            <h3>No food items available</h3>
            <p>Be the first to add some delicious food!</p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="add-first-food-button"
            >
              ➕ Add First Food Item
            </button>
          </div>
        ) : (
          <div className="food-list">
            {foodItems.map(food => (
              <FoodCard 
                key={food._id} 
                food={food} 
                onAdd={handleAddToCart}
                onRemove={handleRemoveFromCart}
                quantity={cartQuantities[food._id] || 0}
              />
            ))}
          </div>
        )}

        {cartItems.length > 0 && (
          <OrderForm 
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onOrderSuccess={handleOrderSuccess}
          />
        )}
      </main>
    </div>
  );
}

export default App;