import Wishlist from "../models/wishlistModel.js";
import Product from "../models/productModel.js";
import HandleError from "../utils/handleError.js";
import handleAsyncError from "../middleware/handleAsyncError.js";

// ============================================
// Add to Wishlist
// ============================================
export const addToWishlist = handleAsyncError(async (req, res, next) => {
  const { productId } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new HandleError("Бүтээгдэхүүн олдсонгүй", 404));
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user._id,
      products: [productId],
    });
  } else {
    const exists = wishlist.products.some(
      (id) => id.toString() === productId.toString()
    );

    if (!exists) {
      wishlist.products.push(productId);
      await wishlist.save();
    }
  }

  await wishlist.populate("products");

  res.status(200).json({
    success: true,
    message: "Хүслийн жагсаалтад нэмэгдлээ",
    wishlist,
  });
});

// ============================================
// Remove from Wishlist
// ============================================
export const removeFromWishlist = handleAsyncError(async (req, res, next) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    return next(new HandleError("Хүслийн жагсаалт олдсонгүй", 404));
  }

  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== productId.toString()
  );

  await wishlist.save();
  await wishlist.populate("products");

  res.status(200).json({
    success: true,
    message: "Хүслийн жагсаалтаас устгагдлаа",
    wishlist,
  });
});

// ============================================
// Get Wishlist
// ============================================
export const getWishlist = handleAsyncError(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
    "products"
  );

  if (!wishlist) {
    return res.status(200).json({
      success: true,
      products: [],
    });
  }

  res.status(200).json({
    success: true,
    products: wishlist.products,
  });
});