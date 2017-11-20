module.exports = (config) => {
	const express		= require('express');
	const passport	= require('passport');
	const users			= require('../modules/users.js');
	const router = express.Router();

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
		users.register(req.body.username, req.body.password, (err, user) => {
			if (err) {
				res.render('register.njk', {
					site: config.site,
					user: req.user,
					error: err
				});
			} else {
				res.redirect('/user/login');
			}
		});
	});

	return router;
};
