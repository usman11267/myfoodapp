import React from 'react';
import './LoadingPage.css';

function LoadingPage() {
  return (
    <div className="loading-page">
      {/* Pulsing Background Effect */}
      <div className="pulse-bg"></div>
      
      {/* Floating Food Elements */}
      <div className="floating-elements">
        <div className="floating-food food-1">🍕</div>
        <div className="floating-food food-2">🍔</div>
        <div className="floating-food food-3">🌮</div>
        <div className="floating-food food-4">🍣</div>
        <div className="floating-food food-5">🍜</div>
        <div className="floating-food food-6">🧁</div>
      </div>

      <div className="loading-container">
        {/* Animated Chef Hat */}
        <div className="chef-hat">
          <div className="hat-top"></div>
          <div className="hat-band"></div>
        </div>

        {/* Food Spinner */}
        <div className="food-spinner">
          <div className="food-item pizza">🍕</div>
          <div className="food-item burger">🍔</div>
          <div className="food-item taco">🌮</div>
          <div className="food-item sushi">🍣</div>
          <div className="food-item curry">🍜</div>
          <div className="food-item dessert">🧁</div>
        </div>

        {/* Loading Text */}
        <div className="loading-text">
          <h2>HomeCook</h2>
          <p className="loading-message">
            Preparing your delicious experience
            <span className="loading-dots">
              <span className="dot1">.</span>
              <span className="dot2">.</span>
              <span className="dot3">.</span>
            </span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p className="progress-text">Loading fresh ingredients...</p>
        </div>
      </div>
    </div>
  );
}

export default LoadingPage; 