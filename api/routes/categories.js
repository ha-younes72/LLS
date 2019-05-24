const express = require('express');
const router = express.Router();

const Controller = require('../controllers/categories')
const checkAuth = require('../middlewares/checkAuth')
const checkOwner = require('../middlewares/checkOwner')

//const uploadManager = require('../middlewares/fileManage')

router.get('/', checkAuth, Controller.Get_All);

router.post('/', checkOwner, Controller.Add)

router.delete('/:id', checkOwner, Controller.Del)

module.exports = router;