const { System } = require('../stores/systems');
const { Member, Patchable } = require('../stores/members');
const { applyPrivacy, genHid } = require('../utils')

module.exports = [
	{
		path: ['/api/system/:sid/members', '/api/s/:sid/m'],
		method: 'get',
		func: async (req, res) => {
			var system = await System.findOne({ hid: req.params.sid });
			if(!system) return res.status(404).send();

			var members = await system.getMembers();
			if(!members?.[0]) return res.status(200).send([]);
			members = members.map(m => {
				m = m.toObject();
				if(!m.overrides || !m.overrides.length)
					m.overrides = system.overrides;
				return applyPrivacy(m, req.user);
			})

			res.send(members);
		}
	},
	{
		path: ['/api/system/:sid/members', '/api/s/:sid/m'],
		method: 'put',
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();
			if(!req.body) return res.status(400).send();

			var system = await System.findOne({ hid: req.params.sid });
			if(!system) return res.status(404).send('System not found');
			if(system.account != req.user.hid)
				return res.status(403).send("That system doesn't belong to you");

			var data = req.body;
			data.account = req.user.hid;
			data.system = system.hid;
			data.hid = genHid();
			var member = await Member.create(data);
			
			try {
				await member.save()
			} catch(e) {
				return res.status(500).send(e.message);
			}

			await res.status(200).send(member.toObject());
		}
	},
	{
		path: ['/api/member/:hid', '/api/m/:hid'],
		method: 'get',
		func: async (req, res) => {
			var member = await Member.findOne({hid: req.params.hid});
			if(!member) return res.status(404).send();
			member = applyPrivacy(member, req.user)
			if(!member) return res.status(404).send();

			res.send(member.toObject());
		}
	},
	{
		path: ['/api/m/:hid', '/api/member/:hid'],
		method: 'patch',
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();
			if(!req.body) return res.status(400).send();
			
			var member = await Member.findOne({hid: req.params.hid});
			if(!member) return res.status(404).send();

			if(member.account != req.user.hid) return res.status(403).send("That member doesn't belong to you")

			var err = [];
			for(var k of Object.keys(req.body)) {
				if(!Patchable[k]) continue;
				console.log(k, req.body[k]);
				var test = true;
				if(Patchable[k].test) test = Patchable[k].test(req.body[k]);
				if(!test) {
					err.push(Patchable[k].err);
					continue;
				}

				if(Patchable[k].transform) member[k] = Patchable[k].transform(req.body[k]);
				else member[k] = req.body[k];
			}

			if(err.length) return res.status(400).send({err});
			try {
				await member.save();
			} catch(e) {
				return res.status(500).send(e);
			}

			return res.status(200).send(member.toObject());
		}
	}, {
		path: ['/api/member/:id', '/api/m/:id'],
		method: 'delete',
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();
			
			var member = await Member.findOne({hid: req.params.id});
			if(!member) return res.status(404).send();
			if(member.account != req.user.hid) return res.status(403).send("That member doesn't belong to you")

			try {
				await member.delete();
			} catch(e) {
				return res.status(500).send(e);
			}

			return res.status(200).send(member.toObject());
		}
	}
]