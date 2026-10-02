require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../backend/models/User');

async function createAdmin() {
  const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!MONGODB_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Set MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD before running this script.');
  }
  if (ADMIN_PASSWORD.length < 12) {
    throw new Error('ADMIN_PASSWORD must contain at least 12 characters.');
  }
  if (/admin123|password|change_me/i.test(ADMIN_PASSWORD)) {
    throw new Error('ADMIN_PASSWORD must not be a common or placeholder password.');
  }

  await mongoose.connect(MONGODB_URI);
  try {
    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      throw new Error(`An account already exists for ${ADMIN_EMAIL}; no changes were made.`);
    }

    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      isActive: true
    });
    console.log(`Created administrator account for ${ADMIN_EMAIL}.`);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin().catch((error) => {
  console.error(`Administrator setup failed: ${error.message}`);
  process.exitCode = 1;
});
