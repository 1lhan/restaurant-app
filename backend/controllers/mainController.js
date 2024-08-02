const express = require('express');
const router = express.Router();
const menuModel = require('../models/menuModel');
const orderItemModel = require('../models/orderItemModel');
const orderModel = require('../models/orderModel');

router.get('/get-menu', async (req, res) => {
    let menu = await menuModel.find()
    return res.json({ success: !!menu, menu })
});

router.get('/get-order-items', async (req, res) => {
    let orderItems = await orderItemModel.find()
    return res.json({ success: !!orderItems, orderItems })
})

router.post('/update-orders', async (req, res) => {
    let newOrderItems = req.body

    let insertItems = await orderItemModel.insertMany(newOrderItems)
    return res.json({ success: !!insertItems })
})

router.post('/save-table-data', async (req, res) => {
    let table = req.body

    let saveTableData = await new orderModel(table).save()
    if (!saveTableData) return res.json({ success: false, msg: 'Table data could not be saved' })

    let deleteOrderItems = await orderItemModel.deleteMany({ tableNo: table.tableNo })
    if (!deleteOrderItems) return res.json({ success: false, msg: 'Order items could not be deleted' })

    return res.json({ success: true })
})

router.post('/cancel-table', async (req, res) => {
    let tableNo = req.body.tableNo

    let _update = orderItemModel.updateMany({ tableNo: String(tableNo) }, { $set: { status: '2' } }).exec()
    return res.json({ success: !!_update, msg: !!_update ? 'Order item statuses have been updated' : 'Order item statuses could not be updated' })
})

router.post('/cancel-order', async (req, res) => {
    let orderId = req.body.orderId

    let _update = await orderItemModel.findOneAndUpdate({ _id: orderId }, { $set: { status: '2' } })
    return res.json({ success: !!_update })
})

router.post('/delete-order-items', async (req, res) => {
    if (req.body._delete) {
        let _delete = await orderItemModel.deleteMany({})
        if (_delete) return res.json({ success: true })
    }
})

router.post('/update-order-item-status-to-ready', async (req, res) => {
    const _id = req.body._id

    const update = await orderItemModel.findOneAndUpdate({ _id }, { $set: { status: '1' } })
    return res.json({ success: !!update, msg: update ? 'Order item status has been updated' : 'Order item status could not be updated' })
})

module.exports = router;