import mongoose from 'mongoose';
import logger from '../../utils/logger.js';
import Product from "../../models/productSchema.js"
import Category from "../../models/categorySchema.js"

const productListController = {

    //@desc render the main product list page
    //GET /productlist
    listProducts: async (req, res) => {
        try {
            const key = req.query.key
            const categories = await Category.find()
            res.render("user/productList", { categories, key })
        } catch (error) {
            logger.error(error);
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    },

    //@desc filter all product and send to product listing page
    //GET /product
    getProducts: async (req, res) => {
        try {
            const { key, price, name, category, minPrice, maxPrice } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = 8;
            const skip = (page - 1) * limit;

            // Step 1: Base match stage
            const matchStage = {
                isActive: true
            };

            // Step 2: Search key
            if (key) {
                matchStage.$text = { $search: key };
            }

            // Step 3: Sorting setup
            const sortStage = {};
            if (price === '1') sortStage.last_price = 1;
            else if (price === '2') sortStage.last_price = -1;

            if (name === '1') sortStage.product_name = 1;
            else if (name === '2') sortStage.product_name = -1;

            if (key && Object.keys(sortStage).length === 0) {
                sortStage.score = { $meta: 'textScore' };
            }

            // Step 4: Aggregation pipeline
            const pipeline = [
                { $match: matchStage },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category_id',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                { $unwind: '$category' },
                {
                    $match: {
                        'category.status': 'active',
                        ...(category ? { 'category.slug': category.toLowerCase() } : {})
                    }
                },
                {
                    $addFields: {
                        discount_chosen_percentage: {
                            $max: ['$discount_percentage', '$category.offers']
                        }
                    }
                },
                {
                    $addFields: {
                        last_price: {
                            $round: [
                                {
                                    $subtract: [
                                        '$mrp',
                                        {
                                            $multiply: [
                                                '$mrp',
                                                { $divide: ['$discount_chosen_percentage', 100] }
                                            ]
                                        }
                                    ]
                                },
                                0
                            ]
                        }
                    }
                }
            ];

            // Step 5: Filter by price range
            if (minPrice || maxPrice) {
                const priceFilter = {};
                if (minPrice) priceFilter.$gte = Number(minPrice);
                if (maxPrice) priceFilter.$lte = Number(maxPrice);
                pipeline.push({ $match: { last_price: priceFilter } });
            }

            // Step 6: Add text score if key present
            if (key) {
                pipeline.push({ $addFields: { score: { $meta: 'textScore' } } });
            }

            // Step 7: Apply sorting
            if (Object.keys(sortStage).length > 0) {
                pipeline.push({ $sort: sortStage });
            } else {
                pipeline.push({ $sort: { _id: -1 } });
            }

            // Step 8: Pagination
            pipeline.push({ $skip: skip }, { $limit: limit });

            // Step 9: Get products
            const products = await Product.aggregate(pipeline);

            // Step 10: Count total
            const countPipeline = [
                { $match: matchStage },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category_id',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                { $unwind: '$category' },
                {
                    $match: {
                        'category.status': 'active',
                        ...(category ? { 'category.slug': category.toLowerCase() } : {})
                    }
                },
                {
                    $addFields: {
                        discount_chosen_percentage: {
                            $max: ['$discount_percentage', '$category.offers']
                        }
                    }
                },
                {
                    $addFields: {
                        last_price: {
                            $round: [
                                {
                                    $subtract: [
                                        '$mrp',
                                        {
                                            $multiply: [
                                                '$mrp',
                                                { $divide: ['$discount_chosen_percentage', 100] }
                                            ]
                                        }
                                    ]
                                },
                                0
                            ]
                        }
                    }
                }
            ];

            if (minPrice || maxPrice) {
                const priceFilter = {};
                if (minPrice) priceFilter.$gte = Number(minPrice);
                if (maxPrice) priceFilter.$lte = Number(maxPrice);
                countPipeline.push({ $match: { last_price: priceFilter } });
            }

            countPipeline.push({ $count: 'total' });
            const countResult = await Product.aggregate(countPipeline);
            const totalCount = countResult[0]?.total || 0;
            const totalPages = Math.ceil(totalCount / limit);

            // Final response
            res.json({ products, totalPages, page });

        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'Server error' });
        }
    },

    //@desc get a specific product full datails and related product listing
    //GET /product/view/:id
    productDetail: async (req, res) => {
        try {
            const productId = new mongoose.Types.ObjectId(req.params.id);

            // Aggregation to fetch single product with category, last_price, and chosen discount
            const productResult = await Product.aggregate([
                { $match: { _id: productId } },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category_id',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                { $unwind: '$category' },
                {
                    $addFields: {
                        discount_chosen_percentage: {
                            $max: ['$discount_percentage', '$category.offers']
                        }
                    }
                },
                {
                    $addFields: {
                        last_price: {
                            $round: [
                                {
                                    $subtract: [
                                        '$mrp',
                                        {
                                            $multiply: [
                                                '$mrp',
                                                { $divide: ['$discount_chosen_percentage', 100] }
                                            ]
                                        }
                                    ]
                                },
                                0
                            ]
                        }
                    }
                }
            ]);

            const product = productResult[0];

            if (!product) {
                return res.status(404).render("user/404", { message: "Product not found" });
            }

            // Related products from same category
            const relatedProducts = await Product.aggregate([
                {
                    $match: {
                        category_id: product.category_id,
                        _id: { $ne: product._id },
                        isActive: true
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category_id',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                { $unwind: '$category' },
                {
                    $match: {
                        'category.status': 'active'
                    }
                },
                {
                    $addFields: {
                        discount_chosen_percentage: {
                            $max: ['$discount_percentage', '$category.offers']
                        }
                    }
                },
                {
                    $addFields: {
                        last_price: {
                            $round: [
                                {
                                    $subtract: [
                                        '$mrp',
                                        {
                                            $multiply: [
                                                '$mrp',
                                                { $divide: ['$discount_chosen_percentage', 100] }
                                            ]
                                        }
                                    ]
                                },
                                0
                            ]
                        }
                    }
                },
                { $limit: 8 }
            ]);

            // Render view with final data
            res.render("user/productDetails", {
                product,
                relatedProducts
            });

        } catch (err) {
            console.error(err);
            res.status(500).render("user/500", { message: "Server Error" });
        }
    },
}

export default productListController;