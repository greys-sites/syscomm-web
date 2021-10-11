const mongoose = require('mongoose');
const { objTransform } = require("../utils.js");

const Patchable = {
	name: {
		test: (n) => n.length && n.length < 100,
		err: "Name must be between 1 and 100 characters"
	},
	body: {
		test: (b) => b.length < 4000,
		err: "Body must be below 4000 characters"
	},
	color: { }
}

const NoteSchema = new mongoose.Schema({
	account: { type: String, required: true }, // hid
	hid: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	body: { type: String, required: true },
	color: String,
	created: Date,
	lastEdit: Date
})

NoteSchema.set('toObject', {
	versionKey: false,
	minimize: false,
	transform: (doc, ret) => {
		delete ret._id;
		delete ret.id;
		delete ret.account;

		return objTransform(ret, {
			hid: { },
			...Patchable,
			created: { },
			lastEdit: { }
		});
	}
})

NoteSchema.methods.delete = function() {
	return Note.deleteOne({_id: this._id})
}

const Note = mongoose.model('note', NoteSchema);
module.exports = { NoteSchema, Note, Patchable };