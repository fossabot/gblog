module.exports = (config) => {
	const express = require('express');
	const mongojs	= require('mongojs');
	const db = mongojs('gblog');
	const router = express.Router();

	router.get('/', (req, res) => {
		db.posts.find((err, docs) => {
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
