const mongoose = require('mongoose');
const { Member } = require('./members');
const { Group } = require('./groups');
const { Tag } = require('./tags');
const { objTransform } = require("../utils.js");

const pkeys = [
	"query",
	"description",
	"pronouns",
	"members",
	"groups",
	"fronters"
]

const Patchable = {
	name: {
		test: (n) => n.length <= 100,
		err: "Name must be 100 characters or less"
	},
	description: {
		test: (d) => d.length <= 2000,
		err: "Description must be 2000 characters or less"
	},
	pronouns: {
		test: (p) => p.length <= 200,
		err: "Pronouns must be 200 characters or less"
	},
	color: {
		
	},
	avatar: {
		
	},
	privacy: {
		test: (p) => {
			p = p ?? {};
			return (
				!Object.keys(p).find(k => p[k] && typeof p[k] !== "boolean") &&
				!Object.keys(p).find(k => !pkeys.includes(k))
			)
		},
		transform: (p) => {
			for(var k in p) {
				p[k] = p[k] ?? null;
			}

			return p;
		},
		err: `Valid privacy keys: ${pkeys.join(", ")}; valid privacy values: true | false`
	},
	overrides: { }
}

const SystemSchema = new mongoose.Schema({
	account: { type: String, required: true }, // hid
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
		pronouns: Boolean,
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

SystemSchema.set('toJSON', {
	getters: true, virtuals: true,
	versionKey: false,
	minimize: false,
	transform: (doc, ret) => {
		delete ret._id;
		delete ret.id;
		delete ret.account;
	}
})

SystemSchema.set('toObject', {
	getters: true, virtuals: true,
	versionKey: false,
	minimize: false,
	transform: (doc, ret) => {
		console.log('sys toObject')
		delete ret._id;
		delete ret.id;
		delete ret.account;

		return objTransform(ret, {
			hid: { },
			...Patchable,
			created: { }
		});
	}
})


SystemSchema.statics.getPopulated = async function(hid) {
	return await this.findOne({ hid })
		.populate({ path: 'members', sort: 'name' })
		.populate('groups')
		.populate('tags');
}

SystemSchema.methods.getMembers = async function() {
	var d = await Member.find({ system: this.hid });
	return d;
}

SystemSchema.methods.getGroups = async function() {
	return await Group.find({ system: this.hid });
}

SystemSchema.methods.getTags = async function() {
	return await Tag.find({ system: this.hid });
}

SystemSchema.methods.getMember = async function(hid) {
	return await Member.find({ system: this.hid, hid });
}

SystemSchema.methods.getGroup = async function(hid) {
	return await Group.find({ system: this.hid, hid });
}

SystemSchema.methods.getTag = async function(hid) {
	return await Tag.find({ system: this.hid, hid });
}

const System = mongoose.model('system', SystemSchema);
module.exports = { System, SystemSchema };