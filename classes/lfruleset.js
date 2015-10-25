"use strict";

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
