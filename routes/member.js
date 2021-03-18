const { System } = require('../stores/systems')
const { Member } = require('../stores/members')
const PATCHABLE = [
	'system',
	'name',
	'description',
	'pronouns',
	'color',
	'avatar',
	'groups',
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

			var members = system.members.map(m => {
				if(!m.overrides || m.overrides.length == 0)
					m.overrides = system.overrides;
				return m;
			})
		}
	},
	{
		path: ['/api/member/:hid', '/api/m/:hid'],
		method: 'get',
		func: async (req, res) => {
			var member = await Member.findOne({ hid: req.params.hid });

			var members = system.members.map(m => {
				if(!m.overrides || m.overrides.length == 0)
					m.overrides = system.overrides;
				return m;
			})
		}
	}
]