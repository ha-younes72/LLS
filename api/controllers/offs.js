const mongoose = require('mongoose')
const Off = require('../models/off')
const Product = require('../models/product')
const Store = require('../models/store')

module.exports.Get_All = function (req, res, next) {
    console.log('He wants the info')
    Off.find()
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                offs: docs
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
    Off.findById(id)
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

module.exports.Get_byProduct = function (req, res, next) {
    const id = req.params.id;
    const filter = {
        'product._id': id
    }
    Off.find(filter)
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json({
                    cout : doc.length,
                    offs: doc
                });
            } else {
                res.status(404).json({ message: 'No valid entry found' });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        })
}


module.exports.Add_Off = (req, res) => {
    console.log('The app wants to add off')
    const pid = req.body.productId;
    var category = null;
    var product = null;
    Product.findById(pid)
        .select("_id name brand unit unitFactor barcode imgs videos desc attributes ratingAvg category")
        .exec()
        .then(doc => {
            if (doc) {
                product = {
                    _id: doc._id,
                    name: doc.name,
                    brand: doc.brand,
                    unit: doc.unit,
                    unitFactor: doc.unitFactor,
                    barcode: doc.barcode,
                    imgs: doc.imgs,
                    videos: doc.videos,
                    desc: doc.desc,
                    attributes: doc.attributes,
                    ratingAvg: doc.ratingAvg
                };
                category = doc.category;
                const sid = req.body.storeId;
                var store = null;
                var location = null;
                Store.findById(sid)
                    .select("")
                    .exec()
                    .then(doc => {
                        console.log("Store Doc:", doc)
                        if (doc) {
                            store = {
                                _id: doc._id,
                                name: doc.name,
                                desc: doc.desc,
                                ratingAvg: doc.ratingAvg
                            };
                            location = doc.location
                            console.log('Location: ', location)
                            console.log('Store: ', store)
                            var off = new Off({
                                _id: new mongoose.Types.ObjectId(),
                                startdate: req.body.startdate,
                                enddate: req.body.enddate,
                                product: product,
                                store: store,
                                location: location,
                                price: req.body.price,
                                offrate: req.body.offrate,
                                category: category
                            });

                            off
                                .save()
                                .then(result => {
                                    console.log(result);
                                    res.status(200).json({
                                        success: true,
                                        id: off._id
                                    })
                                })
                                .catch(err => {
                                    //console.log(err);
                                    res.status(500).json({ error: err })
                                })
                        } else {
                            return res.status(404).json({ message: 'No valid Product found' });
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        return res.status(500).json({ error: err })
                    })


            } else {
                return res.status(404).json({ message: 'No valid Product found' });
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({ error: err })
        })


}

module.exports.Update_byId = (res, req, next) => {
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
    Off.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Off Updated',
                url: 'http://10.42.0.1:3210/offs/' + id
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
}

module.exports.Delete_byId = (req, res, next) => {
    const id = req.params.id;
    Off.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Off Deleted",
                request: {
                    type: 'POST',
                    url: 'http://10.42.0.1:3210/offs/'
                }
            })
        })
        .catch()
}

module.exports.Get_Recomms = (req, res, next) => {
    const location = {
        x: req.body.lat,
        y: req.body.long
    }
    const delta = 35;
    Off.find({
        'location.x': { $gt: location.x - delta, $lt: location.x + delta },
        'location.y': { $gt: location.y - delta, $lt: location.y + delta },
    })
        .sort({ offrate: -1 })
        .exec()
        .then(docs => {
            if (docs.length > 0) {
                const response = {
                    count: docs.length,
                    offs: docs
                }
                res.status(200).json(response)
            } else {
                res.status(404).json({
                    message: "No entry found"
                })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}

module.exports.Get_Limited_Recomms = (req, res, next) => {
    const location = {
        x: req.body.lat,
        y: req.body.long
    }
    const delta = 10;
    console.log("page: ", req.query.page ? (JSON.parse(req.query.page) - 1) * JSON.parse(req.params.limit) : 0)
    Off.find({
        'location.x': { $gt: location.x - delta, $lt: location.x + delta },
        'location.y': { $gt: location.y - delta, $lt: location.y + delta },
    })
        .sort({ offrate: -1 })
        .skip(req.query.page ? (JSON.parse(req.query.page) - 1) * JSON.parse(req.params.limit) : 0)
        .limit(JSON.parse(req.params.limit))
        .exec()
        .then(docs => {
            if (docs.length > 0) {
                const response = {
                    count: docs.length,
                    offs: docs
                }
                res.status(200).json(response)
            } else {
                res.status(404).json({
                    message: "No entry found"
                })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}

module.exports.Get_Recomms_byCat = (req, res, next) => {
    console.log("Params", req.params)
    const location = {
        x: req.body.lat,
        y: req.body.long
    }
    //const regex = req.params.category;
    const regex = req.body.expr;
    //const regex = '/^F/'
    console.log("RegEx", regex)
    const delta = 10;
    Off.find({
        category: { $regex: regex, $options: 'i' },
        //'location.x': { $gt: location.x - delta, $lt: location.x + delta },
        //'location.y': { $gt: location.y - delta, $lt: location.y + delta },
    })
        .sort({ offrate: -1 })
        .exec()
        .then(docs => {
            if (docs.length > 0) {
                const response = {
                    count: docs.length,
                    offs: docs
                }
                res.status(200).json(response)
            } else {
                res.status(404).json({
                    message: "No entry found"
                })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}
