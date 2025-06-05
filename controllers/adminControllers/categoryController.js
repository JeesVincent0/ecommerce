import slugify from "slugify";
import logger from '../../utils/logger.js';
import Product from "../../models/productSchema.js";
import Category from "../../models/categorySchema.js";

const categoryController = {

    //@desc get category list
    //GET /category
    getCategoryList: async (req, res) => {
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
    },

    //@desc create new category
    //POST /category
    createNewCategory: async (req, res) => {
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
            logger.error(error)
            res.status(400).json({ success: false, message: "error.message" })
        }
    },

    //@desc get category neme and slug for category selection
    //GET /category/miancategory/:parentId
    getCategoryNames: async (req, res) => {
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
            logger.error(error.toString())
        }
    },

    //@desc get category using search keywords
    //GET /category/search?key=data
    getCategorySearch: async (req, res) => {
        try {

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
        } catch (error) {
            logger.error(error);
        }

    },

    //@desc get data for edit category form
    //GET /category/edit
    editCategoryForm: async (req, res) => {
        try {
            const slug = req.query.slug
            const category = await Category.findOne({ slug }).select("name slug description status -_id offers")
            res.json({ category })

        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: "Something went wrong" })
        }
    },

    //@desc edit category
    //PATCH /category/edit
    editCategory: async (req, res) => {
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
    },

    //@desc block and unblock catogey
    //PATCH /category/block
    statusCategory: async (req, res) => {
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
    },

    toggleCategoryStatus: async (req, res) => {
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
    },

}

export default categoryController;