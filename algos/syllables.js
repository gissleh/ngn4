"use strict";

var algo = {
    id: "syllables",
    name: "Syllable Concateration",

    parseList: function(input, options, lfRules) {
        var r = {
            positions: [0],
            groups: input,
            size: 0
        };

        for(var i = 0; i < input.length; ++i) {
            var group = input[i];

            if(group.headers.length >= 2) {
                group.weigthMultiplier = parseFloat(group.headers[1]);
            } else {
                group.weigthMultiplier = 1;
            }

            if(group.lines.length === 0) {
                continue;
                width = 0;
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
