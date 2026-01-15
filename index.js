// ============================================
// Complete Hotel Management API - Single File
// با تاریخچه قیمت برای واحدها
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
    stars: Number,
    name: String,
    address: String,
    location: Number,
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
        name: String,
        quanntity: Number,
        squareMeters: Number,
        photos: [String],
        numOftwinBeds: Number,
        numOfSingleBeds: Number,
        numOfKingBeds: Number,
        numOfQueenBeds: Number,
        amenities: [String],
        numOfFits: Number,
        // قیمت‌های فعلی
        pricePerNight: [
          {
            season: String,
            price: Number,
          },
        ],
        // تاریخچه قیمت‌ها
        priceHistory: [
          {
            season: String,
            price: Number,
            changedAt: { type: Date, default: Date.now },
            changedBy: String, // اختیاری: برای ذخیره کاربری که تغییر داده
          },
        ],
      },
    ],
  },
  { timestamps: true },
);

const Hotel = mongoose.model("hotels", hotelSchema);

// ============================================
// HELPER FUNCTIONS
// ============================================

// تابع برای ذخیره قیمت‌های قبلی در تاریخچه
function savePriceHistory(unit, newPrices) {
  if (!unit.priceHistory) {
    unit.priceHistory = [];
  }

  // اگر قیمت‌های قبلی وجود دارد، آنها را به تاریخچه اضافه کن
  if (unit.pricePerNight && unit.pricePerNight.length > 0) {
    unit.pricePerNight.forEach((oldPrice) => {
      unit.priceHistory.push({
        season: oldPrice.season,
        price: oldPrice.price,
        changedAt: new Date(),
      });
    });
  }

  // قیمت‌های جدید را تنظیم کن
  unit.pricePerNight = newPrices;
}

// ============================================
// API ROUTES
// ============================================

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Hotel Management API is running",
    version: "2.0.0 (with Price History)",
    endpoints: {
      "GET /api/hotels": "Get all hotels (with search, pagination)",
      "GET /api/hotels/:id": "Get single hotel by ID",
      "GET /api/hotels/:id/units/:unitId/price-history":
        "Get price history for a unit",
      "POST /api/hotels": "Create new hotel",
      "POST /api/hotels/:id/units":
        "Create a unit (room) for a hotel",
      "PUT /api/hotels/:id/units/:unitId":
        "Update a unit for a hotel (saves price history)",
      "PUT /api/hotels/:id/units/:unitId/prices":
        "Update only prices for a unit (saves history)",
      "DELETE /api/hotels/:id/units/:unitId":
        "Delete a unit for a hotel",
      "PUT /api/hotels/:id": "Update hotel",
      "DELETE /api/hotels/:id": "Delete hotel",
    },
  });
});

app.post("/addNewHotels", async (req, res) => {
  const hotelsData = [
    {
      name: "Grand hotel",
      address: "Abovyan street14",
      options: ["pool", "gym", "spa"],
      tel: ["+374 10 591 600", "+374 10 591 699"],
      email: "sales@grandhotelyerevan.com",
      website: "grandhotelyerevan.com",
      location: "3' center",
    },
    {
      name: "Radisson blue",
      address: "Azatutyan Ave",
      options: ["pool", "gym", "spa"],
      tel: ["+374 10 21 99 00"],
      email: "sales.radssonbluhotel@gmail.com",
      website: "radissonhotels.com",
      location: "5' center",
    },
    {
      name: "Holliday Inn yerevan",
      address: "Amiryan street2",
      options: ["pool", "gym", "spa"],
      tel: ["+374 60 83 30 00"],
      email: "holidayinnyerevan@ihg.com",
      website: "ihg.com",
      location: "center",
    },
    {
      name: "D.T Hilton",
      address: "Grigor Lusavorich street",
      options: ["pool", "gym", "spa"],
      tel: ["+374 11 55 53 33"],
      email: "evnye.hotel@hilton.com",
      website: "hilton.com",
      location: "center",
    },
    {
      name: "The Alexander",
      address: "Abovyan street3/4",
      options: ["pool", "gym", "spa"],
      tel: ["+374 11 20 60 00"],
      email: "info@thealexanderyerevan.com",
      website: "marriott.com",
      location: "5' center",
    },
    {
      name: "Venice hotel complex",
      address: "Movases khorenatsi street",
      options: ["pool", "gym", "spa"],
      tel: ["+374 60 44 30 40"],
      email: "info@venicehotel.am",
      website: "venicehotel.am",
      location: "5' center",
    },
    {
      name: "Double tree by hilton",
      address: "Grigor lusavorich4/2",
      options: ["pool", "gym", "spa"],
      tel: ["+374 11 5553 33"],
      email: "evnye.hotel@hilton.com",
      website: "hilton.com",
      location: "center",
    },
    {
      name: "Golden palace",
      address: "Northern11",
      options: ["gym", "sauna"],
      tel: ["+374 12 22 00 00"],
      email: "info@goldenpalacehotel.am",
      website: "goldenpalacehotel.am",
      location: "5' center",
    },
    {
      name: "Armenia Marriott",
      address: "Amiryan street",
      options: ["pool", "gym"],
      tel: ["+374 10 59 90 00"],
      email: "armenia.marriott@marriott.com",
      website: "marriott.com",
      location: "center",
    },
    {
      name: "National by stellar",
      address: "Amiryan street4/3",
      options: ["pool", "gym", "spa"],
      tel: ["+374 10 57 40 00"],
      email: "info@hotelnational.am",
      website: "hotelnational.am",
      location: "center",
    },
    {
      name: "Best western 4*",
      address: "Italy street",
      options: ["pool", "souna"],
      tel: ["+374 10 59 11 99"],
      email: "info@congresshotelyerevan.com",
      website: "bestwestern.fr",
      location: "center",
    },
    {
      name: "Ramanda",
      address: "pavstos busand street15",
      options: ["gym", "souna"],
      tel: ["+374 11 20 04 00"],
      email: "info@ramanda.am",
      website: "wyndhotels.com",
      location: "center",
    },
    {
      name: "Republic",
      address: "Amiryan street7/1",
      options: ["massage"],
      tel: ["+374 11 99 00 00"],
      email: "info@republichotel.am",
      website: "republichotel.am",
      location: "center",
    },
    {
      name: "Dynast",
      address: "Hovsep emin street52",
      options: ["pool", "gym", "spa"],
      tel: ["+374 10 33 33 10"],
      email: "info@dynastyerevan",
      website: "dynastyerevan.com",
      location: "5' center",
    },
    {
      name: "Ani plaza",
      address: "Sayat-nova 19",
      options: ["pool", "gym", "sauna"],
      tel: ["+374 10 58 95 00"],
      email: "info@anihotel.com",
      website: "anihotel.com",
      location: "15' center",
    },
    {
      name: "Erebuni",
      address: "Vazgen sargsyan26/4",
      options: [],
      tel: ["+374 60 48 05 05"],
      email: "info@erebunihotel.am",
      website: "erebunihotel.am",
      location: "center",
    },
    {
      name: "Yerevan place",
      address: "Vazgen sargsyan26/1",
      options: ["gym"],
      tel: ["+374 11 22 12 34"],
      email: "sale@evnplace.com",
      website: "yerevanplace.com",
      location: "center",
    },
    {
      name: "Ararat",
      address: "grigor lusavorich7",
      options: ["pool", "gym", "souna"],
      tel: ["+374 99 07 75 54"],
      email: "reservation@ararathotel.am",
      website: "ararathotel.am",
      location: "5'center",
    },
    {
      name: "Nacho",
      address: "yervand kochar7/4",
      options: ["pool", "sauna"],
      tel: ["+374 95 74 07 44"],
      email: "hotelnachoyerevan@gmail.com",
      website: "nachohotel.am",
      location: "7'center",
    },
    {
      name: "Paris",
      address: "Amiryan street 4/6",
      options: ["gym"],
      tel: ["+374 60 60 00 60"],
      email: "info@parishotel.am",
      website: "parishotel.am",
      location: "center",
    },
    {
      name: "Metropol",
      address: "mashtots 2/2 Ave",
      options: ["pool", "sauna"],
      tel: ["+374 10 51 07 00"],
      email: "metropol@metropol.am",
      website: "metropol.am",
      location: "5'center",
    },
    {
      name: "Messier53",
      address: "vardanants street15/4",
      options: ["pool", "gym", "spa"],
      tel: ["+374 95 53 00 53"],
      email: "info@messier53hotel.com",
      website: "messier53hotel.com",
      location: "5'center",
    },
    {
      name: "Sphera by stellar",
      address: "artsakh7 Ave",
      options: ["gym"],
      tel: ["+374 33 00 22 76"],
      email: "spherabystellar@gmail.com",
      website: "en.sphera-stellarhotels.ru",
      location: "center",
    },
    {
      name: "Royal plaza",
      address: "martiros saryan street9",
      options: [],
      tel: ["+374 33 62 88 22"],
      email: "info@royalplaza-stellarhotels.ru",
      website: "royalplaza.stellarhotels.ru",
      location: "5'center",
    },
    {
      name: "Holiday Inn express",
      address: "karena street 97/2",
      options: [],
      tel: ["+374 12 22 24 40"],
      email: "reservation@hiexyerevan.am",
      website: "hiexpress.am",
      location: "5'center",
    },
    {
      name: "President",
      address: "dzorapi street72",
      options: ["pool"],
      tel: ["+374 10 53 53 32"],
      email: "sale@presidenthotel.am",
      website: "presidenthotel.am",
      location: "5'center",
    },
    {
      name: "plaza viktoria",
      address: "nar-dos street2",
      options: [],
      tel: ["+374 91 15 22 00"],
      email: "info@hotelplazaviktoria.am",
      website: "hotelplazaviktoria.am",
      location: "10' center",
    },
    {
      name: "Aquatek",
      address: "Myasnikyan street 40/2",
      options: ["pool", "gym", "spa"],
      tel: ["+374 91 50 02 02"],
      email: "hotel-reservation@aquatek.am",
      website: "aquatek.hotelsofarmenia.com",
      location: "10' center",
    },
    {
      name: "Juliet",
      address: "Nairi zaryan street74",
      options: [],
      tel: ["+374 94 65 64 54"],
      email: "arman22555@gmail.com",
      website: "juliet.hotelsofarmenia.com",
      location: "16' center",
    },
    {
      name: "New Bella",
      address: "yervand kochar street6",
      options: ["gym"],
      tel: ["+374 10 24 04 99"],
      email: "info@bella.am",
      website: "newbella.yerevanahotel.com",
      location: "5' center",
    },
    {
      name: "Nice",
      address: "sevan street 5/1",
      options: [],
      tel: ["+374 43 50 07 00"],
      email: "nicehotelyerevan@gmail.com",
      website: "nice-hotel-yerevan.hotelsofarmenia.com",
      location: "10'center",
    },
    {
      name: "Mashtots",
      address: "40A mesrop mashtots Ave",
      options: [],
      tel: ["+374 11 57 00 77"],
      email: "",
      website: "mashtots.hotelsofarmenia.com",
      location: "10' center",
    },
    {
      name: "MarNar",
      address: "Admiral isakov3/1",
      options: [],
      tel: ["+37477 91 91 57"],
      email: "No email",
      website: "MarNar hotel.yerevan-hotel.top",
      location: "8'center",
    },
    {
      name: "Amaras",
      address: "Tairov street46",
      options: [],
      tel: ["+374 91 25 55 71"],
      email: "No email",
      website: "amaras.hotelsofarmenia.com",
      location: "10' center",
    },
  ];

  try {
    // دریافت آخرین هتل برای شروع ID از عدد بعدی
    const lastHotel = await Hotel.findOne().sort({ id: -1 });
    let nextId = lastHotel ? lastHotel.id + 1 : 1;

    // اضافه کردن ID به هر هتل
    const hotelsWithIds = hotelsData.map((hotel) => ({
      ...hotel,
      id: nextId++,
      units: [],
      ratesInfo: {
        hotelCost: 0,
        referralCommission: 0,
        referralCommissionType: "percentage",
        extraAdultCommission: 0,
        extraAdultCommissionType: "percentage",
        extraChildCommission: 0,
        extraChildCommissionType: "percentage",
      },
    }));

    const createdHotels = await Hotel.insertMany(hotelsWithIds);
    res.status(201).json({
      success: true,
      message: `${createdHotels.length} هتل با موفقیت افزوده شد.`,
      data: createdHotels,
    });
  } catch (error) {
    console.error("Error adding hotels:", error);
    res.status(500).json({
      success: false,
      message: "خطای سرور",
      error: error.message,
    });
  }
});

app.post("/deleteAll", async (req, res) => {
  try {
    await Hotel.deleteMany({});
    res.status(200).json({
      success: true,
      message: "All hotels deleted successfully",
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
// GET ALL HOTELS
// @route   GET /api/hotels
// @desc    Get all hotels with optional filters
// @query   search, page, limit
// ============================================
app.get("/api/hotels", async (req, res) => {
  try {
    const { search, page = 1, limit = 300 } = req.query;

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
    const hotel = await Hotel.findOne({ id: Number(req.params.id) });

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
// GET PRICE HISTORY FOR A UNIT
// @route   GET /api/hotels/:id/units/:unitId/price-history
// @desc    Get complete price history for a specific unit
// ============================================
app.get(
  "/api/hotels/:id/units/:unitId/price-history",
  async (req, res) => {
    try {
      const hotel = await Hotel.findOne({
        id: Number(req.params.id),
      });

      if (!hotel) {
        return res.status(404).json({
          success: false,
          message: "Hotel not found",
        });
      }

      const unitId = Number(req.params.unitId);
      const unit = hotel.units.find((u) => u.id === unitId);

      if (!unit) {
        return res.status(404).json({
          success: false,
          message: "Unit not found",
        });
      }

      res.status(200).json({
        success: true,
        data: {
          unitId: unit.id,
          unitName: unit.name,
          currentPrices: unit.pricePerNight || [],
          priceHistory: unit.priceHistory || [],
          totalHistoryRecords: (unit.priceHistory || []).length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  },
);

// ============================================
// UNIT (ROOM) ROUTES
// Create unit: POST /api/hotels/:id/units
// Update unit: PUT /api/hotels/:id/units/:unitId
// Update prices only: PUT /api/hotels/:id/units/:unitId/prices
// Delete unit: DELETE /api/hotels/:id/units/:unitId
// ============================================

app.post("/api/hotels/:id/units", async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ id: Number(req.params.id) });

    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }

    const {
      name,
      quanntity,
      squareMeters,
      photos = [],
      numOftwinBeds,
      numOfSingleBeds,
      numOfKingBeds,
      numOfQueenBeds,
      amenities = [],
      numOfFits,
      pricePerNight = [],
    } = req.body;

    if (!name || quanntity == null || squareMeters == null) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required unit fields: name, quanntity, squareMeters",
      });
    }

    const maxUnitId =
      hotel.units && hotel.units.length
        ? Math.max(...hotel.units.map((u) => u.id || 0))
        : 0;

    const newUnit = {
      id: maxUnitId + 1,
      name,
      quanntity,
      squareMeters,
      photos,
      numOftwinBeds,
      numOfSingleBeds,
      numOfKingBeds,
      numOfQueenBeds,
      amenities,
      numOfFits,
      pricePerNight,
      priceHistory: [], // شروع با تاریخچه خالی
    };

    hotel.units.push(newUnit);
    await hotel.save();

    res
      .status(201)
      .json({ success: true, message: "Unit added", data: newUnit });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

app.put("/api/hotels/:id/units/:unitId", async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ id: Number(req.params.id) });

    if (!hotel)
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });

    const unitId = Number(req.params.unitId);
    const unit = hotel.units.find((u) => u.id === unitId);

    if (!unit)
      return res
        .status(404)
        .json({ success: false, message: "Unit not found" });

    // اگر قیمت جدید ارسال شده، قیمت قبلی را در تاریخچه ذخیره کن
    if (req.body.pricePerNight && req.body.pricePerNight.length > 0) {
      savePriceHistory(unit, req.body.pricePerNight);
    }

    // بقیه فیلدها را بروزرسانی کن (به جز pricePerNight که در بالا مدیریت شد)
    const updatable = [
      "name",
      "quanntity",
      "squareMeters",
      "photos",
      "numOftwinBeds",
      "numOfSingleBeds",
      "numOfKingBeds",
      "numOfQueenBeds",
      "amenities",
      "numOfFits",
    ];

    updatable.forEach((key) => {
      if (req.body[key] !== undefined) unit[key] = req.body[key];
    });

    await hotel.save();

    res.status(200).json({
      success: true,
      message: "Unit updated with price history saved",
      data: {
        ...unit.toObject(),
        priceHistoryCount: unit.priceHistory
          ? unit.priceHistory.length
          : 0,
      },
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
// UPDATE UNIT PRICES ONLY
// @route   PUT /api/hotels/:id/units/:unitId/prices
// @desc    Update only prices for a unit (specialized endpoint)
// ============================================
app.put("/api/hotels/:id/units/:unitId/prices", async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ id: Number(req.params.id) });

    if (!hotel)
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });

    const unitId = Number(req.params.unitId);
    const unit = hotel.units.find((u) => u.id === unitId);

    if (!unit)
      return res
        .status(404)
        .json({ success: false, message: "Unit not found" });

    if (
      !req.body.pricePerNight ||
      !Array.isArray(req.body.pricePerNight)
    ) {
      return res.status(400).json({
        success: false,
        message: "pricePerNight array is required",
      });
    }

    // ذخیره قیمت‌های قبلی در تاریخچه
    savePriceHistory(unit, req.body.pricePerNight);

    await hotel.save();

    res.status(200).json({
      success: true,
      message: "Prices updated and history saved",
      data: {
        unitId: unit.id,
        unitName: unit.name,
        currentPrices: unit.pricePerNight,
        priceHistoryCount: unit.priceHistory
          ? unit.priceHistory.length
          : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

app.delete("/api/hotels/:id/units/:unitId", async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ id: Number(req.params.id) });

    if (!hotel)
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });

    const unitId = Number(req.params.unitId);

    const initialLen = hotel.units.length;
    hotel.units = hotel.units.filter((u) => Number(u.id) !== unitId);

    if (hotel.units.length === initialLen) {
      return res
        .status(404)
        .json({ success: false, message: "Unit not found" });
    }

    await hotel.save();

    res.status(200).json({ success: true, message: "Unit deleted" });
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
    const lastHotel = await Hotel.findOne().sort({ id: -1 });
    const newId = lastHotel ? lastHotel.id + 1 : 1;

    const hotelData = {
      ...req.body,
      id: newId,
    };

    // اطمینان از اینکه هر واحد priceHistory دارد
    if (hotelData.units && Array.isArray(hotelData.units)) {
      hotelData.units = hotelData.units.map((unit) => ({
        ...unit,
        priceHistory: unit.priceHistory || [],
      }));
    }

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
    // ابتدا هتل فعلی را بگیر
    const hotel = await Hotel.findOne({ _id: req.params.id });

    console.log("unit 1 : ", req.body.units[0].pricePerNight);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // اگر units در req.body وجود دارد، باید قیمت‌ها را چک کنیم
    if (req.body.units && Array.isArray(req.body.units)) {
      req.body.units.forEach((newUnit) => {
        // واحد قبلی را پیدا کن
        const oldUnit = hotel.units.find((u) => u.id === newUnit.id);

        if (oldUnit && newUnit.pricePerNight) {
          // چک کن که آیا قیمت تغییر کرده
          const pricesChanged =
            JSON.stringify(oldUnit.pricePerNight) !==
            JSON.stringify(newUnit.pricePerNight);

          if (
            pricesChanged &&
            oldUnit.pricePerNight &&
            oldUnit.pricePerNight.length > 0
          ) {
            // قیمت‌های قبلی را به تاریخچه اضافه کن
            if (!newUnit.priceHistory) {
              newUnit.priceHistory = oldUnit.priceHistory || [];
            }

            oldUnit.pricePerNight.forEach((oldPrice) => {
              newUnit.priceHistory.push({
                season: oldPrice.season,
                price: oldPrice.price,
                changedAt: new Date(),
              });
            });
          } else {
            // اگر قیمت تغییر نکرده، تاریخچه قبلی را حفظ کن
            newUnit.priceHistory = oldUnit.priceHistory || [];
          }
        }
      });
    }

    // حالا هتل را با داده‌های جدید بروزرسانی کن
    const updatedHotel = await Hotel.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Hotel updated successfully",
      data: updatedHotel,
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
