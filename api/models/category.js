const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    icon: String,
    subs: [String]
},{
    collection: 'categories'
})

module.exports = mongoose.model('Category', categorySchema)