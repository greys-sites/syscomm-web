const { Login } = require('../stores/logins')
const crypto = require('crypto-js');
const { randomBytes } = require('crypto');
const PATCHABLE = [
	'password',
	'username',
	'email'
]

const { verify, genHid } = require('../utils');

module.exports = [
	{
		path: '/api/login',
		method: 'post',
		func: async (req, res) => {
			if(!req.body.username || !req.body.password)
				return res.status(404).send();
			
			var account = await Login.findOne({
				username: req.body.username
			})
			if(!account) return res.status(404).send();

			if(!verify(req.body.password, account.salt, account.password))
				return res.status(404).send();

			req.session.csrf = randomBytes(64).toString('hex');
			req.session.user = account.toObject();
			delete req.session.user.password;
			req.session.user.csrf = req.session.csrf;
			
			return res.status(200).send(req.session.user);
		}
	},
	{
		path: '/api/user',
		method: 'get',
		func: async (req, res) => {
			if(!req.user) return res.status(404).send();
			var user = await Login.findOne({ _id: req.user._id});
			if(!user) return res.status(404).send()
			user = await user.toObject({ getters: true });
			delete user.password;
			delete user.salt;
			if(req.session.csrf) user.csrf = req.session.csrf;
			
			return res.status(200).send(user);
		}
	},
	{
		path: '/api/user',
		method: 'put',
		func: async (req, res) => {
			// if(!req.session.csrf) return res.status(401).send('This can route only be accessed from the dashboard.');
			
			var acc = await Login.findOne({ username: req.body.username });
			if(acc) return res.status(409).send('Username taken');

			var salt = randomBytes(32).toString('hex');
			req.body.password = crypto.SHA3(req.body.password + salt).toString();
			req.body.salt = crypto.AES.encrypt(salt, process.env.SECRET).toString();
			req.body.hid = genHid();
			acc = new Login({
				...req.body
			})

			try {
				await acc.save();
			} catch(e) {
				return res.status(500).send(e.message);
			}

			res.status(201).send();
		}
	},
	{
		path: '/api/user',
		method: 'patch',
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();
			
			var acc = await Login.findOne({ _id: req.user._id });
			if(!acc) return res.status(404).send();
	
			var data = { ...req.body };
			for(var k of Object.keys(req.body)) {
				if(!PATCHABLE.includes(k)) continue;

				try {
					switch(k) {
						case 'username':
							var exists = await Login.exists({
								username: data.username
							});
							if(exists) throw new Error('Username taken');
							acc.username = data.username;
							break;
						case 'email':
							var exists = await Login.exists({
								email: data.email
							});
							if(exists) throw new Error('Email in use');
							acc.email = data.email;
							break;
						case 'password':
							if(!verify(req.body.old_pass, acc.salt, acc.password))
								throw new Error('Password incorrect')
							
							var salt = randomBytes(32).toString('hex');
							acc.password = crypto.SHA3(data.password + salt).toString();
							acc.salt = crypto.AES.encrypt(salt, process.env.SECRET).toString();
							break;
					}
				} catch(e) {
					return res.status(500).send(e.message);
				}
			}

			await acc.save();
			acc = acc.toObject();
			delete acc.password;
			if(req.session.csrf) acc.csrf = req.session.csrf;
			req.session.user = acc;
			return res.status(200).send(acc)
		}
	},
	{
		path: '/api/user',
		method: 'delete',
		func: async (req, res) => {
			if(!req.user) return res.status(401).send();

			var acc = await Login.findOne({ _id: req.user._id });
			if(!acc) return res.status(404).send();

			await Login.deleteOne({ _id: acc._id });
			return res.status(200).send();
		}
	},
	{
		path: '/api/logout',
		method: 'get',
		func: async (req, res) => {
			if(!req.user) return res.status(200).send();

			req.session.destroy((err) => {
				if(err) {
					console.log(err);
					return res.status(500).send();
				}

				res.clearCookie('connect.sid');
				return res.status(200).send();
			})
		}
	}
]