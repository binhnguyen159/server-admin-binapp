const express = require('express');
const router = express.Router();
const Admin = require('./../models/admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

router.post('/create', (req, res) => {
    const hash = bcrypt.hashSync(req.body.hash, 10);
    const admin = new Admin({
        email: req.body.email,
        hash
    })
    admin.save()
        .then(() => res.send(admin))
        .catch((error) => {
            console.log(error)
        })
})
router.post('/login', async (req, res) => {
    try {
        console.log(req.body);
        const user = await Admin.findOne({
            email: req.body.email
        },
            (err, value) => {
                if (err) throw new Error('database failed to connect');
                if (!value) res.status(400).json({ message: 'Can not find this id' })
                else if (value) {
                    if (bcrypt.compareSync(req.body.hash, value.hash)) {
                        return res.json({
                            token: jwt.sign({
                                email: value.email,
                                hash: value.hash
                            }, 'Secret')
                        })
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
})
router.get('/', (req, res) => {
    Admin.find().then((result) => {
        res.send(result)
    })
})

module.exports = router;