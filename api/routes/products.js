const express = require('express');
const router = express.Router();

const Controller = require('../controllers/products')
const checkAuth = require('../middlewares/checkAuth')
const checkOwner = require('../middlewares/checkOwner')

const uploadManager = require('../middlewares/fileManage')

router.get('/', checkAuth, Controller.Get_All);

router.get('/categories/', checkAuth, Controller.Get_Categories)

router.get('/:id', checkAuth, Controller.Get_byId)

router.post('/', checkOwner, uploadManager.array('productImage', 12), Controller.Add)

router.patch('/:id', checkOwner, Controller.Update)

router.delete('/:id', checkOwner, Controller.Delete)

module.exports = router;

/*.fields([{
    name: 'productImage', maxCount: 12
},
{
    name: 'productVideo', maxCount: 2
}])*/