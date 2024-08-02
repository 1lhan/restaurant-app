const mongoose = require('mongoose')

const menuSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: [{
        price: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            required: true
        }
    }],
    type: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('menu', menuSchema)