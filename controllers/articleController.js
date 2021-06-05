const User = require('../model/userModel');


exports.getUsers = async(req, res) => {

    try {
        const articles = await User.find();
        res.status(200).json({
            status: "success",
            numOfArticles: articles.length,
            results: {
                data: articles
            }
        })
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err
        });
    }

}



exports.deleteAllArticles = async(req, res) => {


    try {

        const deleteAll = await Article.deleteMany();
        res.status(200).json({
            status: "Successfully deleted all articles",
            results: {
                data: deleteAll
            }
        });

    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err
        });
    }
};

//manipulate with specific article


exports.getArticle = async(req, res) => {

    try {
        const article = await Article.findOne({ title: req.params.articleTitle });
        res.status(200).json({
            results: {
                data: article
            }
        });

    } catch (err) {

        res.status(400).json({
            status: "fail",
            message: err
        });
    }
}


exports.putArticle = async(req, res) => {

    try {
        const updatedArticle = await Article.update({ title: req.params.articleTitle }, { title: req.body.title, content: req.body.content }, { overwrite: true });
        console.log(updatedArticle);
        res.status(200).json({
            results: {
                data: updatedArticle
            }
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err
        });
    }

}



exports.addNewArticle = async(req, res) => {
    try {
        const newArticle = {
            title: req.body.title,
            content: req.body.content
        }

        const article = await User.findByIdAndUpdate({ _id: req.body.id }, { $push: { articles: newArticle } })

        res.status(200).json({
            status: 'success',
            data: {
                article
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            err
        })
    }

}

exports.patchArticle = async(req, res) => {
    try {
        const patchedArtc = await User.findByIdAndUpdate({ id: req.body.id }, { $set: req.body });

        res.status(200).json({
            results: {
                data: patchedArtc
            }
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err
        });
    }
}

exports.deleteArticle = async(req, res) => {
    try {

        const deleted = await Article.deleteOne({ title: req.params.articleTitle });

        res.status(200).json({
            results: {
                data: deleted
            }
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err
        });
    }
};