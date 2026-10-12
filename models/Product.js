const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  cropName: { type: String, required: true },       
  packedVariety: { type: String, required: true },  
  packedLotNumber: { type: String, required: true },
  dateOfTesting: { type: String, required: true },
  dateOfPackaging: { type: String, required: true },
  dateOfExpiry: { type: String, required: true },
  mrp: { type: String, required: true },            
  unitSalePrice: { type: String, required: true },  
  netQty: { type: String, required: true },         
  packedAt: { type: String, required: true },       
  plantAddress: { type: String, required: true },   
  producedBy: { type: String, required: true },     
  leafletUrl: { type: String, required: true },
  
  // ADDED: Stores "100001 - 100500"
  labelRange: { type: String, default: "N/A" },

  quantity: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);