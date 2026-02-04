const mongoose = require('mongoose')
const bcrypt = require("bcrypt")
const crypto = require("crypto")

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please enter the username"],
        unique: true,
        lowercase: true,
        trim: true,
        minlength: 3
    },
    password: {
        type: String,
        required: [true, "Please enter the password"],
        minlength: 6,
        select: false
    },
    refreshToken: {
        type: String,
        required: false,
        select: false
    }
}, {
    timestamps: true
})

UserSchema.pre("save", async function () {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
    }


    if (this.isModified("refreshToken") && this.refreshToken) {
        this.refreshToken = crypto.createHash("sha256").update(this.refreshToken).digest("hex")
    }
})

UserSchema.methods.comparePassword = async function (enterdPassword) {
    return await bcrypt.compare(enterdPassword, this.password)
}

module.exports = mongoose.model("User", UserSchema)