const jwt = require('jsonwebtoken')
const User = require('../models/user.model')

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        req.user = { userId: user._id }
        next()
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' })
    }
}

module.exports = authenticateToken