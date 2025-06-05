import jwt from 'jsonwebtoken'
import process from 'process'

//this middleware is used for track the end points. It will console the end points that we ivoked
export const endPoints = (req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next()
}

export const showJWT = (req, res, next) => {
    const token = req.cookies?.jwt
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err) => {
            if (err) {
                next()
            }
        })

    }
    next()
}

export const checkToken = (req, res, next) => {
    const token = req.cookies?.jwt
    if (token) {
        next()
    }
    res.redirect('/notfound')
}