import jwt from 'jsonwebtoken'

//this middleware is used for track the end points. It will console the end points that we ivoked
export const endPoints = (req, res, next) => {
    logger.error(`${req.method} ${req.originalUrl}`)

    next()
}

export const showJWT = (req, res, next) => {
    const token = req.cookies?.jwt
    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    logger.error("TokenExpiredError")
                }
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