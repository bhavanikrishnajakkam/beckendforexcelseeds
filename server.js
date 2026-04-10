const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto'); // Built-in Node tool, no install needed
const upload = require('./middleware/upload');
require('dotenv').config();

const Product = require('./models/Product');
const Label = require('./models/Label');
const User = require('./models/User');

const app = express();

// 1. SIMPLEST CORS FOR DEPLOYMENT
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("Database Connection Error:", err));

// --- API ROUTES ---

// Health Check (To see if it's alive)
app.get('/', (req, res) => res.send('Ganga Kaveri Backend is LIVE'));

// LOGIN ROUTE
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && user.password === password) {
      res.json({ success: true, message: "Login successful" });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ADMIN: Generate Labels
app.post('/api/admin/generate', upload.single('leaflet'), async (req, res) => {
  try {
    const productData = req.body;
    const quantity = parseInt(productData.quantity);
    const leafletUrl = req.file.path;

    const newProduct = await Product.create({ ...productData, leafletUrl });

    const labelsToInsert = [];
    for (let i = 0; i < quantity; i++) {
      // GENERATE 12-CHAR ID USING NATIVE CRYPTO
      const randomId = crypto.randomBytes(6).toString('hex').toUpperCase(); 
      labelsToInsert.push({ 
        _id: randomId, 
        productId: newProduct._id 
      });
    }

    const createdLabels = await Label.insertMany(labelsToInsert);
    res.status(201).json({ success: true, labelNumbers: createdLabels.map(l => l._id) });
  } catch (error) {
    res.status(500).json({ error: "Server failed to generate labels" });
  }
});

// PUBLIC: Verify
app.get('/api/verify/:labelNo', async (req, res) => {
  try {
    const labelData = await Label.findById(req.params.labelNo).populate('productId');
    if (!labelData) return res.status(404).json({ message: "Invalid QR Code" });
    res.status(200).json({ labelNumber: labelData._id, ...labelData.productId._doc });
  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));

module.exports = app;