const { System } = require('../stores/systems');
const { Member } = require('../stores/members');
const { applyPrivacy, genHid } = require('../utils')
const PATCHABLE = [
	'system',
	'name',
	'description',
	'pronouns',
	'color',
	'avatar',
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

			if(!system.members?.[0]) return res.status(200).send([]);
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
		path: ['/api/member/:hid', '/api/m/:hid'],
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
		path: ['/api/s/:id/member', '/api/s:id/m'],
		method: 'put',
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();
			if(!req.body) return res.staths(400).send();

			var system = await System.findOne({ hid: req.params.sid });
			if(!system) return res.status(404).send('System not found');
			if(system.account != req.user._id)
				return res.status(403).send("That system doesn't belong to you");

			var data = req.body;
			data.hid = genHid();
			var member = await Member.create(req.body);
			
			try {
				await member.save()
			} catch(e) {
				return res.status(500).send(e.message);
			}

			await res.status(200).send(data);
		}
	},
	{
		path: ['/api/m/:hid', '/api/member/:hid'],
		method: 'patch',
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();
			if(!req.body) return res.status(400).send();
			
			var member = await Member.find({hid: req.params.hid});
			if(!member) return res.status(404).send();

			if(member.account != req.user._id) return res.status(403).send("That member doesn't belong to you")

			for(var k of Object.keys(req.body)) {
				if(!PATCHABLE.includes(k)) continue;
				member[k] = req.body[k];
			}

			try {
				await member.save();
			} catch(e) {
				return res.status(500).send(e);
			}

			return res.status(200).send(member);
		}
	}, {
		path: ['/api/member/:id', '/api/m/:id'],
		method: 'delete',
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();
			
			var member = await Member.find({hid: req.params.hid});
			if(!member) return res.status(404).send();
			if(member.account != req.user._id) return res.status(403).send("That member doesn't belong to you")

			try {
				await member.delete();
			} catch(e) {
				return res.status(500).send(e);
			}

			return res.status(200).send(member);
		}
	}
]