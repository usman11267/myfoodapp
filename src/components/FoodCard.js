import React from 'react';
import './FoodCard.css';

const FoodCard = React.memo(({ food, onAdd, onRemove, quantity = 0 }) => {
  // Handle image URL - support both local and uploaded images
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder.jpg';
    
    // If it's already a full URL or starts with /uploads/, use as is
    if (imagePath.startsWith('http') || imagePath.startsWith('/uploads/')) {
      return `http://localhost:3001${imagePath.startsWith('/uploads/') ? imagePath : ''}`;
    }
    
    // For local images in public/images
    return imagePath;
  };

  const imageUrl = getImageUrl(food.image);

  return (
    <div className="food-card">
      <div className="food-image-container">
        <img 
          src={imageUrl} 
          alt={food.name} 
          onError={(e) => {
            e.target.src = '/images/placeholder.jpg';
          }}
        />
        {!food.isAvailable && <div className="unavailable-overlay">Currently Unavailable</div>}
      </div>
      
      <div className="food-details">
        <h3>{food.name}</h3>
        <p className="food-price">Rs. {food.price}</p>
        <p className="food-serves">Serves: {food.serves}</p>
        {food.category && <span className="food-category">{food.category}</span>}
      </div>

      <div className="food-actions">
        {quantity === 0 ? (
          <button 
            onClick={() => onAdd(food)}
            className="add-button"
            disabled={!food.isAvailable}
          >
            {food.isAvailable ? '🛒 Add to Cart' : 'Unavailable'}
          </button>
        ) : (
          <div className="quantity-controls">
            <button 
              onClick={() => onRemove(food._id)}
              className="quantity-btn minus"
            >
              -
            </button>
            <span className="quantity-display">{quantity}</span>
            <button 
              onClick={() => onAdd(food)}
              className="quantity-btn plus"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default FoodCard;