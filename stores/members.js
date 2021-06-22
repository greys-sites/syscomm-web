const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
	account: { type: mongoose.Schema.Types.ObjectId, ref: 'login', required: true },
	system: {type: String },
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

MemberSchema.methods.delete = function() {
	return Member.deleteOne({_id: this._id})
}

const Member = mongoose.model('member', MemberSchema);
module.exports = { MemberSchema, Member };