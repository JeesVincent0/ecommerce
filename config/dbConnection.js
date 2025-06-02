import mongoose from 'mongoose'

export const connectDB = async (mongoUrl) => {
    try {
        await mongoose.connect(mongoUrl)
        console.log(`DataBase connected successfully in port - ${mongoUrl}`)
    } catch (error) {
        logger.error(`DataBase connection failed - ${error}`)
    }
}