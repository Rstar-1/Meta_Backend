export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (typeof next === "function") {
      next(err);
    } else {
      console.error("❌ Handled Async Error:", err);
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
      });
    }
  });
};