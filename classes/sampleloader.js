"use strict";

var loaders = require('../ngn4-loaders.js');

function SampleLoader() {
    this.lists = {};
}

SampleLoader.prototype.loadFromLines = function (lines) {
    var loader = null;
    var options = {};
    var prevOption = null;

    for(var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        // Replace tabs with spaces
        while(line.indexOf('\t') >= 0) {
            line = line.replace('\t', ' ');
        }

        // Make the carriage-returns go away.
        while(line.indexOf('\r') >= 0) {
            line = line.replace('\r', '');
        }

        // Remove double-spaces to avoid empty tokens.
        while(line.indexOf('  ') >= 0) {
            line = line.replace('  ', ' ');
        }

        if(line.length === 0 || line === ' ') {
            continue;
        }

        if(line.charAt(0) === '#') {
            prevOption = null;
            continue;
        }

        var tokens = line.trim().split(' ');

        if(tokens[0].charAt(0) === '$') {
            // Return early if $eof is provided, so notes can be kept below
            //   the useful data.
            if(tokens[0] === '$eof') {
                return;
            }

            var key = tokens[0].substring(1);
            var value = tokens.splice(1);

            if(options.hasOwnProperty(key) && prevOption === key) {
                options[key] = options[key].concat(value);
            } else {
                options[key] = value;
            }

            prevOption = key;
        } else {
            //console.log(options);

            prevOption = null;

            if(loader == null) {
                loader = loaders[options.loader[0]];
            }

            loader.load(tokens, this.lists, options);
        }
    }
};

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = SampleLoader;
}
