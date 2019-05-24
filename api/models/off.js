const mongoose = require('mongoose')

const productAttr = mongoose.Schema({
    name: String,
    desc: String
})

const productInfo = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    brand: String,
    unit: {
        type: String,
        required: true
    },
    unitFactor: String,
    barcode: {
        type: String,
        required: true
    },
    imgs: [String],
    videos: [String],
    desc: String,
    attributes: [productAttr],
    ratingAvg: Number
})

const storeInfo = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    desc: String,
    comments: [String],
    ratingAvg: Number,
})

const offSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    startdate: {
        type: Date,
        default: Date.now
    },
    enddate: {
        type: Date,
        required: true
    },
    product: productInfo,
    store: storeInfo,
    location: {
        type: {
            x: Number,
            y: Number
        },
        index: true,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    offrate: Number,
    category: {
        type: String,
        index: true,
        required: true
    }
}, {
        collection: 'offs'
    }
)

module.exports = mongoose.model('Off', offSchema);