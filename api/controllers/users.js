const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user')
const Token = require('../models/verificationToken')
const UnStore = require('../models/unVerifiedStore')
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var async = require('async');

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

                        newUsr = new User({
                            _id: new mongoose.Types.ObjectId(),
                            fname: req.body.fname,
                            email: req.body.email,
                            lname: req.body.lname,
                            password: hash,
                            roles: req.body.roles
                        });

                        if (req.body.storeName) {
                            const unStore = new UnStore({
                                _userId: newUsr._id,
                                name: req.body.storeName,
                                address: req.body.storeAddress,
                                token: crypto.randomBytes(16).toString('hex')
                            })
                            unStore.save(function (err) {
                                if (err) {
                                    console.log('Saving Store Info Error: ', err.message)
                                    return res.status(500).send({
                                        message: 'Saving Store Info Error, Please Try Later.'
                                    })
                                }
                                var mailContext = 'Hello,\n\n';
                                mailContext += 'Please verify the Store \n'
                                mailContext += 'Store Name: ' + req.body.storeName + '\n'
                                mailContext += 'Store Address: ' + req.body.storeAddress + '\n'
                                mailContext += 'Owner Name: ' + req.body.fname + ' ' + req.body.lname + '\n'
                                mailContext += 'by clicking below url:\n'
                                mailContext += 'http:\/\/' + req.headers.host + '\/stores\/confirmation\/' + unStore.token + '.\n'
                                console.log("I'm Sending Mail: ", mailContext)

                                var mailOptions = {
                                    from: 'Petanux Marketing <marketing@petanux.com>',
                                    to: 'ha.younes72@gmail.com',
                                    subject: 'New Store Verification',
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
                                });

                            })

                        }
                        var token = new Token({
                            _userId: newUsr._id,
                            token: crypto.randomBytes(16).toString('hex')
                        });
                        // Save the verification token
                        token
                            .save(function (err) {
                                if (err) {
                                    console.log('Saving Token Error: ', err.message)
                                    return res.status(500).send({
                                        message: "Internal Error! Please Try Later!"
                                    });
                                }


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

exports.forgotPass = function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, user) {
                if (!user) {
                    return res.status(401).send({
                        message: "You've not signed up yet!!"
                    })
                }

                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        res.status(500).send({
                            error: err,
                            message: "Internal Error! Please Try Later!"
                        })
                    } else {
                        user.newResetPass = hash
                        user.resetPasswordToken = token;
                        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                    }
                })
                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
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
            var mailOptions = {
                to: user.email,
                from: 'passwordreset@demo.com',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/resetpass/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            transporter.sendMail(mailOptions, function (err) {
                res.status(200).send({
                    message: 'An e-mail has been sent to ' + user.email + ' with further instructions.'
                });
                //req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) return console.log(err);
        //res.redirect('/forgot');
    });
}

exports.resetPass = function (req, res) {
    console.log('Im In!!!')
    async.waterfall([
        function (done) {
            console.log('Im In!!!')
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                console.log('Im In!!!')
                if (!user) {
                    return res.status(401).send({
                        message: 'Password reset token is invalid or has expired.'
                    })
                }

                user.password = user.newResetPass;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                user.newResetPass = undefined;

                user.save(function (err) {
                    /*req.logIn(user, function (err) {
                        done(err, user);
                    });*/
                });
            });
        },
        function (user, done) {
            var smtpTransport = nodemailer.createTransport('SMTP', {
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

            });
            var mailOptions = {
                to: user.email,
                from: 'Petanux Marketing <marketing@petanux.com>',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                res.status(401).send({
                    message: 'Success! Your password has been changed.'
                })
                //req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function (err) {
        res.status(401).send({
            message: 'Error Occured'
        })
    });
}
exports.User_Login = (req, res) => {
    console.log('The app wnats to sign in')
    var usr = {
        email: req.body.email,
    }
    User.find(usr)
        .exec()
        .then(doc => {
            if (doc.length < 1) {
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
                            message: "Invalid Email and Password Combination"
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
            console.log(err)
            return res.status(401).send({ success: false, message: "Network Error! Please try again!" })

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
