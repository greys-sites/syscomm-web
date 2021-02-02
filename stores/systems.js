const mongoose = require('mongoose');
const { Member } = require('./members');
const { Group } = require('./groups');

const SystemSchema = new mongoose.Schema({
	account: { type: mongoose.Schema.Types.ObjectId, ref: 'login '},
	hid: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	description: String,
	pronouns: String,
	color: String,
	avatar: String,
	members: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: Member
	}],
	groups: {
		type: mongoose.Schema.Types.ObjectId,
		ref: Group
	},
	privacy: {
		description: Boolean,
		members: Boolean,
		fronters: Boolean
	},
	overrides: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'system'
	}]
})

const System = mongoose.model('system', SystemSchema);
module.exports = { System, SystemSchema };