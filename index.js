// ============================================
// Complete Hotel Management API - Single File
// ============================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Initialize Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI =
  "mongodb+srv://xchat:Abolfazl021_@db1.6qsnqns.mongodb.net/?appName=db1";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ============================================
// MONGOOSE SCHEMA & MODEL
// ============================================

const hotelSchema = new mongoose.Schema(
  {
    id: Number,
    type: String,
    name: String,
    address: String,
    location: {
      lat: Number,
      lng: Number,
    },
    tel: [String],
    email: String,
    website: String,
    whatsapp: String,
    retesDescription: String,
    options: [String],
    ratesInfo: {
      hotelCost: Number,
      referralCommission: Number,
      referralCommissionType: String,
      extraAdultCommission: Number,
      extraAdultCommissionType: String,
      extraChildCommission: Number,
      extraChildCommissionType: String,
    },
    photos: [String],
    units: [
      {
        id: Number,
        photos: [String],
        numOftwinBeds: Number,
        numOfSingleBeds: Number,
        numOfKingBeds: Number,
        numOfQueenBeds: Number,
        amenities: [String],
        numOfFits: Number,
        pricePerNight: [
          {
            season: String,
            price: Number,
          },
        ],
      },
    ],
  },
  { timestamps: true },
);

const Hotel = mongoose.model("hotels", hotelSchema);

// ============================================
// API ROUTES
// ============================================

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Hotel Management API is running",
    version: "1.0.0",
    endpoints: {
      "GET /api/hotels": "Get all hotels (with search, pagination)",
      "GET /api/hotels/:id": "Get single hotel by ID",
      "POST /api/hotels": "Create new hotel",
      "PUT /api/hotels/:id": "Update hotel",
      "DELETE /api/hotels/:id": "Delete hotel",
      "POST /api/hotels/seed": "Seed database with sample data",
    },
  });
});

// ============================================
// GET ALL HOTELS
// @route   GET /api/hotels
// @desc    Get all hotels with optional filters
// @query   search, page, limit
// ============================================
app.get("/api/hotels", async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    let query = {};

    // Search by name or address
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const hotels = await Hotel.find(query)
      .limit(Number(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Hotel.countDocuments(query);

    res.status(200).json({
      success: true,
      count: hotels.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: hotels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// ============================================
// GET SINGLE HOTEL
// @route   GET /api/hotels/:id
// @desc    Get hotel by ID
// ============================================
app.get("/api/hotels/:id", async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ id: req.params.id });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.status(200).json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// ============================================
// CREATE HOTEL
// @route   POST /api/hotels
// @desc    Create new hotel
// ============================================
app.post("/api/hotels", async (req, res) => {
  try {
    // Get the highest ID and increment
    const lastHotel = await Hotel.findOne().sort({ id: -1 });
    const newId = lastHotel ? lastHotel.id + 1 : 1;

    const hotelData = {
      ...req.body,
      id: newId,
    };

    // return console.log({ hotelData });

    const hotel = await Hotel.create(hotelData);

    res.status(201).json({
      success: true,
      message: "Hotel created successfully",
      data: hotel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// ============================================
// UPDATE HOTEL
// @route   PUT /api/hotels/:id
// @desc    Update hotel by ID
// ============================================
app.put("/api/hotels/:id", async (req, res) => {
  try {
    const hotel = await Hotel.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true },
    );

    console.log(req.body);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Hotel updated successfully",
      data: hotel,
    });
    console.log("Hotel updated successfully");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// ============================================
// DELETE HOTEL
// @route   DELETE /api/hotels/:id
// @desc    Delete hotel by ID
// ============================================
app.delete("/api/hotels/:id", async (req, res) => {
  try {
    const hotel = await Hotel.findOneAndDelete({
      _id: req.params.id,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Hotel deleted successfully",
      data: hotel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});
