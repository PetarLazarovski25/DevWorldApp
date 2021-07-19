const express = require('express')
const auth = require('../../middleware/auth')
const router = express.Router()
const { check, validationResult } = require('express-validator/check')
const request = require('request')
const config = require('config')

const Profile = require('../../models/Profile')
const User = require('../../models/User')

// @route  GET api/profile/me
// @desc   Get My Profile   
// @access Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('User', ['name', 'avatar'])

        if (!profile) {
            return res.status(404).send('There is no profile for this user.')
        }

        res.json(profile)
    } catch (e) {
        console.log(e)
        res.status(500).send('SERVER ERROR')
    }
})


router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        res.status(400).send(errors.array())
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body

    const profileFields = {}
    profileFields.user = req.user.id
    if (company) profileFields.company = company
    if (website) profileFields.website = website
    if (location) profileFields.location = location
    if (bio) profileFields.bio = bio
    if (status) profileFields.status = status
    if (githubusername) profileFields.githubusername = githubusername
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim())
    }

    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube
    if (facebook) profileFields.social.facebook = facebook
    if (twitter) profileFields.social.twitter = twitter
    if (instagram) profileFields.social.instagram = instagram
    if (linkedin) profileFields.social.linkedin = linkedin


    try {
        let profile = await Profile.findOne({ user: req.user.id })

        if (profile) {
            //Update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            )

            return res.json(profile)
        }

        profile = new Profile(profileFields)

        await profile.save()
        res.json(profile)

    } catch (e) {
        console.log(e)
        res.send(500).send('SERVER ERROR')
    }

})

// @route  GET api/profile
// @desc   GET ALL PROFILES
// @access Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('User', ['name', 'avatar'])
        res.json(profiles)
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
})

// @route  GET api/profile/user/:user_id
// @desc   Get profile by user id
// @access Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('User', ['name', 'avatar'])

        if (!profile) {
            return res.status(404).send('No Profile Found')
        }

        res.send(profile)
    } catch (e) {
        console.log(e)
        if (e.kind == 'ObjectId') {
            return res.status(404).send('No Profile Found')
        }
        res.status(500).send('Server Error')
    }
})

// @route  DELETE api/profile
// @desc   Delete Profile, user & post
// @access Private
router.delete('/', auth, async (req, res) => {
    try {
        await Profile.findOneAndRemove({ user: req.user.id })
        await User.findOneAndRemove({ _id: req.user.id })

        res.send('User Removed.')

    } catch (error) {
        console.log(e)
        res.status(500).send('SErver error')
    }
})

// @route  PUT api/profile/experience
// @desc   Add Profile Experience  
// @access Private
router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From Date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).send(errors.array())
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id })

        profile.experience.unshift(newExp)

        await profile.save()

        res.send(profile)

    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
})


// @route  DELETE api/profile/experience/:exp_id
// @desc   Delete Experience
// @access Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })

        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)

        profile.experience.splice(removeIndex, 1)

        await profile.save()

        res.send(profile)
    } catch (e) {
        console.log(e)
        res.status(500).send('Server ERROR')
    }
})

// @route  POST api/profile/education
// @desc   Add Profile Education
// @access Private
router.post('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
    check('fieldofstudy', 'Field Of Study is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        res.status(400).send(errors.array())
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body

    const newEducation = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id })

        profile.education.unshift(newEducation)

        await profile.save()

        res.send(profile)
    } catch (error) {
        console.log(error)
        res.status(500).send('Server ERRoR')
    }
})

// @route  DELETE api/profile/education
// @desc   Delete Profile Education
// @access Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })

        const indexToDelete = profile.education.map(item => item.id).indexOf(req.params.edu_id)

        profile.education.splice(indexToDelete, 1)

        await profile.save()

        res.send(profile)

    } catch (error) {
        console.log(error)
        res.status(500).send('Server ERROR')
    }
})

// @route  GET api/profile/github/:username
// @desc   Get User repos from github
// @access Public
router.get('/github/:username', async (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
        }

        request(options, (error, response, body) => {
            if (error) console.error(error)

            if (response.statusCode !== 200) {
                res.status(404).send('Github profile not found')
            }

            res.send(JSON.parse(body))

        })

    } catch (error) {
        console.log(error)
        res.status(500).send('Server ERROR')
    }
})

module.exports = router