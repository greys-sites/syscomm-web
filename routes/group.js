const { Group, Patchable } = require('../stores/groups');
const { Member } = require('../stores/members');
const { System } = require('../stores/systems');
const { applyPrivacy, genHid } = require('../utils')

module.exports = [
	{
		path: ['/api/system/:id/groups', '/api/s/:id/g'],
		method: 'get',
		func: async (req, res) => {
			var system = await System.findOne({ hid: req.params.id });
			if(!system) return res.status(404).send();

			var groups = await system.getGroups();
			if(!groups?.[0]) return res.status(200).send([]);
			groups = groups.map(g => {
				g = g.toObject();
				if(!g.overrides || !g.overrides.length)
					g.overrides = system.overrides;
				return applyPrivacy(g, req.user);
			})

			res.send(groups);
		}
	},
	{
		path: ['/api/system/:id/groups', '/api/s/:id/g'],
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
			var group = await Group.create(req.body);
			
			try {
				await group.save()
			} catch(e) {
				return res.status(500).send(e.message);
			}

			await res.status(200).send(data);
		}
	},
	{
		path: ['/api/group/:id', '/api/g/:id'],
		method: 'get',
		func: async (req, res) => {
			var group = await Group.findOne({hid: req.params.id});
			if(!group) return res.status(404).send();
			group = applyPrivacy(group, req.user)
			if(!group) return res.status(404).send();

			res.send(group.toObject());
		}
	},
	{
		path: ['/api/group/:id', '/api/g/:id'],
		method: 'patch',
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();
			if(!req.body) return res.status(400).send();
			
			var group = await Group.findOne({hid: req.params.id});
			if(!group) return res.status(404).send();

			if(group.account != req.user.hid) return res.status(403).send("That group doesn't belong to you")

			var err = [];
			for(var k of Object.keys(req.body)) {
				if(!Patchable[k]) continue;
				var test = true;
				if(Patchable[k].test) test = Patchable[k].test(req.body[k]);
				if(!test) {
					err.push(Patchable[k].err);
					continue;
				}

				if(Patchable[k].transform) group[k] = Patchable[k].transform(req.body[k]);
				else group[k] = req.body[k];
			}

			if(err.length) return res.status(400).send({err});
			try {
				await group.save();
			} catch(e) {
				return res.status(500).send(e);
			}

			return res.status(200).send(group);
		}
	},
	{
		path: ['/api/group/:id/members', '/api/g/:id/m'],
		method: 'get',
		func: async (req, res) => {
			var group = await Group.findOne({hid: req.params.id});
			var membs = await group.getMembers();
			return res.status(200).send(membs);
		}
	},
	{
		path: ['/api/group/:id/members', '/api/g/:id/m'],
		method: 'patch',
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();
			if(!req.body) return res.status(400).send();

			var group = await Group.findOne({hid: req.params.id});
			if(!group) return res.status(404).send();
			if(group.account != req.user.hid) return res.status(403).send("That group doesn't belong to you");

			if(!Array.isArray(req.body))
				return res.status(400).send("Body should be array of member hids.");

			var members;
			if(req.body.length){
				members = await Member.find({ hid: req.body, account: req.user.hid });
				if(!members?.[0]) return res.status(400).send("No members with those hids found.");
			} else members = [];
			
			
			group.members = members.length ? members.map(m => m.hid) : members;
			await group.save();

			group = group.toObject();
			return res.status(200).send({
				... group,
				members
			})
		}
	},
	{
		path: ['/api/group/:id', '/api/g/:id'],
		method: 'delete',
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();
			
			var group = await Group.findOne({hid: req.params.id});
			if(!group) return res.status(404).send();
			if(group.account != req.user.hid) return res.status(403).send("That group doesn't belong to you")

			try {
				await group.delete();
			} catch(e) {
				return res.status(500).send(e);
			}

			return res.status(200).send();
		}
	}
]