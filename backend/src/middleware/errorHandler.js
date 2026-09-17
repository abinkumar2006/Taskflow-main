// Central error handler - keeps controllers free of try/catch boilerplate noise.
function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found - ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  // Handle common Postgres errors with friendlier messages
  let message = err.message || 'Server error';
  if (err.code === '23505') {
    message = 'A record with this value already exists';
    res.status(409);
  } else if (err.code === '23503') {
    message = 'Related record not found';
    res.status(400);
  } else if (!res.statusCode || res.statusCode === 200) {
    res.status(statusCode);
  }

  res.json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
