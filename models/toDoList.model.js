const mongoose = require('mongoose')

const ToDoListSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true]
    },
    date: {
        type: Date,
        required: [true, "Please select the date"],
        default: Date.now
    },

    tasks: [{
        name: {
            type: String,
            required: [true, "Please add a task"]
        },
        status: {
            type: String,
            enum: ["pending", "done"],
            default: "pending",
            required: [false]
        }
    }]
}, {
    timestamps: true
})

ToDoListSchema.statics.findByDate = function (userId, date) {
    const start = new Date(date)
    start.setUTCHours(0, 0, 0, 0)

    const end = new Date(date)
    end.setUTCHours(23, 59, 59, 999)

    return this.find({
        userId: { $eq: userId },
        date: { $gte: start, $lte: end }
    })
}

const ToDoList = mongoose.model("ToDoList", ToDoListSchema)

module.exports = ToDoList