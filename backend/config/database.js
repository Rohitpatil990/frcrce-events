/**
 * Database Configuration
 * Establishes connection to MongoDB
 */

const mongoose = require('mongoose');

let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI)
      .then((conn) => {
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database Name: ${conn.connection.name}`);
        return conn.connection;
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
};

module.exports = connectDB;
