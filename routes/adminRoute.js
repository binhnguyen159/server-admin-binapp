const express = require('express');
const router = express.Router();
const Admin = require('../model/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/verifyToken');
const firebase = require('firebase/app');
require("firebase/auth");
require("firebase/firestore");
const { cloudinary } = require("./../util/cloudinary")

router.post('/create', verifyToken, (req, res) => {
    try {
        const hash = bcrypt.hashSync(req.body.hash, parseInt(process.env.SALT));
        const admin = new Admin({
            email: req.body.email,
            hash
        })
        admin.save()
            .then(() => res.send(admin))
            .catch((error) => {
                res.status(401).send('This email have already exists')
            })
    } catch (error) {
        res.status(401).send('Can not create account')
    }
})
router.put('/:id', async (req, res) => {
    try {
        let body = { ...req.body };
        const id = req.params.id;
        let image;
        if (req.files) {
            image = await cloudinary.uploader.upload(req.files.avatar.tempFilePath)
                .then(result => result)
                .catch(err => {
                    res.status(400).send(err)
                })
            body = { ...body, avatar: image.url }
        }
        const data = await Admin.findByIdAndUpdate(id, { ...body }, { new: true });
        res.send(data)
    } catch (error) {
        res.status(401).send('Can not update account')
    }
})
router.get('/users', verifyToken, async (req, res) => {
    try {
        const page = Number(req.query.page);
        const pageSize = Number(req.query.pageSize);
        const limit = page * pageSize <= 0 ? 6 : page * pageSize;
        const [total, data] = await Promise.all([
            firebase.firestore()
                .collection('users')
                .get().then(snap => {
                    return snap.size;
                }),
            firebase.firestore()
                .collection('users')
                .orderBy('name', 'desc')
                .limit(limit)
                .get()
                .then(snapshot => {
                    const data = snapshot.docs.map(item => {
                        return { id: item.id, ...item.data() };
                    })
                    return data
                })
        ]);
        res.send({
            page,
            pageSize,
            total,
            totalPage: Math.ceil(total / pageSize),
            data,
        })
    } catch (error) {
        res.status(403).send(error.error)
    }
});

router.delete('/users/:id', verifyToken, async (req, res) => {
    try {
        firebase.firestore()
            .collection('users')
            .doc(req.params.id)
            .delete()
            .then(doc => {
                res.status(200).send("Deleted user")
            })
        firebase.firestore()
            .collection('posts')
            .doc(req.params.id)
            .delete()

    } catch (error) {
        res.status(403).send(error.error)
    }
})
router.delete('/posts', verifyToken, async (req, res) => {
    try {
        const postId = req.query.postId;
        const userId = req.query.userId;
        firebase.firestore()
            .collection('posts')
            .doc(userId)
            .collection('userPosts')
            .doc(postId)
            .delete()
    } catch (error) {
        res.status(403).send(error.error)
    }
})

router.get('/posts', async (req, res) => {
    try {
        data = await firebase.firestore()
            .collection('posts')
            .get()
            .then(snapshot => {
                const data = snapshot.docs.map(item => {
                    return item.id
                })
                return data
            })


        let users = await Promise.all(data.map(user => {
            return firebase.firestore()
                .collection('users')
                .doc(user)
                .get()
                .then(doc => {
                    if (doc.exists)
                        return { id: doc.id, ...doc.data() }
                })
        }))
        let result = await Promise.all(users.map(user => {
            return firebase.firestore()
                .collection('posts')
                .doc(user.id)
                .collection("userPosts")
                .get()
                .then(snap => {
                    return snap.docs.map(post => {

                        let value;
                        value = {
                            ...user,
                            postId: post.id,
                            ...post.data()
                        }
                        return value;
                    })
                })
        }))
        const listResult = [];
        result.forEach(element => {
            element.forEach(el => {
                listResult.push(el);
            })
        });
        res.send({
            result: listResult,
        })
    } catch (error) {
        res.status(403).send(error.error)
    }
});


router.post('/login', async (req, res) => {
    try {
        Admin.findOne({
            email: req.body.email
        },
            (err, value) => {
                if (err) throw new Error('database failed to connect');
                if (!value) res.status(400).json({ message: 'Can not find this email' })
                else if (value) {
                    if (bcrypt.compareSync(req.body.hash, value.hash)) {
                        const token = jwt.sign({
                            email: value.email,
                            hash: value.hash
                        },
                            process.env.KEY_SECRET,
                            { expiresIn: 60 * 60 * 24 * 30 })
                        return res.header('auth-token', token).send(token)
                    }
                    else {
                        res.status(401).json({ message: 'Authentication failed. Wrong password.' });
                    }
                }
            }
        )
    } catch (error) {
        res.status(400).json({ message: 'Can not find this id' })
    }
});
router.put('/change-password/:id', verifyToken, async (req, res) => {
    try {
        if (req.body.newPassword != req.body.confirmPassword)
            res.status(400).json({ message: 'The new password and confirm password must be same' })
        else {
            const user = await Admin.findById(req.params.id)
            if (user) {
                if (bcrypt.compareSync(req.body.oldPassword, user.hash)) {
                    const hash = bcrypt.hashSync(req.body.newPassword, parseInt(process.env.SALT));
                    await Admin.findByIdAndUpdate(user._id, { hash })
                    const token = jwt.sign({
                        email: user.email,
                        hash
                    },
                        process.env.KEY_SECRET,
                        { expiresIn: 60 * 60 * 24 * 30 })
                    return res.header('auth-token', token).send(token)
                }
                else {
                    res.status(400).json({ message: 'Old password is incorrect' })
                }
            }
        }
    } catch (error) {
        res.status(400).json({ message: 'Can not find this id' })
    }
});
router.get('/', verifyToken, async (req, res) => {
    const data = jwt.verify(req.header('auth-token'), process.env.KEY_SECRET);
    const user = await Admin.findOne({ email: data.email });
    res.send({
        token: req.header('auth-token'),
        data: user,
    });
})

router.get('/count', verifyToken, async (req, res) => {
    try {
        const [totalUsers, totalUserPosts] = await Promise.all([
            firebase.firestore()
                .collection('users')
                .get().then(snap => {
                    return snap.size;
                }),
            firebase.firestore()
                .collection('posts')
                .get().then(snap => {
                    return snap.docs.map(item => {
                        return item.id
                    })
                })
        ])

        let totalPosts = await Promise.all(totalUserPosts.map(post => {
            return firebase.firestore()
                .collection('posts')
                .doc(post)
                .collection("userPosts")
                .get()
                .then(snap => {
                    return snap.size;
                })
        }))


        const total = totalPosts.reduce((value, nextValue) => value + nextValue)


        res.send({
            users: totalUsers,
            posts: total,
        })

    } catch (error) {
        res.status(403).send(error.error)
    }
});

router.get("/post/:id/:userId", verifyToken, async (req, res) => {
    try {
        const page = Number(req.query.page);
        const pageSize = Number(req.query.pageSize);
        const data = await firebase.firestore()
            .collection('posts')
            .doc(req.params.userId)
            .collection("userPosts")
            .doc(req.params.id)
            .collection("comments")
            .orderBy("creation", "desc")
            .limit(page * pageSize)
            .get()
            .then(snapshot => {
                return snapshot.docs.map(item => {
                    return { id: item.id, ...item.data() }
                })
            })
        const listComments = await Promise.all(data.map(item => {
            return firebase.firestore()
                .collection('users')
                .doc(item.creator)
                .get()
                .then(doc => {
                    if (doc.exists) {
                        return {
                            ...item, user: { id: doc.id, ...doc.data() }
                        }
                    }
                })
        }))
        res.send(listComments)
    } catch (error) {
        res.status(403).send(error.error)
    }
})

module.exports = router;