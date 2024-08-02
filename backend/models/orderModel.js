const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
    status: {
        type: String,
        enum: ['0', '1', '2'], //table closed, opened, canceled
        required: true
    },
    tableNo: {
        type: String,
        required: true
    },
    tableOpeningTime: {
        type: Date,
        required: true
    },
    tableClosingTime: {
        type: Date,
        required: true
    },
    bill: {
        type: Number,
        required: true
    },
    orders: [
        {
            name: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true

            }
        }
    ],
    paymentMethod: {
        type: String,
        enum: ['cash', 'credit-card'],
        required: true,
        default: 'cash'
    },
    discount: {
        type: Number,
        required: false,
        default: 0
    }
})

module.exports = mongoose.model('order', orderSchema)