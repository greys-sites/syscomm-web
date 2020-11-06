require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const sesh = require('express-session');
const {Pool} = require('pg');

const app = express();
const db = new Pool();
const routes = [];

app.use(sesh({
	store: new (require('connect-pg-simple')(session))(),
	secret: process.env.COOKIE_SECRET,
	resave: false,
	cookie: {maxAge: 30 * 24 * 60 * 60 * 1000}
}))

const setup = async () => {
	var files = fs.readdirSync(__dirname + '/stores');
	db.stores = {};
	for(var file of files) {
		if(["__db.js", "__migrations.js"].includes(file)) continue;
		
		var name = file.replace('.js', "").toLowerCase();
		db.stores[name] = require(__dirname+'/'+file)(db);
		if(db.stores[name].init) db.stores[name].init();
	}

	files = fs.readdirSync(__dirname + '/routes');
	for(var f of files) {
		var n = f.replace('.js', '');
		routes[n] = require(__dirname + `/routes/${f}`)(app, db);
		for(var r of routes[n]) app[r.method](r.path, r.func)
	}

	app.use(express.static(__dirname + '/frontend/build'));
	app.use(async (req, res) => {
		var index = fs.readFileSync(__dirname + '/frontend/build/index.html', 'utf8');
		index = index.replace('$TITLE','Syscomm Notes')
			.replace('$DESC','A system-oriented notes app')
			.replace('$TWITDESC','A system-oriented notes app')
			.replace('$TWITTITLE','Syscomm Notes')
			.replace('$OGTITLE','Syscomm Notes')
			.replace('$OGDESC','A system-oriented notes app')
			.replace('$OEMBED','oembed.json');
		res.send(index);
	});
}

setup()
.then(() => app.listen(process.env.port || 8080))
.catch(consloe.error)