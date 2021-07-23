const express = require('express')
const { check, validationResult } = require('express-validator/check')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')

const User = require('../../models/User')
const router = express.Router()


// @POST User Registration
// @public

router.post('/', [
    check('name', 'You must provide a name').not().isEmpty(),
    check('email', 'Please provide valid email').isEmail(),
    check('password', 'Password must be longer than 5 characters').isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).send(errors.array())
    }

    const { name, email, password } = req.body

    try {

        let user = await User.findOne({ email })

        if (user) {
            return res.status(400).send('Email already taken')
        }

        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        user = new User({
            name,
            email,
            avatar,
            password
        })

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)

        await user.save()

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
                user
            })
        })

    } catch (e) {
        console.log(e)
        res.status(500).send('SERVER ERROR')
    }
})

module.exports = router
