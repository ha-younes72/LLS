var express = require('express');
var router = express.Router();
//var url = 'mongodb://localhost:27017/leafletapp';
//var mongo = require('mongodb').MongoClient;

//const checkAuth = require('../middlewares/checkAuth')
const checkAdmin = require('../middlewares/checkAdmin')

const Controller = require('../controllers/admins')

/* GET home page. */
router.get('/users', checkAdmin, Controller.Get_All_Users);

//router.get('/:id', Controller.User_Get_byId);

router.post('/signup', Controller.Signup)

router.post('/signin', Controller.Login)

//router.patch('/:id', Controller.User_Update)

//router.delete('/:id', Controller.User_Delete)

module.exports = router;