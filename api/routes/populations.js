var express = require('express');
var router = express.Router();

//const mongoose = require('mongoose')


const Off = require('../models/off')

const Product = require('../models/product')

router.get('/details', function(req, res, next) {
    console.log('He wants the info')
    Off.find()
        .populate('product', 'name category desc')
        .exec()
        .then(docs=>{
          const response = {
              count: docs.length,
              offs: docs.map(doc => {
                  return{
                      id: doc._id,
                      startdate: doc.startdate,
                      enddate: doc.enddate,
                      product: doc.product,
                      store: doc.store,
                      price: doc.price,
                      off: doc.off,
                      factor: doc.factor
                  }
              })
          }
          res.status(200).json(response)
          //console.log(docs);
          //res.status(200).json(docs);
      })
      .catch(err=>{
          console.log(err)
          res.status(500).json({error: err})
      })
  });
  
router.get('/details/:id', function(req, res, next){
    const id = req.params.id;
    Off.findById(id)
        .populate([{
            path: 'product',
            model: 'Product',
            select: 'name _id desc attributes rating'
        },{
            path: 'store',
            model: 'Store',
            select: 'name _id desc location rating'
        }])
        .exec()
        .then(doc =>{
            if(doc){
                res.status(200).json(doc);
            }else{
                res.status(404).json({message: 'No valid entry found'});
            }
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({error: err})
        })
})

module.exports = router;