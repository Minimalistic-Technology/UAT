import { Request, Response } from "express";
import Testimonial from "../models/testimonial";


// Create
export const createTestimonial = async (req: Request, res: Response) => {
  try {
    const newTestimonial = new Testimonial(req.body);
    await newTestimonial.save();
    res.status(201).json(newTestimonial);
  } catch (error) {
    res.status(500).json({ error: "Failed to create testimonial" });
  }
};

// Read All
export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const all = await Testimonial.find();
    res.json(all);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
};

// Update
export const updateTestimonial = async (req: Request, res: Response) => {
  try {
    const updated = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update testimonial" });
  }
};

// Delete
export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete testimonial" });
  }
};
