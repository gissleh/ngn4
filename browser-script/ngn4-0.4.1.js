// This file is made from automatically concaterad and filtered node.js scripts.
// ngn4 is open source, and provided under an MIT licence
// See https://github.com/gissleh/ngn4 for more details. 


// Copyright (c) 2015 Gisle Aune"use strict";
var algos = {};
var loaders = {};


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

            var strikes = 0;

            for(var j = 0; j < word.f.length; ++j) {
                var symbol = word.f[j];

                if(r.symbols[symbol].length <= word.l) {
                    ++strikes;
                }
            }

            if(strikes === word.f.length) {
                r.words.splice(i, 1);
                console.error('\tSKIPPED "'+word.f.join(' ')+'" (length <= 1)');
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

                    // If word's wieght is smaller than symbol count,
                    //  retry with another word. This is to prevent crashing
                    if(word.l <= word.f.length) {
                        var r = Math.floor(randomFunction() * data.size);

                        word = null;
                        for(var i = 0; i < data.words.length; ++i) {
                            if(r < data.positions[i + 1]) {
                                word = data.words[i];
                                break;
                            }
                        }

                        if(word === null) {
                            word = data.words[data.words.length - 1];
                        }
                    }

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


var markovUtils = {};
var runId = 0;

markovUtils.mergeFlags = function(flags, flagsStr) {
    var result = {
        lrs: false,
        lrm: false,
        lre: false,
        f2o: false,
        f3o: false,
        to2c: false,
        to2v: false,
        todc: false,
        todv: false,
        lrf: false,
        as: false
    }

    if(typeof(flags) !== 'string') {
        var keys = Object.keys(flags);
        for(var i = 0; i < keys.length; ++i) {
            result[keys[i]] = flags[keys[i]];
        }
    } else {
        flagsStr = flags;
    }

    if(typeof(flagsStr) !== 'undefined') {
        var flagSplit = flagsStr.split(' ');

        for(var i = 0; i < flagSplit.length; ++i) {
            result[flagSplit[i]] = true;
        }
    }

    return result;
}

markovUtils.pick = function(rfunc, array) {
    return array[Math.floor(rfunc() * array.length)];
}

markovUtils.getArray = function(obj, prop) {
    if(!obj.hasOwnProperty(prop)) {
        obj[prop] = [];
    }

    return obj[prop];
}

markovUtils.getIndex = function(obj, prop) {
    if(!obj.hasOwnProperty(prop)) {
        obj[prop] = 0;
    }

    return obj[prop]++;
}

markovUtils.getRandomLength = function(array, total, randomFunction) {
    var r = Math.floor(randomFunction() * total);

    for(var i = 1; i < array.length; ++i) {
        r -= array[i];

        if(r < 0) {
            return i + 3;
        }
    }
    // 4 1 3 1
    return array.length + 1;
}

markovUtils.checkThirdOrder = function(result, option, flags, options) {
    if(flags.f3o) {
        return true;
    }

    var vowels;
    if(options.hasOwnProperty('vowels')) {
        vowels = options.vowels;
    } else {
        vowels = "aeiouy";
    }

    var prev1 = result[result.length - 1];
    var prev2 = result[result.length - 2];

    if(flags.todc && (result.length > 2) && (prev1 === prev2) && (vowels.indexOf(prev1) === -1)) {
        return true;
    }
    if(flags.to2c && (result.length > 2) && (vowels.indexOf(prev1) === -1) && (vowels.indexOf(prev2) === -1)) {
        return true;
    }
    if(flags.todv && (result.length > 2) && (prev1 === prev2) && (vowels.indexOf(prev1) !== -1)) {
        return true;
    }
    if(flags.to2v && (result.length > 2) && (vowels.indexOf(prev1) !== -1) && (vowels.indexOf(prev2) !== -1)) {
        return true;
    }

    return false;
}

markovUtils.checkNext = function(result, option, length, flags, lrFlag, lfRules, samples) {
    var next = result + option.ch;

    if(flags.as && (next.length == length) && (samples.indexOf(next) !== -1)) {
        return false;
    }

    if(lrFlag && option.l != length) {
        return false;
    }

    if(flags.rlf && !lfRules.check(next)) {
        return false;
    }

    return true;
}

/*
  +-------------------------------------------------+
  |                GENERATOR FLAGS                  |
  +---+--------+------------------------------------+
  | X |  lrs   | Length restriction on start, mid,  |
  | X |  lrm   | and/or end rules the length of the |
  | X |  lre   | rule's source sample               |
  +---+--------+------------------------------------+
  | X |  f2o   | Force 2nd or 3rd order chain. f3o  |
  | X |  f3o   | override f2o if both are set       |
  +---+--------+------------------------------------+
  | X |  to2c  | Third order on 2 consonants        |
  | X |  to2v  | and/or vowels                      |
  +---+--------+------------------------------------+
  | X |  todc  | Third order on double consonants   |
  | X |  todv  | and/or vowels                      |
  +---+--------+------------------------------------+
  | X |  rlf   | Restrict letter frequency          |
  +---+--------+------------------------------------+
  | X |  as    | Avoid samples being generated      |
  +---+--------+------------------------------------+
*/

var algo = {
    id: "markov",
    name: "Markov",

    parseList: function(input, options, lfRules) {
        var r = {       // Examples after "aeyna"
            starts: [], //  [{s: 'aey', l: 5}]
            mids: {},   //  {"ey": [{l: 5, ch: 'n'}], "aey": [{l: 5, ch: 'n'}]}
            ends: {},   //  {"eyn": [{l: 5, ch: 'a'}]}
            lf: [],      //  [0, 0, 1],
            lfTotal: 0
        }

        // FLAGS
        if(!options.hasOwnProperty('flags')) {
            options.flags = {};
        }
        options.flags = markovUtils.mergeFlags(options.flags, options.flagsStr);

        // Parse each sample.
        for(var i = 0; i < input.length; ++i) {
            var sample = input[i];
            var l = sample.length;

            // The code doesn't work with names shorter than 3 letters.
            if(sample.length < 3) {
                continue;
            }

            // Learn letter frequency rules from sample.
            lfRules.learn(sample);

            // Length frequency
            while(r.lf.length <= sample.length - 3) {
                r.lf.push(0);
            }
            ++r.lf[sample.length - 3];
            ++r.lfTotal;

            // Beginning
            if(sample.length > 4) {
                r.starts.push({
                    l: l,
                    s: sample.substring(0, 3)
                });
            } else {
                r.starts.push({
                    l: l,
                    s: sample.substring(0, 2)
                });
            }

            // Middle
            for(var j = 2; j < l - 1; ++j) {
                var mid = {
                    ch: sample.charAt(j),
                    l: l
                };

                if(j > 2) {
                    markovUtils.getArray(r.mids, sample.substring(j - 3, j)).push(mid);
                }

                markovUtils.getArray(r.mids, sample.substring(j - 2, j)).push(mid);
            }

            // ends
            var end = {
                ch: sample.charAt(l - 1),
                l: l
            };

            if(sample.length > 4) {
                markovUtils.getArray(r.ends, sample.substring(l - 4, l - 1)).push(end);
            }

            markovUtils.getArray(r.ends, sample.substring(l - 3, l - 1)).push(end);

            //console.log(sample + ' ' + sample.substring(l - 3, l - 1) + '-' + end.ch + ' ' + markovUtils.getArray(r.ends, sample.substring(l - 3, l - 1)).length);
        }

        return r;
    },

    initTemp: function(data, options, lfRules) {
        // Reconstructs samples for avoid-sample rule
        var results = [];
        var indexMap1 = {};
        var indexMap2 = {};
        var getIndex = markovUtils.getIndex;

        for(var i = 0; i < data.starts.length; ++i) {
            var start = data.starts[i];
            var name = start.s.substring(0, 2);
            var length = start.l;
            var key, set, indexMap, index;

            for(var j = name.length; j < length; ++j) {
                set = ((j < length - 1) ? data.mids : data.ends);
                indexMap = ((j < length - 1) ? indexMap1 : indexMap2);

                key = name.substring(name.length - 2);

                if(set.hasOwnProperty(key)) {
                    index = getIndex(indexMap, key);

                    //console.log(index + ' ' + name + ' ' + key + ' ' + (set == data.mids) + ' ' + JSON.stringify(set[key]));

                    name += set[key][index].ch;
                } else {
                    console.log(name + ' ' + key + ' ' + length);
                }
            }

            results.push(name);
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
        // INITIALIZE and START
        var result = "";
        var f = options.flags;

        var globalRuns = 0;

        while(globalRuns++ < 100) {
            var runs = 0;
            var start = markovUtils.pick(randomFunction, data.starts);
            var length = start.l;
            var slength = start.s.length;
            var tight = false;

            result = start.s;

            // If start shouldn't be length restricted, pick a random length.
            if(!f.lrs) {
                length = markovUtils.getRandomLength(data.lf, data.lfTotal, randomFunction);

                if(length <= 4 && slength > 2) {
                    result = start.s.substring(0, 2);
                }
            }

            // Make the rest of the name, letter by letter.
            while(result.length < length) {
                var key, opts, validOpts;

                ++runId;

                var set = ((result.length < length - 1) ? data.mids : data.ends);
                var lrFlag = ((result.length < length - 1) ? f.lrm : f.lre);

                // ATTEMPT: 3rd order options
                if(result.length >= 3 && (!f.f2o || f.f3o)) {
                    key = result.substring(result.length - 3, result.length);
                    opts = set[key];

                    validOpts = [];
                    if(typeof(opts) !== 'undefined') {
                        for(var i = 0; i < opts.length; ++i) {
                            // If (needs third order AND option fits)
                            if(markovUtils.checkThirdOrder(result, opts[i], f, options)
                               && markovUtils.checkNext(result, opts[i], length, f, lrFlag, lfRules, temp)) {

                                validOpts.push(opts[i]);
                            }
                        }
                    }

                    if(validOpts.length > 0) {
                        var opt = markovUtils.pick(randomFunction, validOpts);
                        result += opt.ch;

                        continue;
                    }
                }

                // ATTEMPT: 2nd order options
                if(!f.f3o) {
                    key = result.substring(result.length - 2, result.length);
                    opts = set[key];

                    validOpts = [];
                    if(typeof(opts) !== 'undefined') {
                        for(var i = 0; i < opts.length; ++i) {
                            if(!markovUtils.checkThirdOrder(result, opts[i], f, options)
                               && markovUtils.checkNext(result, opts[i], length, f, lrFlag, lfRules, temp)) {

                                validOpts.push(opts[i]);
                            }
                        }
                    }

                    if(validOpts.length > 0) {
                        var opt = markovUtils.pick(randomFunction, validOpts);
                        result += opt.ch;

                        continue;
                    }
                }

                // LAST RESORT: Cut off the last one and try again
                if(result.length > slength) {
                    result = start.s;
                }

                if(++runs > 32) {
                    result = null;
                    break;
                }
            }

            if(result != null) {
                return result;
            }
        }
    }
}

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = algo;
} else {
    algos[algo.id] = algo;
}


var algo = {
    id: "select",
    name: "Simple Random Selection",

    parseList: function(input) {
        return input;
    },

    initTemp: function(data) {
        return null;
    },

    generate: function(data, randomFunction) {
        return data[Math.floor(randomFunction() * data.length)];
    }
}

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = algo;
} else {
    algos[algo.id] = algo;
}


var algo = {
    id: "syllables",
    name: "Syllable Concateration",

    parseList: function(input, options, lfRules) {
        var r = {
            positions: [0],
            groups: [].concat(input),
            size: 0
        };

        for(var i = 0; i < r.groups.length; ++i) {
            var group = r.groups[i];

            if(group.headers.length >= 2) {
                group.weigthMultiplier = parseFloat(group.headers[1]);
            } else {
                group.weigthMultiplier = 1;
            }

            if(group.lines.length <= 1) {
                console.error('SKIPPED "' + group.id + '" (length <= 1)');
                r.groups.splice(i, 1);
                --i;

                continue;
            }

            group.width = group.lines[0].length;

            for(var j = 0; j < group.lines.length; ++j) {
                var line = group.lines[j];

                if(line.length !== group.width) {
                    console.error(JSON.stringify(group));

                    throw new Error("The line " + JSON.stringify(line) + " is not as long as the others in the group ("+group.width+"). No non-conformism!. D:<");
                }

                lfRules.learn(line.join(''));
            }

            var size = group.lines.length * group.width * group.weigthMultiplier;

            r.size += size;
            r.positions.push(r.size);
        }

        return r;
    },

    initTemp: function(data, options, lfRules) {
        var samples = {};

        // Reconstruct samples
        for(var i = 0; i < data.groups.length; ++i) {
            var group = data.groups[i];

            for(var j = 0; j < group.lines.length; ++j) {
                samples[group.lines[j].join('')] = true;
            }
        }

        // Enforce lfoverride
        if(options.hasOwnProperty('lfOverrides')) {
            var keys = Object.keys(options.lfOverrides);

            for(var i = 0; i < keys.length; ++i) {
                lfRules.counts[keys[i]] = options.lfOverrides[keys[i]];
            }
        }

        return samples;
    },

    generate: function(data, randomFunction, lfRules, options, temp) {
        var rand = randomFunction() * data.size;
        var group = null;

        for(var i = 0; i < data.groups.length - 1; ++i) {
            if(rand < data.positions[i + 1]) {
                group = data.groups[i];
                break;
            }
        }

        if(group == null || group == undefined) {
            group = data.groups[data.groups.length - 1];
        }

        var optionAsls = true;
        if(options.hasOwnProperty('asls')) {
            optionAsls = options.asls;
        }

        var result = [];
        var lines = group.lines;
        var prev = null;
        while(result.length < group.width) {
            var i = result.length;
            rand = Math.floor(randomFunction() * group.lines.length);
            var pick = group.lines[rand][i];

            result.push(pick);
            var fail = false;

            // Respect letter frequency rules
            if(!lfRules.check(result.join(''))) {
                fail = true;
            }

            // Avoid same letter syllables
            if(!fail && optionAsls && i > 0
                && (pick.charAt(0) === result[i - 1].charAt(0))) {
                fail = true;
            }

            // Avoid samples, but permit close samples.
            if(!fail && (i === group.width - 1) && temp.hasOwnProperty(result.join(''))) {
                fail = true;
            }

            if(fail) {
                if(pick === prev) {
                    result = [];

                    if(group.lines.length <= group.width) {
                        var group = null;

                        for(var i = 0; i < data.groups.length - 1; ++i) {
                            if(rand < data.positions[i + 1]) {
                                group = data.groups[i];
                                break;
                            }
                        }

                        if(group == null || group == undefined) {
                            group = data.groups[data.groups.length - 1];
                        }
                    }

                    prev = null;
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


// This file is made from automatically concaterad and filtered node.js scripts.
// ngn4 is open source, and provided under an MIT licence
// See https://github.com/gissleh/ngn4 for more details. 


// Copyright (c) 2015 Gisle Aune"use strict";
var algos = {};
var loaders = {};


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

            var strikes = 0;

            for(var j = 0; j < word.f.length; ++j) {
                var symbol = word.f[j];

                if(r.symbols[symbol].length <= word.l) {
                    ++strikes;
                }
            }

            if(strikes === word.f.length) {
                r.words.splice(i, 1);
                console.error('\tSKIPPED "'+word.f.join(' ')+'" (length <= 1)');
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

                    // If word's wieght is smaller than symbol count,
                    //  retry with another word. This is to prevent crashing
                    if(word.l <= word.f.length) {
                        var r = Math.floor(randomFunction() * data.size);

                        word = null;
                        for(var i = 0; i < data.words.length; ++i) {
                            if(r < data.positions[i + 1]) {
                                word = data.words[i];
                                break;
                            }
                        }

                        if(word === null) {
                            word = data.words[data.words.length - 1];
                        }
                    }

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


var markovUtils = {};
var runId = 0;

markovUtils.mergeFlags = function(flags, flagsStr) {
    var result = {
        lrs: false,
        lrm: false,
        lre: false,
        f2o: false,
        f3o: false,
        to2c: false,
        to2v: false,
        todc: false,
        todv: false,
        lrf: false,
        as: false
    }

    if(typeof(flags) !== 'string') {
        var keys = Object.keys(flags);
        for(var i = 0; i < keys.length; ++i) {
            result[keys[i]] = flags[keys[i]];
        }
    } else {
        flagsStr = flags;
    }

    if(typeof(flagsStr) !== 'undefined') {
        var flagSplit = flagsStr.split(' ');

        for(var i = 0; i < flagSplit.length; ++i) {
            result[flagSplit[i]] = true;
        }
    }

    return result;
}

markovUtils.pick = function(rfunc, array) {
    return array[Math.floor(rfunc() * array.length)];
}

markovUtils.getArray = function(obj, prop) {
    if(!obj.hasOwnProperty(prop)) {
        obj[prop] = [];
    }

    return obj[prop];
}

markovUtils.getIndex = function(obj, prop) {
    if(!obj.hasOwnProperty(prop)) {
        obj[prop] = 0;
    }

    return obj[prop]++;
}

markovUtils.getRandomLength = function(array, total, randomFunction) {
    var r = Math.floor(randomFunction() * total);

    for(var i = 1; i < array.length; ++i) {
        r -= array[i];

        if(r < 0) {
            return i + 3;
        }
    }
    // 4 1 3 1
    return array.length + 1;
}

markovUtils.checkThirdOrder = function(result, option, flags, options) {
    if(flags.f3o) {
        return true;
    }

    var vowels;
    if(options.hasOwnProperty('vowels')) {
        vowels = options.vowels;
    } else {
        vowels = "aeiouy";
    }

    var prev1 = result[result.length - 1];
    var prev2 = result[result.length - 2];

    if(flags.todc && (result.length > 2) && (prev1 === prev2) && (vowels.indexOf(prev1) === -1)) {
        return true;
    }
    if(flags.to2c && (result.length > 2) && (vowels.indexOf(prev1) === -1) && (vowels.indexOf(prev2) === -1)) {
        return true;
    }
    if(flags.todv && (result.length > 2) && (prev1 === prev2) && (vowels.indexOf(prev1) !== -1)) {
        return true;
    }
    if(flags.to2v && (result.length > 2) && (vowels.indexOf(prev1) !== -1) && (vowels.indexOf(prev2) !== -1)) {
        return true;
    }

    return false;
}

markovUtils.checkNext = function(result, option, length, flags, lrFlag, lfRules, samples) {
    var next = result + option.ch;

    if(flags.as && (next.length == length) && (samples.indexOf(next) !== -1)) {
        return false;
    }

    if(lrFlag && option.l != length) {
        return false;
    }

    if(flags.rlf && !lfRules.check(next)) {
        return false;
    }

    return true;
}

/*
  +-------------------------------------------------+
  |                GENERATOR FLAGS                  |
  +---+--------+------------------------------------+
  | X |  lrs   | Length restriction on start, mid,  |
  | X |  lrm   | and/or end rules the length of the |
  | X |  lre   | rule's source sample               |
  +---+--------+------------------------------------+
  | X |  f2o   | Force 2nd or 3rd order chain. f3o  |
  | X |  f3o   | override f2o if both are set       |
  +---+--------+------------------------------------+
  | X |  to2c  | Third order on 2 consonants        |
  | X |  to2v  | and/or vowels                      |
  +---+--------+------------------------------------+
  | X |  todc  | Third order on double consonants   |
  | X |  todv  | and/or vowels                      |
  +---+--------+------------------------------------+
  | X |  rlf   | Restrict letter frequency          |
  +---+--------+------------------------------------+
  | X |  as    | Avoid samples being generated      |
  +---+--------+------------------------------------+
*/

var algo = {
    id: "markov",
    name: "Markov",

    parseList: function(input, options, lfRules) {
        var r = {       // Examples after "aeyna"
            starts: [], //  [{s: 'aey', l: 5}]
            mids: {},   //  {"ey": [{l: 5, ch: 'n'}], "aey": [{l: 5, ch: 'n'}]}
            ends: {},   //  {"eyn": [{l: 5, ch: 'a'}]}
            lf: [],      //  [0, 0, 1],
            lfTotal: 0
        }

        // FLAGS
        if(!options.hasOwnProperty('flags')) {
            options.flags = {};
        }
        options.flags = markovUtils.mergeFlags(options.flags, options.flagsStr);

        // Parse each sample.
        for(var i = 0; i < input.length; ++i) {
            var sample = input[i];
            var l = sample.length;

            // The code doesn't work with names shorter than 3 letters.
            if(sample.length < 3) {
                continue;
            }

            // Learn letter frequency rules from sample.
            lfRules.learn(sample);

            // Length frequency
            while(r.lf.length <= sample.length - 3) {
                r.lf.push(0);
            }
            ++r.lf[sample.length - 3];
            ++r.lfTotal;

            // Beginning
            if(sample.length > 4) {
                r.starts.push({
                    l: l,
                    s: sample.substring(0, 3)
                });
            } else {
                r.starts.push({
                    l: l,
                    s: sample.substring(0, 2)
                });
            }

            // Middle
            for(var j = 2; j < l - 1; ++j) {
                var mid = {
                    ch: sample.charAt(j),
                    l: l
                };

                if(j > 2) {
                    markovUtils.getArray(r.mids, sample.substring(j - 3, j)).push(mid);
                }

                markovUtils.getArray(r.mids, sample.substring(j - 2, j)).push(mid);
            }

            // ends
            var end = {
                ch: sample.charAt(l - 1),
                l: l
            };

            if(sample.length > 4) {
                markovUtils.getArray(r.ends, sample.substring(l - 4, l - 1)).push(end);
            }

            markovUtils.getArray(r.ends, sample.substring(l - 3, l - 1)).push(end);

            //console.log(sample + ' ' + sample.substring(l - 3, l - 1) + '-' + end.ch + ' ' + markovUtils.getArray(r.ends, sample.substring(l - 3, l - 1)).length);
        }

        return r;
    },

    initTemp: function(data, options, lfRules) {
        // Reconstructs samples for avoid-sample rule
        var results = [];
        var indexMap1 = {};
        var indexMap2 = {};
        var getIndex = markovUtils.getIndex;

        for(var i = 0; i < data.starts.length; ++i) {
            var start = data.starts[i];
            var name = start.s.substring(0, 2);
            var length = start.l;
            var key, set, indexMap, index;

            for(var j = name.length; j < length; ++j) {
                set = ((j < length - 1) ? data.mids : data.ends);
                indexMap = ((j < length - 1) ? indexMap1 : indexMap2);

                key = name.substring(name.length - 2);

                if(set.hasOwnProperty(key)) {
                    index = getIndex(indexMap, key);

                    //console.log(index + ' ' + name + ' ' + key + ' ' + (set == data.mids) + ' ' + JSON.stringify(set[key]));

                    name += set[key][index].ch;
                } else {
                    console.log(name + ' ' + key + ' ' + length);
                }
            }

            results.push(name);
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
        // INITIALIZE and START
        var result = "";
        var f = options.flags;

        var globalRuns = 0;

        while(globalRuns++ < 100) {
            var runs = 0;
            var start = markovUtils.pick(randomFunction, data.starts);
            var length = start.l;
            var slength = start.s.length;
            var tight = false;

            result = start.s;

            // If start shouldn't be length restricted, pick a random length.
            if(!f.lrs) {
                length = markovUtils.getRandomLength(data.lf, data.lfTotal, randomFunction);

                if(length <= 4 && slength > 2) {
                    result = start.s.substring(0, 2);
                }
            }

            // Make the rest of the name, letter by letter.
            while(result.length < length) {
                var key, opts, validOpts;

                ++runId;

                var set = ((result.length < length - 1) ? data.mids : data.ends);
                var lrFlag = ((result.length < length - 1) ? f.lrm : f.lre);

                // ATTEMPT: 3rd order options
                if(result.length >= 3 && (!f.f2o || f.f3o)) {
                    key = result.substring(result.length - 3, result.length);
                    opts = set[key];

                    validOpts = [];
                    if(typeof(opts) !== 'undefined') {
                        for(var i = 0; i < opts.length; ++i) {
                            // If (needs third order AND option fits)
                            if(markovUtils.checkThirdOrder(result, opts[i], f, options)
                               && markovUtils.checkNext(result, opts[i], length, f, lrFlag, lfRules, temp)) {

                                validOpts.push(opts[i]);
                            }
                        }
                    }

                    if(validOpts.length > 0) {
                        var opt = markovUtils.pick(randomFunction, validOpts);
                        result += opt.ch;

                        continue;
                    }
                }

                // ATTEMPT: 2nd order options
                if(!f.f3o) {
                    key = result.substring(result.length - 2, result.length);
                    opts = set[key];

                    validOpts = [];
                    if(typeof(opts) !== 'undefined') {
                        for(var i = 0; i < opts.length; ++i) {
                            if(!markovUtils.checkThirdOrder(result, opts[i], f, options)
                               && markovUtils.checkNext(result, opts[i], length, f, lrFlag, lfRules, temp)) {

                                validOpts.push(opts[i]);
                            }
                        }
                    }

                    if(validOpts.length > 0) {
                        var opt = markovUtils.pick(randomFunction, validOpts);
                        result += opt.ch;

                        continue;
                    }
                }

                // LAST RESORT: Cut off the last one and try again
                if(result.length > slength) {
                    result = start.s;
                }

                if(++runs > 32) {
                    result = null;
                    break;
                }
            }

            if(result != null) {
                return result;
            }
        }
    }
}

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = algo;
} else {
    algos[algo.id] = algo;
}


var algo = {
    id: "select",
    name: "Simple Random Selection",

    parseList: function(input) {
        return input;
    },

    initTemp: function(data) {
        return null;
    },

    generate: function(data, randomFunction) {
        return data[Math.floor(randomFunction() * data.length)];
    }
}

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = algo;
} else {
    algos[algo.id] = algo;
}


var algo = {
    id: "syllables",
    name: "Syllable Concateration",

    parseList: function(input, options, lfRules) {
        var r = {
            positions: [0],
            groups: [].concat(input),
            size: 0
        };

        for(var i = 0; i < r.groups.length; ++i) {
            var group = r.groups[i];

            if(group.headers.length >= 2) {
                group.weigthMultiplier = parseFloat(group.headers[1]);
            } else {
                group.weigthMultiplier = 1;
            }

            if(group.lines.length <= 1) {
                console.error('SKIPPED "' + group.id + '" (length <= 1)');
                r.groups.splice(i, 1);
                --i;

                continue;
            }

            group.width = group.lines[0].length;

            for(var j = 0; j < group.lines.length; ++j) {
                var line = group.lines[j];

                if(line.length !== group.width) {
                    console.error(JSON.stringify(group));

                    throw new Error("The line " + JSON.stringify(line) + " is not as long as the others in the group ("+group.width+"). No non-conformism!. D:<");
                }

                lfRules.learn(line.join(''));
            }

            var size = group.lines.length * group.width * group.weigthMultiplier;

            r.size += size;
            r.positions.push(r.size);
        }

        return r;
    },

    initTemp: function(data, options, lfRules) {
        var samples = {};

        // Reconstruct samples
        for(var i = 0; i < data.groups.length; ++i) {
            var group = data.groups[i];

            for(var j = 0; j < group.lines.length; ++j) {
                samples[group.lines[j].join('')] = true;
            }
        }

        // Enforce lfoverride
        if(options.hasOwnProperty('lfOverrides')) {
            var keys = Object.keys(options.lfOverrides);

            for(var i = 0; i < keys.length; ++i) {
                lfRules.counts[keys[i]] = options.lfOverrides[keys[i]];
            }
        }

        return samples;
    },

    generate: function(data, randomFunction, lfRules, options, temp) {
        var rand = randomFunction() * data.size;
        var group = null;

        for(var i = 0; i < data.groups.length - 1; ++i) {
            if(rand < data.positions[i + 1]) {
                group = data.groups[i];
                break;
            }
        }

        if(group == null || group == undefined) {
            group = data.groups[data.groups.length - 1];
        }

        var optionAsls = true;
        if(options.hasOwnProperty('asls')) {
            optionAsls = options.asls;
        }

        var result = [];
        var lines = group.lines;
        var prev = null;
        while(result.length < group.width) {
            var i = result.length;
            rand = Math.floor(randomFunction() * group.lines.length);
            var pick = group.lines[rand][i];

            result.push(pick);
            var fail = false;

            // Respect letter frequency rules
            if(!lfRules.check(result.join(''))) {
                fail = true;
            }

            // Avoid same letter syllables
            if(!fail && optionAsls && i > 0
                && (pick.charAt(0) === result[i - 1].charAt(0))) {
                fail = true;
            }

            // Avoid samples, but permit close samples.
            if(!fail && (i === group.width - 1) && temp.hasOwnProperty(result.join(''))) {
                fail = true;
            }

            if(fail) {
                if(pick === prev) {
                    result = [];

                    if(group.lines.length <= group.width) {
                        var group = null;

                        for(var i = 0; i < data.groups.length - 1; ++i) {
                            if(rand < data.positions[i + 1]) {
                                group = data.groups[i];
                                break;
                            }
                        }

                        if(group == null || group == undefined) {
                            group = data.groups[data.groups.length - 1];
                        }
                    }

                    prev = null;
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


var loader = {
    id: "fullname",
    name: "Full Name",

    load: function(tokens, lists, options) {
        var skip = 'NONE';
        var listIds = options.list;
        var replaces = null;

        // Get skip token (for when you just have a last name)
        if(options.hasOwnProperty('skip')) {
            skip = options.skip[0];
        }

        // Check if replacements should be done.
        if(options.hasOwnProperty('replace')) {
            replaces = options.replace;
        }

        // Add the tokens to the right list.
        for(var i = 0; i < tokens.length; ++i) {
            var token = tokens[i];

            if(token === skip) {
                continue;
            }

            if(i >= listIds.length) {
                break;
            }

            token = token.toLowerCase();

            if(replaces !== null) {
                for(var j = 0; j < replaces.length; j += 2) {
                    var fromChars = replaces[j];

                    while(token.indexOf(fromChars) != -1) {
                        token = token.replace(fromChars, replaces[j + 1]);
                    }
                }
            }

            var listId = listIds[i];

            if(!lists.hasOwnProperty(listId)) {
                lists[listId] = [];
            }

            lists[listId].push(token);
        }
    }
}

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = loader;
} else {
    loaders[loader.id] = loader;
}


var nextId = 0;

var loader = {
    id: "tokens",
    name: "Tokenized Part",

    load: function(tokens, lists, options) {
        var headers = options.group;
        var listId = options.list[0];
        var groupId = headers;
        var list = null, group = null;

        // Ensure the list exists, and select it.
        if(!lists.hasOwnProperty(listId)) {
            lists[listId] = [];
        }
        list = lists[listId];

        // Join the name for lowercasing
        var name = tokens.join(' ').toLowerCase();

        // Before splitting it back up, do replacing if requested.
        if(options.hasOwnProperty('replace')) {
            var replaces = options.replace;

            for(var i = 0; i < replaces.length; i += 2) {
                var fromChars = replaces[i];

                while(name.indexOf(fromChars) != -1) {
                    name = name.replace(fromChars, replaces[i + 1]);
                }
            }


        }

        // Split the name again
        tokens = name.split(' ');

        // Get group name
        if(options.hasOwnProperty('idtoken')) {
            if(options.idtoken === 'ALL') {
                groupId = headers.join(' ');
            } else if(options.idtoken === 'ANON') {
                groupId = '.anonymous' + (nextId++);
            } else {
                groupId = headers[parseInt(options.idtoken)];
            }
        }

        // Try find group
        for(var i = 0; i < list.length; ++i) {
            if(list[i].id == groupId) {
                group = list[i];
                break;
            }
        }

        // If unsuccessful, make the group.
        if(group === null) {
            group = {
                id: groupId,
                headers: headers,
                lines: []
            }

            list.push(group);
        }

        // Add the tokens to the group.
        group.lines.push(tokens);
    }
}

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = loader;
} else {
    loaders[loader.id] = loader;
}


// This file is made from automatically concaterad and filtered node.js scripts.
// ngn4 is open source, and provided under an MIT licence
// See https://github.com/gissleh/ngn4 for more details. 


// Copyright (c) 2015 Gisle Aune"use strict";
var algos = {};
var loaders = {};


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

            var strikes = 0;

            for(var j = 0; j < word.f.length; ++j) {
                var symbol = word.f[j];

                if(r.symbols[symbol].length <= word.l) {
                    ++strikes;
                }
            }

            if(strikes === word.f.length) {
                r.words.splice(i, 1);
                console.error('\tSKIPPED "'+word.f.join(' ')+'" (length <= 1)');
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

                    // If word's wieght is smaller than symbol count,
                    //  retry with another word. This is to prevent crashing
                    if(word.l <= word.f.length) {
                        var r = Math.floor(randomFunction() * data.size);

                        word = null;
                        for(var i = 0; i < data.words.length; ++i) {
                            if(r < data.positions[i + 1]) {
                                word = data.words[i];
                                break;
                            }
                        }

                        if(word === null) {
                            word = data.words[data.words.length - 1];
                        }
                    }

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


var markovUtils = {};
var runId = 0;

markovUtils.mergeFlags = function(flags, flagsStr) {
    var result = {
        lrs: false,
        lrm: false,
        lre: false,
        f2o: false,
        f3o: false,
        to2c: false,
        to2v: false,
        todc: false,
        todv: false,
        lrf: false,
        as: false
    }

    if(typeof(flags) !== 'string') {
        var keys = Object.keys(flags);
        for(var i = 0; i < keys.length; ++i) {
            result[keys[i]] = flags[keys[i]];
        }
    } else {
        flagsStr = flags;
    }

    if(typeof(flagsStr) !== 'undefined') {
        var flagSplit = flagsStr.split(' ');

        for(var i = 0; i < flagSplit.length; ++i) {
            result[flagSplit[i]] = true;
        }
    }

    return result;
}

markovUtils.pick = function(rfunc, array) {
    return array[Math.floor(rfunc() * array.length)];
}

markovUtils.getArray = function(obj, prop) {
    if(!obj.hasOwnProperty(prop)) {
        obj[prop] = [];
    }

    return obj[prop];
}

markovUtils.getIndex = function(obj, prop) {
    if(!obj.hasOwnProperty(prop)) {
        obj[prop] = 0;
    }

    return obj[prop]++;
}

markovUtils.getRandomLength = function(array, total, randomFunction) {
    var r = Math.floor(randomFunction() * total);

    for(var i = 1; i < array.length; ++i) {
        r -= array[i];

        if(r < 0) {
            return i + 3;
        }
    }
    // 4 1 3 1
    return array.length + 1;
}

markovUtils.checkThirdOrder = function(result, option, flags, options) {
    if(flags.f3o) {
        return true;
    }

    var vowels;
    if(options.hasOwnProperty('vowels')) {
        vowels = options.vowels;
    } else {
        vowels = "aeiouy";
    }

    var prev1 = result[result.length - 1];
    var prev2 = result[result.length - 2];

    if(flags.todc && (result.length > 2) && (prev1 === prev2) && (vowels.indexOf(prev1) === -1)) {
        return true;
    }
    if(flags.to2c && (result.length > 2) && (vowels.indexOf(prev1) === -1) && (vowels.indexOf(prev2) === -1)) {
        return true;
    }
    if(flags.todv && (result.length > 2) && (prev1 === prev2) && (vowels.indexOf(prev1) !== -1)) {
        return true;
    }
    if(flags.to2v && (result.length > 2) && (vowels.indexOf(prev1) !== -1) && (vowels.indexOf(prev2) !== -1)) {
        return true;
    }

    return false;
}

markovUtils.checkNext = function(result, option, length, flags, lrFlag, lfRules, samples) {
    var next = result + option.ch;

    if(flags.as && (next.length == length) && (samples.indexOf(next) !== -1)) {
        return false;
    }

    if(lrFlag && option.l != length) {
        return false;
    }

    if(flags.rlf && !lfRules.check(next)) {
        return false;
    }

    return true;
}

/*
  +-------------------------------------------------+
  |                GENERATOR FLAGS                  |
  +---+--------+------------------------------------+
  | X |  lrs   | Length restriction on start, mid,  |
  | X |  lrm   | and/or end rules the length of the |
  | X |  lre   | rule's source sample               |
  +---+--------+------------------------------------+
  | X |  f2o   | Force 2nd or 3rd order chain. f3o  |
  | X |  f3o   | override f2o if both are set       |
  +---+--------+------------------------------------+
  | X |  to2c  | Third order on 2 consonants        |
  | X |  to2v  | and/or vowels                      |
  +---+--------+------------------------------------+
  | X |  todc  | Third order on double consonants   |
  | X |  todv  | and/or vowels                      |
  +---+--------+------------------------------------+
  | X |  rlf   | Restrict letter frequency          |
  +---+--------+------------------------------------+
  | X |  as    | Avoid samples being generated      |
  +---+--------+------------------------------------+
*/

var algo = {
    id: "markov",
    name: "Markov",

    parseList: function(input, options, lfRules) {
        var r = {       // Examples after "aeyna"
            starts: [], //  [{s: 'aey', l: 5}]
            mids: {},   //  {"ey": [{l: 5, ch: 'n'}], "aey": [{l: 5, ch: 'n'}]}
            ends: {},   //  {"eyn": [{l: 5, ch: 'a'}]}
            lf: [],      //  [0, 0, 1],
            lfTotal: 0
        }

        // FLAGS
        if(!options.hasOwnProperty('flags')) {
            options.flags = {};
        }
        options.flags = markovUtils.mergeFlags(options.flags, options.flagsStr);

        // Parse each sample.
        for(var i = 0; i < input.length; ++i) {
            var sample = input[i];
            var l = sample.length;

            // The code doesn't work with names shorter than 3 letters.
            if(sample.length < 3) {
                continue;
            }

            // Learn letter frequency rules from sample.
            lfRules.learn(sample);

            // Length frequency
            while(r.lf.length <= sample.length - 3) {
                r.lf.push(0);
            }
            ++r.lf[sample.length - 3];
            ++r.lfTotal;

            // Beginning
            if(sample.length > 4) {
                r.starts.push({
                    l: l,
                    s: sample.substring(0, 3)
                });
            } else {
                r.starts.push({
                    l: l,
                    s: sample.substring(0, 2)
                });
            }

            // Middle
            for(var j = 2; j < l - 1; ++j) {
                var mid = {
                    ch: sample.charAt(j),
                    l: l
                };

                if(j > 2) {
                    markovUtils.getArray(r.mids, sample.substring(j - 3, j)).push(mid);
                }

                markovUtils.getArray(r.mids, sample.substring(j - 2, j)).push(mid);
            }

            // ends
            var end = {
                ch: sample.charAt(l - 1),
                l: l
            };

            if(sample.length > 4) {
                markovUtils.getArray(r.ends, sample.substring(l - 4, l - 1)).push(end);
            }

            markovUtils.getArray(r.ends, sample.substring(l - 3, l - 1)).push(end);

            //console.log(sample + ' ' + sample.substring(l - 3, l - 1) + '-' + end.ch + ' ' + markovUtils.getArray(r.ends, sample.substring(l - 3, l - 1)).length);
        }

        return r;
    },

    initTemp: function(data, options, lfRules) {
        // Reconstructs samples for avoid-sample rule
        var results = [];
        var indexMap1 = {};
        var indexMap2 = {};
        var getIndex = markovUtils.getIndex;

        for(var i = 0; i < data.starts.length; ++i) {
            var start = data.starts[i];
            var name = start.s.substring(0, 2);
            var length = start.l;
            var key, set, indexMap, index;

            for(var j = name.length; j < length; ++j) {
                set = ((j < length - 1) ? data.mids : data.ends);
                indexMap = ((j < length - 1) ? indexMap1 : indexMap2);

                key = name.substring(name.length - 2);

                if(set.hasOwnProperty(key)) {
                    index = getIndex(indexMap, key);

                    //console.log(index + ' ' + name + ' ' + key + ' ' + (set == data.mids) + ' ' + JSON.stringify(set[key]));

                    name += set[key][index].ch;
                } else {
                    console.log(name + ' ' + key + ' ' + length);
                }
            }

            results.push(name);
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
        // INITIALIZE and START
        var result = "";
        var f = options.flags;

        var globalRuns = 0;

        while(globalRuns++ < 100) {
            var runs = 0;
            var start = markovUtils.pick(randomFunction, data.starts);
            var length = start.l;
            var slength = start.s.length;
            var tight = false;

            result = start.s;

            // If start shouldn't be length restricted, pick a random length.
            if(!f.lrs) {
                length = markovUtils.getRandomLength(data.lf, data.lfTotal, randomFunction);

                if(length <= 4 && slength > 2) {
                    result = start.s.substring(0, 2);
                }
            }

            // Make the rest of the name, letter by letter.
            while(result.length < length) {
                var key, opts, validOpts;

                ++runId;

                var set = ((result.length < length - 1) ? data.mids : data.ends);
                var lrFlag = ((result.length < length - 1) ? f.lrm : f.lre);

                // ATTEMPT: 3rd order options
                if(result.length >= 3 && (!f.f2o || f.f3o)) {
                    key = result.substring(result.length - 3, result.length);
                    opts = set[key];

                    validOpts = [];
                    if(typeof(opts) !== 'undefined') {
                        for(var i = 0; i < opts.length; ++i) {
                            // If (needs third order AND option fits)
                            if(markovUtils.checkThirdOrder(result, opts[i], f, options)
                               && markovUtils.checkNext(result, opts[i], length, f, lrFlag, lfRules, temp)) {

                                validOpts.push(opts[i]);
                            }
                        }
                    }

                    if(validOpts.length > 0) {
                        var opt = markovUtils.pick(randomFunction, validOpts);
                        result += opt.ch;

                        continue;
                    }
                }

                // ATTEMPT: 2nd order options
                if(!f.f3o) {
                    key = result.substring(result.length - 2, result.length);
                    opts = set[key];

                    validOpts = [];
                    if(typeof(opts) !== 'undefined') {
                        for(var i = 0; i < opts.length; ++i) {
                            if(!markovUtils.checkThirdOrder(result, opts[i], f, options)
                               && markovUtils.checkNext(result, opts[i], length, f, lrFlag, lfRules, temp)) {

                                validOpts.push(opts[i]);
                            }
                        }
                    }

                    if(validOpts.length > 0) {
                        var opt = markovUtils.pick(randomFunction, validOpts);
                        result += opt.ch;

                        continue;
                    }
                }

                // LAST RESORT: Cut off the last one and try again
                if(result.length > slength) {
                    result = start.s;
                }

                if(++runs > 32) {
                    result = null;
                    break;
                }
            }

            if(result != null) {
                return result;
            }
        }
    }
}

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = algo;
} else {
    algos[algo.id] = algo;
}


var algo = {
    id: "select",
    name: "Simple Random Selection",

    parseList: function(input) {
        return input;
    },

    initTemp: function(data) {
        return null;
    },

    generate: function(data, randomFunction) {
        return data[Math.floor(randomFunction() * data.length)];
    }
}

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = algo;
} else {
    algos[algo.id] = algo;
}


var algo = {
    id: "syllables",
    name: "Syllable Concateration",

    parseList: function(input, options, lfRules) {
        var r = {
            positions: [0],
            groups: [].concat(input),
            size: 0
        };

        for(var i = 0; i < r.groups.length; ++i) {
            var group = r.groups[i];

            if(group.headers.length >= 2) {
                group.weigthMultiplier = parseFloat(group.headers[1]);
            } else {
                group.weigthMultiplier = 1;
            }

            if(group.lines.length <= 1) {
                console.error('SKIPPED "' + group.id + '" (length <= 1)');
                r.groups.splice(i, 1);
                --i;

                continue;
            }

            group.width = group.lines[0].length;

            for(var j = 0; j < group.lines.length; ++j) {
                var line = group.lines[j];

                if(line.length !== group.width) {
                    console.error(JSON.stringify(group));

                    throw new Error("The line " + JSON.stringify(line) + " is not as long as the others in the group ("+group.width+"). No non-conformism!. D:<");
                }

                lfRules.learn(line.join(''));
            }

            var size = group.lines.length * group.width * group.weigthMultiplier;

            r.size += size;
            r.positions.push(r.size);
        }

        return r;
    },

    initTemp: function(data, options, lfRules) {
        var samples = {};

        // Reconstruct samples
        for(var i = 0; i < data.groups.length; ++i) {
            var group = data.groups[i];

            for(var j = 0; j < group.lines.length; ++j) {
                samples[group.lines[j].join('')] = true;
            }
        }

        // Enforce lfoverride
        if(options.hasOwnProperty('lfOverrides')) {
            var keys = Object.keys(options.lfOverrides);

            for(var i = 0; i < keys.length; ++i) {
                lfRules.counts[keys[i]] = options.lfOverrides[keys[i]];
            }
        }

        return samples;
    },

    generate: function(data, randomFunction, lfRules, options, temp) {
        var rand = randomFunction() * data.size;
        var group = null;

        for(var i = 0; i < data.groups.length - 1; ++i) {
            if(rand < data.positions[i + 1]) {
                group = data.groups[i];
                break;
            }
        }

        if(group == null || group == undefined) {
            group = data.groups[data.groups.length - 1];
        }

        var optionAsls = true;
        if(options.hasOwnProperty('asls')) {
            optionAsls = options.asls;
        }

        var result = [];
        var lines = group.lines;
        var prev = null;
        while(result.length < group.width) {
            var i = result.length;
            rand = Math.floor(randomFunction() * group.lines.length);
            var pick = group.lines[rand][i];

            result.push(pick);
            var fail = false;

            // Respect letter frequency rules
            if(!lfRules.check(result.join(''))) {
                fail = true;
            }

            // Avoid same letter syllables
            if(!fail && optionAsls && i > 0
                && (pick.charAt(0) === result[i - 1].charAt(0))) {
                fail = true;
            }

            // Avoid samples, but permit close samples.
            if(!fail && (i === group.width - 1) && temp.hasOwnProperty(result.join(''))) {
                fail = true;
            }

            if(fail) {
                if(pick === prev) {
                    result = [];

                    if(group.lines.length <= group.width) {
                        var group = null;

                        for(var i = 0; i < data.groups.length - 1; ++i) {
                            if(rand < data.positions[i + 1]) {
                                group = data.groups[i];
                                break;
                            }
                        }

                        if(group == null || group == undefined) {
                            group = data.groups[data.groups.length - 1];
                        }
                    }

                    prev = null;
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


var loader = {
    id: "fullname",
    name: "Full Name",

    load: function(tokens, lists, options) {
        var skip = 'NONE';
        var listIds = options.list;
        var replaces = null;

        // Get skip token (for when you just have a last name)
        if(options.hasOwnProperty('skip')) {
            skip = options.skip[0];
        }

        // Check if replacements should be done.
        if(options.hasOwnProperty('replace')) {
            replaces = options.replace;
        }

        // Add the tokens to the right list.
        for(var i = 0; i < tokens.length; ++i) {
            var token = tokens[i];

            if(token === skip) {
                continue;
            }

            if(i >= listIds.length) {
                break;
            }

            token = token.toLowerCase();

            if(replaces !== null) {
                for(var j = 0; j < replaces.length; j += 2) {
                    var fromChars = replaces[j];

                    while(token.indexOf(fromChars) != -1) {
                        token = token.replace(fromChars, replaces[j + 1]);
                    }
                }
            }

            var listId = listIds[i];

            if(!lists.hasOwnProperty(listId)) {
                lists[listId] = [];
            }

            lists[listId].push(token);
        }
    }
}

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = loader;
} else {
    loaders[loader.id] = loader;
}


var nextId = 0;

var loader = {
    id: "tokens",
    name: "Tokenized Part",

    load: function(tokens, lists, options) {
        var headers = options.group;
        var listId = options.list[0];
        var groupId = headers;
        var list = null, group = null;

        // Ensure the list exists, and select it.
        if(!lists.hasOwnProperty(listId)) {
            lists[listId] = [];
        }
        list = lists[listId];

        // Join the name for lowercasing
        var name = tokens.join(' ').toLowerCase();

        // Before splitting it back up, do replacing if requested.
        if(options.hasOwnProperty('replace')) {
            var replaces = options.replace;

            for(var i = 0; i < replaces.length; i += 2) {
                var fromChars = replaces[i];

                while(name.indexOf(fromChars) != -1) {
                    name = name.replace(fromChars, replaces[i + 1]);
                }
            }


        }

        // Split the name again
        tokens = name.split(' ');

        // Get group name
        if(options.hasOwnProperty('idtoken')) {
            if(options.idtoken === 'ALL') {
                groupId = headers.join(' ');
            } else if(options.idtoken === 'ANON') {
                groupId = '.anonymous' + (nextId++);
            } else {
                groupId = headers[parseInt(options.idtoken)];
            }
        }

        // Try find group
        for(var i = 0; i < list.length; ++i) {
            if(list[i].id == groupId) {
                group = list[i];
                break;
            }
        }

        // If unsuccessful, make the group.
        if(group === null) {
            group = {
                id: groupId,
                headers: headers,
                lines: []
            }

            list.push(group);
        }

        // Add the tokens to the group.
        group.lines.push(tokens);
    }
}

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = loader;
} else {
    loaders[loader.id] = loader;
}


function LFRuleSet() {
    this.counts = {};
    this.doubles = {};
}

LFRuleSet.prototype.learn = function(sample) {
    if(sample instanceof Array) {
        for(var i = 0; i < sample.length; ++i) {
            this.learn(sample[i]);
        }
        return;
    }

    for(var i = 0; i < sample.length; ++i) {
        var ch = sample.charAt(i);
        var count = (sample.split(ch).length - 1);

        if(ch == ' ') {
            continue;
        }

        if(sample[i + 1] == ch) {
            this.doubles[ch] = true;
            --count;
            ++i;
        }

        if(this.counts.hasOwnProperty(ch)) {
            if(this.counts[ch] < count) {
                this.counts[ch] = count;
            }
        } else {
            this.counts[ch] = count;
        }
    }
};

LFRuleSet.prototype.check = function(name) {
    for(var i = 0; i < name.length; ++i) {
        var ch = name.charAt(i);
        var count = (name.split(ch).length - 1);

        if((i > 0 && name[i - 1] == ch) || (i < (name.length - 1) && name[i + 1] == ch)) {
            if(this.doubles.hasOwnProperty(ch)) {
                --count;
                ++i;
            } else {
                return false;
            }
        }

        if(ch == ' ') {
            continue;
        }

        if(this.counts.hasOwnProperty(ch)) {
            if(count > this.counts[ch]) {
                return false;
            }
        } else {
            return false;
        }
    }

    return true;
}

LFRuleSet.prototype.export = function() {
    return {
        cs: this.counts,
        ds: this.doubles
    };
}

LFRuleSet.prototype.import = function(data) {
    this.counts = data.cs;
    this.doubles = data.ds;
}

LFRuleSet.prototype.getCount = function(letter) {
    if(this.counts.hasOwnProperty(letter)) {
        return this.counts[letter];
    } else {
        return 0;
    }
}

LFRuleSet.prototype.isDouble = function(letter) {
    return this.doubles.hasOwnProperty(letter);
}


if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = LFRuleSet;
}


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



function NameGenerator(/*obj OR id, name*/) {
    // Initialize
    this.genders = null;
    this.parts = {};
    this.formats = {};
    this.listIds = {};
    this.meta = {};

    // id, name arguments
    if(arguments.length > 1) {
        this.id = arguments[0];
        this.name = arguments[1];

        return;
    }

    var obj = arguments[0];

    // object argument
    this.id = obj.id;
    this.name = obj.name;
    this.genders = obj.genders || ["UNSPECIFIED"];

    if(obj.hasOwnProperty('parts')) {
        var keys = Object.keys(obj.parts);
        for(var i = 0; i < keys.length; ++i) {
            this.addPart(keys[i], obj.parts[keys[i]]);
        }
    }

    if(obj.hasOwnProperty('formats')) {
        var keys = Object.keys(obj.formats);
        for(var i = 0; i < keys.length; ++i) {
            this.addFormat(keys[i], obj.formats[keys[i]]);
        }
    }

    if(obj.hasOwnProperty('meta')) {
        this.meta = obj.meta;
    }
}

NameGenerator.prototype.addPart = function(id, args) {
    this.parts[id] = new NamePart(id, algos[args.algo], args.options, args.format);

    if(args.hasOwnProperty('lfRules')) {
        this.parts[id].lfRules.import(args.lfRules);
    }

    if(args.hasOwnProperty('data')) {
        this.parts[id].setData(args.data);
    }

    if(args.hasOwnProperty('list')) {
        this.listIds[id] = args.list;
    }
}

NameGenerator.prototype.addFormat = function(id, args) {
    this.formats[id] = new NameFormat(id, args.name, args.format);
}

NameGenerator.prototype.addListsFromLoader = function(loader) {
    var keys = Object.keys(this.listIds);

    for(var i = 0; i < keys.length; ++i) {
        var part = this.parts[keys[i]];

        if(loader.lists.hasOwnProperty(keys[i])) {
            part.loadList(loader.lists[keys[i]]);
        }
    }
}

NameGenerator.prototype.addList = function(listId, listData) {
    var keys = Object.keys(this.listIds);

    for(var i = 0; i < keys.length; ++i) {
        var part = this.parts[keys[i]];

        if(this.listIds[part.id] === listId) {
            part.loadList(listData);
        }
    }
}

NameGenerator.prototype.removePart = function(id) {
    delete this.parts[id];
}

NameGenerator.prototype.removeFormat = function(id) {
    delete this.formats[id];
}

NameGenerator.prototype.generate = function(formatId, gender, randomFunction) {
    if(typeof(randomFunction) === 'undefined' || randomFunction === null) {
        randomFunction = Math.random;
    }

    if(typeof(gender) === 'undefined' || gender == null) {
        var r = Math.floor(this.genders.length * randomFunction());
        gender = this.genders[r].toLowerCase();
    } else {
        gender = gender.toLowerCase();
    }

    var format, keys;

    if(typeof(formatId) === 'undefined' || formatId == null) {
        keys = Object.keys(this.formats);
        format = this.formats[keys[0]];

        for(var i = 0; i < keys.length; ++i) {
            var split = keys[i].split('.');
            if(split.length > 1 && split[1] === gender) {
                format = this.formats[keys[i]];
                break;
            }
        }
    } else {
        if(this.formats.hasOwnProperty(formatId + '.' + gender)) {
            format = this.formats[formatId + '.' + gender]
        } else {
            format = this.formats[formatId];
        }
    }

    if(typeof(format) === 'undefined') {
        return null;
    }

    return format.generateParts(this.parts, gender, randomFunction);
}

NameGenerator.prototype.export = function() {
    var r = {
        id: this.id,
        name: this.name,
        genders: this.genders,
        formats: {},
        parts: {},
        meta: this.meta
    };

    var keys = Object.keys(this.formats);
    for(var i = 0; i < keys.length; ++i) {
        var format = this.formats[keys[i]];

        r.formats[keys[i]] = {
            name: format.name,
            format: format.formats
        };
    }

    keys = Object.keys(this.parts);
    for(var i = 0; i < keys.length; ++i) {
        var part = this.parts[keys[i]];
        var key = keys[i];

        r.parts[key] = {
            algo: part.algo.id,
            options: part.options,
            format: part.format.format,
            lfRules: part.lfRules.export()
        };

        if(this.listIds.hasOwnProperty(key)) {
            r.parts[key].list = this.listIds[key];
        }

        if(part.data !== null) {
            r.parts[key].data = part.data;
        }
    }

    return r;
}

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = NameGenerator;
}



function NameGeneratorSet() {
    this.categoryNames = {};
    this.categoryMetaData = {};
    this.generators = {};
}

NameGeneratorSet.prototype.setCategoryName = function(id, name) {
    this.categoryNames[id] = name;
}

NameGeneratorSet.prototype.setCategoryMeta = function(id, meta) {
    this.categoryMetaData[id] = meta;
}

NameGeneratorSet.prototype.getMeta = function(id, key, defaultValue) {
    var catId = id.split('/');
    var gen = this.getGenerator(id);

    if(typeof(defaultValue) === 'undefined') {
        defaultValue = null;
    }

    if(gen !== null && gen.meta.hasOwnProperty(key)) {
        return gen.meta[key];
    } else if(this.categoryMetaData.hasOwnProperty(catId)) {
        var catMeta = this.categoryMetaData[catId];
        if(catMeta.hasOwnProperty(key)) {
            return catMeta[key];
        } else {
            return defaultValue;
        }
    } else {
        return defaultValue;
    }
}

NameGeneratorSet.prototype.getCategoryName = function(id) {
    if(this.categoryNames.hasOwnProperty(id)) {
        return this.categoryNames[id];
    } else {
        return null;
    }
}

NameGeneratorSet.prototype.addGenerator = function(id, generator, preload) {
    if(preload && !(generator instanceof NameGenerator)) {
        return this.generators[id] = new NameGenerator(generator);
    } else {
        return this.generators[id] = generator;
    }
}

NameGeneratorSet.prototype.getGenerator = function(id) {
    // If no full id is provided, find the first best.
    //  This is NOT recommended with a multi-category
    //  generator set.
    if(id.indexOf('/') === -1) {
        // Try every category until one has a generator with
        //  the requested id.
        var categoryKeys = Object.keys(this.categoryNames);
        for(var i = 0; i < categoryKeys.length; ++i) {
            var key = categoryKeys[i] + '/' + id;

            if(this.generators.hasOwnProperty(key)) {
                return this.getGenerator(key);
            }
        }

        // If none can be found, just return null
        return null;
    }

    if(this.generators.hasOwnProperty(id)) {
        // If the generator was previously unloaded, add it
        if(!(this.generators[id] instanceof NameGenerator)) {
            this.generators[id] = new NameGenerator(this.generators[id]);
        }

        return this.generators[id];
    }

    return null;
}

NameGeneratorSet.prototype.export = function() {
    var r = {
        categories: this.categoryNames,
        categoryMetaData: this.categoryMetaData,
        generators: {}
    };

    var keys = Object.keys(this.generators);

    for(var i = 0; i < keys.length; ++i) {
        r.generators[keys[i]] = this.generators[keys[i]].export();
    }

    return r;
}

NameGeneratorSet.prototype.import = function(obj, preload) {
    var keys, key;

    keys = Object.keys(obj.categories);
    for(var i = 0; i < keys.length; ++i) {
       key = keys[i];
       this.setCategoryName(key, obj.categories[key])
    }

    keys = Object.keys(obj.generators);
    for(var i = 0; i < keys.length; ++i) {
       key = keys[i];
       this.addGenerator(key, obj.generators[key], preload);
    }

    if(typeof(obj.categoryMetaData) === 'object' && obj.categoryMetaData !== null) {
        keys = Object.keys(obj.categoryMetaData);
        for(var i = 0; i < keys.length; ++i) {
            key = keys[i];
            this.setCategoryMetaData(key, obj.categoryMetaData[key])
        }
    }
}

NameGeneratorSet.prototype.getGeneratorIds = function() {
    return Object.keys(this.generators);
}

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = NameGeneratorSet;
}



function NamePart(id, algo, options, format) {
    this.id = id;
    this.algo = algo;
    this.options = options;
    this.data = null;
    this.lfRules = new LFRuleSet();
    this.temp = null;

    if(format instanceof PartFormat) {
        this.format = format;
    } else {
        this.format = new PartFormat(format);
    }
}

NamePart.prototype.loadList = function(list) {
    if(typeof(this.options) === 'undefined') {
        this.options = {};
    }

    this.data = this.algo.parseList(list, this.options, this.lfRules);
    this.temp = this.algo.initTemp(this.data, this.options, this.lfRules);
}

NamePart.prototype.setData = function(data) {
    if(typeof(this.options) === 'undefined') {
        this.options = {};
    }

    this.data = data;
    this.temp = this.algo.initTemp(this.data, this.options, this.lfRules);
}

NamePart.prototype.generate = function(randomFunction) {
    if(this.data == null) {
        throw new Error("No data provided! Set the 'data' property on part with id \""+this.id+"\" or use loadList(list)");
        return;
    }

    if(randomFunction == null || randomFunction == undefined) {
        randomFunction = Math.random;
    }

    return this.format.apply(this.algo.generate(this.data, randomFunction, this.lfRules, this.options, this.temp));
}

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = NamePart;
}


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


