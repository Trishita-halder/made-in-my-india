const ort = require("onnxruntime-node");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ML_DIR = __dirname;

const CLASSIFIER_MODEL_PATH = path.join(
  ML_DIR,
  "efficientnet_b0_30class.onnx"
);

const CLASS_NAMES_PATH = path.join(
  ML_DIR,
  "class_names.json"
);

const CLASS_TO_IDX_PATH = path.join(
  ML_DIR,
  "class_to_idx.json"
);

const CONFIG_PATH = path.join(
  ML_DIR,
  "verification_config.json"
);

const IMAGE_SIZE = 224;

// --------------------------------------------------
// LOAD CONFIG
// --------------------------------------------------

let config = {};

if (fs.existsSync(CONFIG_PATH)) {
  config = JSON.parse(
    fs.readFileSync(CONFIG_PATH, "utf8")
  );
}

const CLASSIFIER_THRESHOLD =
  config.classifier_threshold ?? 0.50;

const REVIEW_THRESHOLD =
  config.review_threshold ?? 0.35;

const MARGIN_THRESHOLD =
  config.margin_threshold ?? 0.15;

// --------------------------------------------------
// LOAD CLASS NAMES
// --------------------------------------------------

if (!fs.existsSync(CLASS_NAMES_PATH)) {
  throw new Error(
    `Missing 30-class file: ${CLASS_NAMES_PATH}`
  );
}

const classNames = JSON.parse(
  fs.readFileSync(CLASS_NAMES_PATH, "utf8")
);

if (classNames.length !== 30) {
  throw new Error(
    `Expected 30 classes, found ${classNames.length}`
  );
}

let classToIdx = {};

if (fs.existsSync(CLASS_TO_IDX_PATH)) {
  classToIdx = JSON.parse(
    fs.readFileSync(CLASS_TO_IDX_PATH, "utf8")
  );
}

console.log(
  `ML: loaded ${classNames.length} NEW classifier classes`
);

console.log(
  `ML: image size: ${IMAGE_SIZE}x${IMAGE_SIZE}`
);

// --------------------------------------------------
// MODEL
// --------------------------------------------------

let classifierSession = null;

async function loadClassifier() {
  if (classifierSession) {
    return classifierSession;
  }

  if (!fs.existsSync(CLASSIFIER_MODEL_PATH)) {
    throw new Error(
      `Missing 30-class ONNX model: ${CLASSIFIER_MODEL_PATH}`
    );
  }

  classifierSession =
    await ort.InferenceSession.create(
      CLASSIFIER_MODEL_PATH,
      {
        executionProviders: ["cpu"]
      }
    );

  console.log(
    "ML: 30-class classifier ONNX model loaded"
  );

  console.log(
    "ML: classifier input names:",
    classifierSession.inputNames
  );

  console.log(
    "ML: classifier output names:",
    classifierSession.outputNames
  );

  return classifierSession;
}

// --------------------------------------------------
// IMAGE PREPROCESSING
// --------------------------------------------------

async function preprocessImage(imageInput) {
  let image;

  if (Buffer.isBuffer(imageInput)) {
    image = sharp(imageInput);
  } else {
    image = sharp(imageInput);
  }

  const { data } = await image
    .resize(IMAGE_SIZE, IMAGE_SIZE, {
      fit: "fill"
    })
    .removeAlpha()
    .raw()
    .toBuffer({
      resolveWithObject: true
    });

  const pixelCount =
    IMAGE_SIZE * IMAGE_SIZE;

  const floatData =
    new Float32Array(pixelCount * 3);

  // ImageNet normalization
  const mean = [
    0.485,
    0.456,
    0.406
  ];

  const std = [
    0.229,
    0.224,
    0.225
  ];

  for (let i = 0; i < pixelCount; i++) {
    const r = data[i * 3] / 255;
    const g = data[i * 3 + 1] / 255;
    const b = data[i * 3 + 2] / 255;

    floatData[i] =
      (r - mean[0]) / std[0];

    floatData[pixelCount + i] =
      (g - mean[1]) / std[1];

    floatData[pixelCount * 2 + i] =
      (b - mean[2]) / std[2];
  }

  return new ort.Tensor(
    "float32",
    floatData,
    [1, 3, IMAGE_SIZE, IMAGE_SIZE]
  );
}

// --------------------------------------------------
// SOFTMAX
// --------------------------------------------------

function softmax(logits) {
  const maxLogit =
    Math.max(...logits);

  const exps = logits.map(
    x => Math.exp(x - maxLogit)
  );

  const sum =
    exps.reduce(
      (a, b) => a + b,
      0
    );

  return exps.map(
    x => x / sum
  );
}

// --------------------------------------------------
// CLASSIFY IMAGE
// --------------------------------------------------

async function classifyImageBuffer(
  imageBuffer
) {
  const session =
    await loadClassifier();

  const inputTensor =
    await preprocessImage(imageBuffer);

  const inputName =
    session.inputNames[0];

  const outputName =
    session.outputNames[0];

  const result =
    await session.run({
      [inputName]: inputTensor
    });

  const logits =
    Array.from(
      result[outputName].data
    );

  const probabilities =
    softmax(logits);

  const ranked =
    probabilities
      .map((probability, index) => ({
        classIndex: index,
        className:
          classNames[index],
        probability
      }))
      .sort(
        (a, b) =>
          b.probability -
          a.probability
      );

  const top1 = ranked[0];
  const top2 = ranked[1];

  const margin =
    top1.probability -
    top2.probability;

  return {
    predictedClass:
      top1.className,

    classIndex:
      top1.classIndex,

    probability:
      top1.probability,

    margin,

    top3:
      ranked.slice(0, 3)
  };
}

// --------------------------------------------------
// VERIFICATION DECISION
// --------------------------------------------------

function decideVerification(
  classification
) {
  const probability =
    classification.probability;

  const margin =
    classification.margin;

  /*
   * HIGH-CONFIDENCE MATCH
   *
   * Both probability and separation from
   * the second candidate must be reasonable.
   */
  if (
    probability >= CLASSIFIER_THRESHOLD &&
    margin >= MARGIN_THRESHOLD
  ) {
    return {
      verified: true,
      cvDecision: "pass"
    };
  }

  /*
   * BORDERLINE
   *
   * The model sees something potentially
   * relevant, but it is not confident enough
   * for automatic publication.
   */
  if (
    probability >= REVIEW_THRESHOLD
  ) {
    return {
      verified: false,
      cvDecision: "review"
    };
  }

  /*
   * LOW CONFIDENCE
   */
  return {
    verified: false,
    cvDecision: "fail"
  };
}

// --------------------------------------------------
// RUN VERIFICATION
// --------------------------------------------------

async function runVerification(
  imageBuffer
) {
  const classification =
    await classifyImageBuffer(
      imageBuffer
    );

  const decision =
    decideVerification(
      classification
    );

  return {
    verified:
      decision.verified,

    cvDecision:
      decision.cvDecision,

    predictedClass:
      classification.predictedClass,

    classIndex:
      classification.classIndex,

    probability:
      classification.probability,

    margin:
      classification.margin,

    top3:
      classification.top3
  };
}

// --------------------------------------------------
// SINGLE IMAGE
// --------------------------------------------------

async function verifyImage(
  imagePath
) {
  const buffer =
    fs.readFileSync(imagePath);

  return runVerification(buffer);
}

async function verifyImageBuffer(
  imageBuffer
) {
  return runVerification(
    imageBuffer
  );
}

// --------------------------------------------------
// MULTI IMAGE
// --------------------------------------------------

async function verifyImageBuffers(
  imageBuffers
) {
  if (
    !Array.isArray(imageBuffers) ||
    imageBuffers.length === 0
  ) {
    throw new Error(
      "At least one image is required."
    );
  }

  const results = [];

  for (const buffer of imageBuffers) {
    const result =
      await runVerification(buffer);

    results.push(result);
  }

  const passed =
    results.filter(
      r => r.cvDecision === "pass"
    ).length;

  const failed =
    results.filter(
      r => r.cvDecision === "fail"
    ).length;

  let cvDecision;

  if (passed === results.length) {
    cvDecision = "pass";
  } else if (failed === results.length) {
    cvDecision = "fail";
  } else {
    cvDecision = "review";
  }

  /*
   * Determine dominant predicted craft.
   */
  const classCounts = {};

  for (const result of results) {
    const cls =
      result.predictedClass;

    if (!classCounts[cls]) {
      classCounts[cls] = 0;
    }

    classCounts[cls]++;
  }

  const dominantClass =
    Object.entries(classCounts)
      .sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] || null;

  const averageProbability =
    results.reduce(
      (sum, r) =>
        sum + r.probability,
      0
    ) / results.length;

  return {
    verified:
      cvDecision === "pass",

    cvDecision,

    predictedClass:
      dominantClass,

    averageProbability,

    imagesChecked:
      results.length,

    passedImages:
      passed,

    failedImages:
      failed,

    results
  };
}

async function verifyImages(
  imagePaths
) {
  const buffers =
    imagePaths.map(
      imagePath =>
        fs.readFileSync(imagePath)
    );

  return verifyImageBuffers(
    buffers
  );
}

// --------------------------------------------------
// EXPORTS
// --------------------------------------------------

module.exports = {
  verifyImage,
  verifyImageBuffer,
  verifyImages,
  verifyImageBuffers,
  classifyImageBuffer,
  runVerification
};