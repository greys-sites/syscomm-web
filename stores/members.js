const mongoose = require('mongoose');
const { Group } = require('./groups')

const MemberSchema = new mongoose.Schema({
	hid: { type: String, required: true, unique: true },
	system: { type: String, required: true },
	name: { type: String, required: true },
	description: String,
	pronouns: String,
	birthday: String,
	color: String,
	avatar: String,
	groups: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: Group
	}],
	created: { type: Date, default: () => new Date() },
	privacy: {
		description: Boolean,
		pronouns: Boolean,
		birthday: Boolean,
		visibility: Boolean
	},
	overrides: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'system'
	}]
})

const Member = mongoose.model('member', MemberSchema);
module.exports = { Member, MemberSchema };