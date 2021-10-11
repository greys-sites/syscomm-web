const mongoose = require('mongoose');
const { objTransform } = require("../utils.js");

const pkeys = [
	"description",
	"pronouns",
	"birthday",
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
			return (
				!Object.keys(p || {}).find(k => p[k] && typeof p[k] !== "boolean") &&
				!Object.keys(p || {}).find(k => !pkeys.includes(k))
			)
		},
		err: `Valid privacy keys: ${pkeys.join(", ")}; valid privacy values: true | false`
	},
	overrides: { }
}

const MemberSchema = new mongoose.Schema({
	account: { type: String, required: true }, // hid
	system: {type: String, required: true },
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

MemberSchema.set('toObject', {
	getters: true, virtuals: true,
	versionKey: false,
	minimize: false,
	transform: (doc, ret) => {
		delete ret._id;
		delete ret.id;
		delete ret.account;

		return objTransform(ret, {
			system: { },
			hid: { },
			...Patchable,
			created: { }
		});
	}
})

MemberSchema.methods.delete = function() {
	return Member.deleteOne({_id: this._id})
}

const Member = mongoose.model('member', MemberSchema);
module.exports = { MemberSchema, Member, Patchable };