// backend/models/trend.js
const fourier = require("./fourier");

// Fit trend + fourier linear model: intercept + trend*t + fourier terms
function fitTrendFourier(target, lambda = 1e-3) {
  const X = [],
    y = [];
  const n = target.length;
  for (let i = 0; i < n; i++) {
    if (target[i] == null) continue;
    const row = [
      1,
      i,
      Math.sin((2 * Math.PI * i) / 5),
      Math.cos((2 * Math.PI * i) / 5),
      Math.sin((2 * Math.PI * i) / 252),
      Math.cos((2 * Math.PI * i) / 252),
    ];
    X.push(row);
    y.push(target[i]);
  }
  if (X.length === 0) return { coef: null };
  const coef = fourier.ridgeSolve(X, y, lambda);
  return { coef };
}

// predict for future range t = start..end
function predictOnRange(coef, startIdx, endIdx) {
  const preds = [];
  for (let i = startIdx; i <= endIdx; i++) {
    const val =
      coef[0] +
      coef[1] * i +
      coef[2] * Math.sin((2 * Math.PI * i) / 5) +
      coef[3] * Math.cos((2 * Math.PI * i) / 5) +
      coef[4] * Math.sin((2 * Math.PI * i) / 252) +
      coef[5] * Math.cos((2 * Math.PI * i) / 252);
    preds.push(Math.max(0, val));
  }
  return preds;
}

function predictTrendFourierFuture(coef, lastIndex, horizon) {
  if (!coef) return new Array(horizon).fill(0);
  const out = [];
  for (let i = 1; i <= horizon; i++) {
    const t = lastIndex + i;
    const val =
      coef[0] +
      coef[1] * t +
      coef[2] * Math.sin((2 * Math.PI * t) / 5) +
      coef[3] * Math.cos((2 * Math.PI * t) / 5) +
      coef[4] * Math.sin((2 * Math.PI * t) / 252) +
      coef[5] * Math.cos((2 * Math.PI * t) / 252);
    out.push(Math.max(0, val));
  }
  return out;
}

module.exports = { fitTrendFourier, predictOnRange, predictTrendFourierFuture };
