const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
	hid: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	description: String,
	color: String,
	avatar: String,
	created: { type: Date, default: () => new Date() },
	privacy: {
		description: Boolean,
		list: Boolean,
		visibility: Boolean
	},
	overrides: [{
		type: String
	}]
})

GroupSchema.virtual('members', {
	ref: 'member',
	localField: '_id',
	foreignField: 'groups'
})

const Group = mongoose.model('group', GroupSchema)
module.exports = { Group };