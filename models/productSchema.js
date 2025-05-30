import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    product_name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    images: {
      type: [String], // Array of image URLs
      required: true,
      validate: [arrayLimit, 'You must provide at least one image'],
    },
    tags: {
      type: [String],
      default: [],
    },
    mrp: {
      type: Number,
      required: true,
    },
    discount_price: {
      type: Number,
      required: true,
    },
    discount_percentage: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    ratings: {
      type: Number,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    total_reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      }
    ],
    isActive: { type: Boolean, default: true}
  },
  { timestamps: true }
);

// Function to ensure at least one image is provided
function arrayLimit(val) {
  return val.length > 0;
}

productSchema.index({ product_name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product