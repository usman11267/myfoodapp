import React, { useState, useEffect } from 'react';
import './RemoveFoods.css';
import { foodAPI } from '../services/api';

const RemoveFoods = ({ onClose, onFoodRemoved }) => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await foodAPI.getAllFoods();
      setFoods(response.data.foods || []);
    } catch (error) {
      console.error('Error fetching foods:', error);
      setError('Failed to load foods. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFood = async (foodId, foodName) => {
    try {
      setDeleting(foodId);
      await foodAPI.deleteFood(foodId);
      
      // Remove from local state
      setFoods(foods.filter(food => food._id !== foodId));
      setShowConfirm(null);
      
      // Notify parent component
      if (onFoodRemoved) {
        onFoodRemoved(foodId);
      }
      
      // Show success message
      alert(`✅ "${foodName}" has been removed successfully!`);
    } catch (error) {
      console.error('Error deleting food:', error);
      alert(`❌ Failed to remove "${foodName}". Please try again.`);
    } finally {
      setDeleting(null);
    }
  };

  const confirmDelete = (food) => {
    setShowConfirm(food);
  };

  const cancelDelete = () => {
    setShowConfirm(null);
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
        if (showConfirm) {
          setShowConfirm(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showConfirm]);

  const ConfirmDialog = ({ food }) => (
    <div className="confirm-overlay" onClick={(e) => e.target === e.currentTarget && cancelDelete()}>
      <div className="confirm-dialog">
        <div className="confirm-header">
          <h3>🗑️ Confirm Deletion</h3>
        </div>
        <div className="confirm-content">
          <div className="food-preview">
            {food.image && (
              <img src={food.image} alt={food.name} className="preview-image" />
            )}
            <div className="preview-details">
              <h4>{food.name}</h4>
              <p>Rs. {food.price}</p>
              <p>Category: {food.category}</p>
            </div>
          </div>
          <p className="warning-text">
            ⚠️ Are you sure you want to delete "<strong>{food.name}</strong>"? 
            This action cannot be undone.
          </p>
        </div>
        <div className="confirm-actions">
          <button 
            className="cancel-btn" 
            onClick={cancelDelete}
            disabled={deleting === food._id}
          >
            Cancel
          </button>
          <button 
            className="delete-btn" 
            onClick={() => handleDeleteFood(food._id, food.name)}
            disabled={deleting === food._id}
          >
            {deleting === food._id ? (
              <>
                <span className="loading-spinner"></span>
                Deleting...
              </>
            ) : (
              <>🗑️ Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="remove-foods-overlay" onClick={handleOverlayClick}>
        <div className="remove-foods-container">
          <div className="remove-foods-header">
            <h2>🗑️ Remove Foods</h2>
            <button className="close-remove-btn" onClick={onClose}>×</button>
          </div>

          {loading && (
            <div className="loading-container">
              <div className="loading-spinner-large"></div>
              <p>Loading foods...</p>
            </div>
          )}

          {error && (
            <div className="error-container">
              <p>{error}</p>
              <button onClick={fetchFoods} className="retry-btn">
                🔄 Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="remove-foods-content">
              {foods.length === 0 ? (
                <div className="no-foods">
                  <div className="no-foods-icon">🍽️</div>
                  <h3>No Foods Available</h3>
                  <p>There are no food items to remove. Add some foods first!</p>
                </div>
              ) : (
                <>
                  <div className="foods-count">
                    <p>📊 Total Foods: <strong>{foods.length}</strong></p>
                  </div>
                  <div className="foods-grid">
                    {foods.map(food => (
                      <div key={food._id} className="food-remove-card">
                        <div className="food-image-container">
                          {food.image ? (
                            <img src={food.image} alt={food.name} className="food-image" />
                          ) : (
                            <div className="no-image">
                              <span>📷</span>
                              <p>No Image</p>
                            </div>
                          )}
                          {!food.isAvailable && (
                            <div className="unavailable-badge">Unavailable</div>
                          )}
                        </div>
                        
                        <div className="food-details">
                          <h3>{food.name}</h3>
                          <p className="food-price">Rs. {food.price}</p>
                          <p className="food-category">{food.category}</p>
                          <p className="food-serves">Serves {food.serves} person{food.serves > 1 ? 's' : ''}</p>
                          {food.description && (
                            <p className="food-description">{food.description}</p>
                          )}
                        </div>

                        <div className="food-actions">
                          <button 
                            className="delete-food-btn"
                            onClick={() => confirmDelete(food)}
                            disabled={deleting === food._id}
                          >
                            {deleting === food._id ? (
                              <>
                                <span className="loading-spinner"></span>
                                Deleting...
                              </>
                            ) : (
                              <>🗑️ Remove</>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showConfirm && <ConfirmDialog food={showConfirm} />}
    </>
  );
};

export default RemoveFoods; 