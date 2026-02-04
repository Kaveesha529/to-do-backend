const express = require('express')
const User = require('./models/user.model')
const jwt = require('jsonwebtoken')
const { generateAccessToken, generateRefreshToken } = require('./utils/jwt')
const crypto = require("crypto")
const authenticateToken = require('./middlewares/auth.middleware')
const router = express.Router()

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body
        await User.create({ username, password })
        res.status(201).json({ message: "User registered successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({ username }).select("+password")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        const accessToken = generateAccessToken(user._id)
        const refreshToken = generateRefreshToken(user._id)

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 1 * 60 * 1000
        })

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        user.refreshToken = refreshToken
        await user.save()

        return res.status(200).json({
            message: "Login successfull",
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.post('/logout', authenticateToken, async (req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        secure: process.env.NODE_ENV === "production",
    })

    const user = await User.findById(req.user.userId)
    if (user) {
        user.refreshToken = null
        await user.save()
    }

    return res.status(200).json({
        message: "Logout successfull",
    })
})

router.get('/auth/me', authenticateToken, (req, res) => {
    res.json({ user: req.user })
})

router.post('/auth/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET)
        const user = await User.findById(decoded.id).select("+refreshToken")
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const dbRefreshToken = user.refreshToken
        const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex")

        if (!dbRefreshToken) {
            return res.status(401).json({ message: "Unauthorized" })
        } else if (dbRefreshToken !== hashedRefreshToken) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const newAccessToken = generateAccessToken(user._id)
        const newRefreshToken = generateRefreshToken(user._id)

        user.refreshToken = newRefreshToken
        await user.save()

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 1 * 60 * 1000
        })

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({ message: "Access token refreshed" })

    } catch (error) {
        res.status(403).json({ message: error.message })
    }

})

module.exports = router