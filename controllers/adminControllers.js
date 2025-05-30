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
    console.log(error.message)
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
    console.log(error.message)
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
    console.log(error.message);
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
    console.log("reached");

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
    console.log(parentId)

    if (parentId === "null") {
      const category = await Category.find({ parentId: null }).select("slug")
      res.json({ categoryNames: category, parent: true })
    } else if (parentId) {
      console.log("backend parentId", parentId)
      const category = await Category.find({ parentId: parentId }).select("slug")
      console.log(category)
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
    console.log(name, description, status, offer)

    //creating slug from name
    const slug = slugify(name, { lower: true, strict: true })

    //check if slug is already exists
    const existingCategory = await Category.findOne({ slug })
    console.log(existingCategory)
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

  console.log("reached search on category")
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
    console.log(slug)
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
    console.log(slug)
    const category = await Category.findOne({ slug });

    if (!category) {
      console.log("daalskhgdkjasfgjbafji")
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

  console.log(keyword)

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

  console.log(product)

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

    console.log("add body", req.body);
    console.log('add images', req.files)

    const { product_name, description, brand, mrp, discount_price, stock, tags, category_slug } = req.body;

    // Store file paths
    const imagePaths = req.files.map(file => file.path);

    const categoryId = await Category.findOne({ slug: category_slug }).select("_id")
    const discount_percentage = Math.floor((discount_price / mrp) * 100);
    const last_price = mrp - discount_price


    const newProduct = new Product({
      product_name,
      description,
      brand,
      mrp,
      discount_price,
      discount_percentage,
      stock,
      tags: tags?.split(",") || [],
      category_id: categoryId,
      images: imagePaths,
      last_price
    })

    await newProduct.save()

    res.json({ status: true })
  } catch (error) {
    console.log(error.message)
  }
}

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
    console.log(error.message)
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
        else console.log(`Deleted old image: ${imgPath}`);
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
    console.log("delete product _id reached - ", _id)
    const deleted = await Product.deleteOne({ _id })
    res.json({ success: true })

  } catch (error) {
    console.log(error.message)
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
  console.log("dataslgjfgjafbg")
  const { id } = req.params;
  const { isActive } = req.body;

  console.log(id, isActive)

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
    console.log(error.toString())
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
    console.log(error.toString())
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
    console.log(error.toString());
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
    console.log(error.toString())
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
    console.log(error.toString());
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
    console.log('error message', error.message)
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
    console.log(couponId)
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
// @route GET /salesreport?page=1&limit=10
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
//router /salesreport/pdf/download
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

    const colors = {
      primary: "#2563eb",
      secondary: "#64748b",
      accent: "#10b981",
      background: "#f8fafc",
      text: "#1e293b",
      border: "#e2e8f0",
      warning: "#f59e0b"
    };

    const pageWidth = doc.page.width - 100;

    const drawLine = (x1, y1, x2, y2, color = colors.border, width = 1) => {
      doc.strokeColor(color).lineWidth(width).moveTo(x1, y1).lineTo(x2, y2).stroke();
    };

    const drawBox = (x, y, width, height, fillColor, strokeColor = null) => {
      doc.rect(x, y, width, height);
      if (fillColor) doc.fillColor(fillColor).fill();
      if (strokeColor) doc.strokeColor(strokeColor).stroke();
    };

    // ===== HEADER =====
    drawBox(50, 50, pageWidth, 80, colors.primary);
    doc.fillColor("white").font("Helvetica-Bold").fontSize(24).text("SALES REPORT", 70, 75);
    doc.font("Helvetica").fontSize(12).text(`Generated on ${moment().format("MMMM DD, YYYY")}`, 70, 105);

    // ===== SUMMARY CARDS =====
    const cardY = 160;
    const cardWidth = (pageWidth - 30) / 4; // Adjusted spacing
    const cardHeight = 80;

    const summaryCards = [
      {
        label: "TOTAL ORDERS",
        value: report.totalOrders.toLocaleString(),
        color: colors.primary
      },
      {
        label: "TOTAL MRP",
        value: `₹${report.summary.totalMRP.toLocaleString()}`,
        color: colors.secondary
      },
      {
        label: "TOTAL DISCOUNT",
        value: `₹${report.summary.totalDiscount.toLocaleString()}`,
        color: colors.warning
      },
      {
        label: "FINAL AMOUNT",
        value: `₹${report.summary.finalAmount.toLocaleString()}`,
        color: colors.accent
      }
    ];

    summaryCards.forEach((card, i) => {
      const x = 50 + i * (cardWidth + 10);
      drawBox(x, cardY, cardWidth, cardHeight, colors.background, colors.border);
      doc.fillColor(colors.text).font("Helvetica-Bold").fontSize(10).text(card.label, x + 10, cardY + 15, {
        width: cardWidth - 20,
        align: "center"
      });
      doc.fillColor(card.color).fontSize(16).text(card.value, x + 10, cardY + 40, {
        width: cardWidth - 20,
        align: "center"
      });
    });

    // ===== DATE RANGE =====
    doc.y = cardY + cardHeight + 30;
    const dateRange = report.dateRange !== "undefined - undefined"
      ? report.dateRange
      : `All time (as of ${moment().format("MMM DD, YYYY")})`;
    doc.fillColor(colors.text).font("Helvetica").fontSize(12).text(`Report Period: ${dateRange}`, 50, doc.y);

    // ===== TABLE HEADER =====
    doc.y += 40;
    doc.font("Helvetica-Bold").fontSize(16).text("Order Details", 50, doc.y);
    doc.y += 25;

    const tableTop = doc.y;

    // Define column positions and widths for better alignment
    const columns = [
      { header: "Order ID", x: 50, width: 85 },
      { header: "Customer", x: 140, width: 100 },
      { header: "Date", x: 245, width: 75 },
      { header: "Payment", x: 325, width: 60 },
      { header: "Items", x: 390, width: 40 },
      { header: "MRP", x: 435, width: 60 },
      { header: "Discount", x: 500, width: 60 },
      { header: "Final", x: 565, width: 60 }
    ];

    // Draw table header
    drawBox(50, tableTop, pageWidth, 30, colors.primary);
    doc.fillColor("white").font("Helvetica-Bold").fontSize(9);

    columns.forEach(col => {
      doc.text(col.header, col.x + 5, tableTop + 10, {
        width: col.width - 10,
        align: col.header.includes("MRP") || col.header.includes("Discount") || col.header.includes("Final") || col.header.includes("Items") ? "center" : "left"
      });
    });

    // ===== TABLE ROWS =====
    let currentY = tableTop + 35;
    const rowHeight = 30;

    report.orders.forEach((order, index) => {
      // Check if we need a new page
      if (currentY > doc.page.height - 120) {
        doc.addPage();
        currentY = 50;

        // Redraw header on new page
        drawBox(50, currentY, pageWidth, 30, colors.primary);
        doc.fillColor("white").font("Helvetica-Bold").fontSize(9);
        columns.forEach(col => {
          doc.text(col.header, col.x + 5, currentY + 10, {
            width: col.width - 10,
            align: col.header.includes("MRP") || col.header.includes("Discount") || col.header.includes("Final") || col.header.includes("Items") ? "center" : "left"
          });
        });
        currentY += 35;
      }

      // Alternate row colors
      const rowColor = index % 2 === 0 ? "white" : colors.background;
      drawBox(50, currentY - 5, pageWidth, rowHeight, rowColor, colors.border);

      // Prepare data
      const customerName = order.userName?.length > 15 ? order.userName.slice(0, 12) + "..." : order.userName || "Unknown";
      const paymentMethod = order.paymentMethod?.toUpperCase() || "N/A";
      const orderDate = moment(order.placedAt).format("MMM DD, YY");
      const discountAmount = order.coupon?.discountAmount || 0;

      // Draw row data
      doc.fillColor(colors.text).font("Helvetica").fontSize(8);

      // Order ID
      doc.text(order.orderId || "N/A", columns[0].x + 5, currentY + 8, {
        width: columns[0].width - 10
      });

      // Customer Name
      doc.text(customerName, columns[1].x + 5, currentY + 8, {
        width: columns[1].width - 10
      });

      // Date
      doc.text(orderDate, columns[2].x + 5, currentY + 8, {
        width: columns[2].width - 10
      });

      // Payment Method
      doc.text(paymentMethod, columns[3].x + 5, currentY + 8, {
        width: columns[3].width - 10
      });

      // Items Count
      doc.text(order.totalItems?.toString() || "0", columns[4].x + 5, currentY + 8, {
        width: columns[4].width - 10,
        align: "center"
      });

      // MRP (Total Amount before discount)
      doc.fillColor(colors.secondary).font("Helvetica-Bold");
      doc.text(`₹${order.totalMRP?.toLocaleString() || order.totalAmount?.toLocaleString() || "0"}`, columns[5].x + 5, currentY + 8, {
        width: columns[5].width - 10,
        align: "right"
      });

      // Discount
      doc.fillColor(discountAmount > 0 ? colors.warning : colors.secondary);
      doc.text(`₹${discountAmount.toLocaleString()}`, columns[6].x + 5, currentY + 8, {
        width: columns[6].width - 10,
        align: "right"
      });

      // Final Amount
      doc.fillColor(colors.accent).font("Helvetica-Bold");
      doc.text(`₹${order.grandTotal?.toLocaleString() || "0"}`, columns[7].x + 5, currentY + 8, {
        width: columns[7].width - 10,
        align: "right"
      });

      currentY += rowHeight;
    });

    // ===== SUMMARY SECTION =====
    if (currentY > doc.page.height - 200) {
      doc.addPage();
      currentY = 70;
    } else {
      currentY += 40;
    }

    // Summary box
    const summaryBoxHeight = 140;
    drawBox(50, currentY, pageWidth, summaryBoxHeight, colors.background, colors.border);

    doc.fillColor(colors.text).font("Helvetica-Bold").fontSize(16).text("SUMMARY", 70, currentY + 20);

    const summaryStartY = currentY + 50;
    const summaryData = [
      { label: "Total Orders:", value: report.totalOrders.toLocaleString(), color: colors.primary },
      { label: "Total MRP:", value: `₹${report.summary.totalMRP.toLocaleString()}`, color: colors.secondary },
      { label: "Total Discounts:", value: `₹${report.summary.totalDiscount.toLocaleString()}`, color: colors.warning },
      { label: "Final Revenue:", value: `₹${report.summary.finalAmount.toLocaleString()}`, color: colors.accent },
      {
        label: "Average Order Value:",
        value: `₹${report.totalOrders ? (report.summary.finalAmount / report.totalOrders).toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "0"}`,
        color: colors.primary
      }
    ];

    summaryData.forEach((item, i) => {
      const itemY = summaryStartY + (i * 15);
      doc.fillColor(colors.text).font("Helvetica").fontSize(10);
      doc.text(item.label, 70, itemY, { width: 150 });
      doc.fillColor(item.color).font("Helvetica-Bold").fontSize(11);
      doc.text(item.value, 250, itemY);
    });

    // ===== FOOTER =====
    const footerY = doc.page.height - 60;
    drawLine(50, footerY - 10, pageWidth + 50, footerY - 10, colors.border);
    doc.fontSize(8).fillColor(colors.secondary)
      .text(`Generated by SHOPPI PVT LTD • ${moment().format("MMMM DD, YYYY [at] HH:mm")}`, 50, footerY, {
        width: pageWidth,
        align: "center"
      });

    // ===== PAGE NUMBERS =====
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor(colors.secondary)
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
//router /salesreport/excel/download
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
    sheet.getRow(7).values = [`Total Discount: ₹${((report.summary?.totalMRP - report.summary?.finalAmount) || 0).toLocaleString('en-IN')}`];
    sheet.getCell("A7").font = { bold: true };

    sheet.getRow(8).values = [`Total Coupon Offer: ₹${(report.summary?.totalDiscount || 0).toLocaleString('en-IN')}`];
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
    sheet.getCell(summaryStartRow + 2, 8).value = ((report.summary?.totalMRP - report.summary?.finalAmount) || 0) + (report.summary?.totalDiscount || 0); // Fixed: Combined all discounts
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
//rouer GET GET /dashboard?startDate=&endDate=
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
    let totalOffers = 0;

    for (const order of orders) {
      if (order.orderStatus === 'delivered') delivered++;
      if (order.orderStatus === 'returned') returned++;
      if (order.paymentMethod === 'cod') codCount++;
      if (order.paymentMethod === 'razorpay') razorpayCount++;

      for (const item of order.items) {
        const productMRP = item.productPrice * item.quantity;
        const offerAmount = (item.productPrice - item.priceAtPurchase) * item.quantity;
        totalMRP += productMRP;
        totalOffers += offerAmount;
      }

      if (order.coupon?.discountAmount) {
        totalOffers += order.coupon.discountAmount;
      }
    }

    const totalOrders = delivered + returned;

    const deliveryReturnRatio = {
      delivered,
      returned,
      deliveredPercentage: totalOrders ? ((delivered / totalOrders) * 100).toFixed(2) : 0,
      returnedPercentage: totalOrders ? ((returned / totalOrders) * 100).toFixed(2) : 0
    };

    const paymentMethodRatio = {
      cod: codCount,
      razorpay: razorpayCount,
      codPercentage: (codCount + razorpayCount) ? ((codCount / (codCount + razorpayCount)) * 100).toFixed(2) : 0,
      razorpayPercentage: (codCount + razorpayCount) ? ((razorpayCount / (codCount + razorpayCount)) * 100).toFixed(2) : 0
    };

    const pricingStats = {
      totalMRP,
      totalOffers
    };

    // Top 10 Best-Selling Products
    const topProducts = await Order.aggregate([
      {
        $match: {
          placedAt: { $gte: start, $lte: end },
          orderPlaced: true,
          orderStatus: 'delivered'
        }
      },
      { $unwind: '$items' },
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

    // Get Top Categories with total revenue and sales count
    const topCategoriesRaw = await Order.aggregate([
      {
        $match: {
          placedAt: { $gte: start, $lte: end },
          orderPlaced: true,
          orderStatus: 'delivered'
        }
      },
      { $unwind: '$items' },
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
          totalRevenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } }
        }
      },
      { $sort: { totalUnitsSold: -1 } },
      { $limit: 10 }
    ]);

    // Fetch total products for each category
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
      topCategories
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

    const start = startDate ? new Date(startDate) : new Date('2000-01-01');
    start.setUTCHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setUTCHours(23, 59, 59, 999);

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const groupBy = diffDays <= 7 ? { $dayOfMonth: "$placedAt" } :
      diffDays <= 31 ? { $dayOfMonth: "$placedAt" } :
        diffDays <= 365 ? { $month: "$placedAt" } :
          { $year: "$placedAt" };

    const dateFormat = diffDays <= 7 ? "%Y-%m-%d" :
      diffDays <= 31 ? "%Y-%m-%d" :
        diffDays <= 365 ? "%Y-%m" : "%Y";

    const salesData = await Order.aggregate([
      {
        $match: {
          placedAt: { $gte: start, $lte: end },
          orderStatus: 'delivered',
          orderPlaced: true
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$placedAt" } },
          totalSales: { $sum: "$grandTotal" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log(salesData)

    const labels = salesData.map(item => item._id);
    const sales = salesData.map(item => item.totalSales);

    res.json({ success: true, labels, sales });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};