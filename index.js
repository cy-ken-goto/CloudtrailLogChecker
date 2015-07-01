console.log('Loading function');

var aws = require('aws-sdk');
var s3 = new aws.S3({ apiVersion: '2006-03-01' });
var async = require('async');
var zlib = require('zlib');

exports.handler = function(event, context) {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // Get the object from the event and show its content type
    var bucket = event.Records[0].s3.bucket.name;
    var key = event.Records[0].s3.object.key;
    var params = {
        Bucket: bucket,
        Key: key
    };

    async.waterfall(
        [
            function download(callback) {
                console.log('--- download start ---');
                s3.getObject(params, function(err, data) {
                    if (err) {
                        callback(err);
                    }
                    try {
                        callback(null, data);
                    } catch (e) {
                        callback(e);
                    }
                });
            },
            function unzip(data, callback) {
                console.log('CONTENT TYPE:', data.ContentType);
                console.log('CONTENT ENCODING:', data.ContentEncoding);
                console.log('--- unzip start ---');
                zlib.gunzip(data.Body, function (err, binary) {
                    if (err) {
                        callback(err);
                    }
                    try {
                        callback(null, data, binary);
                    } catch (e) {
                        callback(e);
                    }
                });
            },
            function checkJsonData(data, binary) {
                console.log('--- check start ---');
                var json = JSON.parse(binary.toString('utf-8'));
                for (var i = 0, len = json['Records'].length; i < len; i++) {
                    // rootユーザかのチェック
                    if (json['Records'][i]['userIdentity']['userName'] === 'root') {
                        console.log('root使ってるよ！');
                    }
                }
                context.succeed(data.ContentType);
            }
        ], function (err, results) {
            if (err) {
                context.fail("Error " + err);
                console.log("Error " + err);
                throw err;
            }
            console.log('all done. ' + results);
        }
    );
};