module.exports = (config) => {
	// Pull in modules
	const express	= require('express');
	const marked	= require('marked');
	const mongojs	= require('mongojs');

	// Connect to the database
	const db = mongojs('gblog');

	// Turn on our router
	const router = express.Router();

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
				res.render('post.njk', {
					site: config.site,
					user: req.user && req.user.username ? req.user.username : null,
					post: {
						md: doc.content,
						html: marked(doc.content || '')
					}
				});
			}
		});
	});

	router.post('/:postSlug', (req, res) => {
		console.log(JSON.stringify(req.body, null, 2));
		db.posts.findAndModify({
			query: {
				slug: req.params.postSlug
			},
			update: {
				$set: {
					content: req.body.newContent
				}
			},
			new: true
		}, (err, doc, lastErrorObject) => {
			if (err) console.error(err);
		});
	});

	return router;
};
