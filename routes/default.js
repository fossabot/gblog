module.exports = (config) => {
	const express = require('express');
	const mongojs = require('mongojs');
	const db = mongojs(config.database);
	const router = express.Router();

	router.get('/', (req, res) => {
		// Find all the posts and sort them by date in ascending order
		db.posts.find().sort({ date: -1 }, (err, docs) => {
			if (err) console.error(err);
			res.render('index.njk', {
				site: config.site,
				user: req.user && req.user.username ? req.user.username : null,
				posts: docs || null
			});
		});
	});

	return router;
};
