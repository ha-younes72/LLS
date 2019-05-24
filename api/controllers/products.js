const mongoose = require('mongoose')

const Product = require('../models/product')

exports.Get_Categories = function (req, res, next) {
    console.log('He wants the info')
    Product.find()
        .distinct('category')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                categories: docs.map(doc => {
                    return {
                        category: doc.category,
                        //id: doc._id
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

exports.Get_All = function (req, res, next) {
    console.log('He wants the info')
    Product.find()
        .select('_id name desc category barcode imgs')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        desc: doc.desc,
                        category: doc.category,
                        id: doc._id,
                        barcode: decodeURI.barcode,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3210/products/' + doc._id,
                            img: 'http://localhost:3210/' + doc.imgs[0]
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

exports.Get_byId = function (req, res, next) {
    const id = req.params.id;
    Product.findById(id)
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

exports.Add = (req, res) => {
    console.log('The app wants to add product')
    const images = req.files.map(file => {
        return file.path
    })
    const videos = []
    /*
    const videos = req.files['productVideo'].map(file =>{
        return file.path
    })*/
    //console.log(images)
    //console.log(req.body.attributes)
    var product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        brand: req.body.brand,
        unit: req.body.unit,
        unitFactor: req.body.unitFactor,
        barcode: req.body.barcode,
        imgs: images,
        videos: videos,
        desc: req.body.desc,
        attributes: JSON.parse(req.body.attributes),
        category: req.body.category
    });

    product
        .save()
        .then(result => {
            console.log(result);
            res.status(200).json({
                success: true,
                id: product._id
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        })

}

exports.Update = (res, req, next) => {
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
    Product.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Product Updated',
                url: 'http://10.42.0.1:3210/products/' + id
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
}

exports.Delete = (req, res, next) => {
    const id = req.params.id;
    Product.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Product Deleted",
                request: {
                    type: 'POST',
                    url: 'http://10.42.0.1:3210/products/'
                }
            })
        })
        .catch()
}