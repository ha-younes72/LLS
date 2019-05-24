const mongoose = require('mongoose')

const adminSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        fname: {type: String, required: true},
        lname: String,
        password: {type: String, required: true},
        email: {type: String, required: true, unique: true}
    },{
        collection : 'admins'
    }
)

module.exports = mongoose.model('Admin', adminSchema);