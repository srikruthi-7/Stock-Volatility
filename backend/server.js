const express = require("express");
const cors = require("cors");
const predictRouter = require("./routes/predict");

const app = express();

// CORS (frontend can be on any port)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// JSON parser
app.use(express.json({ limit: "6mb" }));

// Routes
app.use("/predict", predictRouter);

// Health check
app.get("/", (req, res) => res.send("Hybrid Volatility Backend — up"));

// Server port
const PORT = process.env.PORT || 5000;

// IMPORTANT — LISTEN ON ALL ADDRESSES (fixes your issue)
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
