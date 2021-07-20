const express = require('express')
const config = require('config')
const auth = require('../../middleware/auth')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = express.Router()
const { check, validationResult } = require('express-validator/check')
const User = require('../../models/User')

// @route  GET api/auth
// @access Public
router.get('/', auth, async (req, res) => {
    try {
        let user = await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch (e) {
        console.log(e)
        res.status(500).send('SERVER ERROR')
    }
})

// @route  POST api/auth
// @access Public
// @desc   Login & Authenticate User
router.post('/login', [
    check('email', 'Please provide email').isEmail(),
    check('password', 'Provide a password').exists()
], async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).send(errors.array())
    }

    const { email, password } = req.body

    try {

        let user = await User.findOne({ email })

        if (!user) {
            return res.status(404).send('Invalid login')
        }

        const isMatch = bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).send('Invalid login')
        }

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), {
            expiresIn: 360000
        }, (err, token) => {
            if (err) throw err
            res.json({
                token
            })
        })

    } catch (e) {
        console.log(e)
        res.status(500).send('SERVER ERROR')
    }
})

module.exports = router