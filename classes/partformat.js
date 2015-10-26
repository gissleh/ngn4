"use strict";

function PartFormat(format) {
    this.format = format;

    while(this.format.length < 2) {
        this.format += 'a';
    }

    this.capitalizeFirst = (format[0] === 'A');
    this.capitalizeDefault = (format[1] === 'A');
    this.capitalizers = {};
    this.caseChangers = {};
    this.replacers = {};
    this.errors = [];

    for(var i = 2; i < (format.length - 1); ++i) {
        var op = format[i + 1];
        var ch = format[i];

        switch(op) {
            case 'a': case 'A':
                this.capitalizers[ch] = (op === 'A');
                ++i;

                if(i < (format.length - 1) && (format[i + 1] === 'A' || format[i + 1] === 'a')) {
                    this.caseChangers[ch] = (format[i + 1] === 'A' );
                    ++i;
                }

                break;
            case 'S':
                this.replacers[ch] = ' ';
                ++i;
                break;
            case 'R':
                var r = "";

                for(i = i + 2; i < format.length; ++i) {
                    if(format[i] === ';') {
                        break;
                    }

                    r += format[i];
                }

                this.replacers[ch] = r;

                break;
        }
    }
}

PartFormat.prototype.apply = function (name) {
    var result = "";
    var replaceNext = null;
    var capitalizeNext = this.capitalizeFirst;
    var capitalizeDefault = this.capitalizeDefault;
    var next = name[0];
    var buffer = "";
    var nextBuffer = null;

    var i = 0;
    while(i < name.length) {
        var capitalize = capitalizeNext;
        var replace = replaceNext;
        var ch = next;
        capitalizeNext = capitalizeDefault;

        if(this.capitalizers.hasOwnProperty(ch)) {
            capitalizeNext = this.capitalizers[ch];
        }

        if(this.replacers.hasOwnProperty(ch)) {
            replace = this.replacers[ch];
        }

        if(this.caseChangers.hasOwnProperty(ch)) {
            capitalizeDefault = this.caseChangers[ch];
        }

        if(replace !== null) {
            if(replace.length <= 1) {
                next = replace;
            } else {
                next = replace[0];
                nextBuffer = replace.substring(1);
            }

            replaceNext = null;
        }
        if(capitalize) {
            next = next.toUpperCase();
        }

        result += next;

        if(nextBuffer !== null) {
            buffer = nextBuffer;
            nextBuffer = null;
        }

        if(buffer.length > 0) {
            next = buffer[0];
            buffer = buffer.substring(1);
        } else {
            next = name[i + 1];
            ++i;
        }
    }

    return result;
};

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = PartFormat;
}
