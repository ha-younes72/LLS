const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user')
const Admin = require('../models/admin')


exports.Get_All_Users = function (req, res, next) {
    //console.log('He wants the info')
    User.find()
        .select('_id fname lname email')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                users: docs.map(doc => {
                    return {
                        name: doc.fname + doc.lname,
                        email: doc.email,
                        id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://10.42.0.1:3210/users/' + doc._id
                        }
                    }
                })
            }
            res.status(200).json(response)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ error: err })
        })
}

exports.Signup = (req, res) => {
    Admin.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length > 0) {
                res.status(409).send({
                    message: "Mail Exists"
                })
            } else {
                console.log('The admin wants to sign up')
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        res.status(500).send({
                            error: err
                        })
                    } else {
                        var usr = new Admin({
                            _id: new mongoose.Types.ObjectId(),
                            fname: req.body.fname,
                            email: req.body.email,
                            lname: req.body.lname,
                            password: hash
                        });

                        usr
                            .save()
                            .then(result => {
                                console.log(result);
                                res.status(200).json({
                                    success: true,
                                    id: usr._id
                                })
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({ error: err })
                            })
                    }
                })
            }
        })
}

exports.Login = (req, res) => {
    console.log('The admin wants to sign in')
    var usr = {
        email: req.body.email,
    }
    Admin.find(usr)
        .exec()
        .then(doc => {
            if (doc.length < 0) {
                console.log('Not Auth!!')
                return res.status(401).send({ success: false, message: "Not Auth" })
            }
            bcrypt.compare(req.body.password, doc[0].password, (err, result) => {
                if (err) {
                    console.log('Not Auth!!')
                    return res.status(401).send({ success: false, message: "Not Auth" })
                }
                if (result) {
                    const token = jwt.sign({
                        email: doc[0].email,
                        userId: doc[0]._id
                    }, "adminprivatekey", {
                            expiresIn: '1h'
                        })
                    return res.status(200).json({
                        success: true,
                        token: token,
                        message: "Auth Successful"
                    })
                }
                res.status(401).json({
                    success: false,
                    message: "No Auth"
                })
            })

        })
        .catch(err => {
            res.status(500).send({ error: err })
            console.log(err)
        })
}