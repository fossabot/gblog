// Needed modules
const mongojs	= require('mongojs');
const bcrypt	= require('bcrypt-nodejs');

// Get our database
const db = mongojs('gblog');

module.exports = {
	findById: (id, callback) => {
		db.users.findOne({
			_id: mongojs.ObjectId(id)
		}, (err, user) => {
			if (err) callback(err);
			if (!user) callback(new Error('User ' + id + ' does not exist'));
			callback(null, user);
		});
	},
	findByUsername: (username, callback) => {
		db.users.findOne({
			username: username
		}, (err, user) => {
			if (err) return callback(err);
			if (!user) return callback(null, new Error('User ' + username + ' does not exist'));
			callback(null, user);
		});
	},
	register: (username, password, callback) => {
		db.users.findOne({
			username: username
		}, (err, user) => {
			if (!err && !user) {
				// User not currently in DB so we can add them safely
				bcrypt.hash(password, bcrypt.genSaltSync(), null, (err, hash) => {
					if (err) {
						callback(err);
					} else {
						db.users.insert({
							username: username,
							password: hash
						}, (err, user) => {
							if (err) callback(err);
							callback(null, user);
						});
					}
				});
			} else if (err) {
				callback(err);
			} else {
				callback(new Error('User ' + username + ' already exists'));
			}
		});
	}
};
