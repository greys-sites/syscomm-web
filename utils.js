const crypto = require('crypto-js');
const { randomBytes } = require('crypto');

module.exports = {
	verify: (pass, salt, hash, decrypt = true) => {
		if(decrypt) salt = crypto.AES.decrypt(salt, process.env.SECRET).toString(crypto.enc.Utf8);
		pass = crypto.SHA3(pass + salt).toString();

		return pass === hash;
	},

	applyPrivacy: (obj, requester) => {
		if(!obj.privacy || Object.keys(obj.privacy).length == 0)
			return obj;

		var override = [...(obj.overrides || []), obj.hid].includes(requester?.hid);
		for(var key in Object.keys(obj.privacy)) {
			if(obj.privacy[key]) {
				if(!override) {
					if(key == 'query') return null; // disallow query completely
				
					obj[key] = null;
				}
			}
		}

		if(!override) {
			obj.overrides = [];
			obj.privacy = {};
		}

		return obj;
	},

	genHid: (num = 5, table = process.env.CHARS.split('')) => {
		var hid = '';
		var i = 0;
		while(i < num) {
			var rand = Math.floor(Math.random() * table.length);
			hid += table[rand];
			i++;
		}

		return hid;
	}
}