/**
 * Creates non-production demo accounts without deleting existing data.
 * Run with ALLOW_DEMO_SEED=true in a development environment only.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./backend/models/User');

async function seedDatabase() {
  if (process.env.NODE_ENV === 'production' || process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error('Demo seeding is disabled. Set ALLOW_DEMO_SEED=true outside production to enable it.');
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required.');
  }

  const demoUsers = [
    { name: 'Admin User', email: 'admin@frcrce.ac.in', password: 'admin123', role: 'admin' },
    {
      name: 'Dr. Rajesh Kumar',
      email: 'faculty@frcrce.ac.in',
      password: 'faculty123',
      role: 'faculty',
      department: 'Electronics & Computer Science',
      phone: '9876543210'
    },
    {
      name: 'Prof. Priya Sharma',
      email: 'priya.sharma@frcrce.ac.in',
      password: 'faculty123',
      role: 'faculty',
      department: 'Electronics & Computer Science',
      phone: '9876543211'
    },
    ...[
      ['Rohit Patil', 'student@frcrce.ac.in', '2023001', 2, '9876543220'],
      ['Anurag Sharma', 'anurag.sharma@frcrce.ac.in', '2023002', 2, '9876543221'],
      ['Shahaan Tufail', 'shahaan.tufail@frcrce.ac.in', '2023003', 2, '9876543222'],
      ['Priya Shah', 'priya.shah@frcrce.ac.in', '2022101', 3, '9876543223'],
      ['Amit Verma', 'amit.verma@frcrce.ac.in', '2023004', 2, '9876543224']
    ].map(([name, email, rollNumber, year, phone]) => ({
      name,
      email,
      password: 'student123',
      role: 'student',
      department: 'Electronics & Computer Science',
      year,
      rollNumber,
      phone
    }))
  ];

  await mongoose.connect(process.env.MONGODB_URI);
  try {
    for (const demoUser of demoUsers) {
      const existingUser = await User.findOne({ email: demoUser.email });
      if (!existingUser) {
        await User.create(demoUser);
        console.log(`Created demo account: ${demoUser.email}`);
      } else {
        console.log(`Kept existing account unchanged: ${demoUser.email}`);
      }
    }
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase().catch((error) => {
  console.error(`Demo seeding failed: ${error.message}`);
  process.exitCode = 1;
});
