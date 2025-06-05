import fs from 'fs';
import path from "path";
import slugify from "slugify";
import mongoose from "mongoose";
import logger from '../../utils/logger.js';
import Brand from "../../models/brandSchema.js";
import Product from "../../models/productSchema.js";
import Category from "../../models/categorySchema.js";

const productController = {

    //@desc get product list
    //GET /products
    getProducts: async (req, res) => {
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
            logger.error(error.toString())
        }
    },

    //@desc get products by search
    //GET /products/search
    getProductsSearch: async (req, res) => {
        try {
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
            const totalPages = Math.ceil(totalProduct / limit);

            res.json({ product, totalPages: totalPages, page })
        } catch (error) {
            logger.error(error)
        }
    },

    //@desc get child category details
    //GET /product/category
    getChildCategory: async (req, res) => {
        try {
            const categoryNames = await Category.find().select("slug -_id name")
            res.json({ categoyNames: categoryNames, status: true })
        } catch (error) {
            logger.error(error.toString())
            res.status(500).json({ message: "something Went wrong", status: false })
        }
    },

    //@desc add new product
    //POST /product/add
    addNewProduct: async (req, res) => {
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
    },

    //@desc get all brands for edit or add products form
    //router GET /product/brands
    getBrands: async (req, res) => {
        try {
            const brands = await Brand.find()
            res.json({ success: true, brands })
        } catch (error) {
            logger.error(error.toString());
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    },

    //@desc get product data for edit form
    //GET /product/:id
    getProductData: async (req, res) => {
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
    },

    //@desc edit product details
    //POST /product/edit
    editProduct: async (req, res) => {
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
    },

    //@desc delete product
    // DELETE /product/delete/:id
    deleteProduct: async (req, res) => {
        try {
            const _id = req.params.id

            await Product.deleteOne({ _id })
            res.json({ success: true })

        } catch (error) {
            logger.error(error.message)
        }
    },


    //@desc product block and unblock
    //Router PATCH /admin/products/:id/status
    toggleProductStatus: async (req, res) => {

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
            logger.error(error)
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

}

export default productController;