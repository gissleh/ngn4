"use strict";

function NameFormat(id, name, format) {
    this.id = id;
    this.name = name;
    this.format = format;
    this.partIds = [];
    this.replaceIds = [];
    var start = -1;

    for(var i = 0; i < format.length; ++i) {
        var ch = format[i];

        if(ch === '{') {
            start = i + 1;
        } else if(ch === '}') {
            var partId = format.substring(start, i);

            var split = partId.split('|');
            if(split.length > 1) {
                this.partIds.push(split);
            } else {
                this.partIds.push(partId);
            }

            this.replaceIds.push('{' + partId + '}')
        }
    }
}

NameFormat.prototype.generateParts = function(parts, gender, randomFunction) {
    var result = this.format;

    for(var i = 0; i < this.partIds.length; ++i) {
        var partId = this.partIds[i];
        var part = parts[partId];
        var replaceId = this.replaceIds[i];

        if(partId instanceof Array) {
            partId = partId[Math.floor(randomFunction() * partId.length)];
            part = parts[partId];
        }

        // If a gendered part exists, use it instead (i.e. first.male)
        var genderedPartId = partId + '.' + gender;
        if(parts.hasOwnProperty(genderedPartId)) {
            part = parts[genderedPartId];
            partId = genderedPartId;
        }

        // If possible, replace the part.
        if(parts.hasOwnProperty(partId)) {
            result = result.replace(replaceId, part.generate(randomFunction));
        }
    }

    return result;
}

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = NameFormat;
}
