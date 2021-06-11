const express = require("express");
const { getArticlesFromUser, deleteAllArticles, getArticle, putArticle, patchArticle, deleteArticle, addNewArticle } = require("../controllers/articleController");
const { registerUser, login, protect, updatePassword, forgotPassword } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', login);
router.post('/updatePassword', protect, updatePassword);
router.post('/forgotPassword', forgotPassword);

router.route("/")
    .get(protect, getArticlesFromUser)
    .patch(addNewArticle)

router.route("/:articleTitle")
    .get(getArticle)
    .put(putArticle)
    .patch(patchArticle)
    .delete(deleteArticle)

module.exports = router;