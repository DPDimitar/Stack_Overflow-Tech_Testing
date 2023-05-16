var QuestionModel = require('../models/questionModel.js');
var AsnwerModel = require('../models/asnwerModel.js');
var VotesModel = require('../models/votesModel.js');


/**
 * questionController.js
 *
 * @description :: Server-side logic for managing questions.
 */
module.exports = {

    /**
     * questionController.list()
     */
    list: async function (req, res) {

        var q1;

        if (req.query.search) {
            q1 = await QuestionModel.find({tags: req.query.search}).sort({datetime: 'desc'}).populate('userid');
        } else {
            q1 = await QuestionModel.find({}).sort({datetime: 'desc'}).populate('userid');
        }

        return res.render('questions/list', {'questions': q1})
    },
    myquestions: async function (req, res) {

        var q2 = [];
        if (req.query.search) {
            q2 = await QuestionModel.find({
                userid: req.session.userId,
                tags: req.query.search
            }).populate('userid');
        } else {
            q2 = await QuestionModel.find({userid: req.session.userId}).populate('userid');
        }

        return res.render('questions/list', {'questions': q2})
    },
    hotquestions: async function (req, res) {

        var q3 = [];
        if (req.query.search) {
            q3 = await QuestionModel.find({
                tags: req.query.search
            }).sort({
                views: 'desc'
            }).populate('userid');
        } else {
            q3 = await QuestionModel.find({}).sort({views: 'desc'}).populate('userid');
        }
        return res.render('questions/list', {'questions': q3})
    },

    /**
     * questionController.show()
     */
    show: async function (req, res) {

        var id = req.params.id;

        await QuestionModel.findOneAndUpdate({_id: id}, {$inc: {views: 1}})

        const data = await QuestionModel.findOne({_id: id}).populate('userid');
        const answers = await AsnwerModel.find({qid: id, chosen: false}).populate('uid');
        const correctAnswer = await AsnwerModel.findOne({qid: id, chosen: true}).populate('uid');
        var correctAnswerUPVotes = []
        var correctAnswerDOWNVotes = []
        if (correctAnswer) {
            correctAnswerUPVotes = await VotesModel.find({aid: correctAnswer._id, upvote: true})
            correctAnswerDOWNVotes = await VotesModel.find({aid: correctAnswer._id, upvote: false})
        }

        var answers2 = []

        for (const key of Object.keys(answers)) {
            var upvotes = await VotesModel.countDocuments({
                aid: answers[key]._id,
                uid: req.session.userId,
                upvote: true
            })
            var downvotes = await VotesModel.countDocuments({
                aid: answers[key]._id,
                uid: req.session.userId,
                upvote: false
            })
            answers2.push({
                description: answers[key].description,
                uid: answers[key].uid,
                _id: answers[key]._id,
                datetime: answers[key].description.datetime,
                upvotes: upvotes,
                downvotes: downvotes,
                comments: answers[key].comments ? answers[key].comments : []
            })
        }

        if (!data) {
            return res.status(500).json({
                message: 'Error. Question does not exist!',
                error: ""
            });
        }

        return res.render('questions/show', {
            data: data,
            answers: answers2,
            correctAnswer: correctAnswer,
            correctAnswerUPVotes: correctAnswerUPVotes,
            correctAnswerDOWNVotes: correctAnswerDOWNVotes
        });

    },

    showAddQuestion: function (req, res) {
        return res.render('questions/post');
    },

    /**
     * questionController.create()
     */
    create: async function (req, res) {

        var question = new QuestionModel({
            title: req.body.title,
            description: req.body.description,
            userid: req.session.userId,
            datetime: new Date(),
            tags: req.body.tag,
            views: req.body.views,
            comments: []
        });

        await question.save();

        return res.render('message', {message:"Question posted successfully!"})

    },

    /**
     * questionController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        QuestionModel.findOne({_id: id}, function (err, question) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting question',
                    error: err
                });
            }

            if (!question) {
                return res.status(404).json({
                    message: 'No such question'
                });
            }

            question.title = req.body.title ? req.body.title : question.title;
            question.description = req.body.description ? req.body.description : question.description;
            question.userid = req.body.userid ? req.body.userid : question.userid;
            question.datetime = req.body.datetime ? req.body.datetime : question.datetime;
            question.tags = req.body.tags ? req.body.tags : question.tags;
            question.views = req.body.views ? req.body.views : question.views;

            question.save(function (err, question) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating question.',
                        error: err
                    });
                }

                return res.json(question);
            });
        });
    },

    comment: async function (req, res) {

        var id = req.params.id;

        return res.render('questions/comment', {qid: id})

    },

    postComment: async function (req, res) {

        var id = req.params.id;

        await QuestionModel.findOneAndUpdate({_id: id}, {$push: {comments: req.body.description}});

        return res.render('message', {message:"Comment published successfully!"})

    },

    /**
     * questionController.remove()
     */
    remove: async function (req, res) {

        var id = req.params.id;

        const question = await QuestionModel.findOne({_id: id});

        if (question.userid.toString() !== req.session.userId) {
            return res.status(500).json({
                message: 'Error when deleting the question. Not owner!',
                error: ""
            });
        }

        await QuestionModel.findByIdAndRemove(id);

        return res.status(200).json({
            message: 'Deleted. Success!'
        });
    }
};
