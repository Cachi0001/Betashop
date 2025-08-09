const cloudinary = require('../config/cloudinary.config');
const { Readable } = require('stream');

// Helper: upload from Multer memory buffer using Cloudinary upload_stream
const uploadFromBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    Readable.from(buffer).pipe(stream);
  });
};

const uploadImage = async (file, folder = 'products') => {
  try {
    const useBuffer = !!file.buffer; // Multer memory storage
    const options = {
      folder: folder,
      transformation: [
        { width: 800, height: 800, crop: 'fill' },
        { quality: 'auto' },
        { format: 'auto' }
      ]
    };

    const result = useBuffer
      ? await uploadFromBuffer(file.buffer, options)
      : await cloudinary.uploader.upload(file.path, options);

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
    const options = {
      folder: folder,
      resource_type: 'raw', // For non-image files
      format: 'gltf'
    };

    const result = file.buffer
      ? await uploadFromBuffer(file.buffer, options)
      : await cloudinary.uploader.upload(file.path, options);

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

