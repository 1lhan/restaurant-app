const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const menuModel = require('../models/menuModel')
const staffModel = require('../models/staffModel')
const financialTransactionModel = require('../models/financialTransactionModel')
const orderModel = require('../models/orderModel')
const userModel = require('../models/userModel')

router.post('/add-menu-item', async (req, res) => {
    let { name, price, type, date } = req.body

    let menuItem = new menuModel({ name, price: [{ price, date }], type, date })
    let addMenuItem = await menuItem.save()
    return res.json({ success: !!addMenuItem, msg: !!addMenuItem ? 'New menu item added successfully' : 'New menu item could not be added' })
})

router.post('/delete-menu-item', async (req, res) => {
    let _delete = await menuModel.findByIdAndDelete(req.body.id)
    return res.json({ success: !!_delete })
})

router.post('/add-stock', async (req, res) => {
    let { id, stock, date } = req.body

    let _update = await menuModel.findOneAndUpdate({ _id: id }, { $push: { stockUpdateHistory: { stock, date } }, $inc: { stock: +stock } })
    return res.json({ success: !!_update, newMenuData: _update })
})

router.post('/update-menu-item-price', async (req, res) => {
    let { id, price, date } = req.body

    let _update = await menuModel.findOneAndUpdate({ _id: id }, { $push: { price: { $each: [{ price, date }], $position: 0 } } })
    return res.json({ success: !!_update })
})

// Staff

router.get('/get-staff', async (req, res) => {
    let staff = await staffModel.find()
    return res.json({ success: !!staff, staff })
})

router.post('/add-staff', async (req, res) => {
    let { name, lastname, gender, phoneNumber, identificationNumber, role, salary, startDate } = req.body

    let newStaff = new staffModel({ name, lastname, gender, phoneNumber, identificationNumber, role, salary: [{ salary, date: startDate }], startDate, terminationDate: null })
    let saveNewStaff = await newStaff.save()
    return res.json({ success: !!saveNewStaff })
})

router.post('/update-salary', async (req, res) => {
    let { id, salary, date } = req.body

    let checkStaffMember = await staffModel.find({ _id: id })
    if (!checkStaffMember) return res.json({ success: false, msg: 'The staff member could not be found' })

    let _update = await staffModel.findOneAndUpdate({ _id: id }, { $push: { salary: { $each: [{ salary, date }], $position: 0 } } })
    return res.json({ success: !!_update })
})

router.post('/terminate-staff-member', async (req, res) => {
    let { id, date } = req.body

    let checkStaffMember = await staffModel.find({ _id: id })
    if (!checkStaffMember) return res.json({ success: false, msg: 'The staff member could not be found' })

    let _terminate = await staffModel.findOneAndUpdate({ _id: id }, { $set: { terminationDate: date } })
    return res.json({ success: !!_terminate })
})

router.post('/delete-staff-member', async (req, res) => {
    let { id } = req.body

    let checkStaffMember = await staffModel.find({ _id: id })
    if (!checkStaffMember) return res.json({ success: false, msg: 'The staff member could not be found' })

    let _delete = await staffModel.findByIdAndDelete(id)
    return res.json({ success: !!_delete })
})

// Financial Transaction

router.get('/get-financial-transactions/:startDate/:endDate', async (req, res) => {
    let { startDate, endDate } = req.params
    let transactions = await financialTransactionModel.find({
        date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    })
    return res.json({ success: !!transactions, transactions: transactions ? transactions : [] })
})

router.post('/enter-financial-transaction', async (req, res) => {
    let { transactionType, category, amount, description } = req.body

    let transaction = new financialTransactionModel({ transactionType: transactionType == 'income' ? '1' : '0', category, amount, description })
    let saveTransaction = await transaction.save()
    return res.json({ success: !!saveTransaction })
})

router.post('/delete-transaction', async (req, res) => {
    let { _id } = req.body

    let _delete = await financialTransactionModel.findByIdAndDelete(_id)
    return res.json({ success: !!_delete })
})

// Data Analysis

router.get('/get-analysis-data/:startDate/:endDate', async (req, res) => {
    let { startDate, endDate } = req.params

    let _orders = await orderModel.find({ tableOpeningTime: { $gte: new Date(startDate), $lte: new Date(endDate) } })
    let _transactions = await financialTransactionModel.find({ date: { $gte: new Date(startDate), $lte: new Date(endDate) } })
    let _menu = await menuModel.find()

    return res.json({ orders: _orders ? _orders : [], transactions: _transactions ? _transactions : [], menu: _menu ? _menu : [] })
})

// Accounts

router.get('/get-accounts', async (req, res) => {
    let accounts = await userModel.find()
    return res.json({ success: !!accounts, accounts: accounts ? accounts : [] })
})

module.exports = router