const mongoose = require('mongoose');
const { Member } = require('./members');
const { Group } = require('./groups');
const { Tag } = require('./tags');

const SystemSchema = new mongoose.Schema({
	account: { type: mongoose.Schema.Types.ObjectId, ref: 'login', required: true },
	hid: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	description: String,
	pronouns: String,
	color: String,
	avatar: String,
	created: { type: Date, default: () => new Date() },
	privacy: {
		query: Boolean,
		description: Boolean,
		members: Boolean,
		groups: Boolean,
		fronters: Boolean
	},
	overrides: [{
		type: String // hids
	}]
});

SystemSchema.virtual('members', {
	ref: 'member',
	localField: 'hid',
	foreignField: 'system'
})

SystemSchema.virtual('groups', {
	ref: 'group',
	localField: 'hid',
	foreignField: 'system'
})

SystemSchema.virtual('tags', {
	ref: 'tag',
	localField: 'hid',
	foreignField: 'system'
})

SystemSchema.set('toJSON', { getters: true, virtuals: true });
SystemSchema.set('toObject', { getters: true, virtuals: true });

SystemSchema.methods.getMembers = async function() {
	return Member.find({ system: this.hid });
}

SystemSchema.methods.getGroups = async function() {
	return Group.find({ system: this.hid });
}

SystemSchema.methods.getTags = async function() {
	return Tag.find({ system: this.hid });
}

SystemSchema.methods.getMember = async function(hid) {
	return Member.find({ system: this.hid, hid });
}

SystemSchema.methods.getGroup = async function(hid) {
	return Group.find({ system: this.hid, hid });
}

SystemSchema.methods.getTag = async function(hid) {
	return Tag.find({ system: this.hid, hid });
}

// SystemSchema.pre(/find/, function() {
	// this.populate({ path: 'members', sort: 'name' })
		// .populate('groups')
		// .populate('tags')
// })

const System = mongoose.model('system', SystemSchema);
module.exports = { System, SystemSchema };