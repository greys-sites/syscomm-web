const mongoose = require('mongoose');
const { Group } = require('./groups');
const { Tag } = require('./tags');

const MemberSchema = new mongoose.Schema({
	system: { type: String, required: true },
	hid: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	description: String,
	pronouns: String,
	birthday: String,
	color: String,
	avatar: String,
	groups: [mongoose.Schema.Types.ObjectId],
	tags: [mongoose.Schema.Types.ObjectId],
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

const Member = mongoose.model('member', MemberSchema);
module.exports = { MemberSchema, Member };