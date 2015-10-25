"use strict";

var grammarUtils = {
    pick: function(array, randomFunction) {
        return array[Math.floor(randomFunction() * array.length)];
    }
}

var algo = {
    id: "grammar",
    name: "Grammar",

    parseList: function(input, options, lfRules) {
        var r = {
            positions: [0],
            words: [],
            symbols: {},
            size: 0
        };

        for(var i = 0; i < input.length; ++i) {
            var group = input[i];
            var headers = group.headers;
            var lines = group.lines;

            // Ensure sets exists.
            for(var j = 0; j < headers.length; ++j) {
                var header = headers[j];

                if(!r.symbols.hasOwnProperty(header)) {
                    r.symbols[header] = [];
                }
            }

            // Parse lines to add to sets
            for(var j = 0; j < lines.length; ++j) {
                var tokens = lines[j];

                lfRules.learn(tokens.join(''));

                for(var k = 0; k < tokens.length; ++k) {
                    var token = tokens[k];
                    var header = headers[k];

                    r.symbols[header].push(token);
                }
            }

            r.words.push({f: headers, l: lines.length});
            r.size += lines.length;
            r.positions.push(r.size);
        }

        for(var i = 0; i < r.words.length; ++i) {
            var word = r.words[i];

            if(word.l > 1) {
                continue;
            }

            for(var j = 0; j < word.f.length; ++j) {
                var symbol = word.f[j];

                if(r.symbols[symbol].length <= 1) {
                    console.error('\tWARNING "'+word.f.join(' ')+'"/"'+symbol+'".length = 1');
                }
            }
        }

        return r;
    },

    initTemp: function(data, options, lfRules) {
        // Reconstruct samples
        var words = data.words;
        var symbols = data.symbols;
        var results = [];
        var indices = {};
        var symbolKeys = Object.keys(symbols);

        // Set up the indices array
        for(var i = 0; i < symbolKeys.length; ++i) {
            indices[symbolKeys[i]] = 0;
        }

        for(var i = 0; i < words.length; ++i) {
            var word = words[i];

            for(var j = 0; j < word.l; ++j) {
                var name = "";

                for(var k = 0; k < word.f.length; ++k) {
                    var symbol = word.f[k];
                    var index = indices[symbol]++;

                    name += symbols[symbol][index];
                }

                results.push(name);
            }
        }

        // Enforce lfoverride
        if(options.hasOwnProperty('lfOverrides')) {
            var keys = Object.keys(options.lfOverrides);

            for(var i = 0; i < keys.length; ++i) {
                lfRules.counts[keys[i]] = options.lfOverrides[keys[i]];
            }
        }

        return results;
    },

    generate: function(data, randomFunction, lfRules, options, temp) {
        var word = null;
        var result = [];
        var prev = null;
        var r = Math.floor(randomFunction() * data.size);

        for(var i = 0; i < data.words.length; ++i) {
            if(r < data.positions[i + 1]) {
                word = data.words[i];
                break;
            }
        }

        if(word === null) {
            word = data.words[data.words.length - 1];
        }

        while(result.length < word.f.length) {
            var i = result.length;
            var symbol = word.f[i];
            var pick = grammarUtils.pick(data.symbols[symbol], randomFunction);
            var fail = false;
            var name;

            result.push(pick);
            name = result.join('');

            if(!lfRules.check(name)) {
                fail = true;
            }

            if(!fail && temp.indexOf(name) !== -1) {
                fail = true;
            }

            if(fail) {
                if(prev === pick) {
                    prev = null;
                    result = [];
                } else {
                    prev = pick;
                    result.pop();
                }
            }
        }

        return result.join('');
    }
}

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = algo;
} else {
    algos[algo.id] = algo;
}
