const spicedPg = require("spiced-pg");

const dbUrl =
    process.env.DATABASE_URL ||
    "postgres:postgres:postgres@localhost:5432/imageboard";

const db = spicedPg(dbUrl);

exports.getRecentImages = function() {
    const q = `SELECT url, title, description, username, id, created_at FROM images 
    ORDER BY created_at DESC
    LIMIT 12`;
    return db.query(q).then(result => {
        return result.rows;
    });
};

exports.insertNewImage = function(title, description, username, url) {
    const q = `INSERT INTO images (title, description, username, url, created_at) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING id, created_at`;
    const params = [title, description, username, url, new Date()];
    return db.query(q, params).then(result => {
        return result.rows[0];
    });
};

exports.createComment = function(comment, username, imageId) {
    const q = `INSERT INTO comments (comment, username, image_id, created_at)
    VALUES ($1, $2, $3, $4)
    RETURNING id, created_at`;
    const params = [comment, username, imageId, new Date()];
    return db.query(q, params).then(result => {
        return result.rows[0];
    });
};

exports.getCommentsForImage = function(imageId) {
    const q = `SELECT comment, username, created_at FROM comments
    WHERE image_id = $1
    ORDER BY created_at DESC`;
    const params = [imageId];
    return db.query(q, params).then(result => {
        return result.rows;
    });
};
