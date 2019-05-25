const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user')
const Token = require('../models/verificationToken')
var crypto = require('crypto');
var nodemailer = require('nodemailer');

exports.User_Get_All = function (req, res, next) {
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

exports.User_Get_byId = function (req, res, next) {
    const id = req.params.id;
    User.findById(id)
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({ message: 'No valid entry found' });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        })
}

exports.User_Signup = (req, res) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length > 0) {
                res.status(409).send({
                    message: "Mail Exists"
                })
            } else {
                var newUsr = null
                console.log('The app wants to sign up')
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        res.status(500).send({
                            error: err,
                            message: "Internal Error! Please Try Later!"
                        })
                    } else {
                        newUsr = new User({
                            _id: new mongoose.Types.ObjectId(),
                            fname: req.body.fname,
                            email: req.body.email,
                            lname: req.body.lname,
                            password: hash
                        });

                        var token = new Token(
                            {
                                _userId: newUsr._id,
                                token: crypto.randomBytes(16).toString('hex')
                            }
                        );
                        // Save the verification token
                        token
                            .save(function (err) {
                                if (err) {
                                    console.log('Saving Token Error: ', err.message)
                                    return res.status(500).send({
                                        message: "Internal Error! Please Try Later!"
                                    });
                                }

                                // Send the email
                                var transporter = nodemailer.createTransport(
                                    {
                                        //host: "http://cryptic-bastion-18400.herokuapp.com",
                                        //port: 3211,
                                        //secure: false,
                                        host: 'mail.petanux.com',
                                        port: 587,

                                        //service: 'Sendgrid',
                                        //service: 'Gmail',
                                        //secureConnection: true,
                                        auth: {
                                            user: 'marketing@petanux.com',//process.env.SENDGRID_USERNAME,
                                            pass: '8892PNX9935'//process.env.SENDGRID_PASSWORD
                                        },
                                        tls: {
                                            rejectUnauthorized: false
                                        }

                                    }
                                );
                                var mailContext = 'Hello,\n\n';
                                mailContext += 'Please verify your account by clicking the link: \nhttp:\/\/'
                                mailContext += req.headers.host + '\/users\/confirmation\/' + token.token + '.\n'
                                console.log("I'm Sending Mail: ", mailContext)

                                var mailOptions = {
                                    from: 'Petanux Marketing <marketing@petanux.com>',
                                    to: newUsr.email,
                                    subject: 'Account Verification Token',
                                    text: mailContext
                                };
                                transporter.sendMail(mailOptions, function (err) {
                                    if (err) {
                                        console.log("Error Sending MY Mail: ", err.message)
                                        return res.status(500).send({
                                            message: "Internal Error! Please Try Later!"
                                        });
                                    }

                                    console.log("Mail Sent: ")
                                    res.status(200).send({
                                        message: 'A verification email has been sent to the given mail, you have to confirm it to continue.'
                                    });

                                    newUsr
                                        .save()
                                        .then(result => {

                                            console.log(result);
                                            res.status(200).json({
                                                success: true,
                                                id: newUsr._id
                                            })
                                        })
                                        .catch(err => {
                                            console.log(err);
                                            res.status(500).json({ error: err })
                                        })
                                });


                            })

                    }
                })
            }
        })
}

exports.confirmationPost = function (req, res, next) {
    //req.assert('email', 'Email is not valid').isEmail();
    //req.assert('email', 'Email cannot be blank').notEmpty();
    //req.assert('token', 'Token cannot be blank').notEmpty();
    //req.sanitize('email').normalizeEmail({ remove_dots: false });

    // Check for validation errors    
    //var errors = req.validationErrors();
    //if (errors) return res.status(400).send(errors);

    // Find a matching token
    Token.findOne({ token: req.params.token }, function (err, token) {
        if (!token) return res.status(400).send(
            {
                type: 'not-verified',
                msg: 'We were unable to find a valid token. Your token my have expired.'
            }
        );

        // If we found a token, find a matching user
        User.findOne({ _id: token._userId/*, email: req.body.email*/ }, function (err, user) {
            if (!user) return res.status(400).send({
                msg: 'We were unable to find a user for this token.'
            });
            if (user.isVerified) return res.status(400).send({
                type: 'already-verified',
                msg: 'This user has already been verified.'
            });

            // Verify and save the user
            user.isVerified = true;
            user.save(function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); }
                res.status(200).send("The account has been verified. Please log in.");
            });
        });
    });
};

exports.resendTokenPost = function (req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('email', 'Email cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    // Check for validation errors    
    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors);

    User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) return res.status(400).send({ msg: 'We were unable to find a user with that email.' });
        if (user.isVerified) return res.status(400).send({ msg: 'This account has already been verified. Please log in.' });

        // Create a verification token, save it, and send email
        var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });

        // Save the token
        token.save(function (err) {
            if (err) { return res.status(500).send({ msg: err.message }); }

            // Send the email
            var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });
            var mailOptions = { from: 'no-reply@codemoto.io', to: user.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n' };
            transporter.sendMail(mailOptions, function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); }
                res.status(200).send('A verification email has been sent to ' + user.email + '.');
            });
        });

    });
};

exports.User_Login = (req, res) => {
    console.log('The app wnats to sign in')
    var usr = {
        email: req.body.email,
    }
    User.find(usr)
        .exec()
        .then(doc => {
            if (doc.length < 0) {
                console.log('Invalid Email and Password Combination')
                return res.status(401).send({ success: false, message: "Invalid Email and Password Combination" })
            } else {
                if (doc[0].isVerified) {
                    bcrypt.compare(req.body.password, doc[0].password, (err, result) => {
                        if (err) {
                            console.log('Not Auth!!')
                            return res.status(401).send(
                                {
                                    success: false,
                                    message: "Invalid Email and Password Combination"
                                })
                        }
                        if (result) {
                            const token = jwt.sign({
                                email: doc[0].email,
                                userId: doc[0]._id
                            }, "secretprivatekey", {
                                    expiresIn: '1h'
                                })
                            return res.status(200).json({
                                success: true,
                                token: token,
                                userInfo: doc[0],
                                message: "Auth Successful"
                            })
                        }
                        res.status(401).json({
                            success: false,
                            message: "No Auth"
                        })
                    })
                } else {
                    console.log('Please Verify Your Account First!!')
                    return res.status(401).send(
                        {
                            success: false,
                            message: "Please Verify Your Account First!!"
                        })
                }

            }
        })
        .catch(err => {
            return res.status(401).send({ success: false, message: "Network Error! Please try again!" })
            console.log(err)
        })
}

exports.User_Update = (res, req, next) => {
    /*
    [
        {"propName": 'name', "value": "NewValue"}
    ]
    */
    const id = req.params.id;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    User.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'User Updated',
                url: 'http://10.42.0.1:3210/users/' + id
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
}

exports.User_Delete = (req, res, next) => {
    const id = req.params.id;
    User.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "User Deleted",
                request: {
                    type: 'POST',
                    url: 'http://10.42.0.1:3210/users/'
                }
            })
        })
        .catch()
}
