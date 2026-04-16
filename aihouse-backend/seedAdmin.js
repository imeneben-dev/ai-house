const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = "mongodb+srv://abdellahben965_db_user:aihouse123@cluster0.vgehfjl.mongodb.net/?appName=Cluster0";

async function createFirstAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    const adminExists = await User.findOne({ email: "admin@univ-blida.dz" });
    if (adminExists) {
      console.log("Admin account already exists in the database!");
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("SecurePassword123!", salt);

    await User.create({
      fullName: "Admin User",
      email: "admin@univ-blida.dz",
      department: "Administration",
      password: hashedPassword,
      role: "admin",
      title: "System Administrator",
      focus: "Platform Management",
      bio: "Lead administrator for the AI House Blida 1 platform."
    });

    console.log("SUCCESS: The first Admin account has been securely created!");
    process.exit();

  } catch (error) {
    console.error("Failed to create admin:", error);
    process.exit(1);
  }
}

createFirstAdmin();