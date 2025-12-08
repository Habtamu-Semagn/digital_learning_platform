export const validateBookFields = (req, res, next) => {
  const { title } = req.body;
  if (!title) {
    return res
      .status(400)
      .json({ status: "fail", message: "Title is required" });
  }
  next();
};
