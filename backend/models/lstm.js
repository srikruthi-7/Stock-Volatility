// backend/models/lstm.js
// ✔ WORKS ON WINDOWS (uses pure TFJS, no tfjs-node)
const tf = require("@tensorflow/tfjs");

/**
 * Create sliding sequences for LSTM
 */
function makeSequences(dfFeatures, targets, seqLen = 30) {
  const X = [];
  const y = [];

  for (let i = seqLen; i < dfFeatures.length; i++) {
    if (targets[i] == null) continue;

    const seq = [];
    let invalid = false;

    for (let j = i - seqLen; j < i; j++) {
      if (!dfFeatures[j]) {
        invalid = true;
        break;
      }
      seq.push(dfFeatures[j]);
    }

    if (!invalid) {
      X.push(seq);
      y.push(targets[i]);
    }
  }

  return { X: X.length ? X : null, y: y.length ? y : null };
}

/**
 * Build a small LSTM model (pure JS version)
 */
function buildLSTMModel(seqLen, nFeat) {
  const model = tf.sequential();

  model.add(
    tf.layers.lstm({
      units: 64,
      returnSequences: true,
      inputShape: [seqLen, nFeat],
    })
  );

  model.add(tf.layers.dropout({ rate: 0.2 }));

  model.add(tf.layers.lstm({ units: 32 }));
  model.add(tf.layers.dropout({ rate: 0.2 }));

  model.add(tf.layers.dense({ units: 1, activation: "linear" }));

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: "meanSquaredError",
  });

  return model;
}
