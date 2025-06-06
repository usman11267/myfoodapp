import React, { useState, useEffect } from 'react';
import './AddFoodForm.css';
import { foodAPI, uploadAPI } from '../services/api';

const AddFoodForm = ({ onFoodAdded, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    serves: '1',
    category: 'Other',
    isAvailable: true
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = ['Rice', 'Curry', 'Dessert', 'Bread', 'Appetizer', 'Other'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPG, PNG, GIF)');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return '/images/default-food.jpg';

    const uploadFormData = new FormData();
    uploadFormData.append('image', selectedFile);

    try {
      const response = await uploadAPI.uploadImage(uploadFormData);

      if (response.data.success) {
        return response.data.imagePath;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Food name is required');
      }
      if (!formData.price || formData.price <= 0) {
        throw new Error('Please enter a valid price');
      }
      if (!formData.serves || formData.serves <= 0) {
        throw new Error('Please enter valid serving size');
      }

      // Image validation with alert
      if (!selectedFile) {
        alert('📷 Please add an image for the food item!\n\n' +
              '🔹 Images help customers see what they\'re ordering\n' +
              '🔹 Make your food more appealing\n' +
              '🔹 Increase order likelihood\n\n' +
              'Click "Choose Image File" to add a photo.');
        return;
      }

      // Upload image first
      const imagePath = await uploadImage();

      // Prepare food data
      const foodData = {
        ...formData,
        price: parseFloat(formData.price),
        serves: parseInt(formData.serves),
        image: imagePath
      };

      // Create food item
      const response = await foodAPI.createFood(foodData);

      if (response.data.success) {
        setSuccess('Food item added successfully!');
        onFoodAdded(response.data.food);
        
        // Reset form after success
        setTimeout(() => {
          setFormData({
            name: '',
            price: '',
            serves: '1',
            category: 'Other',
            isAvailable: true
          });
          setSelectedFile(null);
          setImagePreview('');
          setSuccess('');
          onClose();
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to add food item');
      }
    } catch (error) {
      console.error('Error adding food:', error);
      setError(error.message || 'Failed to add food item. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="add-food-overlay" onClick={handleOverlayClick}>
      <div className="add-food-form">
        <div className="form-header">
          <h2>🍽️ Add New Food Item</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Food Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter food name"
                required
              />
            </div>

            <div className="form-group">
              <label>Price (Rs)*</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0"
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Serves (People)*</label>
              <input
                type="number"
                name="serves"
                value={formData.serves}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Category*</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Food Image</label>
            <div className="file-upload-container">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
              />
              <label 
                htmlFor="image-upload" 
                className={`file-upload-label ${selectedFile ? 'has-file' : ''}`}
              >
                {selectedFile ? (
                  <>
                    ✅ {selectedFile.name}
                  </>
                ) : (
                  <>
                    📷 Choose Image File
                  </>
                )}
              </label>
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button 
                    type="button" 
                    className="remove-image"
                    onClick={() => {
                      setSelectedFile(null);
                      setImagePreview('');
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <small>Supported formats: JPG, PNG, GIF (Max 5MB)</small>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleInputChange}
              />
              <span className="checkmark"></span>
              Available for orders
            </label>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              ❌ Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Adding...
                </>
              ) : (
                <>
                  ✨ Add Food Item
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFoodForm; 