const mongoose = require('mongoose');

const LoginSchema = new mongoose.Schema({
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

LoginSchema.post('findOne', async (doc) => {
	var systems = await mongoose.model('system').find({ account: doc._id });
	doc.systems = systems;
	return doc;
})

const Login = mongoose.model('login', LoginSchema);
module.exports = { Login, LoginSchema }