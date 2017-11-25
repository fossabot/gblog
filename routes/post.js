module.exports = (config) => {
	// Pull in modules
	const express = require('express');
	const mongojs = require('mongojs');
	const marked = require('marked');

	// Connect to the database
	const db = mongojs(config.database);

	// Turn on our router
	const router = express.Router();

	// Shortcut for ensuring login
	const mustBeLoggedIn = require('connect-ensure-login').ensureLoggedIn('/user/login');

	// New post
	router.get(/^\/new$/, mustBeLoggedIn, (req, res) => {
		res.render('post.njk', {
			site: config.site,
			user: req.user && req.user.username ? req.user.username : null,
			newPost: true
		});
	});

	router.post(/^\/new$/, mustBeLoggedIn, (req, res) => {
		db.posts.findOne({ slug: req.body.slug }, (err, doc) => {
			if (err) console.error(err);
			if (doc) {
				res.send({ message: 'slug-used' });
			} else {
				req.body.author = req.user.username;
				db.posts.insert(req.body, (err) => {
					if (err) {
						res.send({ message: 'error-insert' });
					} else {
						res.send({ message: 'success' });
					}
				});
			}
		});
	});

	router.get('/:postSlug', (req, res) => {
		db.posts.findOne({ slug: req.params.postSlug }, (err, doc) => {
			if (err) {
				res.render('error.njk', {
					site: config.site,
					user: req.user && req.user.username ? req.user.username : null,
					status: 500
				});
			} else if (!doc) {
				res.render('error.njk', {
					site: config.site,
					user: req.user && req.user.username ? req.user.username : null,
					status: 404
				});
			} else {
				doc.content = {
					md: doc.content,
					html: marked(doc.content)
				};
				res.render('post.njk', {
					site: config.site,
					user: req.user && req.user.username ? req.user.username : null,
					post: doc
				});
			}
		});
	});

	router.put('/:postSlug', mustBeLoggedIn, (req, res) => {
		db.posts.findAndModify({
			query: {
				_id: mongojs.ObjectId(req.body._id),
				author: req.user.username
			},
			update: {
				$set: {
					title: req.body.title,
					slug: req.body.slug,
					content: req.body.content
				}
			},
			new: true
		}, (err, doc, lastErrorObject) => {
			if (err) {
				console.error(err);
				res.send({ message: 'error-update' });
			} else {
				res.send({ message: 'succes' });
			}
		});
	});

	router.delete('/:postSlug', mustBeLoggedIn, (req, res) => {
		db.posts.remove({
			slug: req.params.postSlug,
			author: req.user.username
		}, (err) => {
			if (err) {
				res.send({ message: 'error-delete' });
			} else {
				res.send({ message: 'success' });
			}
		});
	});

	return router;
};
