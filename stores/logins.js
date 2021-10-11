const mongoose = require('mongoose');
const { System } = require('./systems');

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

LoginSchema.methods.getSystems = async function() {
	return await System.find({ account: this.hid })
		.populate({ path: 'members', sort: 'name' })
		.populate('groups')
		.populate('tags');
}

const Login = mongoose.model('login', LoginSchema);
module.exports = { Login, LoginSchema }