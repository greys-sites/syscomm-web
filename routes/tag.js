const { Tag, Patchable } = require('../stores/tags');
const { Member } = require('../stores/members');
const { System } = require('../stores/systems');
const { applyPrivacy, genHid } = require('../utils');

module.exports = [
	{
		path: ['/api/system/:id/tags', '/api/s/:id/t'],
		method: 'get',
		func: async (req, res) => {
			var system = await System.findOne({ hid: req.params.id });
			if(!system) return res.status(404).send();

			var tags = await system.getTags();
			if(!tags?.[0]) return res.status(200).send([]);
			tags = tags.map(t => {
				t = t.toObject();
				if(!t.overrides || !t.overrides.length)
					t.overrides = system.overrides;
				return applyPrivacy(t, req.user);
			})

			res.send(tags);
		}
	},
	{
		path: ['/api/system/:id/tags', '/api/s/:id/t'],
		method: 'put',
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();
			if(!req.body) return res.status(400).send();

			var system = await System.findOne({ hid: req.params.id });
			if(!system) return res.status(404).send('System not found');
			if(system.account != req.user.hid)
				return res.status(403).send("That system doesn't belong to you");

			var data = req.body;
			data.account = req.user.hid;
			data.system = system.hid;
			data.hid = genHid();
			var tag = await Tag.create(req.body);
			
			try {
				await tag.save()
			} catch(e) {
				return res.status(500).send(e.message);
			}

			await res.status(200).send(data);
		}
	},
	{
		path: ['/api/tag/:id', '/api/t/:id'],
		method: 'get',
		func: async (req, res) => {
			var tag = await Tag.findOne({hid: req.params.id});
			if(!tag) return res.status(404).send();
			tag = applyPrivacy(tag, req.user)
			if(!tag) return res.status(404).send();

			res.send(tag.toObject());
		}
	},
	{
		path: ['/api/tag/:id', '/api/t/:id'],
		method: 'patch',
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();
			if(!req.body) return res.status(400).send();
			
			var tag = await Tag.findOne({hid: req.params.id});
			if(!tag) return res.status(404).send();

			if(tag.account != req.user.hid) return res.status(403).send("That tag doesn't belong to you")

			var err = [];
			for(var k of Object.keys(req.body)) {
				if(!Patchable[k]) continue;
				var test = true;
				if(Patchable[k].test) test = Patchable[k].test(req.body[k]);
				if(!test) {
					err.push(Patchable[k].err);
					continue;
				}

				if(Patchable[k].transform) tag[k] = Patchable[k].transform(req.body[k]);
				else tag[k] = req.body[k];
			}

			if(err.length) return res.status(400).send({err});
			try {
				await tag.save();
			} catch(e) {
				return res.status(500).send(e);
			}

			return res.status(200).send(tag);
		}
	},
	{
		path: ['/api/tag/:id/members', '/api/t/:id/m'],
		method: 'get',
		func: async (req, res) => {
			var tag = await Tag.findOne({hid: req.params.id});
			var membs = await tag.getMembers();
			return res.status(200).send(membs);
		}
	},
	{
		path: ['/api/tag/:id/members', '/api/t/:id/m'],
		method: 'patch',
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();
			if(!req.body) return res.status(400).send();

			var tag = await Tag.findOne({hid: req.params.id});
			if(!tag) return res.status(404).send();
			if(tag.account != req.user.hid) return res.status(403).send("That tag doesn't belong to you");

			if(!Array.isArray(req.body))
				return res.status(400).send("Body should be array of member hids.");

			var members;
			if(req.body.length){
				members = await Member.find({ hid: req.body, account: req.user.hid });
				if(!members?.[0]) return res.status(400).send("No members with those hids found.");
			} else members = [];
			
			
			tag.members = members.length ? members.map(m => m.hid) : members;
			await tag.save();

			tag = tag.toObject();
			return res.status(200).send({
				... tag,
				members
			})
		}
	},
	{
		path: ['/api/tag/:id', '/api/t/:id'],
		method: 'delete',
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();
			
			var tag = await Tag.findOne({hid: req.params.id});
			if(!tag) return res.status(404).send();
			if(tag.account != req.user.hid) return res.status(403).send("That tag doesn't belong to you")

			try {
				await tag.delete();
			} catch(e) {
				return res.status(500).send(e);
			}

			return res.status(200).send();
		}
	}
]