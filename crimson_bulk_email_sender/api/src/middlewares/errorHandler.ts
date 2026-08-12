// @ts-nocheck
import AppError from '../utils/AppError';

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production response (do not leak operational/programmatic error details)
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      console.error('ERROR 💥:', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong on the server'
      });
    }
  }
};
