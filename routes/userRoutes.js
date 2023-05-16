var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');
var multer = require('multer');
var upload = multer({dest: 'public/images/'});

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
router.get('/', userController.list);

/*
 * GET
 */
router.get('/login', userController.showLogin);
router.get('/register', userController.showRegister);
router.get('/profile', requiresLogin, userController.showProfile);
router.get('/logout', requiresLogin, userController.logout);
router.get('/:id', userController.show);


/*
 * POST
 */
router.post('/:id/uploadPhoto', upload.single('photo'), userController.uploadPhoto);
router.post('/register', userController.create);
router.post('/login', userController.login);

/*
 * PUT
 */
router.put('/:id', userController.update);

/*
 * DELETE
 */
router.delete('/:id', userController.remove);

module.exports = router;
