const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
	hid: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	description: String,
	color: String,
	avatar: String,
	members: [ String ], // hids
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

// const Group = mongoose.model('group', GroupSchema)
module.exports = { GroupSchema };