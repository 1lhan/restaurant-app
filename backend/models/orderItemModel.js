const mongoose = require('mongoose')

const orderItemSchema = mongoose.Schema({
    status: {
        type: String,
        enum: ['0', '1', '2'] // preparing, ready, canceled
    },
    tableNo: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('orderItem', orderItemSchema)