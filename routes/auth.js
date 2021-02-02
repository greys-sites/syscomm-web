const { Login } = require('../stores/logins')
const crypto = require('crypto-js');
const { randomBytes } = require('crypto');
const PATCHABLE = [
	'password',
	'username',
	'email'
]

const verify = (pass, salt, hash, decrypt = true) => {
	if(decrypt) salt = crypto.AES.decrypt(account.salt, process.env.SECRET).toString(crypto.enc.Utf8);
	pass = crypto.SHA3(req.body.password + salt).toString();

	return pass === hash;
}

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
			req.session.user = account.toObject((doc, obj) => {
				delete obj.password;
				obj.csrf = req.session.csrf;
				return obj;
			});
			return res.status(200).send(req.session.user);
		}
	},
	{
		path: '/api/user',
		method: 'get',
		func: async (req, res) => {
			if(!req.session.user) return res.status(404).send();
			
			return res.status(200).send(req.session.user);
		}
	},
	{
		path: '/api/user',
		method: 'put',
		func: async (req, res) => {
			var acc = await Login.findOne({ username: req.body.username });
			if(acc) return res.status(409).send('Username taken');

			var salt = randomBytes(32).toString('hex');
			req.body.password = crypto.SHA3(req.body.password + salt).toString();
			req.body.salt = crypto.AES.encrypt(salt, process.env.SECRET).toString();
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
			if(!req.session.user) return res.status(404).send();
			
			var acc = await Login.findOne({ _id: req.session.user._id });
			if(!verify(req.body.old_pass, acc.salt, acc.password))
				return res.status(401).send();
	
			var data = { ...req.body };
			for(var k of req.body) {
				if(!PATCHABLE.includes(k)) continue;

				try {
					switch(k) {
						case 'username':
							var exists = await Login.exists({
								username: data.username;
							});
							if(exists) throw new Error('Username taken');
							acc.username = data.username;
							break;
						case 'email':
							var exists = await Login.exists({
								email: data.email;
							});
							if(exists) throw new Error('Email in use');
							acc.email = data.email;
							break;
						case 'password':
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
			return res.status(200).send(acc.toObject((doc, obj) => {
				delete obj.password;
				obj.csrf = req.session.csrf;
				return obj;
			}))
		}
	}
]