require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Define MongoDB Schema & Model
const SensorSchema = new mongoose.Schema({
  nitrogen: Number,
  phosphorus: Number,
  potassium: Number,
  temperature: Number,
  humidity: Number,
  distance: Number,
  soilMoisture: Number,
  relay: { type: Boolean, default: false }  // ✅ Ensuring default relay value
});

const SensorData = mongoose.model("SensorData", SensorSchema);

// ✅ Get Sensor Data (Including Relay Status)
app.get("/api/sensor", async (req, res) => {
  try {
    let sensorData = await SensorData.findOne();

    if (!sensorData) {
      sensorData = await SensorData.create({ relay: false });  // ✅ Auto-create document if missing
    }

    res.json(sensorData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET Relay Status
app.get("/api/relay", async (req, res) => {
  try {
    let sensorData = await SensorData.findOne();

    if (!sensorData) {
      sensorData = await SensorData.create({ relay: false });
    }

    res.json({ relay: sensorData.relay });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Update Sensor Data (Including Relay)
app.put("/api/sensor", async (req, res) => {
  try {
    const updateData = req.body;
    const updatedSensor = await SensorData.findOneAndUpdate({}, updateData, { new: true, upsert: true });
    res.json(updatedSensor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Update Relay Status
app.put("/api/relay", async (req, res) => {
  try {
    const { relay } = req.body;

    if (typeof relay !== "boolean") {
      return res.status(400).json({ message: "Invalid relay value, must be true or false" });
    }

    const updatedRelay = await SensorData.findOneAndUpdate({}, { relay }, { new: true, upsert: true });
    res.json({ relay: updatedRelay.relay });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
