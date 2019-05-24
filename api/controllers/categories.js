const mongoose = require('mongoose')
//var admin = require('firebase-admin');

const Category = require('../models/category')

exports.Get_All = function (req, res, next) {
    console.log('He wants the info')
    Category.find()
        .select('_id name icon subs')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                categories: docs.map(doc => {
                    return {
                        _id: doc.id,
                        name: doc.name,
                        icon: doc.icon,
                        sub: doc.subs,
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

exports.Add = (req, res, next) => {
    var category = new Category({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        subs: req.body.sub,
        icon: req.body.icon
    })

    category
        .save()
        .then(result => {
            console.log(result);
            res.status(200).json({
                success: true,
                id: category._id
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        })
}

exports.Del = (req, res, next) => {
    const id = req.params.id;
    Category.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Category Deleted",
                request: {
                    type: 'POST'
                }
            })
        })
        .catch()
}
