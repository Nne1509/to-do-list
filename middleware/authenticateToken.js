const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization
        jwt.verify(token, process.env.TOKEN_SECRET)
        return next()
    } catch (error) {
        res.status(401).json(`Invalid token- ${error}`)
    }
}








module.exports = {verifyToken}