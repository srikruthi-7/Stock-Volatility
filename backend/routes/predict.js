const express = require("express");
const router = express.Router();

// MAIN PREDICT ENDPOINT
router.post("/", (req, res) => {
  console.log("Incoming prediction request:", req.body);

  const prices = req.body.prices || [];
  const horizon = req.body.horizon || 30;

  if (!Array.isArray(prices) || prices.length === 0) {
    return res.status(400).json({ error: "Prices array is required" });
  }

  // Generate FAKE predictions (working test)
  const last = prices[prices.length - 1];
  const predicted = Array(horizon)
    .fill(0)
    .map(() => last + (Math.random() * 2 - 1));

  return res.json({
    latest_vol: Math.random(),
    next_prediction: predicted[0],
    predicted,
  });
});

module.exports = router;
