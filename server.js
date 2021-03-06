const express = require('express')
const db = require('./config/db')
const app = express()

const port = process.env.PORT || 3000

db()

//Init middleware
app.use(express.json({ extended: false }))


app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/posts', require('./routes/api/posts'))


app.listen(port, () => {
    console.log('Server active on port: ', port)
})