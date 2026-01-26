const express = require('express')
const toDoListRouter = require('./toDoList')
const app = express()

app.use('/todo-list', toDoListRouter)

app.listen(3000, () => {
    console.log('The server is running on port 3000')
})