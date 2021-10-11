const mongoose = require('mongoose');
const { objTransform } = require("../utils.js");

const Patchable = {
	name: {
		test: (n) => n.length <= 100,
		err: "Name must be 100 characters or less"
	},
	description: {
		test: (d) => d.length <= 2000,
		err: "Description must be 2000 characters or less"
	},
	color: {
		
	}
}

const TagSchema = new mongoose.Schema({
	account: { type: String, required: true }, // hid
	system: { type: String, required: true },
	hid: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	description: String,
	color: String,
	members: [ String ] // hids
})

// TagSchema.set('toJSON', {
	// getters: true, virtuals: true,
	// versionKey: false,
	// minimize: false,
	// transform: (doc, ret) => {
		// delete ret._id;
		// delete ret.id;
		// delete ret.account;
	// }
// })

TagSchema.set('toObject', {
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
			members: { },
			created: { }
		});
	}
})

TagSchema.methods.getMembers = async function() {
	return await Member.find({ hid: this.members });
}

TagSchema.methods.delete = function() {
	return Tag.deleteOne({_id: this._id})
}

const Tag = mongoose.model('tag', TagSchema);
module.exports = { TagSchema, Tag, Patchable };