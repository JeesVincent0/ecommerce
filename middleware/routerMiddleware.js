
import multer from "multer";
import path from "path";
import jwt from "jsonwebtoken"
import crypto from "crypto";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + crypto.randomBytes(4).toString("hex");
    cb(null, uniqueSuffix + ext);
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

export const verifyUserJWT = (req, res, next) => {
  const token = req.cookies?.jwt // assuming token is stored in cookies

  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect('/login');
    }

    req.user = decoded; // store decoded data (like userId) in request object
    next();
  });
};

export const redirectIfAuthenticated = (req, res, next) => {
  const token = req.cookies?.jwt

  if (!token) {
    return next(); // No token → proceed to login page
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(); // Invalid token → proceed to login
    }

    // Valid token → redirect to homepage or dashboard
    return res.redirect('/home');
  });
};

export const verifyAdminJWT = (req, res, next) => {
  const token = req.cookies?.jwt // assuming token is stored in cookies

  if (!token) {
    return res.redirect('/adminlogin');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect('/adminlogin');
    }

    req.user = decoded; // store decoded data (like userId) in request object
    next();
  });
};

export const redirectIfAuthenticatedAdmin = (req, res, next) => {
  const token = req.cookies?.jwt

  if (!token) {
    return next(); // No token → proceed to login page
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(); // Invalid token → proceed to login
    }

    // Valid token → redirect to homepage or dashboard
    return res.redirect('/adminhome');
  });
};