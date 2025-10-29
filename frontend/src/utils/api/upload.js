import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Upload single image to Cloudinary via backend
export const uploadImage = async (file, token) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post(`${API_URL}/api/upload/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Upload multiple images to Cloudinary via backend
export const uploadMultipleImages = async (files, token) => {
  try {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images', file);
    });

    const response = await axios.post(`${API_URL}/api/upload/upload-multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId, token) => {
  try {
    const response = await axios.delete(`${API_URL}/api/upload/delete/${publicId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Get image info from Cloudinary
export const getImageInfo = async (publicId, token) => {
  try {
    const response = await axios.get(`${API_URL}/api/upload/info/${publicId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error getting image info:', error);
    throw error;
  }
};

export const uploadApi = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  getImageInfo,
};
