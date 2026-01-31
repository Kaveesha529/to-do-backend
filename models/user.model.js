const mongoose = require('mongoose')
const bcrypt = require("bcrypt")

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
    }
}, {
    timestamps: true
})

UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.comparePassword = async function (enterdPassword) {
    return await bcrypt.compare(enterdPassword, this.password)
}

module.exports = mongoose.model("User", UserSchema)