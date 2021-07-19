const mongoose = require('mongoose')
const db = 'mongodb+srv://pekipeki4:Lazarovski123@devworld.xjxag.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
        console.log('MongoDB connected.')
    } catch (e) {
        return console.log(e.message)
    }
}

module.exports = connectDB