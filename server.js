// server.js
const serverless = require("serverless-http");
const mongoose = require("mongoose");
const app = require("./app");

// ==================================================
// 🔹 MONGODB CONNECTION (CACHED)
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectToMongoDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.mongo_uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// ==================================================
// 🔹 Vercel Serverless Handler
module.exports.handler = async (req, res) => {
  try {
    await connectToMongoDB(); // Ensure DB is connected
    return app(req, res); // Pass request to Express
  } catch (err) {
    console.error("DB Connection Error:", err);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};
