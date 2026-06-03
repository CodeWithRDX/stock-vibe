/**
 * Send standardized success response
 * 
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - User-friendly message
 * @param {object|array|null} data - Payload data
 */
export const sendSuccess = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send standardized error response
 * 
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error details message
 * @param {object|null} errors - Specific validation errors or details
 */
export const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};
