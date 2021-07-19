const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator/check')
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const Post = require('../../models/Post')

// @route  POST api/posts
// @desc   Create a post
// @access Private
router.post('/', [auth, [
    check('text', 'You have to provide text').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        res.status(400).send(errors.array())
    }

    try {
        const user = await User.findOne({ _id: req.user.id }).select('-password')

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })

        await newPost.save()

        res.send(newPost)
    } catch (e) {
        console.error(e)
        res.status(500).send('Server ERROR')
    }
})

// @route  GET api/posts
// @desc   Get all posts
// @access Private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 })

        res.send(posts)
    } catch (e) {
        console.error(e)
        res.status(500).send('Server ERROR')
    }
})

// @route  GET api/posts/:id
// @desc   Get post by id
// @access Private
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).send('Post not found')
        }

        res.send(post)
    } catch (error) {
        console.error(error)
        if (error.kind === 'ObjectId') {
            return res.status(404).send('Post not found')
        }
        res.status(500).send('SERVER ERROR')
    }
})

// @route  DELETE api/posts/:id
// @desc   Delete post by id
// @access Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).send('Post not found')
        }

        if (post.user.toString() !== req.user.id) {
            return res.status(401).send('Not Authorized.')
        }

        await post.remove()

        res.send('Post Removed.')

    } catch (e) {
        console.log(e.message)
        res.status(500).send('server errror')
    }
})

// @route  PUT api/posts/like/:id
// @desc   Like a post
// @access Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        //proverka dali e veke lajkuvan postot od userot
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).send('Post already liked')
        }

        post.likes.unshift({ user: req.user.id })

        await post.save()

        res.send(post.likes)

    } catch (error) {
        console.error(error)
        res.status(500).send('Server Error')
    }
})


// @route  PUT api/posts/unlike/:id
// @desc   Unlike a post
// @access Private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        //proverka dali e veke lajkuvan postot od userot
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).send('Post not liked yet.')
        }

        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id)

        post.likes.splice(removeIndex, 1)

        await post.save()

        res.send(post.likes)

    } catch (error) {
        console.error(error)
        res.status(500).send('Server Error')
    }
})

// @route  PUT api/posts/comments/:id
// @desc   Comment on a post
// @access Private
router.put('/comments/:id', [auth, [
    check('text', 'Please enter your comment').not().isEmpty()
]], async (req, res) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        res.status(400).send(errors.array())
    }

    const { text } = req.body

    try {
        const user = await User.findById(req.user.id).select('-password')
        const post = await Post.findById(req.params.id)

        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        }

        post.comments.unshift(newComment)

        await post.save()

        res.send(post.comments)

    } catch (error) {
        console.error(error)
        res.status(500).send('Server ERROR')
    }
})

// @route  DELETE api/posts/comments/:id/:comment_id
// @desc   Delete a comment on a post
// @access Private
// router.delete('/comments/:id/:comment_id', auth, async (req, res) => {
//     try {
//         const post = await Post.findById(req.params.id)

//         // zemi go komentaort
//         const comment = post.comments.find(comment => comment.id === req.params.comment_id)
//         // vidi dali nasol komentar 
//         if (!comment) {
//             return res.status(404).send('No comment found')
//         }

//         if (comment.user.toString() !== req.user.id) {
//             return res.status(401).send('Not Authorized')
//         }

//         const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id)

//         post.comments.splice(removeIndex, 1)

//         await post.save()

//         res.send(post.comments)

//     } catch (error) {
//         console.error(error)
//         res.status(500).send('Server Error')
//     }
// })

module.exports = router