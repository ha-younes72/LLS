var express = require('express');
var router = express.Router();

const checkAuth = require('../middlewares/checkAuth')

const Controller = require('../controllers/users')


router.get('/:id', checkAuth, Controller.User_Get_byId);

router.post('/signup', Controller.User_Signup)

router.get('/confirmation/:token', Controller.confirmationPost);

router.post('/resend', Controller.resendTokenPost);

router.post('/forgottpass', Controller.forgotPass)

router.get('/resetpass/:token', Controller.resetPass)

router.post('/signin', Controller.User_Login)

router.patch('/',  Controller.User_Update)

router.delete('/:id', checkAuth, Controller.User_Delete)

module.exports = router;