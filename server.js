require("dotenv").config()

const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const toDoListRouter = require('./toDoList')
const userRouter = require('./user')
const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.use('/api/user', userRouter)
app.use('/api/todo-list', toDoListRouter)

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to the database')
        app.listen(3000, () => {
            console.log('The server is running on port 3000')
        })
    })
    .catch(() => {
        console.log('Database connection failed')
    })