var express = require('express');
var router = express.Router();

const Controller = require('../controllers/stores')
const CheckAuth = require('../middlewares/checkAuth')
const CheckOwner = require('../middlewares/checkOwner')
const uploadManager = require('../middlewares/fileManage')


router.get('/', CheckAuth, Controller.Get_ALL);

router.get('/:id', CheckAuth, Controller.Get_byId)

router.post('/', CheckOwner, Controller.Add)

router.patch('/:id', CheckOwner, Controller.Update)

router.delete('/:id', CheckOwner, Controller.Del_byId)

module.exports = router;