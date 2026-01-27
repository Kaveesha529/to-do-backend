const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const toDoListRouter = require('./toDoList')
const app = express()

app.use(cors({
    origin: "http://localhost:5173"
}))

app.use(express.json())

app.use('/api/todo-list', toDoListRouter)

mongoose.connect('mongodb+srv://knbalasooriya529_db_user:MK4Ed1oC770ViHqi@to-do-db.cquvgrx.mongodb.net/?appName=to-do-db')
    .then(() => {
        console.log('Connected to the database')
        app.listen(3000, () => {
            console.log('The server is running on port 3000')
        })
    })
    .catch(() => {
        console.log('Database connection failed')
    })