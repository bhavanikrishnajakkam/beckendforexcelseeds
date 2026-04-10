const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  // The Basics
  cropName: { type: String, required: true },       // e.g., Paddy
  packedVariety: { type: String, required: true },  // e.g., S-911
  packedLotNumber: { type: String, required: true },// e.g., CH413J008

  // Dates
  dateOfTesting: { type: String, required: true },
  dateOfPackaging: { type: String, required: true },
  dateOfExpiry: { type: String, required: true },

  // Pricing and Weight
  mrp: { type: String, required: true },            // e.g., Rs 1620.00
  unitSalePrice: { type: String, required: true },  // e.g., Rs 162.00 per 1Kg
  netQty: { type: String, required: true },         // e.g., 10 Kg

  // Location and Manufacturer
  packedAt: { type: String, required: true },       // e.g., VR Agri Tech...
  plantAddress: { type: String, required: true },   // Full address
  producedBy: { type: String, required: true },     // e.g., Savannah Seeds Pvt Ltd.

  // The PDF link from Cloudinary
  leafletUrl: { type: String, required: true },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);