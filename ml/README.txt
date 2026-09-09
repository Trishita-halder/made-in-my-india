MADE IN MY INDIA
ML VISUAL VERIFICATION MODEL
================================

Model:
EfficientNet-B0 feature extractor

Input:
RGB image, 224 x 224

Output:
1280-dimensional visual embedding

Verification:
1. Generate image embedding.
2. L2-normalize embedding.
3. Compare against the 22 learned class prototypes
   using cosine similarity.
4. Accept the image when maximum similarity >= 0.40.

Threshold:
0.40

Threshold selection:
Selected using validation data only, with the criterion
of achieving at least 90% accuracy among accepted
validation images.

Validation:
471 images
Accepted: 75.16%
Accepted accuracy: 90.40%

Test:
473 images
Accepted: 78.65%
Accepted accuracy: 88.98%

Independent OOD evaluation:
500 unrelated commercial-product images
OOD rejection: 99.20%
OOD false acceptance: 0.80%
ROC-AUC: 0.9741

Important:
This system is NOT a machine-made detector.

A rejected image means that the image was not sufficiently
similar to the learned traditional-art/craft visual
distribution. It does not prove that the product is
machine-made.

Training classes:
0: Insang
1: Kawung
2: Mega mendung
3: Parang
4: Sidoluhur
5: Truntum
6: Tumpal
7: aipan
8: ajrakh
9: bagru
10: bengal_school
11: bhil
12: bikaner
13: bundi
14: ikat
15: kancheepuram_checks
16: leheriya
17: madrasplaids
18: manipuriphanke
19: mizopuan
20: patola
21: sanganeri

Deployment:
The ONNX model is self-contained and does not require
an external .onnx.data file.

Backend integration:
Use ONNX Runtime to generate the embedding and compare
it with class_prototypes.npy.

Do not expose the similarity score to end users.
