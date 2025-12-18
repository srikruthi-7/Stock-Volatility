// backend/models/fourier.js
const math = require("mathjs");

// ridge solve: w = (X^T X + lambda I)^-1 X^T y
function ridgeSolve(X, y, lambda = 1e-3) {
  const Xm = math.matrix(X);
  const Xt = math.transpose(Xm);
  const XtX = math.multiply(Xt, Xm);
  const n = XtX.size()[0];
  const reg = math.add(XtX, math.multiply(lambda, math.identity(n)));
  const Xty = math.multiply(Xt, math.matrix(y));
  try {
    const w = math.lusolve(reg, Xty);
    return w.toArray().map((r) => r[0]);
  } catch (err) {
    const pinv = math.pinv(reg);
    const w = math.multiply(pinv, Xty);
    return w.toArray().map((r) => r[0]);
  }
}

function fitFourierRidge(target, featuresMatrix, lambda = 1e-3) {
  const X = [],
    y = [];
  for (let i = 0; i < target.length; i++) {
    if (target[i] == null) continue;
    X.push(featuresMatrix[i]);
    y.push(target[i]);
  }
  if (X.length === 0) return { coef: null };
  const coef = ridgeSolve(X, y, lambda);
  return { coef };
}

function predictWithCoef(coef, featRow) {
  if (!coef) return 0;
  let s = 0;
  for (let i = 0; i < coef.length; i++) s += coef[i] * (featRow[i] || 0);
  return Math.max(0, s);
}

module.exports = { fitFourierRidge, predictWithCoef, ridgeSolve };
