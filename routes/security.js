var crypto = require('crypto');

exports.cipher = function(algorithm, key, data, callback) {
    var encrypted = "";
    var cip = crypto.createCipher(algorithm, key);
    encrypted += cip.update(data, 'binary', 'hex');
    encrypted += cip.final('hex');
    callback(encrypted);
}

exports.decipher = function(algorithm, key, callback) {
    var decrypted = "";
    var decipher = crypto.createDecipher(algorithm, key);
    decrypted += decipher.update(encrypted, 'hex', 'binary');
    decrypted += decipher.final('binary');
    callback(decrypted);
}
