const mongoose = require('mongoose');
const { objTransform } = require("../utils.js");
const { Member } = require('./members');

const pkeys = [
	"description",
	"members",
	"visibility"
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
	color: { },
	avatar: { },
	members: { },
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

const GroupSchema = new mongoose.Schema({
	account: { type: String, required: true }, // hid
	system: { type: String, required: true },
	hid: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	description: String,
	color: String,
	avatar: String,
	members: [ String ], // hids
	created: { type: Date, default: () => new Date() },
	privacy: {
		description: Boolean,
		members: Boolean,
		visibility: Boolean
	},
	overrides: [{
		type: String
	}]
})

GroupSchema.set('toObject', {
	getters: true, virtuals: true,
	versionKey: false,
	minimize: false,
	transform: (doc, ret) => {
		delete ret._id;
		delete ret.id;
		delete ret.account;

		
		return objTransform(ret, {
			// add extra non-patchable keys
			system: { },
			hid: { },
			...Patchable,
			created: { }
		});
	}
})

GroupSchema.methods.getMembers = async function() {
	return await Member.find({ hid: this.members });
}

GroupSchema.methods.delete = function() {
	return Group.deleteOne({_id: this._id})
}

const Group = mongoose.model('group', GroupSchema)
module.exports = { GroupSchema, Group };