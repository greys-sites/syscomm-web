const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
	hid: { type: String, required: true, unique: true },
	system: { type: String, required: true },
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
		type: mongoose.Schema.Types.ObjectId,
		ref: 'system'
	}]
})

GroupSchema.methods.getMembers = async function() {
	return await this.db.model('member').find({ groups: this._id });
}

const Group = mongoose.model('group', GroupSchema);
module.exports = { Group, GroupSchema };