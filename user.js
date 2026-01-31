const express = require('express')
const User = require('./models/user.model')
const generateToken = require('./utils/jwt')
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
            return res.status(200).json({ message: "Invalid credentials" })
        }

        const token = generateToken(user._id)

        res.status(200).json({
            message: "Login successfull",
            token
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router