import handleAsyncError from "../middleware/handleAsyncError.js";
import HandleError from "../utils/handleError.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import { reviewThanksEmail } from "../utils/emailTemplates/orderStatusEmail.js";
import { v2 as cloudinary } from "cloudinary";

// ============================================
// HELPER: base64 эсвэл файлыг Cloudinary-д зөв форматлах
// ============================================
const formatImageForCloudinary = (imageData) => {
  if (!imageData) return null;

  if (imageData.startsWith && imageData.startsWith("http")) {
    return null;
  }

  if (typeof imageData === "string" && imageData.startsWith("data:image")) {
    return imageData;
  }

  if (typeof imageData === "string") {
    return `data:image/png;base64,${imageData}`;
  }

  return null;
};

// ============================================
// CLOUDINARY OPTIMIZATION OPTIONS
// ============================================
const getCloudinaryOptions = (folder = "products") => ({
  folder,
  width: 800,
  crop: "scale",
  quality: "auto:good",
  fetch_format: "auto",
  flags: "progressive",
  transformation: [
    { width: 800, crop: "scale" },
    { quality: "auto:good" },
    { fetch_format: "auto" },
  ],
});

// ============================================
// CREATE PRODUCT (Admin)
// ============================================
export const createProduct = handleAsyncError(async (req, res, next) => {
  console.log("=== CREATE PRODUCT START ===");
  console.log("Body keys:", Object.keys(req.body));
  console.log("Files:", req.files);
  console.log("Files is array:", Array.isArray(req.files));
  console.log("Files length:", req.files?.length);

  const { name, description, price, category, stock } = req.body;

  let imagesToUpload = [];

  if (req.files && req.files.length > 0) {
    imagesToUpload = req.files.map((f) => ({
      type: "file",
      data: f,
    }));
    console.log("✅ Files found:", imagesToUpload.length);
  }

  if (imagesToUpload.length === 0 && req.body.images) {
    const bodyImages = Array.isArray(req.body.images)
      ? req.body.images
      : [req.body.images];
    imagesToUpload = bodyImages
      .filter((img) => img && typeof img === "string")
      .map((img) => ({
        type: "base64",
        data: img,
      }));
    console.log("✅ Base64 found:", imagesToUpload.length);
  }

  if (imagesToUpload.length === 0) {
    console.log("❌ No images to upload");
    return next(new HandleError("Please upload product images", 400));
  }

  const uploadedImages = [];

  for (const item of imagesToUpload) {
    let uploadSource;

    if (item.type === "file") {
      if (item.data.buffer) {
        const base64 = item.data.buffer.toString("base64");
        const mimeType = item.data.mimetype || "image/jpeg";
        uploadSource = `data:${mimeType};base64,${base64}`;
      } else if (item.data.tempFilePath) {
        uploadSource = item.data.tempFilePath;
      } else if (item.data.data) {
        uploadSource = item.data.data;
      }
      console.log("File source type:", typeof uploadSource);
    } else {
      uploadSource = formatImageForCloudinary(item.data);
      console.log("Base64 source type:", typeof uploadSource);
    }

    if (!uploadSource) {
      console.error("❌ Invalid image source:", item.type);
      continue;
    }

    try {
      console.log("Uploading to Cloudinary with optimization...");
      const myCloud = await cloudinary.uploader.upload(
        uploadSource,
        getCloudinaryOptions("products")
      );
      console.log("✅ Cloudinary success:", myCloud.public_id);
      uploadedImages.push({
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      });
    } catch (error) {
      console.error("❌ Cloudinary error:", error.message);
      return next(
        new HandleError(`Image upload failed: ${error.message}`, 500)
      );
    }
  }

  if (uploadedImages.length === 0) {
    console.log("❌ No images uploaded successfully");
    return next(new HandleError("No images were uploaded successfully", 400));
  }

  console.log("=== CREATING PRODUCT ===");
  const product = await Product.create({
    name,
    description,
    price,
    category,
    stock,
    images: uploadedImages,
    user: req.user._id,
  });
  console.log("✅ Product created:", product._id);

  res.status(201).json({
    success: true,
    product,
  });
});

// ============================================
// GET ALL PRODUCTS
// ============================================
export const getAllProducts = handleAsyncError(async (req, res, next) => {
  const resultPerPage = Number(req.query.limit) || 8;
  const currentPage = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};

  const category = req.query.category
    ? { category: req.query.category }
    : {};

  const filter = { ...keyword, ...category };

  const productsCount = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .limit(resultPerPage)
    .skip(resultPerPage * (currentPage - 1));

  res.status(200).json({
    success: true,
    products,
    productsCount,
    productCount: productsCount,
    resultPerPage,
    resultsPerPage: resultPerPage,
    filteredProductsCount: productsCount,
  });
});

// ============================================
// GET PRODUCT DETAILS
// ============================================
export const getProductDetails = handleAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new HandleError("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// ============================================
// UPDATE PRODUCT (Admin)
// ============================================
export const updateProduct = handleAsyncError(async (req, res, next) => {
  const { name, description, price, category, stock } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new HandleError("Product not found", 404));
  }

  let images = product.images;
  let imagesToUpload = [];

  if (req.files && req.files.images) {
    const files = Array.isArray(req.files.images)
      ? req.files.images
      : [req.files.images];
    imagesToUpload = files.map((f) => ({ type: "file", data: f }));
  }

  if (imagesToUpload.length === 0 && req.body.images) {
    const bodyImages = Array.isArray(req.body.images)
      ? req.body.images
      : [req.body.images];
    imagesToUpload = bodyImages
      .filter((img) => img && typeof img === "string")
      .map((img) => ({ type: "base64", data: img }));
  }

  if (imagesToUpload.length > 0) {
    for (const img of product.images) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
      } catch (error) {
        console.error("Cloudinary destroy error:", error.message);
      }
    }

    images = [];

    for (const item of imagesToUpload) {
      let uploadSource;

      if (item.type === "file") {
        uploadSource = item.data.tempFilePath || item.data.data;
      } else {
        uploadSource = formatImageForCloudinary(item.data);
      }

      if (!uploadSource) continue;

      try {
        const myCloud = await cloudinary.uploader.upload(
          uploadSource,
          getCloudinaryOptions("products")
        );
        images.push({
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        });
      } catch (error) {
        console.error("Cloudinary upload error:", error.message);
      }
    }
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { name, description, price, category, stock, images },
    { returnDocument: "after", runValidators: true }
  );

  res.status(200).json({
    success: true,
    product: updatedProduct,
  });
});

// ============================================
// DELETE PRODUCT (Admin)
// ============================================
export const deleteProduct = handleAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new HandleError("Product not found", 404));
  }

  for (const img of product.images) {
    try {
      await cloudinary.uploader.destroy(img.public_id);
    } catch (error) {
      console.error("Cloudinary destroy error:", error.message);
    }
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

// ============================================
// CREATE / UPDATE PRODUCT REVIEW
// ============================================
export const createProductReview = handleAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  if (!product) {
    return next(new HandleError("Product not found", 404));
  }

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    product.reviews.push(review);
  }

  product.numOfReviews = product.reviews.length;

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  // ⭐ Review thanks email илгээх
  try {
    await sendEmail({
      email: req.user.email,
      subject: "Таны сэтгэгдэлд баярлалаа! ⭐",
      message: reviewThanksEmail(
        { name: req.user.name },
        product,
        Number(rating),
        comment
      ),
    });
    console.log("✅ Review thanks email sent to:", req.user.email);
  } catch (emailError) {
    console.error("❌ Review email failed:", emailError.message);
  }

  res.status(200).json({
    success: true,
    message: "Review added successfully",
  });
});

// ============================================
// GET ALL REVIEWS OF A PRODUCT
// ============================================
export const getProductReviews = handleAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new HandleError("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// ============================================
// DELETE REVIEW
// ============================================
export const deleteReview = handleAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new HandleError("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  const ratings = reviews.length === 0 ? 0 : avg / reviews.length;
  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    { reviews, ratings, numOfReviews },
    { returnDocument: "after", runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});

// ============================================
// ADMIN — GET ALL PRODUCTS (no pagination)
// ============================================
export const getAdminProducts = handleAsyncError(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

// ============================================
// Aliases for backward compatibility
// ============================================
export const createProducts = createProduct;
export const ReviewForProduct = createProductReview;
export const getSingleProduct = getProductDetails;