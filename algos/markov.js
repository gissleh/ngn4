"use strict";

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
