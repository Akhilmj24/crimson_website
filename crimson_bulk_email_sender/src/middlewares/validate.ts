// @ts-nocheck
import AppError from '../utils/AppError';

export default (validator) => {
  return (req, res, next) => {
    const { error } = validator(req.body);
    if (error) {
      return next(new AppError(error, 400));
    }
    next();
  };
};
