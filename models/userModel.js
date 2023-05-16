var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var bcrypt = require('bcrypt');

var userSchema = new Schema({
	'username' : String,
	'email' : String,
	'password' : String,
	'photo_path' : String
});

userSchema.statics.authenticate = function (username, password, callback) {
	try {
		User.findOne({username: username}).then(user => {

			if (!user) {
				let err = new Error("User with this username not found");
				err.status = 401;
				return callback(err);
			}

			bcrypt.compare(password, user.password, function (err, result) {
				if (result === true) {
					return callback(null, user);
				} else {
					return callback();
				}
			})

		})


	} catch (err) {
		return callback(err);
	}
}

userSchema.pre('save', function (next) {
	let user = this;
	bcrypt.hash(user.password, 10, function (err, hash) {
		if (err) {
			return next(err);
		}
		user.password = hash;
		next();
	})
});

var User = mongoose.model('user', userSchema)
module.exports = mongoose.model('user', userSchema);
