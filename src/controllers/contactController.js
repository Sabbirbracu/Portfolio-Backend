import Contact from "../models/Contact.js";
import AppError from "../utils/AppError.js";

// POST /api/contact (public)
export const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    const contact = await Contact.create({ name, email, subject, message });
    res.status(201).json({
      success: true,
      message: "Message sent successfully. I'll get back to you soon!",
      data: { id: contact.id },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/contact (protected)
export const getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, message: "Messages fetched", data: contacts });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/contact/:id/status (protected)
export const updateContactStatus = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!contact) throw new AppError("Message not found", 404);
    res.json({ success: true, message: "Status updated", data: contact });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/contact/:id (protected)
export const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) throw new AppError("Message not found", 404);
    res.json({ success: true, message: "Message deleted", data: null });
  } catch (err) {
    next(err);
  }
};
