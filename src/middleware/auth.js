import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import AppError from "../utils/AppError.js";

// Attaches req.admin when a valid Bearer token is present, but never rejects the request.
// Lets public endpoints serve extra data (e.g. private projects) to the logged-in admin panel.
export const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
      const admin = await Admin.findById(decoded.id);
      if (admin) req.admin = admin;
    }
  } catch {
    // Invalid/expired token on a public route: treat as anonymous.
  }
  next();
};

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new AppError("Not authorized, no token provided", 401);
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      throw new AppError("Not authorized, admin no longer exists", 401);
    }

    req.admin = admin;
    next();
  } catch (err) {
    next(err);
  }
};
