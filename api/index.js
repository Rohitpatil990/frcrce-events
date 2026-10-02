const app = require('../server');
const connectDB = require('../backend/config/database');

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error(`Vercel request could not connect to MongoDB: ${error.message}`);
    return res.status(503).json({
      success: false,
      message: 'Database is not available'
    });
  }
};
