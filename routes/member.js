const { System } = require('../stores/systems');
const { applyPrivacy, genHid } = require('../utils')
const PATCHABLE = [
	'system',
	'name',
	'description',
	'pronouns',
	'color',
	'avatar',
	'tags',
	'privacy',
	'overrides'
];

module.exports = [
	{
		path: ['/api/system/:sid/members', '/api/s/:sid/m'],
		method: 'get',
		func: async (req, res) => {
			var system = await System.findOne({ hid: req.params.sid });
			if(!system) return res.status(404).send();

			if(!system.nembers?.[0]) return res.status(200).send([]);
			var members = system.members.map(m => {
				m = m.toObject();
				if(!m.overrides || m.overrides.length == 0)
					m.overrides = system.overrides;
				return applyPrivacy(m, req.user);
			})

			res.send(members);
		}
	},
	{
		path: ['/api/system/:sid/member/:hid', '/api/s/:sid/m/:hid'],
		method: 'get',
		func: async (req, res) => {
			var system = await System.findOne({ hid: req.params.sid });
			if(!system) return res.status(404).send();
			console.log(system.members);
			var member = system.members.find(m => m.hid == req.params.hid);
			if(!member) return res.status(404).send();
			member = applyPrivacy(member, req.user)
			if(!member) return res.status(404).send();

			res.send(member);
		}
	},
	{
		path: ['/api/system/:sid/member', '/api/s/:sid/m'],
		method: 'put',
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();
			if(!req.body) return res.staths(400).send();

			var system = await System.findOne({ hid: req.params.sid });
			if(!system) return res.status(404).send('System not found');
			if(system.account != req.user._id)
				return res.status(403).send("That system doesn't belong to you");
			if(!system.members) system.members = [];
			
			var data = req.body;
			delete data.system;
			data.hid = genHid();

			system.members[0] = data
			console.log(system.members);
			try {
				await system.save()
			} catch(e) {
				return res.status(500).send(e.message);
			}

			await res.status(200).send(data);
		}
	},
	{
		path: ['/api/s/:sid/m/:hid', '/api/system/:sid/member/:hid'],
		method: 'patch',
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();
			if(!req.body) return res.status(400).send();

			var system = await System.findOne({ hid: req.params.hid });
			if(!system) return res.status(404).send('System not found');
			if(system.account != req.user.id)
				return res.status(403).send("That system doesn't belong to you");
			
			var member = system.members.find(m => m.hid == req.params.hid);
			if(!member) return res.status(404).send();
			var index = system.members.findIndex(m => m.hid == req.params.hid);

			for(var k of Object.keys(req.body)) {
				if(!PATCHABLE.includes(k)) continue;
				member[k] = req.body[k];
			}

			try {
				system.members[index] = members;
				await system.save();
			} catch(e) {
				return res.status(500).send(e);
			}

			return res.status(200).send(member);
		}
	}
]