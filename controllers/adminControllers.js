import User from "../models/userSchema.js"
import bcrypt from 'bcrypt'
import { createToken } from "./JWT.js"
import Category from "../models/categorySchema.js"
import slugify from "slugify"
import Product from "../models/productSchema.js"
import mongoose from "mongoose"
import path from "path"
import fs from 'fs'
import Order from "../models/ordersSchema.js"
import Wallet from "../models/walletSchema.js"
import Coupon from "../models/couponSchema.js"
import logger from '../utils/logger.js';
import referralCoupon from "../models/referralCouponSchema.js"
import PDFDocument from "pdfkit"
import moment from "moment"
import ExcelJS from "exceljs";
import { salesReportData } from "../utils/getSalesReportData.js"
import Brand from "../models/brandSchema.js"

//@desc render admin login page
//GET /adminlogin
export const getAdminLogin = (req, res) => {
  res.render('admin/login')
}

//@desc verify admin email and password
//POST /login
export const verifyAdminLogin = async (req, res) => {
  try {

    //getting form data for admin verification
    const { email, password } = req.body

    //admin mailId and status checking
    const admin = await User.findOne({ email })
    if (!admin) throw new Error("Wrong email")
    if (!admin.isAdmin) throw new Error("Wrong email")

    //password checking
    const pass = await bcrypt.compare(password, admin.hashPassword)
    if (!pass) throw new Error("Wrong password")

    const token = createToken(admin.email, '1h')
    res.cookie("jwt", token, { httpOnly: true })

    //success response with next page url
    res.json({ success: true, redirectUrl: "/adminhome", email: true, password: true })

  } catch (error) {
    logger.error(error.message)
    if (error.message === "Wrong email") {
      res.status(401).json({ email: false })
    } else if (error.message === "Wrong password") {
      res.status(401).json({ password: false, email: true })
    }
  }
}

//@desc render admin home
//GET /adminhome
export const getAdminHome = (req, res) => {
  res.render("admin/adminMainLayout")
}

//@desc pass users to fronend
//GET /users
export const getUsers = async (req, res) => {

  //getting data from query params
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;

  //settup for get users
  const skip = (page - 1) * limit;
  const filter = {
    $or: [
      { isAdmin: false },
      { isAdmin: { $exists: false } }
    ]
  };

  //getting user and count for pagination
  const users = await User.find(filter).select('name email isActive -_id').sort({ createdAt: -1 }).skip(skip).limit(limit);
  const totalUsers = await User.countDocuments(filter);
  const totalPages = Math.ceil(totalUsers / limit)

  res.json({ users, totalPages: totalPages, currentPage: page });
}

//@desc block user
//GET /users/block
export const blockUser = async (req, res) => {
  try {

    //getting data from query params
    const email = req.query.email;

    //blocking user and send response
    const user = await User.updateOne({ email }, { $set: { isActive: false } })
    res.json({ success: true, message: "User blocked" })
  } catch (error) {
    logger.error(error.message)
    res.status(500).json({ success: false, message: "Something went wrong" })
  }
}

//@desc unblock user
//GET /users/unblock
export const unBlockUser = async (req, res) => {
  try {

    //getting data from query params
    const email = req.query.email;

    //unblocking user and send response
    const user = await User.updateOne({ email }, { $set: { isActive: true } });
    res.json({ success: true, message: "User unbloked" })

  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ success: false, message: "Something went wrong" })
  }
}

//@desc get users using search keywords
//GET /users/search?key=data
export const getUsersSearch = async (req, res) => {

  //getting data from query params
  const keyword = req.query.key;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  //settup for get users
  const regxKey = new RegExp(keyword, 'i')
  const skip = (page - 1) * limit
  const filter = {
    $or: [
      { isAdmin: false },
      { isAdmin: { $exists: false } }
    ],
    $or: [
      { name: { $regex: regxKey } },
      { email: { $regex: regxKey } }
    ]
  }

  //getting user and count for pagination
  const users = await User.find(filter).select('name email isActive -_id').sort({ createdAt: -1 }).skip(skip).limit(limit)
  const totalUsers = await User.countDocuments(filter)
  const totalPages = Math.ceil(totalUsers / limit)

  res.json({ users, totalPages: totalPages, currentPage: page })
}

//@desc get category list
//GET /category
export const getCategoryList = async (req, res) => {
  try {
    logger.error("reached");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .select("name slug status totalSales totalProducts offers")
      .skip(skip)
      .limit(limit);

    // Get product count for each category
    const categoryList = await Promise.all(categories.map(async (category) => {
      const productCount = await Product.countDocuments({ category_id: category._id });
      return {
        ...category.toObject(),
        productCount,
      };
    }));

    const totalCategory = await Category.countDocuments();
    const totalPages = Math.ceil(totalCategory / limit);

    res.json({ categoryList, totalPages, page });

  } catch (error) {
    console.error("Error fetching category list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


//@desc get category neme and slug for category selection
//GET /category/miancategory/:parentId
export const getCategoryNames = async (req, res) => {
  try {
    const parentId = req.params.parentId

    if (parentId === "null") {
      const category = await Category.find({ parentId: null }).select("slug")
      res.json({ categoryNames: category, parent: true })
    } else if (parentId) {
      const category = await Category.find({ parentId: parentId }).select("slug")
     
      res.json({ categoryNames: category, parent: false, child: true })
    }
  } catch (error) {

  }
}


//@desc create new category
//POST /category
export const createNewCategory = async (req, res) => {
  try {
    const { name, description, status, offer } = req.body

    //creating slug from name
    const slug = slugify(name, { lower: true, strict: true })

    //check if slug is already exists
    const existingCategory = await Category.findOne({ slug })
    if (existingCategory) throw new ("Use another name")

    //creating new category
    const newCategory = new Category({
      name,
      slug,
      description,
      status,
      offers: offer
    })
    await newCategory.save();
    const newCategoryId = await Category.findOne({ slug: slug }).select("_id")

    await Category.updateOne({ _id: newCategoryId }, { $set: { isChild: true } })

    res.json({ status: true })

  } catch (error) {
    res.status(400).json({ success: false, message: "error.message" })
  }
}

//@desc get category using search keywords
//GET /category/search?key=data
export const getCategorySearch = async (req, res) => {

  //getting data from query params
  const keyword = req.query.key;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  //settup for get users
  const regxKey = new RegExp(keyword, 'i')
  const skip = (page - 1) * limit
  const filter = { name: { $regex: regxKey } }

  //getting category and count for pagination
  const categoryList = await Category.find(filter).select("name slug status -_id").sort({ createdAt: -1 }).skip(skip).limit(limit)
  const totalCategory = await Category.countDocuments(filter)
  const totalPages = Math.ceil(totalCategory / limit)

  res.json({ categoryList, totalPages: totalPages, page })

}

//@desc get data for edit category form
//GET /category/edit
export const editCategoryForm = async (req, res) => {
  try {
    const slug = req.query.slug
    const category = await Category.findOne({ slug }).select("name slug description status -_id offers")
    res.json({ category })

  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

//@desc edit category
//PATCH /category/edit
export const editCategory = async (req, res) => {
  try {
    let { name, description, status, slug, offers } = req.body;
    const updatedFields = {};
    const originalSlug = slug;

    // Check for name update and generate new slug
    if (name) {
      const newSlug = slugify(name, { lower: true, strict: true });

      //Check if another category already uses this slug
      const existingCategory = await Category.findOne({ slug: newSlug });
      if (existingCategory && existingCategory.slug !== originalSlug) {
        return res.status(400).json({
          status: false,
          message: 'Category name already exists',
        });
      }

      updatedFields.name = name;
      updatedFields.slug = newSlug;
    }

    if (description) updatedFields.description = description;
    if (status) updatedFields.status = status;

    const offerValue = Number(offers);
    if (!isNaN(offerValue)) updatedFields.offers = offerValue;

    const result = await Category.updateOne(
      { slug: originalSlug },
      { $set: updatedFields }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ status: false, message: 'Category not found' });
    }

    res.json({ status: true, message: 'Category updated successfully' });
  } catch (error) {
    console.error('Edit Category Error:', error);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};



//@desc block and unblock catogey
//PATCH /category/block
export const statusCategory = async (req, res) => {
  try {
    const slug = req.params.slug;

    const category = await Category.findOne({ slug });

    if (!category) {

      return res.status(404).json({ status: false, message: "Category not found" });
    }

    // Toggle status
    category.status = category.status === 'active' ? 'inactive' : 'active';
    await category.save();

    res.json({ status: true, message: "Category status updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
}

//@desc get product list
//GET /products
export const getProducts = async (req, res) => {
  try {
    //getting data from query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;

    //settup for get users
    const skip = (page - 1) * limit;

    const product = await Product.find().sort({ createdAt: -1 })
      .populate("category_id", "name")
      .select("product_name mrp discount_percentage _id images stock isActive")
      .skip(skip)
      .limit(limit)

    const totalProduct = await Product.countDocuments();
    const totalPages = Math.ceil(totalProduct / limit)


    res.json({ product, totalPages: totalPages, page })
  } catch (error) {

  }
}

//@desc get products by search
//GET /products/search
export const getProductsSearch = async (req, res) => {
  //getting data from query params
  const keyword = req.query.key;
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 2



  //settup for get users
  const regxKey = new RegExp(keyword, 'i')
  const skip = (page - 1) * limit
  const filter = {
    $or: [
      { product_name: { $regex: regxKey } },
      { tags: { $in: [regxKey] } }
    ]
  };

  //getting category and count for pagination
  const product = await Product.find(filter).select("product_name mrp discount_price discount_percentage _id images stock last_price").sort({ createdAt: -1 }).skip(skip).limit(limit)
  const totalProduct = await Product.countDocuments(filter)
  const totalPages = Math.ceil(totalProduct / limit)



  res.json({ product, totalPages: totalPages, page })
}

//@desc get child category details
//GET /product/category
export const getChildCategory = async (req, res) => {
  try {
    const categoryNames = await Category.find().select("slug -_id name")
    res.json({ categoyNames: categoryNames, status: true })
  } catch (error) {
    res.status(500).json({ message: "something Went wrong", status: false })
  }
}

//@desc add new product
//POST /product/add
export const addNewProduct = async (req, res) => {
  try {


    const {
      product_name,
      description,
      brand,
      mrp,
      discount_price,
      stock,
      tags,
      category_slug
    } = req.body;

    // 1. Handle images
    const imagePaths = req.files.map(file => file.path);

    // 2. Find category ID
    const categoryId = await Category.findOne({ slug: category_slug }).select("_id");

    // 3. Calculate discount and last price
    const discount_percentage = Math.floor((discount_price / mrp) * 100);
    const last_price = mrp - discount_price;

    // 4. Handle brand - check if brand exists
    const brandSlug = slugify(brand, { lower: true });
    let existingBrand = await Brand.findOne({ name: brandSlug });

    // 5. If brand doesn't exist, create it
    if (!existingBrand) {
      existingBrand = new Brand({ name: brandSlug });
      await existingBrand.save();
    }

    // 6. Create product
    const newProduct = new Product({
      product_name,
      description,
      brand: existingBrand.name, // or use brand ID if you store relation
      mrp,
      discount_price,
      discount_percentage,
      stock,
      tags: tags?.split(",") || [],
      category_id: categoryId,
      images: imagePaths,
      last_price
    });

    await newProduct.save();

    res.json({ status: true });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

//@desc get product data for edit form
//GET /product/:id
export const getProductData = async (req, res) => {
  try {

    //accessing id from url
    const _id = req.params.id

    //fing neccesory fields from product collection and category collection
    const productObj = await Product.findOne({ _id }).select("_id product_name description brand mrp discount_percentage stock tags category_id images isActive")
    const categoryId = new mongoose.Types.ObjectId(productObj.category_id)
    const category = await Category.findOne({ _id: categoryId }).select("slug -_id")

    //productObj convert to js pure object for add category slug before respoce
    const product = productObj.toObject()
    product.slug = category?.slug

    res.json({ product })

  } catch (error) {
    logger.error(error.message)
  }
}

//@desc edit product details
//POST /product/edit
export const editProduct = async (req, res) => {
  try {

    const { id, product_name, description, brand, mrp, discount_percentage, stock, tags, category_slug, existingImages } = req.body;

    // Parse and validate existingImages array
    let existingImagesArray = [];
    try {
      if (existingImages) {
        existingImagesArray = JSON.parse(existingImages);
        if (!Array.isArray(existingImagesArray)) {
          existingImagesArray = [];
        }
      }
    } catch (err) {
      console.warn("Error parsing existingImages", err);
    }

    // Remove null/undefined/empty values
    existingImagesArray = existingImagesArray.filter(img => typeof img === 'string' && img.trim() !== '');

    // New images from multer
    const newImagePaths = req.files?.map(file => file.path) || [];

    // Combine existing and new image paths
    const updatedImagePaths = [...existingImagesArray, ...newImagePaths].filter(Boolean);

    // Get category ID
    const category = await Category.findOne({ slug: category_slug }).select('_id');
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Parse number values
    const mrpNum = parseFloat(mrp);

    // Get old product to compare images
    const oldProduct = await Product.findById(id).select('images');
    if (!oldProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Remove unused images from disk
    const removedImages = oldProduct.images.filter(img => !updatedImagePaths.includes(img));
    removedImages.forEach(imgPath => {
      if (!imgPath || typeof imgPath !== 'string') return; // skip invalid entries
      const fullPath = path.resolve(imgPath);
      fs.unlink(fullPath, err => {
        if (err) console.error(`Failed to delete ${imgPath}:`, err);
        else logger.error(`Deleted old image: ${imgPath}`);
      });
    });

    // Prepare update object
    const updateProduct = {
      product_name,
      description,
      brand,
      mrp: mrpNum,
      discount_percentage,
      stock: parseInt(stock),
      tags: tags?.split(',').map(tag => tag.trim()) || [],
      category_id: category._id,
      images: updatedImagePaths
    };

    // Update product
    const updated = await Product.findByIdAndUpdate(id, updateProduct, { new: true });
    if (!updated) {
      return res.status(500).json({ message: 'Update failed' });
    }

    res.json({ success: true, message: 'Product updated successfully', product: updated });

  } catch (error) {
    console.error("Edit product error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


//@desc delete product
// DELETE /product/delete/:id
export const deleteProduct = async (req, res) => {
  try {
    const _id = req.params.id

    const deleted = await Product.deleteOne({ _id })
    res.json({ success: true })

  } catch (error) {
    logger.error(error.message)
  }
}

// Controller
export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;


  try {

    const order = await Order.findById(orderId);


    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const previousStatus = order.orderStatus;

    // Only adjust inventory if status is changing to cancelled or returned
    if ((status === 'cancelled' || status === 'returned') && previousStatus !== status) {
      for (const item of order.products) {
        // Assuming item.productId and item.quantity exist
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { quantity: item.quantity }
        });
      }
    }

    order.orderStatus = status;
    await order.save();

    res.json({ success: true, message: "Order status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

//@desc return request approve and reject
//router PUT /orders/:orderId/return-request
export const handleReturnRequest = async (req, res) => {
  const { orderId } = req.params;
  const { approve, productId } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const item = order.items.find(i => i.productId.toString() === productId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Product not found in order" });
    }

    if (!item.returnRequest) {
      return res.status(400).json({ success: false, message: "No return requested for this item" });
    }

    if (approve) {
      // Step 1: Revert stock
      const product = await Product.findById(productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }

      // Step 2: Calculate item total
      const itemTotal = item.priceAtPurchase * item.quantity;

      // Step 3: Adjust coupon amount if exists
      let discountOnItem = 0;
      if (order.coupon && order.coupon.code) {
        const coupon = await Coupon.findOne({ code: order.coupon.code });

        if (coupon) {
          if (coupon.discountType === 'fixed') {
            const totalItemsCost = order.items.reduce((sum, i) => {
              return sum + (i.orderStatus !== 'returned' ? i.priceAtPurchase * i.quantity : 0);
            }, 0);

            // Proportionally distribute fixed discount
            discountOnItem = (itemTotal / totalItemsCost) * order.coupon.discountAmount;

          } else if (coupon.discountType === 'percentage') {
            discountOnItem = (itemTotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount) {
              discountOnItem = Math.min(discountOnItem, coupon.maxDiscount);
            }
          }
        }
      }

      // Step 4: Update amounts and item status
      const adjustedAmount = itemTotal - discountOnItem;

      order.totalAmount -= itemTotal;
      order.grandTotal -= adjustedAmount;

      item.orderStatus = 'returned';
      item.returnRequest = false;
      item.returnReason = ''; // Optional: clear reason

    } else {
      // Reject return
      item.orderStatus = 'delivered';
      item.returnRequest = false;
    }

    await order.save();

    res.json({ success: true, message: "Return request handled successfully" });

  } catch (error) {
    console.error("Return handle error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    category.status = category.status === 'active' ? 'inactive' : 'active';
    await category.save();

    res.status(200).json({ status: category.status });
  } catch (error) {
    console.error('Toggle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getUserDetailsAndOrders = async (req, res) => {
  try {
    const email = req.params.email;

    // Find user by email (excluding password)
    const user = await User.findOne({ email })
      .select('-password')
      .populate('addresses');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find all orders for that user, and populate product details inside items
    const orders = await Order.find({ userId: user._id })
      .sort({ placedAt: -1 })
      .populate('items.productId', 'product_name images brand') // Only needed fields

    res.json({
      success: true,
      details: {
        user,
        orders
      }
    });

  } catch (error) {
    console.error('Error fetching user and orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const toggleProductStatus = async (req, res) => {

  const { id } = req.params;
  const { isActive } = req.body;

  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: `Product ${isActive ? 'unblocked' : 'blocked'} successfully`, product });

  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

//@desc get all referral coupons for list in the admin panel
// GET /coupon
export const getReferralCoupons = async (req, res) => {
  try {
    // Extract pagination parameters from query
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalCoupons = await referralCoupon.countDocuments();

    // Get coupons with pagination
    const coupons = await referralCoupon.find()
      .sort({ createdAt: -1 }) // Sort by newest first (adjust the field as needed)
      .skip(skip)
      .limit(limit);

    // Send response with pagination metadata
    res.json({
      success: true,
      coupons,
      pagination: {
        totalCoupons,
        totalPages: Math.ceil(totalCoupons / limit),
        currentPage: page,
        hasNextPage: page * limit < totalCoupons,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

//@desc get referral coupon data for edit
//GET /coupon/referral/edit
export const getReferralCoupon = async (req, res) => {
  try {
    const couponId = req.query.couponId;

    const coupon = await referralCoupon.findOne({ _id: couponId })

    res.json({ success: true, coupon })

  } catch (error) {
    logger.error(error.toString())
    res.status(500).json({ success: false, message: "Something went wrong" })
  }
}

//@desc save edited referral coupon data
//PATCH /coupon/referral/edit
export const saveReferralCoupon = async (req, res) => {
  try {
    let { id, code, totalUsageLimit, discountType, discountValue, minPurchase, maxDiscount, offerDays } = req.body;

    const existingCoupon = await referralCoupon.findOne({ code, _id: { $ne: id } });
    if (existingCoupon) {
      return res.status(400).json({ success: false, message: "Coupon code already exists." });
    }

    if (discountType === "fixed") {
      maxDiscount = 0;
    }

    await referralCoupon.updateOne(
      { _id: id },
      {
        $set: {
          code, totalUsageLimit, discountType, discountValue, minPurchase, maxDiscount, offerDays
        }
      }
    );

    res.json({ success: true })
  } catch (error) {
    logger.error(error.toString())
    res.status(500).json({ success: false, message: "Something went wrong" })
  }
}

//@desc bolock and unblock referral coupon
// PATCH blockReferralCoupon
export const blockReferralCoupon = async (req, res) => {
  try {
    const { couponId } = req.body;

    if (!couponId) {
      return res.status(400).json({ success: false, message: "Coupon ID is required" });
    }

    const coupon = await referralCoupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    // Toggle between 'active' and 'inactive'
    const newStatus = coupon.status === "active" ? "inactive" : "active";

    await referralCoupon.updateOne({ _id: couponId }, { status: newStatus });

    res.status(200).json({
      success: true,
      message: `Coupon ${newStatus === "inactive" ? "blocked" : "unblocked"} successfully`,
      newStatus
    });
  } catch (error) {
    logger.error(error.toString());
    res.status(500).json({ success: true, message: "Something went wrong" })
  }
}

//@desc Create new referral coupon form submition
//POST /coupon/referral/add
export const addReferralCoupon = async (req, res) => {
  try {
    const { code, totalUsageLimit, discountType, discountValue, minPurchase, maxDiscount, offerDays } = req.body;

    const existingCoupon = await referralCoupon.findOne({ code })
    if (existingCoupon) throw new Error("This coupon code is already taken")

    const newCoupon = new referralCoupon({
      code, totalUsageLimit, discountType, discountValue, minPurchase, maxDiscount, offerDays
    })

    await newCoupon.save();

    res.json({ success: true })

  } catch (error) {
    logger.error(error.toString())
  }
}

//@desc get referral coupons 
//GET /coupon/referral?page
export const getCoupons = async (req, res) => {
  try {
    // Extract pagination parameters from query
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalCoupons = await Coupon.countDocuments();

    // Get coupons with pagination
    const coupons = await Coupon.find()
      .sort({ createdAt: -1 }) // Sort by newest first (adjust the field as needed)
      .skip(skip)
      .limit(limit);

    // Send response with pagination metadata
    res.json({
      success: true,
      coupons,
      pagination: {
        totalCoupons,
        totalPages: Math.ceil(totalCoupons / limit),
        currentPage: page,
        hasNextPage: page * limit < totalCoupons,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

//@desc search referral coupons
// GET /coupon/referral/search?
export const searchReferralCoupons = async (req, res) => {
  try {
    const query = req.query.query;

    if (!query) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    // Case-insensitive search on coupon code
    const coupons = await referralCoupon.find({
      $or: [
        { code: { $regex: query, $options: 'i' } },
        { discountType: { $regex: query, $options: 'i' } },
        { status: { $regex: query, $options: 'i' } }
      ]
    });

    res.json({ success: true, coupons });
  } catch (error) {
    logger.error(error.toString());
    res.status(500).json({ success: true, message: "Something went wrong" })
  }
}

//@desc add new coupon
//POST /coupon/add
export const addCoupon = async (req, res) => {
  try {
    const { code, totalUsageLimit, discountType, discountValue, minPurchase, maxDiscount, startDate, expiryDate, usageLimitPerUser } = req.body;

    const existingCoupon = await Coupon.findOne({ code })
    if (existingCoupon) throw new Error("This coupon code is already taken")

    const newCoupon = new Coupon({
      code, discountType, discountValue, minPurchase, maxDiscount, startDate, expiryDate, usageLimitPerUser, totalUsageLimit
    })

    await newCoupon.save();

    res.json({ success: true })

  } catch (error) {
    logger.error('error message', error.message)
    if (error.message === "This coupon code is already taken") {
      res.status(500).json({ success: false, couponUsed: true });
    } else {
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
  }
}

//@desc get coupon data for edit coupon form 
//GET /coupon/edit
export const getCoupon = async (req, res) => {
  try {
    const couponId = req.query.couponId;
    
    const coupon = await Coupon.findOne({ _id: couponId })
    res.json({ success: true, coupon })
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" })
  }
}

//@desc save edited coupon data
// PATCH /coupon/edit
export const saveCoupon = async (req, res) => {
  try {
    const { id, code, discountType, totalUsageLimit, discountValue, minPurchase, maxDiscount, startDate, expiryDate, usageLimitPerUser } = req.body;

    const existingCoupon = await Coupon.findOne({ code, _id: { $ne: id } });
    if (existingCoupon) {
      return res.status(400).json({ success: false, message: "Coupon code already exists." });
    }

    const updated = await Coupon.updateOne(
      { _id: id },
      {
        $set: {
          code, discountType, totalUsageLimit, discountValue, minPurchase, maxDiscount, startDate, expiryDate, usageLimitPerUser
        }
      }
    );

    res.json({ success: true })

  } catch (error) {
    res.status(500).json({ success: true, message: "Something went wrong" });
  }
}

//@desc block or unblock coupon
//PATCH /coupon/block
export const blockCoupon = async (req, res) => {
  try {
    const { couponId } = req.body;

    if (!couponId) {
      return res.status(400).json({ success: false, message: "Coupon ID is required" });
    }

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    // Toggle between 'active' and 'inactive'
    const newStatus = coupon.status === "active" ? "inactive" : "active";

    await Coupon.updateOne({ _id: couponId }, { status: newStatus });

    res.status(200).json({
      success: true,
      message: `Coupon ${newStatus === "inactive" ? "blocked" : "unblocked"} successfully`,
      newStatus
    });
  } catch (error) {
    console.error("Error toggling coupon status:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Add this endpoint to your routes file

export const searchCoupons = async (req, res) => {
  try {
    const query = req.query.query;

    if (!query) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    // Case-insensitive search on coupon code
    const coupons = await Coupon.find({
      $or: [
        { code: { $regex: query, $options: 'i' } },
        { discountType: { $regex: query, $options: 'i' } },
        { status: { $regex: query, $options: 'i' } }
      ]
    });

    res.json({ success: true, coupons });
  } catch (error) {
    console.error("Error searching coupons:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


//@desc approve redund for canceled and returned order items
// POST /refund
export const approveRefund = async (req, res) => {
  try {
    const { orderId, status, productId } = req.body;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const product = order.items.find(item => item.productId.toString() === productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found in order" });
    }

    if (product.orderStatus !== "returned") {
      return res.status(400).json({ success: false, message: "Product is not marked as returned" });
    }

    // Update refund status for that specific product
    const updatedItems = order.items.map(item => {
      if (item.productId.toString() === productId) {
        return {
          ...item.toObject(),
          refund: status === "approve" ? "approve" : "reject"
        };
      }
      return item;
    });

    order.items = updatedItems;
    await order.save();

    // If refund is approved, calculate refund for that product
    if (status === "approve") {
      let refundAmount = product.priceAtPurchase * product.quantity;

      // Apply proportional coupon discount if used
      if (order.coupon?.discountAmount) {
        const orderSubtotal = order.items.reduce((sum, item) => {
          return sum + (item.priceAtPurchase * item.quantity);
        }, 0);

        const productShare = (product.priceAtPurchase * product.quantity) / orderSubtotal;
        const proportionalDiscount = order.coupon.discountAmount * productShare;

        refundAmount -= proportionalDiscount;
      }

      // Round to 2 decimals
      refundAmount = Math.round(refundAmount * 100) / 100;

      let wallet = await Wallet.findOne({ userId: order.userId });

      if (!wallet) {
        wallet = new Wallet({
          userId: order.userId,
          balance: 0,
          transactions: []
        });
      }

      wallet.balance += refundAmount;
      wallet.transactions.push({
        type: 'credit',
        amount: refundAmount,
        reason: order.coupon?.code
          ? `Refund for product (with coupon: ${order.coupon.code})`
          : 'Refund for product',
        orderId: order._id
      });

      await wallet.save();
    }

    res.json({ success: true });

  } catch (error) {
    console.error("Partial Refund Error:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


// @desc Get Sales Report
// route GET /salesreport?page=1&limit=10
export const getSalesReport = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const startDateRaw = req.query.startDate;
    const endDateRaw = req.query.endDate;

    // getting sales filtered data, funciton inside the untils forlder
    const report = await salesReportData(startDateRaw, endDateRaw, skip, limit);

    res.status(200).json({
      success: true,
      orders: report.orders,
      pagination: {
        totalOrders: report.totalOrders,
        totalPages: Math.ceil(report.totalOrders / limit),
        currentPage: page,
        hasNextPage: page * limit < report.totalOrders,
        hasPrevPage: page > 1,
      },
      summary: report.summary,
    });
  } catch (error) {
    console.error('Sales Report Error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

//@desc download salesreport in pdf
//router GET /salesreport/pdf/download
export const getSalesReportPdf = async (req, res) => {
  try {
    const { startDate: startDateRaw, endDate: endDateRaw } = req.query;

    const report = await salesReportData(startDateRaw, endDateRaw);
    logger.info(report);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=sales-report-${moment().format("YYYY-MM-DD")}.pdf`);

    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
      bufferPages: true,
      info: {
        Title: "Sales Report",
        Author: "SHOPPI PVT LTD",
        Subject: "Sales Performance Report",
        CreationDate: new Date()
      }
    });
    doc.pipe(res);

    const pageWidth = doc.page.width - 100;

    const drawLine = (x1, y1, x2, y2, width = 1) => {
      doc.strokeColor("black").lineWidth(width).moveTo(x1, y1).lineTo(x2, y2).stroke();
    };

    const drawBox = (x, y, width, height, strokeColor = "black") => {
      doc.rect(x, y, width, height);
      if (strokeColor) doc.strokeColor(strokeColor).stroke();
    };

    // ===== HEADER =====
    doc.fillColor("black").font("Helvetica-Bold").fontSize(20).text("SALES REPORT", 50, 50);
    doc.font("Helvetica").fontSize(12).text("SHOPPI PVT LTD", 50, 75);
    doc.font("Helvetica").fontSize(10).text(`Generated: ${moment().format("MMMM DD, YYYY")}`, 50, 95);
    
    drawLine(50, 115, pageWidth + 50, 115, 2);

    // ===== SUMMARY SECTION =====
    doc.y = 135;
    doc.font("Helvetica-Bold").fontSize(14).text("SUMMARY", 50, doc.y);
    doc.y += 25;

    const summaryData = [
      { label: "Total Orders:", value: report.totalOrders.toLocaleString() },
      { label: "Total MRP:", value: `₹${report.summary.totalMRP.toLocaleString()}` },
      { label: "Total Discount:", value: `₹${report.summary.totalDiscount.toLocaleString()}` },
      { label: "Final Amount:", value: `₹${report.summary.finalAmount.toLocaleString()}` },
      { 
        label: "Average Order Value:", 
        value: `₹${report.totalOrders ? (report.summary.finalAmount / report.totalOrders).toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "0"}` 
      }
    ];

    summaryData.forEach((item, i) => {
      const itemY = doc.y + (i * 18);
      doc.fillColor("black").font("Helvetica").fontSize(10);
      doc.text(item.label, 50, itemY, { width: 150 });
      doc.font("Helvetica-Bold");
      doc.text(item.value, 220, itemY);
    });

    // ===== DATE RANGE =====
    doc.y += 120;
    const dateRange = report.dateRange !== "undefined - undefined"
      ? report.dateRange
      : `All time (as of ${moment().format("MMM DD, YYYY")})`;
    doc.font("Helvetica").fontSize(10).text(`Report Period: ${dateRange}`, 50, doc.y);

    // ===== TABLE =====
    doc.y += 35;
    doc.font("Helvetica-Bold").fontSize(12).text("ORDER DETAILS", 50, doc.y);
    doc.y += 20;

    const tableTop = doc.y;

    // FIXED: Define columns with proper widths that fit within page boundaries
    const columns = [
      { header: "Order ID", x: 50, width: 80 },
      { header: "Date", x: 135, width: 70 },
      { header: "Payment", x: 210, width: 70 },
      { header: "Items", x: 285, width: 45 },
      { header: "MRP", x: 335, width: 70 },
      { header: "Discount", x: 410, width: 70 },
      { header: "Final", x: 485, width: 65 }  // Ends at 550, well within pageWidth (545)
    ];

    // Draw table header
    drawBox(50, tableTop, pageWidth, 25);
    doc.fillColor("black").font("Helvetica-Bold").fontSize(9);

    columns.forEach(col => {
      const align = ["MRP", "Discount", "Final", "Items"].includes(col.header) ? "center" : "left";
      doc.text(col.header, col.x + 5, tableTop + 8, {
        width: col.width - 10,
        align: align
      });
    });

    // ===== TABLE ROWS =====
    let currentY = tableTop + 30;
    const rowHeight = 25;

    report.orders.forEach((order, index) => {
      // Check if we need a new page
      if (currentY > doc.page.height - 100) {
        doc.addPage();
        currentY = 50;

        // Redraw header on new page
        drawBox(50, currentY, pageWidth, 25);
        doc.fillColor("black").font("Helvetica-Bold").fontSize(9);
        columns.forEach(col => {
          const align = ["MRP", "Discount", "Final", "Items"].includes(col.header) ? "center" : "left";
          doc.text(col.header, col.x + 5, currentY + 8, {
            width: col.width - 10,
            align: align
          });
        });
        currentY += 30;
      }

      // Draw row border
      drawBox(50, currentY - 2, pageWidth, rowHeight);

      // Prepare data
      const paymentMethod = order.paymentMethod?.toUpperCase() || "N/A";
      const orderDate = moment(order.placedAt).format("DD/MM/YY");
      const discountAmount = order.coupon?.discountAmount || 0;

      // Draw row data
      doc.fillColor("black").font("Helvetica").fontSize(8);

      // Order ID - truncate if too long
      const orderId = order.orderId || "N/A";
      const truncatedOrderId = orderId.length > 12 ? orderId.substring(0, 12) + "..." : orderId;
      doc.text(truncatedOrderId, columns[0].x + 3, currentY + 6, {
        width: columns[0].width - 6
      });

      // Date
      doc.text(orderDate, columns[1].x + 3, currentY + 6, {
        width: columns[1].width - 6
      });

      // Payment Method - truncate if needed
      const truncatedPayment = paymentMethod.length > 8 ? paymentMethod.substring(0, 8) : paymentMethod;
      doc.text(truncatedPayment, columns[2].x + 3, currentY + 6, {
        width: columns[2].width - 6
      });

      // Items Count
      doc.text(order.totalItems?.toString() || "0", columns[3].x + 3, currentY + 6, {
        width: columns[3].width - 6,
        align: "center"
      });

      // MRP
      doc.text(`₹${order.totalMRP?.toLocaleString() || order.totalAmount?.toLocaleString() || "0"}`, columns[4].x + 3, currentY + 6, {
        width: columns[4].width - 6,
        align: "right"
      });

      // Discount
      doc.text(`₹${discountAmount.toLocaleString()}`, columns[5].x + 3, currentY + 6, {
        width: columns[5].width - 6,
        align: "right"
      });

      // Final Amount - this should now fit properly
      doc.font("Helvetica-Bold");
      doc.text(`₹${order.grandTotal?.toLocaleString() || "0"}`, columns[6].x + 3, currentY + 6, {
        width: columns[6].width - 6,
        align: "right"
      });

      currentY += rowHeight;
    });

    // ===== FOOTER =====
    const footerY = doc.page.height - 50;
    drawLine(50, footerY - 15, pageWidth + 50, footerY - 15);
    doc.fontSize(8).fillColor("black").font("Helvetica")
      .text(`SHOPPI PVT LTD • Generated on ${moment().format("DD/MM/YYYY [at] HH:mm")}`, 50, footerY, {
        width: pageWidth,
        align: "center"
      });

    // ===== PAGE NUMBERS =====
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor("black").font("Helvetica")
        .text(`Page ${i + 1} of ${totalPages}`, doc.page.width - 100, doc.page.height - 30, {
          align: "right"
        });
    }

    doc.end();

  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({
      error: "Failed to generate sales report",
      message: err.message
    });
  }
};


//@desc douwnload sales report in excel 
//router GET /salesreport/excel/download
export const downloadSalesReportExcel = async (req, res) => {
  try {
    const { startDate: startDateRaw, endDate: endDateRaw } = req.query;

    // Set default dates if not provided
    const defaultStartDate = startDateRaw || '2000-01-01';
    const defaultEndDate = endDateRaw || new Date().toISOString().split('T')[0];

    const report = await salesReportData(defaultStartDate, defaultEndDate);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sales Report");

    // Title and summary section
    sheet.mergeCells("A1", "H1"); // Fixed: Changed from G1 to H1 for 8 columns
    sheet.getCell("A1").value = "SALES REPORT";
    sheet.getCell("A1").font = { size: 18, bold: true };
    sheet.getCell("A1").alignment = { horizontal: 'center' };

    // Add generated date
    sheet.mergeCells("A2", "H2"); // Fixed: Changed from G2 to H2 for 8 columns
    sheet.getCell("A2").value = `Generated on: ${new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`;
    sheet.getCell("A2").alignment = { horizontal: 'center' };
    sheet.getCell("A2").font = { size: 10, italic: true };

    // Summary Cards
    sheet.getRow(4).values = [`Report Period: ${report.dateRange || `${defaultStartDate} - ${defaultEndDate}`}`];
    sheet.getCell("A4").font = { bold: true, size: 12 };

    sheet.getRow(5).values = [`Total Orders: ${report.totalOrders || 0}`];
    sheet.getCell("A5").font = { bold: true };

    sheet.getRow(6).values = [`Total Sales: ₹${(report.summary?.totalMRP || 0).toLocaleString('en-IN')}`];
    sheet.getCell("A6").font = { bold: true };

    // Fixed: Separate rows for different discount types
    sheet.getRow(7).values = [`Total Discount: ₹${((report.summary?.totalDiscount) || 0).toLocaleString('en-IN')}`];
    sheet.getCell("A7").font = { bold: true };

    sheet.getRow(8).values = [`Total Coupon Offer: ₹${(report.summary?.proportionalDiscount || 0).toLocaleString('en-IN')}`];
    sheet.getCell("A8").font = { bold: true };

    sheet.getRow(9).values = [`Final Revenue: ₹${(report.summary?.finalAmount || 0).toLocaleString('en-IN')}`];
    sheet.getCell("A9").font = { bold: true };

    const avgOrderValue = report.totalOrders ? (report.summary?.finalAmount || 0) / report.totalOrders : 0;
    sheet.getRow(10).values = [`Average Order Value: ₹${avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`];
    sheet.getCell("A10").font = { bold: true };

    // Table Header (starting from row 12)
    const headerRow = sheet.getRow(12); // Fixed: Changed from row 11 to 12
    headerRow.values = [
      "Order ID",
      "Customer Name",
      "Date",
      "Payment Method",
      "Total Amount",
      "Discount",
      "Coupon Offer", // Fixed: Proper formatting
      "Grand Total"
    ];

    // Style header row
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2563eb' }
    };
    headerRow.height = 25;

    // Table Rows
    let rowIndex = 13; // Fixed: Start from row 13
    (report.orders || []).forEach((order) => {
      const row = sheet.addRow([
        order.orderId || "N/A",
        order.userName || "Unknown",
        order.placedAt ? new Date(order.placedAt).toLocaleDateString('en-IN') : "N/A",
        order.paymentMethod || "N/A",
        order.totalMRP || 0,
        (order.totalMRP - order.totalAmount) || 0, // Fixed: Added fallback
        (order.coupon?.discountAmount || 0),
        order.grandTotal || 0,
      ]);

      // Alternate row colors
      if (rowIndex % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F8FAFC' }
        };
      }

      // Format currency columns (Fixed: Updated column numbers)
      row.getCell(5).numFmt = '₹#,##0.00'; // Total Amount
      row.getCell(6).numFmt = '₹#,##0.00'; // Discount
      row.getCell(7).numFmt = '₹#,##0.00'; // Coupon Offer
      row.getCell(8).numFmt = '₹#,##0.00'; // Grand Total

      rowIndex++;
    });

    // Column formatting and widths (Fixed: Added width for 8th column)
    const columnWidths = [15, 25, 15, 18, 15, 15, 15, 15]; // Added width for Coupon Offer column
    sheet.columns.forEach((col, index) => {
      col.width = columnWidths[index] || 15;
    });

    // Add borders to all used cells (Fixed: Updated column count to 8)
    const lastRow = sheet.lastRow?.number || 12;
    for (let row = 1; row <= lastRow; row++) {
      for (let col = 1; col <= 8; col++) { // Fixed: Changed from 7 to 8 columns
        const cell = sheet.getCell(row, col);
        if (row >= 12) { // Fixed: Updated to row 12 for table start
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
      }
    }

    // Summary totals at the bottom
    const summaryStartRow = lastRow + 2;
    sheet.getCell(summaryStartRow, 1).value = "SUMMARY";
    sheet.getCell(summaryStartRow, 1).font = { bold: true, size: 14 };

    // Fixed: Updated summary calculations and positions
    sheet.getCell(summaryStartRow + 1, 6).value = "Total Sales:";
    sheet.getCell(summaryStartRow + 1, 6).font = { bold: true };
    sheet.getCell(summaryStartRow + 1, 8).value = report.summary?.totalMRP || 0; // Fixed: Use totalMRP for total sales
    sheet.getCell(summaryStartRow + 1, 8).numFmt = '₹#,##0.00';
    sheet.getCell(summaryStartRow + 1, 8).font = { bold: true };

    sheet.getCell(summaryStartRow + 2, 6).value = "Total Discount:";
    sheet.getCell(summaryStartRow + 2, 6).font = { bold: true };
    sheet.getCell(summaryStartRow + 2, 8).value = ((report.summary?.totalDiscount ) || 0) + (report.summary?.proportionalDiscount || 0); // Fixed: Combined all discounts
    sheet.getCell(summaryStartRow + 2, 8).numFmt = '₹#,##0.00';
    sheet.getCell(summaryStartRow + 2, 8).font = { bold: true };

    sheet.getCell(summaryStartRow + 3, 6).value = "Final Revenue:";
    sheet.getCell(summaryStartRow + 3, 6).font = { bold: true };
    sheet.getCell(summaryStartRow + 3, 8).value = report.summary?.finalAmount || 0;
    sheet.getCell(summaryStartRow + 3, 8).numFmt = '₹#,##0.00';
    sheet.getCell(summaryStartRow + 3, 8).font = { bold: true, color: { argb: '10b981' } };

    // Generate filename with date range (Fixed: Sanitize filename)
    const sanitizedStartDate = defaultStartDate.replace(/[:/\\?%*|"<>]/g, '-');
    const sanitizedEndDate = defaultEndDate.replace(/[:/\\?%*|"<>]/g, '-');
    const filename = `sales-report-${sanitizedStartDate}-to-${sanitizedEndDate}.xlsx`;

    // Send as download
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`); // Fixed: Added quotes around filename

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Error generating Excel report:", err);
    res.status(500).json({
      error: "Failed to generate Excel report",
      message: err.message
    });
  }
};

//@desc get data for admin dashboard
//rouer GET /dashboard?startDate=&endDate=
export const dashBoardData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date('2000-01-01');
    start.setUTCHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setUTCHours(23, 59, 59, 999);

    const orders = await Order.find({
      placedAt: { $gte: start, $lte: end },
      orderPlaced: true
    }).populate('items.productId');

    let delivered = 0;
    let returned = 0;
    let codCount = 0;
    let razorpayCount = 0;

    let totalMRP = 0;
    let totalRevenue = 0;
    let productDiscount = 0;
    let couponDiscount = 0;
    let proportionalCouponDiscount = 0;

    for (const order of orders) {
      if (order.paymentMethod === 'cod') codCount++;
      if (order.paymentMethod === 'razorpay') razorpayCount++;

      // Calculate total delivered revenue per order
      const deliveredItems = order.items.filter(item => item.orderStatus === 'delivered');
      const totalDeliveredRevenue = deliveredItems.reduce((sum, item) => (
        sum + item.priceAtPurchase * item.quantity
      ), 0);

      for (const item of order.items) {
        if (item.orderStatus === 'delivered') delivered++;
        if (item.orderStatus === 'returned') returned++;

        const itemMRP = item.productPrice * item.quantity;
        const itemRevenue = item.priceAtPurchase * item.quantity;
        const itemProductDiscount = (item.productPrice - item.priceAtPurchase) * item.quantity;

        totalMRP += itemMRP;
        totalRevenue += itemRevenue;
        productDiscount += itemProductDiscount;

        // Add proportional coupon discount only for delivered items
        if (item.orderStatus === 'delivered' && order.coupon?.discountAmount && totalDeliveredRevenue > 0) {
          const proportion = itemRevenue / totalDeliveredRevenue;
          const proportionalDiscount = proportion * order.coupon.discountAmount;
          proportionalCouponDiscount += proportionalDiscount;
        }
      }

      // Add full coupon discount to total discount
      if (order.coupon?.discountAmount) {
        couponDiscount += order.coupon.discountAmount;
      }
    }

    const totalItems = delivered + returned;

    const deliveryReturnRatio = {
      delivered,
      returned,
      deliveredPercentage: totalItems ? ((delivered / totalItems) * 100).toFixed(2) : 0,
      returnedPercentage: totalItems ? ((returned / totalItems) * 100).toFixed(2) : 0
    };

    const paymentMethodRatio = {
      cod: codCount,
      razorpay: razorpayCount,
      codPercentage: (codCount + razorpayCount) ? ((codCount / (codCount + razorpayCount)) * 100).toFixed(2) : 0,
      razorpayPercentage: (codCount + razorpayCount) ? ((razorpayCount / (codCount + razorpayCount)) * 100).toFixed(2) : 0
    };

    const totalDiscount = productDiscount + couponDiscount;
    const finalAmount = totalDiscount - proportionalCouponDiscount;

    const pricingStats = {
      totalMRP: +totalMRP.toFixed(2),
      totalRevenue: +totalRevenue.toFixed(2),
      productDiscount: +productDiscount.toFixed(2),
      couponDiscount: +couponDiscount.toFixed(2),
      totalDiscount: +totalDiscount.toFixed(2),
      proportionalCouponDiscount: +proportionalCouponDiscount.toFixed(2),
      finalAmount: +finalAmount.toFixed(2)
    };

    // Top 10 Best-Selling Products
    const topProducts = await Order.aggregate([
      {
        $match: {
          placedAt: { $gte: start, $lte: end },
          orderPlaced: true,
          'items.orderStatus': 'delivered'
        }
      },
      { $unwind: '$items' },
      { $match: { 'items.orderStatus': 'delivered' } },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          productId: '$_id',
          product_name: '$productInfo.product_name',
          discount_price: '$productInfo.discount_price',
          mrp: '$productInfo.mrp',
          ratings: '$productInfo.ratings',
          image: { $arrayElemAt: ['$productInfo.images', 0] },
          totalSold: 1
        }
      }
    ]);

    // Top Brands
    const topBrands = await Order.aggregate([
      {
        $match: {
          placedAt: { $gte: start, $lte: end },
          orderPlaced: true,
          'items.orderStatus': 'delivered'
        }
      },
      { $unwind: '$items' },
      { $match: { 'items.orderStatus': 'delivered' } },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.brand',
          salesCount: { $sum: '$items.quantity' },
          productSet: { $addToSet: '$items.productId' },
          revenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } }
        }
      },
      {
        $project: {
          brand: '$_id',
          salesCount: 1,
          productCount: { $size: '$productSet' },
          revenue: 1
        }
      },
      { $sort: { salesCount: -1 } },
      { $limit: 10 }
    ]);

    // Top Categories
    const topCategoriesRaw = await Order.aggregate([
      {
        $match: {
          placedAt: { $gte: start, $lte: end },
          orderPlaced: true,
          'items.orderStatus': 'delivered'
        }
      },
      { $unwind: '$items' },
      { $match: { 'items.orderStatus': 'delivered' } },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productInfo.category_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo._id',
          name: { $first: '$categoryInfo.name' },
          totalUnitsSold: { $sum: '$items.quantity' },
          totalRevenue: {
            $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] }
          }
        }
      },
      { $sort: { totalUnitsSold: -1 } },
      { $limit: 10 }
    ]);

    const topCategories = await Promise.all(
      topCategoriesRaw.map(async (cat) => {
        const productCount = await Product.countDocuments({ category_id: cat._id });
        return {
          categoryId: cat._id,
          name: cat.name,
          totalUnitsSold: cat.totalUnitsSold,
          totalRevenue: cat.totalRevenue,
          totalProducts: productCount
        };
      })
    );

    res.json({
      success: true,
      deliveryReturnRatio,
      paymentMethodRatio,
      pricingStats,
      topProducts,
      topCategories,
      topBrands
    });

  } catch (error) {
    logger.error(`${error.toString()} - [PATH - ${req.method} ${req.originalUrl} ]`);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


//@desc get sales data for admin dashboard
//router GET /sales-chart-data
export const getSalesChartData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Set date range with proper UTC handling
    const start = startDate ? new Date(startDate) : new Date('2000-01-01');
    start.setUTCHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setUTCHours(23, 59, 59, 999);

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Helper function to determine grouping strategy
    const getGroupingStrategy = (diffDays) => {
      if (diffDays <= 7) {
        return {
          groupBy: { $dayOfMonth: "$placedAt" },
          dateFormat: "%Y-%m-%d"
        };
      } else if (diffDays <= 31) {
        return {
          groupBy: { $dayOfMonth: "$placedAt" },
          dateFormat: "%Y-%m-%d"
        };
      } else if (diffDays <= 365) {
        return {
          groupBy: { $month: "$placedAt" },
          dateFormat: "%Y-%m"
        };
      } else {
        return {
          groupBy: { $year: "$placedAt" },
          dateFormat: "%Y"
        };
      }
    };

    const { groupBy, dateFormat } = getGroupingStrategy(diffDays);

    // Get sales data with proper item-level status checking
    const salesData = await Order.aggregate([
      {
        $match: {
          placedAt: { $gte: start, $lte: end },
          orderPlaced: true
        }
      },
      {
        $unwind: "$items"
      },
      {
        $match: {
          "items.orderStatus": "delivered"
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$placedAt" } },
          totalSales: { 
            $sum: { 
              $multiply: ["$items.quantity", "$items.priceAtPurchase"] 
            } 
          },
          orderCount: { $addToSet: "$_id" },
          itemCount: { $sum: "$items.quantity" }
        }
      },
      {
        $addFields: {
          orderCount: { $size: "$orderCount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Helper function to fill missing periods with zero values
    const fillMissingPeriods = (data, start, end, diffDays) => {
      const filledData = [];
      const dataMap = new Map(data.map(item => [item._id, item]));
      
      if (diffDays <= 31) {
        // Fill daily data
        const current = new Date(start);
        while (current <= end) {
          const dateStr = current.toISOString().split('T')[0];
          filledData.push(dataMap.get(dateStr) || { 
            _id: dateStr, 
            totalSales: 0, 
            orderCount: 0,
            itemCount: 0
          });
          current.setDate(current.getDate() + 1);
        }
      } else if (diffDays <= 365) {
        // Fill monthly data
        const current = new Date(start.getFullYear(), start.getMonth(), 1);
        const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
        
        while (current <= endMonth) {
          const monthStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
          filledData.push(dataMap.get(monthStr) || { 
            _id: monthStr, 
            totalSales: 0, 
            orderCount: 0,
            itemCount: 0
          });
          current.setMonth(current.getMonth() + 1);
        }
      } else {
        // Fill yearly data
        const startYear = start.getFullYear();
        const endYear = end.getFullYear();
        
        for (let year = startYear; year <= endYear; year++) {
          const yearStr = year.toString();
          filledData.push(dataMap.get(yearStr) || { 
            _id: yearStr, 
            totalSales: 0, 
            orderCount: 0,
            itemCount: 0
          });
        }
      }
      
      return filledData;
    };

    // Helper function to format labels for display
    const formatLabel = (dateStr, diffDays) => {
      try {
        if (diffDays <= 7) {
          // Show day name for weekly view (e.g., "Mon, Jan 15")
          const date = new Date(dateStr + 'T00:00:00.000Z');
          return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            timeZone: 'UTC'
          });
        } else if (diffDays <= 31) {
          // Show month day for monthly view (e.g., "Jan 15")
          const date = new Date(dateStr + 'T00:00:00.000Z');
          return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            timeZone: 'UTC'
          });
        } else if (diffDays <= 365) {
          // Show month year for yearly view (e.g., "Jan 2024")
          const [year, month] = dateStr.split('-');
          const date = new Date(year, month - 1, 1);
          return date.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric'
          });
        } else {
          // Show year for multi-year view (e.g., "2024")
          return dateStr;
        }
      } catch (error) {
        console.error('Date formatting error:', error);
        return dateStr; // fallback to raw string
      }
    };

    // Helper function to get period type for summary
    const getPeriodType = (diffDays) => {
      if (diffDays <= 7) return 'daily-week';
      if (diffDays <= 31) return 'daily-month';
      if (diffDays <= 365) return 'monthly';
      return 'yearly';
    };

    // Fill in missing dates/periods with zero values
    const filledData = fillMissingPeriods(salesData, start, end, diffDays);

    // Format data for chart
    const labels = filledData.map(item => formatLabel(item._id, diffDays));
    const sales = filledData.map(item => item.totalSales);

    // Calculate summary statistics
    const totalRevenue = sales.reduce((sum, amount) => sum + amount, 0);
    const totalOrders = filledData.reduce((sum, item) => sum + (item.orderCount || 0), 0);
    const totalItems = filledData.reduce((sum, item) => sum + (item.itemCount || 0), 0);
    const averageSale = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Return data in your preferred format
    res.json({ 
      success: true, 
      labels, 
      sales,
      // Additional data for enhanced functionality
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        totalItems,
        averageSale: Math.round(averageSale * 100) / 100,
        dateRange: { 
          start: start.toISOString().split('T')[0], 
          end: end.toISOString().split('T')[0] 
        },
        period: getPeriodType(diffDays)
      },
      chartData: filledData
    });
  } catch (error) {
    console.error('Sales Chart Error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

//@desc get all brands for edit or add products form
//router GET /product/brands
export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find()
    res.json({ success: true, brands })
  } catch (error) {
    logger.error(error.toString());
    res.status(500).json({ success: false, message: "Something went wrong" })
  }
}