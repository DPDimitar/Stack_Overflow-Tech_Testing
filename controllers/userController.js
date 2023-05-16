var UserModel = require('../models/userModel.js');
var QuestionModel = require('../models/questionModel.js');
var AnswerModel = require('../models/asnwerModel.js');

/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
module.exports = {

    /**
     * userController.list()
     */
    list: function (req, res) {
        UserModel.find(function (err, users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }

            return res.json(users);
        });
    },

    /**
     * userController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({_id: id}, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            return res.json(user);
        });
    },

    showRegister: function (req, res, next) {
        if (req.session.userId) {
            var err = new Error("You are logged in!");
            err.status = 401;
            return next(err);
        }
        return res.render('users/register');
    },

    showLogin: function (req, res, next) {
        if (req.session.userId) {
            var err = new Error("You are logged in!");
            err.status = 401;
            return next(err);
        }
        return res.render('users/login');
    },

    showProfile: async function (req, res) {
        const user = await UserModel.findOne({_id: req.session.userId})
        const userqs = await QuestionModel.find({'userid': req.session.userId})
        const useranswers = await AnswerModel.find({'uid': req.session.userId})
        return res.render('users/profile', { user:user, qs: userqs.length, as: useranswers.length});
    },

    /**
     * userController.create()
     */
    create: async function (req, res, next) {

        if (req.session.userId) {
            var err = new Error("You are logged in!");
            err.status = 401;
            return next(err);
        }

        var user = new UserModel({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            photo_path: req.body.photo_path
        });

        try {
            await user.save();
            return res.render('message', {message:"Successfully Registered!"})

        } catch (err) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating user',
                    error: err
                });
            }

        }
    },

    login: async function (req, res, next) {
        if (req.session.userId) {
            var err = new Error("You are logged in!");
            err.status = 401;
            return next(err);
        }
        UserModel.authenticate(req.body.username, req.body.password, function (error, user) {
            if (error || !user) {

                var err = new Error("Wrong username or password");
                err.status = 401;
                return next(err);
            } else {
                req.session.userId = user._id;
                return res.redirect('/');
            }
        })
    },

    logout: async function (req, res) {
        if (req.session.userId) {
            try {
                req.session.destroy()
                return res.redirect('/');
            } catch (err) {
                return next(err);
            }
        }
        return res.redirect('/');
    },

    /**
     * userController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({_id: id}, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            user.username = req.body.username ? req.body.username : user.username;
            user.email = req.body.email ? req.body.email : user.email;
            user.password = req.body.password ? req.body.password : user.password;
            user.photo_path = req.body.photo_path ? req.body.photo_path : user.photo_path;

            user.save(function (err, user) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating user.',
                        error: err
                    });
                }

                return res.json(user);
            });
        });
    },

    uploadPhoto: async function (req, res) {

        await UserModel.findOneAndUpdate({_id: req.session.userId}, {photo_path: req.file.filename});
        return res.render('message', {message:"Image uploaded successfully!"})
        // return res.json({error: "", message: "Image uploaded successfully"});

    },

    /**
     * userController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        UserModel.findByIdAndRemove(id, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the user.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
