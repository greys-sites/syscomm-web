const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
	system: { type: String, required: true },
	hid: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	description: String,
	color: String
})

TagSchema.virtual('members', {
	ref: 'member',
	localField: '_id',
	foreignField: 'tags'
})

const Tag = mongoose.model('tag', TagSchema);
module.exports = { TagSchema, Tag };