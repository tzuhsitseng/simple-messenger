var fs = require('fs');

//ssl license
var keyPath = 'SSL/myprivate.pem';
var certPath = 'SSL/yourcert.pem';

//var keyPath = 'SSLAES/privatekey.pem';
//var certPath = 'SSLAES/certificate.pem';

var hskey = fs.readFileSync(keyPath);
var hscert = fs.readFileSync(certPath);

var options = {
    key: hskey,
    cert: hscert
};

//ssl object
var ssl = {};

ssl.options = options;

module.exports = ssl;
