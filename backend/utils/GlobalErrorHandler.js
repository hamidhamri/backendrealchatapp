export const GlobalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  if (!err.isOperational) {
    res.json({
      status: err.status,
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
    });
    console.log(err);
  }
  res.status(err.statusCode || 500).json({
    status: err.status,
    message: err.message,
  });
};
