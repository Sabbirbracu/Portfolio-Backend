import crypto from "crypto";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import AppError from "../utils/AppError.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// POST /api/admin/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!admin || !(await admin.comparePassword(password))) {
      throw new AppError("Invalid email or password", 401);
    }

    admin.lastLogin = new Date();
    await admin.save();

    // Response shape matches AuthResponse in the frontend apiSlice
    res.json({
      success: true,
      message: "Login successful",
      data: {
        token: signToken(admin._id),
        admin: {
          id: admin._id.toString(),
          email: admin.email,
          name: admin.name,
          role: admin.role,
          lastLogin: admin.lastLogin.toISOString(),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/verify (protected)
export const verifyToken = async (req, res) => {
  // Frontend expects { valid, admin } at the top level
  res.json({
    valid: true,
    admin: {
      id: req.admin._id.toString(),
      email: req.admin.email,
      name: req.admin.name,
      role: req.admin.role,
      lastLogin: req.admin.lastLogin?.toISOString(),
    },
  });
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new AppError("Email is required", 400);
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (admin) {
      const rawToken = admin.createResetToken();
      await admin.save();

      // No mail service wired up yet — log the reset link so it can be used manually.
      // Swap this for an email send (Resend, Nodemailer, etc.) before production.
      const resetUrl = `${process.env.CLIENT_URL || "http://localhost:8080"}/admin/reset-password?token=${rawToken}`;
      console.log(`Password reset link for ${admin.email}: ${resetUrl}`);
    }

    // Always the same response, so emails can't be enumerated
    res.json({
      success: true,
      message: "If an account exists for that email, a reset link has been sent",
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      throw new AppError("Token and new password are required", 400);
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!admin) {
      throw new AppError("Reset token is invalid or has expired", 400);
    }

    admin.password = password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    res.json({ success: true, message: "Password has been reset. You can now log in." });
  } catch (err) {
    next(err);
  }
};
