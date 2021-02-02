require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const sesh = require('express-session');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const routes = {};

app.use(sesh({
	store: new (require('connect-mongo')(sesh))({ url: process.env.MONGO_URI }),
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 30 * 24 * 60 * 60 * 1000,
		secure: true,
		sameSite: 'strict'
	}
}))

// csrf middleware
app.use((req, res, next) => {
	if(['GET', 'HEAD', 'OPTIONS'].includes(req.method))
		return next();

	if(!req.session.csrf) return next();
	if(req.headers['csrf-token'] !== req.session.csrf)
		return res.status(403).send('Invalid CSRF token');

	next();
})

// attempt to convert mongo docs in session storage
app.use(async (req, res, next) => {
	if(!req.session.user) return next();

	req.session.user = await mongoose.model('login').findOne( { _id: req.session.user._id });
	next()
})

const index = fs.readFileSync(__dirname + '/frontend/build/index.html', 'utf8');

const setup = async () => {
	mongoose.connect(process.env.MONGO_URI, (err) => {
		if(err) throw err;
	})
	var files = fs.readdirSync(__dirname + '/stores');
	files.forEach(f => require(`${__dirname}/stores/${f}`));

	files = fs.readdirSync(__dirname + '/routes');
	for(var f of files) {
		var n = f.replace('.js', '');
		routes[n] = require(__dirname + `/routes/${f}`);
		for(var r of routes[n]) app[r.method](r.path, r.func)
	}

	app.use(express.static(__dirname + '/frontend/build'));
	app.use(async (req, res) => {
		res.send(
			index.replace('$TITLE','Syscomm Notes')
				 .replace('$DESC','A system-oriented notes app')
				 .replace('$TWITDESC','A system-oriented notes app')
				 .replace('$TWITTITLE','Syscomm Notes')
				 .replace('$OGTITLE','Syscomm Notes')
				 .replace('$OGDESC','A system-oriented notes app')
				 .replace('$OEMBED','oembed.json')
		)
	});
}

setup()
.then(() => app.listen(process.env.port || 8080))
.catch(console.error)