module.exports = (config) => {
	const express = require('express');
	const passport = require('passport');
	const users = require('../modules/users.js');
	const mongojs = require('mongojs');
	const router = express.Router();
	const db = mongojs( config.database.url, [ config.database.collection ] );

	// Shortcut for ensuring login
	const mustBeLoggedIn = require('connect-ensure-login').ensureLoggedIn('/user/login');

	router.get('/login', (req, res) => {
		if (req.user) {
			res.redirect('/');
		} else {
			res.render('login.njk', {
				site: config.site
			});
		}
	});

	router.post('/login', passport.authenticate('local', {
		successReturnToOrRedirect: '/',	// Redirect to their original page or fallback to the root
		failureRedirect: '/user/login'	// Send them back to the login page if it fails
	}), (req, res) => {
		res.redirect('/');
	});

	router.get('/logout', (req, res) => {
		req.logout();
		res.redirect('/');
	});

	router.get('/register', (req, res) => {
		if (req.user) {
			res.redirect('/');
		} else {
			res.render('register.njk', { site: config.site });
		}
	});

	router.post('/register', (req, res) => {
		db.inviteCodes.findOne({
			code: req.body.invite
		}, (err, doc) => {
			if (err) {
				res.render('error.njk', {
					site: config.site,
					user: req.user && req.user.username ? req.user.username : null,
					status: 500
				});
			} else if (!doc) {
				res.render('register.njk', {
					site: config.site,
					error: 'Invalid invite code'
				});
			} else {
				users.register(req.body.username, req.body.password, (err, user) => {
					if (err) {
						res.render('register.njk', {
							site: config.site,
							user: req.user,
							error: err
						});
					} else {
						db.inviteCodes.remove({ code: req.body.invite });
						res.redirect('/user/login');
					}
				});
			}
		});
	});

	router.get('/admin', mustBeLoggedIn, (req, res) => {
		db.inviteCodes.find((err, docs) => {
			if (!err && docs) {
				res.render('admin.njk', {
					site: config.site,
					user: req.user,
					inviteCodes: docs
				});
			} else {
				res.render('admin.njk', {
					site: config.site,
					user: req.user
				});
			}
		});
	});

	router.post('/admin', mustBeLoggedIn, (req, res) => {
		if (req.body.inviteCode) {
			db.inviteCodes.insert({
				code: req.body.inviteCode
			}, (err) => {
				if (err) {
					res.send({ message: 'error' });
				} else {
					res.send({ message: 'success' });
				}
			});
		}
	});

	return router;
};
