const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'eduflow',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary
 * @param {string} imageData - Base64 encoded image data
 * @param {string} folder - Folder to upload to (e.g., 'courses', 'users')
 * @param {string} [publicId] - Optional public ID for the image
 * @returns {Promise<Object>} - Upload result with URL and public ID
 */
exports.uploadImage = async (imageData, folder, publicId = '') => {
  try {
    // Handle base64 data
    if (imageData.startsWith('data:image')) {
      const uploadOptions = {
        folder: `eduflow/${folder}`,
        resource_type: 'image',
        overwrite: true,
        transformation: [
          { width: 1200, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      };
      
      // Add public ID if provided
      if (publicId) {
        uploadOptions.public_id = publicId;
      }
      
      const result = await cloudinary.uploader.upload(imageData, uploadOptions);
      
      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } else {
      throw new Error('Invalid image format. Must be base64 encoded data URL.');
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<Object>} - Deletion result
 */
exports.deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('Public ID is required for deletion');
    }
    
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

/**
 * Create signed upload URL for direct frontend uploads
 * @param {Object} options - Options for the signed URL
 * @param {string} options.folder - Folder to upload to
 * @param {number} [options.maxFileSize] - Maximum file size in bytes
 * @param {string[]} [options.allowedFormats] - Array of allowed formats
 * @returns {Object} - Signature data for frontend upload
 */
exports.getSignedUploadParams = (options) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  const params = {
    timestamp,
    folder: `eduflow/${options.folder}`,
    api_key: cloudinary.config().api_key
  };
  
  if (options.maxFileSize) {
    params.max_file_size = options.maxFileSize;
  }
  
  if (options.allowedFormats) {
    params.allowed_formats = options.allowedFormats.join(',');
  }
  
  // Generate signature
  const signature = cloudinary.utils.api_sign_request(params, cloudinary.config().api_secret);
  
  return {
    ...params,
    signature
  };
}; 