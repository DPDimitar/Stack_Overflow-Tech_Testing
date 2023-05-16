var express = require('express');
var router = express.Router();
var asnwerController = require('../controllers/asnwerController.js');

function requiresLogin(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        var err = new Error("You must be logged in to view this page!");
        err.status = 401;
        return next(err);
    }
}


/*
 * GET
 */
router.get('/', asnwerController.list);

/*
 * GET
 */
router.get('/:id/post', requiresLogin, asnwerController.showAnswerPost);
router.get('/:id', asnwerController.show);
router.get('/:id/comment', requiresLogin, asnwerController.comment);


/*
 * POST
 */
router.post('/:id/post', requiresLogin, asnwerController.create);

/*
 * PUT
 */
router.post('/:id/update', requiresLogin, asnwerController.update);
router.post('/:id/vote', requiresLogin, asnwerController.vote);
router.post('/:id/comment', requiresLogin, asnwerController.postComment);

/*
 * DELETE
 */
router.post('/:id/delete', requiresLogin, asnwerController.remove);

module.exports = router;
