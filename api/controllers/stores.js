const mongoose = require('mongoose')
const Store = require('../models/store')

module.exports.Get_ALL = function (req, res, next) {
    console.log('He wants the info')
    Store.find()
        .select('_id name desc location')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                stores: docs.map(doc => {
                    return {
                        name: doc.name,
                        desc: doc.desc,
                        location: doc.location,
                        id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://10.42.0.1:3210/stores/' + doc._id
                        }
                    }
                })
            }
            res.status(200).json(response)
            //console.log(docs);
            //res.status(200).json(docs);
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ error: err })
        })
}

module.exports.Get_byId = function (req, res, next) {
    const id = req.params.id;
    Store.findById(id)
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

module.exports.Add = (req, res, next) => {
    console.log('The app wants to add store')
    console.log(req.body)
    var store = new Store({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        desc: req.body.desc,
        location: {
            x:req.body.lat,
            y:req.body.long
        }
    });

    console.log("I'm Here")

    store.save()
        .then(result => {
            console.log(result);
            res.status(200).json({
                success: true,
                id: store._id
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        })

}

module.exports.Update = (res, req, next)=>{
    /*
    [
        {"propName": 'name', "value": "NewValue"}
    ]
    */
    const id = req.params.id;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Store.update({_id: id},{$set: updateOps})
        .exec()
        .then(result=>{
            console.log(result);
            res.status(200).json({
                message: 'Product Updated',
                url: 'http://10.42.0.1:3210/stores/' + id
            });
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
}

module.exports.Del_byId = (req, res, next)=>{
    const id = req.params.id;
    Store.remove({_id:id})
        .exec()
        .then(result=>{
            res.status(200).json({
                message: "Product Deleted",
                request:{
                    type: 'POST',
                    url: 'http://10.42.0.1:3210/stores/'
                }
            })
        })
        .catch()
} 