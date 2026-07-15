import "dotenv/config";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";

// Creates (or resets) the admin account from env vars.
// Usage: npm run seed
const seed = async () => {
  const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
  }
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env to seed the admin account");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  const existing = await Admin.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    existing.password = ADMIN_PASSWORD;
    existing.name = ADMIN_NAME || existing.name;
    await existing.save();
    console.log(`Admin already existed — password updated for ${existing.email}`);
  } else {
    const admin = await Admin.create({
      name: ADMIN_NAME || "Admin",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    console.log(`Admin created: ${admin.email}`);
  }

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
