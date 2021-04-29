const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
	hid: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	description: String,
	color: String,
	members: [ String ] // hids
})

// TagSchema.virtual('members', {
	// ref: 'member',
	// localField: '_id',
	// foreignField: 'tags'
// })

// const Tag = mongoose.model('tag', TagSchema);
module.exports = { TagSchema };