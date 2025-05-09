import User from "../models/userSchema.js"
import bcrypt, { hash } from 'bcrypt'
import { createToken } from "./JWT.js"
import Category from "../models/categorySchema.js"
import slugify from "slugify"
import Product from "../models/productSchema.js"
import mongoose, { Types } from "mongoose"
import path from "path"
import fs from 'fs'
import Order from "../models/ordersSchema.js"
import Wallet from "../models/walletSchema.js"

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
      .select("name slug status isChild")
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
        const { parentId, categoryName, categoryStatus, categoryDescription } = req.body

        //creating slug from name
        const slug = slugify(categoryName, { lower: true, strict: true })

        //check if slug is already exists
        const existingCategory = await Category.findOne({ slug })
        if (existingCategory) throw new ("Category with same name already exist.")

        let level = 1;
        if (parentId) {
            const parentCategory = await Category.findById(parentId);
            if (!parentCategory) {
                return res.status(400).json({ status: false, message: "Invalid parent category ID." });
            }
            level = parentCategory.level + 1;
        }

        //creating new category
        const newCategory = new Category({
            name: categoryName,
            slug: slug,
            description: categoryDescription,
            status: categoryStatus,
            parentId: parentId || null,
            level,
        })
        await newCategory.save();
        const newCategoryId = await Category.findOne({ slug: slug}).select("_id")

        await Category.updateOne({ _id: newCategoryId }, { $set: { isChild: true } })
        
        console.log("new category created")
        res.json({ status: true })

    } catch (error) {
        if (error.message === "Category with same name already exist.") {
            res.status(400).json({ exist: true, message: "error.message" })
        }
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
        const category = await Category.findOne({ slug }).select("name slug description status -_id")
        res.json({ category })

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    }
}

//@desc edit category
//PATCH /category/edit
export const editCategory = async (req, res) => {
    let { name, description, status, slug } = req.body
    console.log(name, description, status, slug)
    let tempSlug = slug
    if (name) {
        await Category.updateOne({ slug: tempSlug }, { $set: { name } })
        slug = slugify(name, { lower: true, strict: true })
        await Category.updateOne({ slug: tempSlug }, { $set: { slug } })
    }
    if (description) await Category.updateOne({ slug }, { $set: { description } })
    if (status) await Category.updateOne({ slug }, { status })
    res.json({ status: true })
}

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

        const product = await Product.find().sort({ createdAt: -1}).select("product_name mrp discount_price discount_percentage _id images stock last_price isActive").skip(skip).limit(limit)

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
        const categoryNames = await Category.find({ isChild: false }).select("slug -_id")
        console.log(categoryNames)
        res.json({ categoyNames: categoryNames, status: true })
    } catch (error) {
        res.status(500).json({ message: "something Went wrong", status: false })
    }
}

//@desc add new product
//POST /product/add
export const addNewProduct = async (req, res) => {
    try {

        console.log(req.body);
        console.log(req.files)

        const { product_name, description, brand, mrp, discount_price, stock, tags, category_slug } = req.body;

        // Store file paths
        const imagePaths = req.files.map(file => file.path);

        const categoryId = await Category.findOne({ slug: category_slug }).select("_id")
        const discount_percentage = Math.floor(((mrp - discount_price) / mrp) * 100);
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
        const productObj = await Product.findOne({ _id }).select("_id product_name description brand mrp discount_price stock tags category_id images isActive")
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
        console.log(req.body);
        console.log(req.files)

        const { id, product_name, description, brand, mrp, discount_price, stock, tags, category_slug } = req.body;

        // Store file paths
        const imagePaths = req.files.map(file => file.path);

        //finding the category _id for update in product collection
        const categoryId = await Category.findOne({ slug: category_slug }).select("_id")
        const discount_percentage = Math.floor(((mrp - discount_price) / mrp) * 100);
        const last_price = mrp - discount_price

        //all product updating variables added to a obj for cleaner code
        const updateProduct = {
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
        }

        //saving old product image file path for delete image after updating production collection
        const oldImagesPath = await Product.findOne({ _id: id }).select("images -_id")

        //Updating products
        const updated = await Product.findByIdAndUpdate(id, updateProduct, { new: true })
        if (!updated) res.status(500).json({ message: "Not updated something went wrong" })
        console.log(oldImagesPath)

        //after editing the product details, deleting the old product images
        oldImagesPath.images.forEach(imgPath => {
            const fullPath = path.resolve(imgPath);
            fs.unlink(fullPath, err => {
                if (err) console.error(`Failed to delete ${imgPath}:`, err);
                else console.log(`${imgPath} deleted`);
            });
        });

        //response
        res.json({ success: true })


    } catch (error) {
        console.log(error.message)
    }
}

//@desc delete product
// DELETE /product/delete/:id
export const deleteProduct = async (req, res) => {
    try {
        const _id = req.params.id
        console.log("delete product _id reached - ", _id)
        const deleted = await Product.deleteOne({_id})
        res.json({ success: true})
        
    } catch (error) {
        console.log(error.message)
    }
}

// Controller
export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const updated = await Order.findByIdAndUpdate(orderId, { orderStatus: status }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, message: "Order status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const handleReturnRequest = async (req, res) => {
  const { orderId } = req.params;
  const { approve } = req.body;

  try {
    const status = approve ? "returned" : "delivered";
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // Update order status
    order.orderStatus = status;
    order.returnRequest = false;
    await order.save();

    if (approve) {
      // Add refund to wallet
      let wallet = await Wallet.findOne({ userId: order.userId });
      if (!wallet) {
        wallet = new Wallet({
          userId: order.userId,
          balance: 0,
          transactions: []
        });
      }

      const refundAmount = order.totalAmount;

      wallet.balance += refundAmount;
      wallet.transactions.push({
        type: 'credit',
        amount: refundAmount,
        reason: 'Order refund',
        orderId: order._id
      });

      await wallet.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal error" });
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
