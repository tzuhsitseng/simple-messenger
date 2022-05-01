var gm = require('gm');
var imageMagick = gm.subClass({
    imageMagick: true
});

exports.resize = function(src, dis, fileName, maxWidth, maxHeight) {
    var oldWidth = 0;
    var oldHeight = 0;
    var width = 0;
    var height = 0;
    var ratio = 0;
    var maxRatio = maxWidth / maxHeight;

    imageMagick(src + '/' + fileName)
        .identify(function(err, data) {
            if (err) {
                // error handle
                throw err;
            } else {
                oldWidth = data.size.width;
                oldHeight = data.size.height;
                ratio = oldWidth / oldHeight;

                if (oldWidth < maxWidth && oldHeight < maxHeight) {
                    width = oldWidth;
                    height = oldHeight;
                } else if (ratio > maxRatio) {
                    width = oldWidth * maxHeight / oldHeight;
                    height = maxHeight;

                } else {
                    width = maxWidth;
                    height = oldHeight * maxWidth / oldWidth;
                }

                imageMagick(src + '/' + fileName)
                    .resize(width, height)
                    .write(src + '/' + 'thumb_' + fileName, function(err) {
                        if (err) {
                            // error handle
                            throw err;
                        } else {
                            console.log('resize done');
                        }
                    })
            }
        });
}
