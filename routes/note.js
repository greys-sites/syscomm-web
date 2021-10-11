const { Note, Patchable } = require("../stores/notes");
const { genHid } = require('../utils');

module.exports = [
	{
		path: ['/api/notes'],
		method: "get",
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();

			var notes = await Note.find({account: req.user.hid});
			if(!notes?.length) return res.status(200).send([]);

			console.log(notes);
			return res.status(200).send(notes.map(n => n.toObject()));
		}
	},
	{
		path: ['/api/note/:id'],
		method: "get",
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();

			var note = await Note.findOne({
				account: req.user.hid,
				hid: req.params.id
			});

			if(note) res.status(200).send(note.toObject());
			else res.status(404).send("Note not found");
		}
	},
	{
		path: ['/api/notes'],
		method: "put",
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();
			if(!req.body) return res.status(400).send();

			var data = req.body;
			data.account = req.user.hid;
			data.hid = genHid();
			var note = await Note.create(data);
			
			try {
				await note.save()
			} catch(e) {
				return res.status(500).send(e.message);
			}

			await res.status(200).send(note.toObject());
		}
	},
	{
		path: ['/api/note/:id'],
		method: "patch",
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();
			if(!req.body) return res.status(400).send();

			var note = await Note.findOne({
				account: req.user.hid,
				hid: req.params.id
			})
			if(!note) return res.status(404).send();

			var err = [];
			for(var k of Object.keys(req.body)) {
				if(!Patchable[k]) continue;
				var test = true;
				if(Patchable[k].test) test = Patchable[k].test(req.body[k]);
				if(!test) {
					err.push(Patchable[k].err);
					continue;
				}

				if(Patchable[k].transform) note[k] = Patchable[k].transform(req.body[k]);
				else note[k] = req.body[k];
			}

			if(err.length) return res.status(400).send({err});
			try {
				await note.save();
			} catch(e) {
				return res.status(500).send(e);
			}

			return res.status(200).send(note);
		}
	},
	{
		path: ['/api/note/:id'],
		method: "delete",
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();

			var note = await Note.findOne({
				account: req.user.hid,
				hid: req.params.id
			})
			if(!note) return res.status(404).send();

			try {
				await note.delete();
			} catch(e) {
				return res.status(500).send(e);
			}

			return res.status(200).send(note);
		}
	},
	{
		path: ['/api/notes'],
		method: "delete",
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();

			try {
				await Note.deleteMany({ account: req.user.hid });
			} catch(e) {
				return res.status(500).send(e);
			}

			return res.status(204).send();
		}
	}
]