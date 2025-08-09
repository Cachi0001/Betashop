const cloudinary = require('../config/cloudinary.config');

const uploadImage = async (file, folder = 'products') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      transformation: [
        { width: 800, height: 800, crop: 'fill' },
        { quality: 'auto' },
        { format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

const uploadMultipleImages = async (files, folder = 'products') => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    throw new Error(`Multiple image upload failed: ${error.message}`);
  }
};

const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

const upload3DModel = async (file, folder = '3d-models') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: 'raw', // For non-image files
      format: 'gltf'
    });

    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    throw new Error(`3D model upload failed: ${error.message}`);
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  upload3DModel
};

