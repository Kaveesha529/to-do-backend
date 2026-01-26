const mongoose = require('mongoose')

const ToDoListSchema = mongoose.Schema({
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

ToDoListSchema.statics.findByDate = function (date) {
    const start = new Date(date)
    start.setUTCHours(0, 0, 0, 0)

    const end = new Date(date)
    end.setUTCHours(23, 59, 59, 999)

    return this.find({
        date: { $gte: start, $lte: end }
    })
}

const ToDoList = mongoose.model("ToDoList", ToDoListSchema)

module.exports = ToDoList