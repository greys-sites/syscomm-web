const { System, Patchable } = require('../stores/systems')

const { applyPrivacy, genHid } = require('../utils');

module.exports = [
	{
		path: ['/api/system/:hid', '/api/s/:hid'],
		method: 'get',
		func: async (req, res) => {
			var sys = await System.findOne({ hid: req.params.hid });
			if(!sys) return res.status(404).send();

			var requester = req.user;

			sys = sys.toObject((doc, obj) => {
				obj = applyPrivacy(obj, requester);
				return obj;
			})

			if(sys) res.status(200).send(sys);
			else res.status(404).send();
		}
	},
	{
		path: ['/api/system', '/api/s'],
		method: 'put',
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();

			var data = req.body;
			data.account = req.user.hid;
			data.hid = genHid();

			var sys = await System.create(data);
			try {
				await sys.save()
			} catch(e) {
				return res.status(500).send(e.message);
			}

			await res.status(200).send(sys.toObject());
		}
	},
	{
		path: ['/api/system/:hid', '/api/s/:hid'],
		method: 'patch',
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();
			if(!req.body) return res.status(400).send();

			var sys = await System.findOne({ hid: req.params.hid });
			if(!sys) return res.status(404).send();
			if(req.user.hid != sys.account) return res.status(403).send();

			var err = [];
			for(var k of Object.keys(req.body)) {
				if(!Patchable[k]) continue;
				var test = true;
				if(Patchable[k].test) test = Patchable[k].test(req.body[k]);
				if(!test) {
					err.push(Patchable[k].err);
					continue;
				}

				if(Patchable[k].transform) sys[k] = Patchable[k].transform(req.body[k]);
				else sys[k] = req.body[k];
			}

			if(err.length) return res.status(400).send({err});
			try {
				await sys.save();
			} catch(e) {
				return res.status(500).send(e);
			}

			return res.status(200).send(sys.toObject());
		}
	},
	{
		path: ['/api/system/:hid', '/api/s/:hid'],
		method: 'delete',
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();

			var sys = await System.findOne({ hid: req.params.hid });
			if(!sys) return res.status(404).send();
			if(req.user.hid != sys.account) return res.status(403).send();

			await System.deleteOne({ _id: sys._id });
			return res.status(200).send();
		}
	}
]