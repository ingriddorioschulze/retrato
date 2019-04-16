const express = require("express");
const db = require("./db");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./s3");

const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

const app = express();

app.use(express.static(__dirname + "/public"));
app.use(express.json());

app.get("/cards", (req, res) => {
    db.getRecentImages().then(images => {
        res.send(images);
    });
});

app.post("/uploadImage", uploader.single("file"), (req, res) => {
    s3.uploadImage(req.file.path, req.file.filename)
        .then(url => {
            return db
                .insertNewImage(
                    req.body.title,
                    req.body.description,
                    req.body.username,
                    url
                )
                .then(row => {
                    res.json({
                        url: url,
                        id: row.id,
                        created_at: row.created_at
                    });
                });
        })

        .catch(error => {
            console.error(error);
            res.status(500).json({
                message: "Upload failed."
            });
        });
});

app.post("/addComment", (req, res) => {
    db.createComment(
        req.body.comment,
        req.body.username,
        req.body.imageId
    ).then(comment => {
        res.json({
            id: comment.id,
            created_at: comment.created_at
        });
    });
});

app.get("/seeComment/:imageId", (req, res) => {
    db.getCommentsForImage(req.params.imageId).then(comments => {
        res.send(comments);
    });
});

app.listen(8080);
