const mongoose = require('mongoose')

const commentScema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String
    }
})

const ratingSchema = mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    rating: Number
})

const storeSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        name: {type: String, required: true},
        desc: String,
        comments: [commentScema],
        location: {
            type: {
                x: Number,
                y: Number
            },
            index: true,
            required: true
        },
        ratingAvg: Number,
        rating: [ratingSchema]
    },{
        collection : 'stores'
    }
)

module.exports = mongoose.model('Store', storeSchema);