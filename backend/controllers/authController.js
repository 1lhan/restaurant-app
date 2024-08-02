const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken')
require('dotenv').config()

router.post('/register', async (req, res) => {
    let { username, password, role } = req.body /*!*/

    let checkUsername = await userModel.findOne({ username })
    if (checkUsername) return res.json({ success: false, msg: 'The username already been using' })

    let hashedPassword = await bcrypt.hash(password, saltRounds)

    let user = new userModel({ username, password: hashedPassword, role })  /*!*/
    let register = await user.save()

    return res.json({ success: !!register, msg: register ? '' : 'Account could not create' })
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body

    let user = await userModel.findOne({ username })

    if (user != null) {
        let passwordControl = await bcrypt.compare(password, user.password)

        if (passwordControl) {
            user.password = ''
            const accessToken = jwt.sign({ _id: user._id }, process.env.SECRET_TOKEN, { expiresIn: '7d' })
            return res.json({ success: true, user, token: accessToken })
        }
    }
    return res.json({ success: false, msg: 'No user matching with this informations' })
})

router.post('/auto-login', async (req, res) => {
    try {
        const token = req.body.token.slice(6, req.body.token.length)
        if (!token) return res.json({ success: false })

        let verify = jwt.verify(token, process.env.SECRET_TOKEN)
        if (!verify) return res.json({ success: false })

        let user = await userModel.findOne({ _id: verify._id }).select('-password')
        return res.json({ success: !!user, user: user ? user : false })
    }
    catch (error) {
        return res.json({ success: false })
    }
})

router.post('/update-password', async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body

    const user = await userModel.findOne({ _id: userId })
    if (!user) return res.json({ success: false, msg: 'User not found' })

    const passwordControl = await bcrypt.compare(currentPassword, user.password)
    if (!passwordControl) return res.json({ success: false, msg: 'Incorrect password' })

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    const update = await userModel.findOneAndUpdate({ _id: userId }, { $set: { password: hashedPassword } })
    return res.json({ success: !!update, msg: update ? 'Password updated successfully' : 'Password update failed' })
})

router.post('/delete-account', async (req, res) => {
    const { userId } = req.body

    const user = await userModel.findOne({ _id: userId })
    if (!user) return res.json({ success: false, msg: 'User not found' })

    const _delete = await userModel.findOneAndDelete({ _id: userId })
    return res.json({ success: !!_delete, msg: _delete ? 'The account has been deleted' : 'The account could not be deleted' })
})

module.exports = router