const express = require("express");
const { getArticles, addArticle, deleteAllArticles, getArticle, putArticle, patchArticle, deleteArticle } = require("../controllers/articleController")
const router = express.Router();


router.route("/")
    .get(getArticles)
    .post(addArticle)
    .delete(deleteAllArticles);

router.route("/:articleTitle")
    .get(getArticle)
    .put(putArticle)
    .patch(patchArticle)
    .delete(deleteArticle)

module.exports = router;