const math = require("mathjs");

function safeParseDates(dates) {
  return dates.map((d) => {
    const dt = new Date(d);
    if (!isFinite(dt)) return d;
    return dt.toISOString().slice(0, 10);
  });
}

function computeLogReturns(close) {
  const res = [];
  for (let i = 1; i < close.length; i++) {
    const p0 = close[i - 1],
      p1 = close[i];
    if (p0 > 0 && p1 > 0) res.push(Math.log(p1) - Math.log(p0));
    else res.push(0);
  }
  return res;
}

function computeAbsReturns(close) {
  return computeLogReturns(close).map((x) => Math.abs(x));
}

function rollingStd(arr, window) {
  const out = new Array(arr.length).fill(null);
  for (let i = window - 1; i < arr.length; i++) {
    const slice = arr.slice(i - (window - 1), i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
    const variance =
      slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / slice.length;
    out[i] = Math.sqrt(variance);
  }
  return out;
}

function makeFourierFeatures(n) {
  const sinW = [],
    cosW = [],
    sinY = [],
    cosY = [];
  for (let t = 0; t < n; t++) {
    sinW.push(Math.sin((2 * Math.PI * t) / 5));
    cosW.push(Math.cos((2 * Math.PI * t) / 5));
    sinY.push(Math.sin((2 * Math.PI * t) / 252));
    cosY.push(Math.cos((2 * Math.PI * t) / 252));
  }
  return { sinW, cosW, sinY, cosY };
}

function buildFeatureMatrix(absRet) {
  const n = absRet.length;
  const rv5 = rollingStd(absRet, 5);
  const rv10 = rollingStd(absRet, 10);
  const { sinW, cosW, sinY, cosY } = makeFourierFeatures(n);
  const featureMatrix = new Array(n);
  for (let i = 0; i < n; i++) {
    featureMatrix[i] = [
      rv5[i] || 0,
      rv10[i] || 0,
      absRet[i] || 0,
      sinW[i] || 0,
      cosW[i] || 0,
      sinY[i] || 0,
      cosY[i] || 0,
    ];
  }
  return { featureMatrix, rv5, rv10, sinW, cosW, sinY, cosY };
}

function makeNextTradingDates(lastDateStr, horizon) {
  const out = [];
  let cursor = new Date(lastDateStr);
  if (!isFinite(cursor)) cursor = new Date();
  let added = 0;
  while (added < horizon) {
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() + 1);
    const wd = cursor.getDay();
    if (wd === 0 || wd === 6) continue;
    out.push(cursor.toISOString().slice(0, 10));
    added++;
  }
  return out;
}

module.exports = {
  safeParseDates,
  computeLogReturns,
  computeAbsReturns,
  rollingStd,
  makeFourierFeatures,
  buildFeatureMatrix,
  makeNextTradingDates,
};
