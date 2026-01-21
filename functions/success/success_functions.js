  // for send simply success responses
  let successMessage = (statusCode, res, message, data) => {
      if (!res) {
        throw new TypeError("Response object (res) is required");
      }
        // if (!message) {
        //   throw new TypeError("Message is required");
        // }
    return res.status(statusCode).json({
      status: "success",
      data,
      message,
    });
  };


  module.exports = {
    successMessage,
  };
