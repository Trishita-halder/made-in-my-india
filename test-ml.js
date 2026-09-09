const fs = require("fs");
const path = require("path");

const {
  verifyImageBuffers
} = require("./ml/verifier");

async function main() {
  console.log("Testing two-image ML verification...\n");

  const image1 = path.join(
    __dirname,
    "ml",
    "test-image2.jpg"
  );

  const image2 = path.join(
    __dirname,
    "ml",
    "test-image4.jpg"
  );

  console.log("Image 1:", image1);
  console.log("Image 2:", image2);

  if (!fs.existsSync(image1)) {
    throw new Error(`Image 1 not found: ${image1}`);
  }

  if (!fs.existsSync(image2)) {
    throw new Error(`Image 2 not found: ${image2}`);
  }

  const buffer1 =
    fs.readFileSync(image1);

  const buffer2 =
    fs.readFileSync(image2);

  const result =
    await verifyImageBuffers([
      buffer1,
      buffer2
    ]);

  console.log("========================================");
  console.log("TWO IMAGE VERIFICATION RESULT");
  console.log("========================================");

  console.log(
    JSON.stringify(result, null, 2)
  );

  console.log("========================================");
}

main().catch(error => {
  console.error("❌ Test failed:");
  console.error(error);
});