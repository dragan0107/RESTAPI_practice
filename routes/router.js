const express = require("express");
const { getUsers, deleteAllArticles, getArticle, putArticle, patchArticle, deleteArticle, addNewArticle } = require("../controllers/articleController");
const { registerUser, login, protect } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', login);


router.route("/")
    .get(protect, getUsers)
    .patch(addNewArticle)

router.route("/:articleTitle")
    .get(getArticle)
    .put(putArticle)
    .patch(patchArticle)
    .delete(deleteArticle)

module.exports = router;