import jwt from "jsonwebtoken"
import process from "process"

export const createToken = (email, time) => {
    
    const payload = {
        userEmail: email
    }
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: time })
}