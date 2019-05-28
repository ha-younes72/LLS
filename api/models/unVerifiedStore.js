const mongoose = require('mongoose')

const unStoreSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        name: { type: String, required: true },
        address: { type: String, required: true },
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        token: { type: String, required: true }

    }, {
        collection: 'unStores'
    }
)

module.exports = mongoose.model('UnStore', unStoreSchema);