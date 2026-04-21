const profile = (req, res) => {
  const profile = (req, res) => {
    res.status(200).json({
      success: true,
      message: "Authentication confirmed",
      data: {
        user: req.user,
      },
    });
  };
};
export { profile };
