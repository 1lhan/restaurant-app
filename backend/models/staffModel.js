const mongoose = require('mongoose')

const staffSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    identificationNumber: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    salary: [{
        salary: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            required: true
        }
    }],
    startDate: {
        type: Date,
        required: true
    },
    terminationDate: {
        type: Date,
        required: false
    }
})

module.exports = mongoose.model('staff', staffSchema)