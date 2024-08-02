const mongoose = require('mongoose')

const financialTransactionSchema = mongoose.Schema({
    transactionType: {
        type: String,
        required: true,
        enum: ['0', '1'] // 0: expense, 1: income
    },
    category: {
        type: String,
        required: true,
        enum: ['sales', 'invoice', 'supplies', 'equipment', 'salary', 'other']
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    description: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('financialTransaction', financialTransactionSchema)