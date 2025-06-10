//importing core modules
import { fileURLToPath } from 'url';
import path from 'path';


//importing third-party modules
import express from 'express'
import cookieParser from 'cookie-parser';
import passport from 'passport';
import session from 'express-session';

//importing local modules
import userRoutes from './routes/userRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import { connectDB } from './config/dbConnection.js';
import { endPoints, showJWT } from './middleware/gobalMiddleware.js';
import './config/passport.js'
import logger from './utils/logger.js';
import process from 'process';

//main variable setting
const app = express()
const port = process.env.PORT || 3000
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/ecommerce'

//setting path variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Log unhandled errors
process.on('unhandledRejection', (err) => {
  logger.critical(`Unhandled Rejection: ${err.message}`);
});

process.on('uncaughtException', (err) => {
  logger.critical(`Uncaught Exception: ${err.message}`);
});


//body parse middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//static middleware
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.static(path.join(__dirname, 'public')))

//middleware for login and signUp with google
app.use(session({
  secret: process.env.SESSION_SECRET || "hekko",
  resave: false,
  saveUninitialized: false
}))

// prevent caching in browser
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.use(cookieParser())
app.use(passport.initialize())
app.use(passport.session())

//setting view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));

//this middleware is used for track the end points called
app.use(endPoints)
app.use(showJWT)

//routes setup
app.get('/', (req, res) => { res.redirect('/login'); });
app.use('/', userRoutes)
app.use('/', adminRoutes)

connectDB(mongoUrl).then(() => app.listen(port, () => console.log(`Server connected port ${port}`)))