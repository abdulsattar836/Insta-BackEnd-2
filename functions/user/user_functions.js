// successMessage
const { successMessage } = require("../success/success_functions");
// appError
const AppError = require("../../utils/appError");
// catchAsync
const catchAsync = require("../../utils/catchAsync");

// method POST
// route /api/v1/user/logout:
// @desciption for  logout user
const logout = (model) =>
  catchAsync(async (req, res, next) => {
    // Get refresh token from cookies
    let refreshToken = req.cookies.refreshToken;

    // If not in cookies, fallback to Authorization header
    if (!refreshToken && req.headers.authorization) {
      const authHeader = req.headers.authorization.split(" ");
      if (authHeader[0] === "Bearer") refreshToken = authHeader[1];
    }

    if (!refreshToken) {
      return next(new AppError("Refresh token is required", 400));
    }

    // Find user with this refresh token
    const user = await model.findOne({ refreshToken });
    if (!user) {
      return next(new AppError("You are not logged in", 400));
    }

    // Remove the refresh token from the array
    await model.updateOne(
      { _id: user._id },
      { $pull: { refreshToken: refreshToken } },
    );

    // Clear cookies if using cookies
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return successMessage(200, res, "Logout successful", null);
  });

module.exports = {
  logout,
};
