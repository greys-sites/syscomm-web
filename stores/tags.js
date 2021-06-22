const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
	account: { type: mongoose.Schema.Types.ObjectId, ref: 'login', required: true },
	system: String,
	hid: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	description: String,
	color: String,
	members: [ String ] // hids
})

const Tag = mongoose.model('tag', TagSchema);
module.exports = { TagSchema, Tag };