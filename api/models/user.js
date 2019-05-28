const mongoose = require('mongoose')

const prdSeen = mongoose.Schema(
	{
		_id: mongoose.Schema.Types.ObjectId,
		productId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Product'
		},
		startTime: {
			type: Date,
			default: Date.now
		},
		endTime: {
			type: Date,
			default: Date.now
		}
	}
)


const userSchema = mongoose.Schema(
	{
		_id: mongoose.Schema.Types.ObjectId,
		fname: { type: String, required: true },
		lname: String,
		img: String,
		job: String,
		password: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		roles: [{ type: String, default: 'usual' }],
		registeredAt: { type: Date, default: Date.now },
		loginAt: [{ type: Date }],
		productsSeen: [prdSeen],
		myStore: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Store'
		},
		favCats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
		realTimeNotif: { type: Boolean, default: true },
		casualWishList: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Product'
		}],
		isVerified: { type: Boolean, default: false },
		passwordResetToken: String,
		passwordResetExpires: Date,
		storeId: {type: mongoose.Schema.Types.ObjectId, ref: 'Store'}
	}, {
		collection: 'users'
	}
)

module.exports = mongoose.model('User', userSchema);
