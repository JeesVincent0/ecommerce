
import multer from "multer";
import path from "path";

// Configure storage 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products"); // Save files in this folder
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + file.fieldname + ext);
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, and PNG images are allowed."), false);
  }
};

// Limit size: 2MB per image
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

export const productImageUpload = upload.array("images", 4); // max 4 images
