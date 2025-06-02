const asyncWrapper = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next); // ✅ đã truyền đủ 3 tham số
    } catch (error) {
      next(error);
    }
  };
};

module.exports = asyncWrapper;
