const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { nanoid } = require('nanoid');
const upload = require('./middleware/upload'); // Ensure this file exists
require('dotenv').config();
app.use(cors({
  origin: ['https://frontendforexcelseeds.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 2. Explicitly handle the preflight OPTIONS requests for all routes
app.options('*', cors());



const Product = require('./models/Product');
const Label = require('./models/Label');

const app = express();

app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("Database Connection Error:", err));

// --- API ROUTES ---
const User = require('./models/User');

// LOGIN ROUTE
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    // Note: For production, passwords should be hashed using bcrypt
    if (user && user.password === password) {
      res.json({ success: true, message: "Login successful" });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
// 1. ADMIN: Create Product & Generate Labels
app.post('/api/admin/generate', upload.single('leaflet'), async (req, res) => {
  try {
    const productData = req.body;
    const quantity = parseInt(productData.quantity);
    const leafletUrl = req.file.path; // Cloudinary URL

    // Create the Product Entry
    const newProduct = await Product.create({
      ...productData,
      leafletUrl
    });

    // Generate unique labels (12-char ID like the screenshot)
    const labelsToInsert = [];
    for (let i = 0; i < quantity; i++) {
      labelsToInsert.push({ 
        _id: nanoid(12).toUpperCase(), 
        productId: newProduct._id 
      });
    }

    const createdLabels = await Label.insertMany(labelsToInsert);

    res.status(201).json({ 
      success: true, 
      labelNumbers: createdLabels.map(label => label._id) 
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server failed to generate labels" });
  }
});

// 2. PUBLIC: Customer Verification
app.get('/api/verify/:labelNo', async (req, res) => {
  try {
    const labelData = await Label.findById(req.params.labelNo).populate('productId');
    
    if (!labelData) {
      return res.status(404).json({ message: "Invalid QR Code" });
    }

    res.status(200).json({
      labelNumber: labelData._id,
      ...labelData.productId._doc
    });
  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

module.exports = app;