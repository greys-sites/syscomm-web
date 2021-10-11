const crypto = require('crypto-js');
const { randomBytes } = require('crypto');

module.exports = {
	verify: (pass, salt, hash, decrypt = true) => {
		if(decrypt) salt = crypto.AES.decrypt(salt, process.env.SECRET).toString(crypto.enc.Utf8);
		pass = crypto.SHA3(pass + salt).toString();

		return pass === hash;
	},

	applyPrivacy: (obj, requester) => {
		var os = [...(obj.overrides || []), obj.account];
		var override = os.includes(requester?.hid);
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
	},

	objTransform: (obj, keys) => {
		var tmp = {};
		var err = [];
		for(var k in keys) {
			if(!obj[k] && obj[k] !== false) {
				tmp[k] = null;
				continue;
			}

			var test = true;
			if(keys[k].test) test = keys[k].test(obj[k]);
			if(!test) err.push(keys[k].err);
			if(keys[k].transform) obj[k] = keys[k].transform(obj[k]);
			tmp[k] = obj[k];
		}

		if(err.length) console.log(err.join("\n"));

		return tmp;
	}
}