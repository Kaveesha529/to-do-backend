const express = require('express')
const ToDoList = require('./models/toDoList.model')
const router = express.Router()

router.post('/create', async (req, res) => {
    try {
        const { date, tasks } = req.body
        let toDoList = await ToDoList.findByDate(date)
        if (toDoList.length === 0) {
            toDoList = await ToDoList.create(req.body)
            return res.status(200).json({ message: "Task created successfully" })
        }
        const list = toDoList[0]
        list.tasks.push(...tasks)
        await list.save()
        res.status(200).json({ message: "Task created successfully" })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.get('/', async (req, res) => {
    try {
        const { date } = req.query
        if (!date) {
            const toDoList = await ToDoList.findByDate(Date.now())
            return res.status(200).json(toDoList)
        }

        const toDoList = await ToDoList.find({
            date: {
                $eq: new Date(date)
            }
        })
        res.status(200).json(toDoList)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.delete('/:listId', async (req, res) => {
    try {
        const { listId } = req.params
        const deletedList = await ToDoList.findByIdAndDelete(listId)

        if (!deletedList) {
            return res.status(404).json({ message: "List not found" })
        }

        res.status(200).json({ message: "List deleted successfully" })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.delete('/:listId/tasks/:taskId', async (req, res) => {
    try {
        const { listId, taskId } = req.params
        const deletedTask = await ToDoList.findByIdAndUpdate(
            listId,
            { $pull: { tasks: { _id: taskId } } },
            { new: true }
        )

        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found" })
        }

        res.status(200).json({ message: "Task deleted successfully" })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.patch('/:listId/tasks/:taskId', async (req, res) => {
    try {
        const { listId, taskId } = req.params
        const { name, status } = req.body

        const list = await ToDoList.findById(listId)
        if (!list) {
            return res.status(404).json({ message: "List not found" })
        }

        const task = list.tasks.id(taskId)
        if (!task) {
            return res.status(404).json({ message: "Task not found" })
        }

        if (name) task.name = name
        if (status) task.status = status

        await list.save()

        res.status(200).json({ message: "Task updated successfully" })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.get('/health', (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Server is running"
    })
})

module.exports = router