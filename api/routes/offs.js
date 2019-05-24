var express = require('express');
var router = express.Router();


const checkAuth = require('../middlewares/checkAuth')
const checkOwner = require('../middlewares/checkOwner')
const Controller = require('../controllers/offs')

router.get('/', checkAuth, Controller.Get_All);

router.get('/:id', checkAuth, Controller.Get_byId);

router.get('/byProduct/:id', checkAuth, Controller.Get_byProduct);

router.post('/recoms/', checkAuth, Controller.Get_Recomms)

router.post('/recoms/:limit', checkAuth, Controller.Get_Limited_Recomms)

//router.post('/recoms/:limit', checkAuth, Controller.Get_Limited_Recomms_withPage)

router.post('/recomsbyCat/', checkAuth, Controller.Get_Recomms_byCat)

router.post('/', checkOwner, Controller.Add_Off);

router.patch('/:id', checkOwner, Controller.Update_byId);

router.delete('/:id', checkOwner, Controller.Delete_byId);

module.exports = router;