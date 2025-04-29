import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    position: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    isChild: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true, // createdAt and updatedAt auto
  }
);

const Category = mongoose.model('Category', categorySchema);

export default Category;
