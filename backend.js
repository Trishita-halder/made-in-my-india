// ============================================================
// MADE IN MY INDIA
// Express Backend + Supabase + 30-Class ML Verification
// ============================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const { verifyImageBuffers } = require("./ml/verifier");

const app = express();
const PORT = process.env.PORT || 5000;

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://crexoniildaxodwguhgp.supabase.co";

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY is missing.");
  process.exit(1);
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

// ============================================================
// CORS
// ============================================================

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// ============================================================
// MULTER
// ============================================================

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 10,
    fileSize: 10 * 1024 * 1024,
  },
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/", (req, res) => {
  res.json({
    message: "Made In My India backend is running.",
  });
});

// ============================================================
// FORMAT PRODUCT
// ============================================================

function formatProduct(product) {
  if (!product) return null;

  const dbImages = Array.isArray(product.product_images)
    ? product.product_images
    : [];

  const firstUploadedImage =
    dbImages.length > 0
      ? dbImages[0].image_url
      : null;

  const mainImage =
    firstUploadedImage ||
    product.image ||
    null;

  let images = dbImages;

  if (images.length === 0 && mainImage) {
    images = [{ image_url: mainImage }];
  }

  return {
    ...product,
    image: mainImage,
    images,
  };
}

// ============================================================
// GET ALL PUBLISHED PRODUCTS
// ============================================================

app.get("/api/products", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_images (
          id,
          product_id,
          image_url,
          image_type,
          created_at
        )
      `)
      .eq("listing_status", "published")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "❌ Supabase products error:",
        error
      );

      return res.status(500).json({
        error: "Failed to load products.",
        details: error.message,
      });
    }

    return res.json(
      (data || []).map(formatProduct)
    );
  } catch (error) {
    console.error(
      "❌ GET /api/products error:",
      error
    );

    return res.status(500).json({
      error: "Failed to load products.",
    });
  }
});

// ============================================================
// GET SINGLE PRODUCT
// ============================================================

app.get("/api/products/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_images (
          id,
          product_id,
          image_url,
          image_type,
          created_at
        )
      `)
      .eq("id", req.params.id)
      .single();

    if (error) {
      console.error(
        "❌ Supabase product error:",
        error
      );

      return res.status(404).json({
        error: "Product not found.",
      });
    }

    return res.json(formatProduct(data));
  } catch (error) {
    console.error(
      "❌ GET /api/products/:id error:",
      error
    );

    return res.status(500).json({
      error: "Failed to load product.",
    });
  }
});

// ============================================================
// TEXT NORMALIZATION
// ============================================================

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

// ============================================================
// CRAFT ALIASES
// ============================================================

const craftAliases = {
  "gond painting": [
    "gond",
    "gond painting",
  ],

  "kalighat painting": [
    "kalighat",
    "kalighat painting",
  ],

  "kangra painting": [
    "kangra",
    "kangra painting",
  ],

  "kerala mural": [
    "kerala mural",
    "mural",
    "kerala mural painting",
  ],

  "madhubani painting": [
    "madhubani",
    "madhubani painting",
    "mithila",
    "mithila painting",
  ],

  "mandana art drawing": [
    "mandana",
    "mandana art",
    "mandana drawing",
    "mandana art drawing",
  ],

  "pichwai painting": [
    "pichwai",
    "pichwai painting",
  ],

  "warli painting": [
    "warli",
    "warli painting",
  ],

  aipan: [
    "aipan",
    "aipan art",
  ],

  ajrakh: [
    "ajrakh",
    "ajrakh printing",
  ],

  bagru: [
    "bagru",
    "bagru printing",
  ],

  "bengal school": [
    "bengal school",
    "bengal school painting",
  ],

  bhil: [
    "bhil",
    "bhil art",
    "bhil painting",
  ],

  bikaner: [
    "bikaner",
    "bikaner painting",
  ],

  bundi: [
    "bundi",
    "bundi painting",
  ],

  ikat: [
    "ikat",
    "ikat textile",
  ],

  "kancheepuram checks": [
    "kancheepuram",
    "kancheepuram checks",
  ],

  leheriya: [
    "leheriya",
    "leheriya textile",
  ],

  madrasplaids: [
    "madras plaid",
    "madras plaids",
    "madrasplaids",
  ],

  manipuriphanke: [
    "manipuri phanek",
    "manipuriphanke",
    "phanek",
  ],

  mizopuan: [
    "mizo puan",
    "mizopuan",
    "puan",
  ],

  patola: [
    "patola",
    "patola textile",
  ],

  sanganeri: [
    "sanganeri",
    "sanganeri printing",
  ],

  insang: [
    "insang",
  ],

  kawung: [
    "kawung",
  ],

  "mega mendeng": [
    "mega mendeng",
    "mega mendeng pattern",
  ],

  parang: [
    "parang",
  ],

  sidoluhur: [
    "sidoluhur",
  ],

  truntum: [
    "truntum",
  ],

  tumpal: [
    "tumpal",
  ],
};

// ============================================================
// MATCH SELLER CRAFT WITH ML PREDICTION
// ============================================================

function craftMatchesPrediction(
  sellerCraft,
  predictedClass
) {
  const seller = normalizeText(
    sellerCraft
  );

  const predicted = normalizeText(
    predictedClass
  );

  if (!seller || !predicted) {
    return false;
  }

  if (
    seller === predicted ||
    predicted.includes(seller) ||
    seller.includes(predicted)
  ) {
    return true;
  }

  return (
    craftAliases[predicted] || []
  ).some(
    (alias) =>
      normalizeText(alias) === seller
  );
}

// ============================================================
// METADATA CONSISTENCY CHECK
// ============================================================

function checkMetadataConsistency(
  product,
  cvResult
) {
  const warnings = [];
  const contradictions = [];

  const makingMethod = String(
    product.making_method || ""
  ).trim();

  const district = String(
    product.district || ""
  ).trim();

  const giInfo = String(
    product.gi_info || ""
  ).trim();

  const giReference = String(
    product.gi_reference || ""
  ).trim();

  const sellerCraft = normalizeText(
    product.craft
  );

  const predictedClass = normalizeText(
    cvResult.predictedClass
  );

  // ----------------------------------------------------------
  // CRAFT MATCH
  // ----------------------------------------------------------

  if (
    sellerCraft &&
    predictedClass
  ) {
    if (
      !craftMatchesPrediction(
        product.craft,
        cvResult.predictedClass
      )
    ) {
      contradictions.push(
        `Seller craft "${product.craft}" does not match ML prediction "${cvResult.predictedClass}".`
      );
    }
  }

  // ----------------------------------------------------------
  // SEARCHABLE PRODUCT TEXT
  // ----------------------------------------------------------

  const searchableText = [
    product.name,
    product.description,
    product.craft,
    product.category,
    product.material,
    product.making_method,
    product.heritage_info,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // ----------------------------------------------------------
  // SUSPICIOUS MANUFACTURING TERMS
  // ----------------------------------------------------------

  const suspiciousTerms = [
    "factory made",
    "factory-made",
    "mass produced",
    "mass-produced",
    "machine manufactured",
    "machine-manufactured",
    "machine made",
    "machine-made",
    "factory manufactured",
    "factory-manufactured",
  ];

  for (const term of suspiciousTerms) {
    if (
      searchableText.includes(term)
    ) {
      contradictions.push(
        `Suspicious manufacturing term: "${term}"`
      );
    }
  }

  // ----------------------------------------------------------
  // WARNINGS
  // ----------------------------------------------------------

  if (!makingMethod) {
    warnings.push(
      "Making method is missing."
    );
  }

  if (!district) {
    warnings.push(
      "District is missing."
    );
  }

  if (
    giInfo &&
    !giReference
  ) {
    warnings.push(
      "GI information provided without a GI reference."
    );
  }

  return {
    consistent:
      contradictions.length === 0,

    warnings,

    contradictions,

    sellerCraft:
      product.craft || null,

    predictedClass:
      cvResult.predictedClass || null,

    craftMatch:
      sellerCraft &&
      predictedClass
        ? craftMatchesPrediction(
            product.craft,
            cvResult.predictedClass
          )
        : null,
  };
}

// ============================================================
// FINAL VERIFICATION DECISION
// ============================================================

function determineVerificationDecision(
  cvResult,
  metadataResult
) {
  // ML FAILED
  if (
    cvResult.cvDecision === "fail"
  ) {
    return {
      authentication_status:
        "rejected",

      listing_status:
        "rejected",

      reason:
        "ML verification failed.",
    };
  }

  // ML NEEDS REVIEW
  if (
    cvResult.cvDecision === "review"
  ) {
    return {
      authentication_status:
        "review",

      listing_status:
        "pending",

      reason:
        "ML result requires review.",
    };
  }

  // METADATA CONTRADICTION
  if (
    metadataResult.contradictions
      .length > 0
  ) {
    return {
      authentication_status:
        "review",

      listing_status:
        "pending",

      reason:
        "ML prediction and seller metadata are inconsistent.",
    };
  }

  // VERIFIED
  return {
    authentication_status:
      "verified",

    listing_status:
      "published",

    reason:
      "ML verification and metadata checks passed.",
  };
}

// ============================================================
// CREATE PRODUCT
// ============================================================

app.post(
  "/api/products",
  upload.array("images", 10),

  async (req, res) => {
    try {
      // ======================================================
      // NO LOGIN REQUIRED
      // ======================================================
      //
      // We are intentionally not checking Supabase auth here.
      // seller_id will be NULL for this demo flow.
      //
      // ======================================================

      const files =
        req.files || [];

      // ------------------------------------------------------
      // IMAGE COUNT
      // ------------------------------------------------------

      if (files.length < 2) {
        return res.status(400).json({
          error:
            "At least 2 product images are required.",
        });
      }

      if (files.length > 10) {
        return res.status(400).json({
          error:
            "Maximum 10 product images are allowed.",
        });
      }

      // ------------------------------------------------------
      // PRODUCT DATA
      // ------------------------------------------------------

      const productData = {
        name:
          req.body.name || null,

        description:
          req.body.description || null,

        craft:
          req.body.craft || null,

        category:
          req.body.category || null,

        state:
          req.body.state || null,

        district:
          req.body.district || null,

        material:
          req.body.material || null,

        artisan_name:
          req.body.artisan_name || null,

        making_method:
          req.body.making_method || null,

        heritage_info:
          req.body.heritage_info || null,

        gi_info:
          req.body.gi_info || null,

        gi_reference:
          req.body.gi_reference || null,

        dimensions:
          req.body.dimensions || null,

        weight:
          req.body.weight || null,

        variants:
          req.body.variants || null,

        price:
          req.body.price
            ? Number(req.body.price)
            : null,

        stock:
          req.body.stock
            ? Number(req.body.stock)
            : 0,

        shipping_info:
          req.body.shipping_info || null,

        dispatch_time:
          req.body.dispatch_time || null,

        seller_phone:
          req.body.seller_phone || null,

        seller_email:
          req.body.seller_email || null,

        // Login removed for now
        seller_id: null,
      };

      // ------------------------------------------------------
      // REQUIRED FIELDS
      // ------------------------------------------------------

      if (!productData.name) {
        return res.status(400).json({
          error:
            "Product name is required.",
        });
      }

      if (!productData.craft) {
        return res.status(400).json({
          error:
            "Craft is required.",
        });
      }

      if (!productData.category) {
        return res.status(400).json({
          error:
            "Category is required.",
        });
      }

      if (!productData.state) {
        return res.status(400).json({
          error:
            "State is required.",
        });
      }

      if (!productData.material) {
        return res.status(400).json({
          error:
            "Material is required.",
        });
      }

      // ======================================================
      // ML VERIFICATION
      // ======================================================

      console.log(
        "\nRunning 30-class ML verification..."
      );

      const cvResult =
        await verifyImageBuffers(
          files.map(
            (file) =>
              file.buffer
          )
        );

      console.log(
        "ML RESULT:",
        JSON.stringify(
          cvResult,
          null,
          2
        )
      );

      // ======================================================
      // METADATA CHECK
      // ======================================================

      const metadataResult =
        checkMetadataConsistency(
          productData,
          cvResult
        );

      console.log(
        "METADATA RESULT:",
        JSON.stringify(
          metadataResult,
          null,
          2
        )
      );

      // ======================================================
      // FINAL DECISION
      // ======================================================

      const decision =
        determineVerificationDecision(
          cvResult,
          metadataResult
        );

      console.log(
        "FINAL DECISION:",
        JSON.stringify(
          decision,
          null,
          2
        )
      );

      // ======================================================
      // INSERT PRODUCT
      // ======================================================

      const {
        data: product,
        error: productError,
      } = await supabase
        .from("products")
        .insert({
          ...productData,

          authentication_status:
            decision.authentication_status,

          listing_status:
            decision.listing_status,
        })
        .select()
        .single();

      if (productError) {
        console.error(
          "❌ Product insert failed:",
          productError
        );

        return res.status(500).json({
          error:
            "Failed to create product.",

          details:
            productError.message,
        });
      }

      // ======================================================
      // UPLOAD IMAGES
      // ======================================================

      const uploadedImages = [];

      for (
        let i = 0;
        i < files.length;
        i++
      ) {
        const file =
          files[i];

        const extension =
          path
            .extname(
              file.originalname
            )
            .toLowerCase() ||
          ".jpg";

        const allowedExtensions = [
          ".jpg",
          ".jpeg",
          ".png",
          ".webp",
        ];

        const safeExtension =
          allowedExtensions.includes(
            extension
          )
            ? extension
            : ".jpg";

        const fileName =
          `${product.id}/${Date.now()}-${i}${safeExtension}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from(
            "product-images"
          )
          .upload(
            fileName,
            file.buffer,
            {
              contentType:
                file.mimetype ||
                "image/jpeg",

              upsert: false,
            }
          );

        if (uploadError) {
          console.error(
            "❌ Image upload failed:",
            uploadError
          );

          await supabase
            .from("products")
            .delete()
            .eq(
              "id",
              product.id
            );

          return res.status(500).json({
            error:
              "Failed to upload product image.",

            details:
              uploadError.message,
          });
        }

        // ----------------------------------------------------
        // PUBLIC IMAGE URL
        // ----------------------------------------------------

        const {
          data: publicUrlData,
        } =
          supabase.storage
            .from(
              "product-images"
            )
            .getPublicUrl(
              fileName
            );

        const imageUrl =
          publicUrlData
            .publicUrl;

        const imageType =
          i === 0
            ? "main"
            : "gallery";

        // ----------------------------------------------------
        // SAVE IMAGE RECORD
        // ----------------------------------------------------

        const {
          data: imageRecord,
          error:
            imageDbError,
        } = await supabase
          .from(
            "product_images"
          )
          .insert({
            product_id:
              product.id,

            image_url:
              imageUrl,

            image_type:
              imageType,
          })
          .select()
          .single();

        if (imageDbError) {
          console.error(
            "❌ Image database insert failed:",
            imageDbError
          );

          return res.status(500).json({
            error:
              "Image uploaded but database record failed.",

            details:
              imageDbError.message,
          });
        }

        uploadedImages.push(
          imageRecord
        );
      }

      // ======================================================
      // FINAL PRODUCT
      // ======================================================

      const finalProduct = {
        ...product,

        product_images:
          uploadedImages,

        image:
          uploadedImages[0]
            ?.image_url ||
          null,

        images:
          uploadedImages,
      };

      // ======================================================
      // RESPONSE
      // ======================================================

      return res.status(201).json({
        success: true,

        product:
          finalProduct,

        verification: {
          authentication_status:
            decision.authentication_status,

          listing_status:
            decision.listing_status,

          reason:
            decision.reason,

          cv_decision:
            cvResult.cvDecision,

          predicted_class:
            cvResult.predictedClass,

          probability:
            cvResult.probability,

          top3:
            cvResult.top3,

          metadata_consistent:
            metadataResult.consistent,

          craft_match:
            metadataResult.craftMatch,

          metadata_warnings:
            metadataResult.warnings,

          metadata_issues:
            metadataResult.contradictions,
        },
      });
    } catch (error) {
      console.error(
        "❌ PRODUCT SUBMISSION ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "Something went wrong while creating the product.",

        details:
          error.message,
      });
    }
  }
);

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log(
    "\n========================================"
  );

  console.log(
    "MADE IN MY INDIA BACKEND"
  );

  console.log(
    "========================================"
  );

  console.log(
    `Backend running on port ${PORT}`
  );

  console.log(
    `Supabase URL: ${SUPABASE_URL}`
  );

  console.log(
    `Service key exists: ${Boolean(
      SUPABASE_SERVICE_ROLE_KEY
    )}`
  );

  console.log(
    "ML: 30-class verification + metadata consistency enabled"
  );

  console.log(
    "Login requirement: DISABLED"
  );

  console.log(
    "========================================\n"
  );
});