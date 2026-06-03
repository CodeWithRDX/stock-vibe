/**
 * Validates request components against a Zod schema.
 * 
 * @param {object} schemas - Object containing schemas for body, query, or params
 * @returns {function} Express middleware function
 */
export const validate = (schemas) => {
  return async (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      next(error); // Passes Zod validation error to errorHandler
    }
  };
};
