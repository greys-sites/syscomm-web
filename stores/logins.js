const mongoose = require('mongoose');

const LoginSchema = new mongoose.Schema({
	hid: { type: String, required: true, unique: true },
	username: {
		type: String,
		required: true,
		validate: function(val) {
			return !val.match(/[^a-z0-9-_]/gi);
		}
	},
	password: {
		type: String,
		required: true
	},
	salt: {
		type: String,
		required: true
	},
	email: String,
	token: String
})

LoginSchema.virtual('systems', {
	ref: 'system',
	foreignField: 'account',
	localField: '_id'
})

LoginSchema.set('toJSON', { getters: true, /*virtuals: true*/ });
LoginSchema.set('toObject', { getters: true, /*virtuals: true*/ });

LoginSchema.pre('findOne', function() {
	this.populate('systems');
})

const Login = mongoose.model('login', LoginSchema);
module.exports = { Login, LoginSchema }