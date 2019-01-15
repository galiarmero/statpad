const mongoose = require('mongoose')
const DB_URI = require('./vars').DB_URI

module.exports.init = () => {
    mongoose.connect(DB_URI).then(
        () => {
            console.log('Connected to db')
        },
        err => {
            console.log('Error connecting to db')
            console.log(err)
        }
    )
}
