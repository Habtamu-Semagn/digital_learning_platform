export const validateBookFields = (req, res, next) => {
  const { title, author, language } = req.body;
  if (!title || !author || !language) {
    return res
      .status(400)
      .json({ status: "fail", message: "Missing required fields" });
  }
  next();
};
