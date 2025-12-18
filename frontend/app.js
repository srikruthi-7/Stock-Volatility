// ================================
// GLOBAL VARIABLES
// ================================
let volChart = null;
let lastPayload = null;

// ================================
// CSV PARSER
// ================================
function parseCSV(text) {
  const rows = text
    .trim()
    .split("\n")
    .map((r) => r.split(","));
  const header = rows.shift();

  const dateIndex = header.findIndex((h) => h.toLowerCase() === "date");
  const closeIndex = header.findIndex((h) => h.toLowerCase() === "close");

  const dates = [];
  const prices = [];

  rows.forEach((row) => {
    if (row[dateIndex] && row[closeIndex]) {
      dates.push(row[dateIndex]);
      prices.push(parseFloat(row[closeIndex]));
    }
  });

  return { dates, prices };
}

// ================================
// RENDER CHART.JS
// ================================
function renderChart(dates, prices, predicted) {
  const ctx = document.getElementById("volChart");

  if (volChart) volChart.destroy();

  volChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Historical",
          data: prices,
          borderWidth: 2,
        },
        {
          label: "Predicted",
          data: predicted,
          borderDash: [5, 5],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: { type: "time", time: { unit: "day" } },
        y: { title: { display: true, text: "Volatility" } },
      },
    },
  });

  document.getElementById("chartLegend").innerText =
    "Loaded: Historical + Predicted";
}

// ================================
// SEND TO BACKEND (FIXED URL)
// ================================
async function sendToBackend(prices, horizon, models) {
  try {
    const res = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prices: prices,
        horizon: horizon,
        models: models,
      }),
    });

    if (!res.ok) throw new Error("Server " + res.status);

    return await res.json();
  } catch (err) {
    alert("Cannot reach backend. Make sure server.js is running.");
    console.log(err);
    return null;
  }
}

// ================================
// SHOW PREVIEW
// ================================
function showPreview(text) {
  document.getElementById("dataPreview").innerText =
    text.substring(0, 1000) + "\n\n...(trimmed)...";
}

// ================================
// HANDLE DROP ZONE
// ================================
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
let currentCSV = "";

dropZone.addEventListener("click", () => fileInput.click());

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("hover");
});
dropZone.addEventListener("dragleave", () =>
  dropZone.classList.remove("hover")
);

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("hover");

  const file = e.dataTransfer.files[0];
  handleFile(file);
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  handleFile(file);
});

// ================================
// HANDLE FILE LOAD
// ================================
function handleFile(file) {
  const reader = new FileReader();

  reader.onload = () => {
    currentCSV = reader.result;
    showPreview(currentCSV);
  };

  reader.readAsText(file);
}

// ================================
// RUN BUTTON
// ================================
document.getElementById("runBtn").addEventListener("click", async () => {
  if (!currentCSV) {
    alert("Please upload a CSV first.");
    return;
  }

  const { dates, prices } = parseCSV(currentCSV);

  const horizon = parseInt(document.getElementById("horizon").value);

  const models = {
    lstm: document.getElementById("lstm").checked,
    prophet: document.getElementById("prophet").checked,
    fourier: document.getElementById("fourier").checked,
  };

  lastPayload = { prices, horizon, models };

  const backend = await sendToBackend(prices, horizon, models);

  if (!backend) return;

  document.getElementById("latestVol").innerText =
    backend.latest_vol?.toFixed(4) ?? "—";

  document.getElementById("nextPred").innerText =
    backend.next_prediction?.toFixed(4) ?? "—";

  renderChart(dates, prices, backend.predicted || []);
});

// ================================
// DEMO BUTTON
// ================================
document.getElementById("demoBtn").addEventListener("click", () => {
  const csv = `Date,Close
2024-01-01,120
2024-01-02,121
2024-01-03,119
2024-01-04,122
2024-01-05,123
2024-01-06,125
2024-01-07,127`;

  currentCSV = csv;
  showPreview(csv);
});

// ================================
// DOWNLOAD BUTTON
// ================================
document.getElementById("downloadBtn").addEventListener("click", () => {
  if (!lastPayload) {
    alert("Run prediction first.");
    return;
  }

  const blob = new Blob([JSON.stringify(lastPayload, null, 2)], {
    type: "text/json",
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "request.json";
  a.click();
});
