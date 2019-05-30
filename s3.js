const knox = require("knox-s3");
let secrets;
const bucketName = "retratar";

if (process.env.NODE_ENV == "production") {
    secrets = process.env;
} else {
    secrets = require("./secrets");
}
const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: bucketName,
    region: "eu-west-1"
});

exports.uploadImage = function(filepath, filename) {
    return new Promise((resolve, reject) => {
        client.putFile(
            filepath,
            filename,
            {
                "x-amz-acl": "public-read"
            },
            (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    const wasSuccessful = res.statusCode == 200;
                    if (wasSuccessful) {
                        resolve(
                            `https://s3-eu-west-1.amazonaws.com/${bucketName}/${filename}`
                        );
                    } else {
                        reject({
                            message: "s3 request failed.",
                            statusCode: res.statusCode
                        });
                    }
                }
            }
        );
    });
};
