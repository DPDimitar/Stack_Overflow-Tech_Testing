var AsnwerModel = require('../models/asnwerModel.js');
var QuestionModel = require('../models/questionModel.js');
var VotesModel = require('../models/votesModel.js');

/**
 * asnwerController.js
 *
 * @description :: Server-side logic for managing asnwers.
 */
module.exports = {

    /**
     * asnwerController.list()
     */
    list: function (req, res) {
        AsnwerModel.find(function (err, asnwers) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting asnwer.',
                    error: err
                });
            }

            return res.json(asnwers);
        });
    },

    /**
     * asnwerController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        AsnwerModel.findOne({_id: id}, function (err, asnwer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting asnwer.',
                    error: err
                });
            }

            if (!asnwer) {
                return res.status(404).json({
                    message: 'No such asnwer'
                });
            }

            return res.json(asnwer);
        });
    },

    showAnswerPost: async function (req, res) {

        var id = req.params.id;

        return res.render('answers/post', {qid: id});

    },

    /**
     * asnwerController.create()
     */
    create: async function (req, res) {

        var id = req.params.id;

        var question = await QuestionModel.findOne({_id: id});

        if (question.userid.toString() === req.session.userId) {
            return res.status(500).json({
                message: 'Error. Cannot answer own Question!',
                error: ""
            });
        }

        var asnwer = new AsnwerModel({
            description: req.body.description,
            qid: id,
            uid: req.session.userId,
            chosen: false,
            datetime: new Date(),
            comments: []
        });

        await asnwer.save();
        return res.status(201).json(asnwer);

    },

    /**
     * asnwerController.update()
     */
    update: async function (req, res) {

        var id = req.params.id;

        var answer = await AsnwerModel.findOne({_id: id});

        var question = await QuestionModel.findOne({_id: answer.qid})

        if (question.userid.toString() !== req.session.userId) {
            return res.status(500).json({
                message: 'Error when choosing correct asnwer. You are not the owner of the Q!',
                error: ""
            });
        }

        await AsnwerModel.findOneAndUpdate({chosen: true}, {chosen: false})
        await AsnwerModel.findOneAndUpdate({_id: id}, {chosen: true})

        return res.status(200).json({
            message: 'Success! Chosen correct answer!',
        });


    },

    comment: async function (req, res) {

        var id = req.params.id;

        return res.render('answers/comment', {aid:id})

    },

    postComment: async function (req, res) {

        var id = req.params.id;

        await AsnwerModel.findOneAndUpdate({ _id: id }, { $push: { comments: req.body.description } });

        return res.render('message', {message:"Comment published successfully!"})

    },

    vote: async function (req, res) {

        var id = req.params.id;
        var vote = req.body.vote;

        var voteDocument = await VotesModel.findOne({aid: id, uid: req.session.userId});

        if(voteDocument){
            voteDocument.upvote = (vote === 'upvote');
            await voteDocument.save();
            return res.status(200).json({message:"Success. Voted!"});
        }

        var votes = new VotesModel({
            upvote : vote === 'upvote',
            aid : id,
            uid : req.session.userId
        });

        await votes.save()

        return res.render('message', {message:"Success. Voted!"})

    },

    /**
     * asnwerController.remove()
     */
    remove: async function (req, res) {

        var id = req.params.id;

        var answer = await AsnwerModel.findOne({_id: id});

        if (answer.uid.toString() !== req.session.userId) {
            return res.status(500).json({
                message: 'Error. Cannot delete answers of other users!',
                error: ""
            });
        }

        await AsnwerModel.findByIdAndRemove(id);

        return res.status(200).json({message: "Success! Answer Deleted!"});

    }
};
