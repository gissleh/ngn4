"use strict";

function NameFormat(id, name, formats) {
    this.id = id;
    this.name = name;
    this.partIds = [];
    this.replaceIds = [];
    this.offsets = [0];

    if(formats instanceof Array) {
        this.formats = formats;
    } else {
        this.formats = [formats];
    }

    for(var i = 0; i < this.formats.length; ++i) {
        var format = this.formats[i];
        var start = -1;

        for(var j = 0; j < format.length; ++j) {
            var ch = format[j];

            if(ch === '{') {
                start = j + 1;
            } else if(ch === '}') {
                var partId = format.substring(start, j);
                var split = partId.split('|');

                if(split.length > 1) {
                    this.partIds.push(split);
                } else {
                    this.partIds.push(partId);
                }

                this.replaceIds.push('{' + partId + '}');
            }
        }

        this.offsets.push(this.partIds.length);
    }
}

NameFormat.prototype.generateParts = function(parts, gender, randomFunction) {
    var formats = [];
    var partList = [];
    var replaces = [];

    if(typeof(randomFunction) === 'undefined') {
        randomFunction = Math.random;
    }

    for(var i = 0; i < this.formats.length; ++i) {
        var format = this.formats[i];
        var offset = this.offsets[i];
        var nextOffset = this.offsets[i + 1];

        var good = true;

        var validParts = [];
        var validReplaces = [];

        for(var j = offset; j < nextOffset; ++j) {
            var partId = this.partIds[j];
            var replaceId = this.replaceIds[j];

            if(partId instanceof Array) {
                partId = partId[Math.floor(randomFunction() * partId.length)];
            }

            // If a gendered part exists, use it instead (e.g. first.male)
            var genderedPartId = partId + '.' + gender;
            if(parts.hasOwnProperty(genderedPartId)) {
                partId = genderedPartId;
            }

            // If possible, replace the part.
            if(parts.hasOwnProperty(partId)) {
                validParts.push(parts[partId]);
                validReplaces.push(replaceId);
            } else {
                good = false;
                break;
            }
        }

        if(good) {
            partList.push(validParts);
            replaces.push(validReplaces);
            formats.push(format);
        }
    }

    var r = Math.floor(randomFunction() * partList.length);
    var result = formats[r];
    var sel = partList[r];
    var replaces = replaces[r];

    for(var i = 0; i < sel.length; ++i) {
        result = result.replace(replaces[i], sel[i].generate(randomFunction));
    }

    return result;
}

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = NameFormat;
}
