const express = require("express");
const app = express();
const port = 1717;
const articleRouter = require("./routes/router");


app.use(express.json());

app.use("/articles", articleRouter)


app.listen(port, () => {
    console.log("The server is hosted on port 1717!");
});