const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
	hid: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	description: String,
	pronouns: String,
	birthday: String,
	color: String,
	avatar: String,
	created: { type: Date, default: () => new Date() },
	privacy: {
		description: Boolean,
		pronouns: Boolean,
		birthday: Boolean,
		visibility: Boolean
	},
	overrides: [{
		type: String
	}],
	password: String // for private notes
})

// const Member = mongoose.model('member', MemberSchema);
module.exports = { MemberSchema };