const mongoose = require('mongoose')

const productAttr = mongoose.Schema({
    name: String,
    desc: String
})

const ratingSchema = mongoose.Schema({
    rate: Number,
    date: {type:Date, default: Date.now}
})

const priceSchema = mongoose.Schema({
    date: {type: Date, default: Date.now},
    prices: [{
        storeId: mongoose.Schema.Types.ObjectId,
        pricePerUnit: Number
    }]
})

const productSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        name: {type: String, required: true},
        brand: String,
        unit: String,
        unitFactor: String,
        barcode: String,
        imgs: {type: [String]},
        videos: {type: [String]},
        desc: String,
        attributes: [productAttr],
        rating: [ratingSchema],
        storesId: {type:[mongoose.Schema.Types.ObjectId], ref:'Store'},
        category: {type: String, index: true},
        prices: [priceSchema]
    },{
        collection : 'products'
    }
)

module.exports = mongoose.model('Product', productSchema);