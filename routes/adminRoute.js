const express = require('express');
const router = express.Router();
const Admin = require('../model/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/verifyToken');
const firebase = require('firebase/app');
require("firebase/auth");
require("firebase/firestore");
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
})
router.delete('/users/:id', verifyToken, async (req, res) => {
    try {
        firebase.firestore()
            .collection('users')
            .doc(req.params.id)
            .delete()
            .then(doc => {
                res.status(200).send("Deleted user")
            })
    } catch (error) {
        res.status(403).send(error.error)
    }
})
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
router.get('/', verifyToken, (req, res) => {
    res.send(req.header('auth-token'));
})

module.exports = router;