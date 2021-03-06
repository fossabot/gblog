// Required modules
const express				= require('express');
const nunjucks			= require('nunjucks');
const nunjucksDate	= require('nunjucks-date');
const stylus				= require('stylus');
const path					= require('path');
const passport			= require('passport');
const Strategy			= require('passport-local').Strategy;
const users					= require('./modules/users.js');
const bcrypt				= require('bcrypt-nodejs');
const session				= require('express-session');
const mongojs				= require('mongojs');
const MongoStore		= require('connect-mongo')(session);

// Turn on our app
const app = express();

// Pull in site data
const config = require('./config.json');

// Stylus
app.use(stylus.middleware({
	src: path.join(__dirname, '/stylus'),
	dest: path.join(__dirname, '/public'),
	force: config.devMode,
	compress: !config.devMode
}));

// Nunjucks
const env = nunjucks.configure('views', {
	autoescape: false,
	noCache: config.devMode,
	express: app
});
nunjucksDate.setDefaultFormat('MMMM Do YYYY');
nunjucksDate.install(env);

// Passport
passport.use(new Strategy(
	(username, password, callback) => {
		users.findByUsername(username, (err, user) => {
			if (err) return callback(err);
			if (!user) return callback(null, false, { message: 'Incorrect username' });
			if (!bcrypt.compareSync(password, user.password)) return callback(null, false, { message: 'Incorrect password' });
			return callback(null, user);
		});
	}
));

passport.serializeUser((user, callback) => {
	callback(null, user._id);
});

passport.deserializeUser((id, callback) => {
	users.findById(id, (err, user) => {
		if (err) return callback(err);
		callback(null, user);
	});
});

// Data parsing and session handling
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('body-parser').json());
app.use(session({
	secret: config.secret,
	resave: false,
	saveUninitialized: false,
	store: new MongoStore({
		url: 'mongodb://localhost/' + config.database
	})
}));

// Turn on passport
app.use(passport.initialize());
app.use(passport.session());

// Public folder
app.use(express.static('public'));

// Routes
const routes = {
	default: require('./routes/default')(config),
	post: require('./routes/post')(config),
	user: require('./routes/user')(config)
};
app.use('/', routes.default);
app.use('/post', routes.post);
app.use('/user', routes.user);

// Listen
const port = config.devMode ? config.port.dev : config.port.prod;
app.listen(port, () => {
	console.log('gBlog listening on port ' + port);
});
