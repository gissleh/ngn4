"use strict";

var nextId = 0;

/*
$at_class bcdfghjklmnpqrstvwxyz=C aeiou=V
$at_special y:VyV=C y:VyC=V y:CyC=V
*/

var atlUtils = {
    replaceAt: function(str, index, ch) {
        return str.substr(0, index) + ch + str.substr(index+ch.length);
    }
}

var loader = {
    id: "autotokens",
    name: "Automagical Tokenization",

    load: function(tokens, lists, options) {
        // Make sure defaults are in order.
        if(this.defaults.classes === null) {
            this.setupDefaults();
        }

        var classes = this.defaults.classes;
        var specials = this.defaults.specials;
        var endings = this.defaults.endings;
        var flags = this.defaults.flags;

        var optSyllables = false;
        if(options.hasOwnProperty('at_syllables')) {
            optSyllables = (options.at_syllables[0].toLowerCase() === 'true');
        }

        if(options.hasOwnProperty('at_classes')) {
            var newClasses = {};
            var atClasses = options.at_classes;

            for (var cl in classes) {
                if(classes.hasOwnProperty(cl)) {
                    newClasses[cl] = classes[cl];
                }
            }

            for(var i = 0; i < atClasses.length; ++i) {
                var assignment = atClasses[i].split('=');

                if(assignment.length < 2) {
                    throw new Error('at classes need to be formatted "aeiou=V" or "Ø=V" for single letters');
                }

                var letters = assignment[0];
                var letterClass = assignment[1];

                for(var j = 0; j < letters.length; ++j) {
                    newClasses[letters[j]] = letterClass;
                }
            }

            classes = newClasses;
        }

        // Add custom endings
        if(options.hasOwnProperty('at_endings')) {
            endings = options.at_endings.concat(endings);
        }

        if(options.hasOwnProperty('at_flags')) {
            var newFlags = {};
            var flagKeys = Object.keys(flags);

            for(var i = 0; i < flagKeys; ++i) {
                newFlags[flagKeys[i]] = flags[flagKeys[i]];
            }


            for(var i = 0; i < options.at_flags.length; ++i) {
                newFlags[options.at_flags[i]] = true;
            }

            flags = newFlags;
        }

        for(var i = 0; i < tokens.length; ++i) {
            if(i >= options.list.length) {
                break;
            }

            var listId = options.list[i];
            var list = null, group = null;
            var token = tokens[i].toLowerCase();

            // Ensure the list exists, and select it.
            if(!lists.hasOwnProperty(listId)) {
                lists[listId] = [];
            }
            list = lists[listId];

            // Tokenize
            var r = null, headers;

            if(optSyllables) {
                r = this.getSyllables(token, classes, specials, flags);
                this.applyEndings(r, endings, flags);

                headers = [r.classes.join(',')];
            } else {
                r = this.getFragments(token, classes, specials, flags);
                this.applyEndings(r, endings, flags);
                this.applyNumbers(r, flags);

                headers = r.classes;
            }

            // Construct group id
            var groupId = r.classes.join(',');

            // Try find group
            for(var j = 0; j < list.length; ++j) {
                if(list[j].id == groupId) {
                    group = list[j];
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
            group.lines.push(r.fragments);
        }
    },

    getSyllables: function(name, classes, specials, flags) {
        var cs = this.getClasses(name, classes, specials);

        var r = {
            fragments: [],
            classes: []
        };

        var prev = 'V';
        var currFragment = "";
        var currClass = "";

        for(var i = 0; i < name.length; ++i) {
            var ch = name.charAt(i);
            var cl = cs[i];

            if(cl !== 'V' && prev === 'V') {
                if(currFragment.length > 0) {
                    r.fragments.push(currFragment);
                    r.classes.push(currClass);
                }

                currFragment = "";
                currClass = "";
            }

            currFragment += ch;
            currClass += cl;
            prev = cl;
        }

        if(currFragment.length > 0) {
            r.fragments.push(currFragment);
            r.classes.push(currClass);
        }

        return r;
    },

    getFragments: function(name, classes, specials, flags) {
        var cs = this.getClasses(name, classes, specials);

        var r = {
            fragments: [],
            classes: []
        };

        var prev = 'V';
        var currFragment = "";
        var currClass = "";

        for(var i = 0; i < name.length; ++i) {
            var ch = name.charAt(i);
            var cl = cs[i];

            if(flags.nvc && prev !== null && prev !== 'V') {
                if(cl !== 'V') {
                    prev = cl;
                } else {
                    prev = 'C';
                }
            }

            if(cl !== prev) {
                if(currFragment.length > 0) {
                    r.fragments.push(currFragment);
                    r.classes.push(currClass);
                }

                currFragment = ch;
                currClass = cl;

                prev = cl;
            } else {
                currFragment += ch;
                currClass += cl;

                prev = cl;
            }
        }

        if(currFragment.length > 0) {
            r.fragments.push(currFragment);
            r.classes.push(currClass);
        }

        return r;
    },

    applyEndings: function(r, endings) {
        for(var i = 0; i < endings.length; ++i) {
            var ending = endings[i];
            var valid = null;
            var ef = "";
            var ec = "";

            for(var j = r.fragments.length - 1; j > 0; --j) {
                ef = r.fragments[j] + ef;
                ec = r.classes[j] + ec;

                if(ec.length > ending.length) {
                    break;
                }

                if(ec.length === ending.length) {
                    if(valid !== null && valid.class.length > ending.length) {
                        break;
                    }

                    var match = true;

                    for(var k = 0; k < ending.length; ++k) {
                        var ech = ending[k];

                        if(ech === ech.toUpperCase()) {
                            if(ef.charAt(k) === ef.charAt(k + 1)) {
                                ec = atlUtils.replaceAt(ec, k, 'D');
                            }

                            if(ec[k] !== ech) {
                                match = false;
                                break;
                            }
                        } else {
                            if(ef[k] !== ech) {
                                match = false;
                                break;
                            }
                        }
                    }

                    if(match) {
                        valid = {
                            index: j,
                            fragment: ef,
                            class: ec
                        };
                    }
                }
            }

            if(valid !== null) {
                r.fragments.splice(valid.index);
                r.classes.splice(valid.index);
                r.fragments.push(valid.fragment);
                r.classes.push(valid.class);
            }
        }
    },

    applyNumbers: function(r, flags) {
        var ev = false;
        var sv = false;

        // Start
        if(r.classes.length > 0) {
            sv = (r.classes[0].charAt(0) === 'V');

            r.classes[0] = 'S' + r.classes[0];

            if(flags.lrs) {
                var len =  r.classes.join('').length;
                r.classes[0] = r.classes[0] + "." + len
            }
        } else {
            throw new Error("Can't apply numbers to 0 classes");
        }

        // Ending
        if(r.classes.length > 1) {
            var ind = r.classes.length - 1;
            ev = (r.classes[ind].charAt(0) === 'V');

            r.classes[ind] = 'E' + r.classes[ind];
        }

        // The rest
        var lc = 0;
        var cindex = 1;
        if(!sv) {
            lc = 0;
        }

        var len = r.classes.length;
        for(var i = 1; i < len - 1; ++i) {
            var cl = r.classes[i];
            var isV = (cl.charAt(0) === 'V');

            if(!flags.npn) {
                if(ev && i == len - 2) { // SC V *C* EV
                    cl = cl + 'L'
                } else if(!ev && i >= len - 3) { // SC V *C* *E* C
                    cl = cl + 'L'
                } else { // SC *V* *C* *V* C V EC
                    if(isV) {
                        cl = cl + cindex;
                        cindex++;
                    } else {
                        cl = cl + cindex;
                    }
                }
            }

            r.classes[i] = cl;
        }

        // Length restriction
        if(flags.lrs) {
            r.classes[0] = r.classes[0] + '.' + cindex;
        }

        if(flags.lre) {
            var last = r.classes.length - 1;
            r.classes[last] = r.classes[last] + '.' + cindex;
        }

        return r;
    },

    getClasses: function(name, classes, specials) {
        var results = [];

        for(var i = 0; i < name.length; ++i) {
            results.push(this.getClass(name, i, classes, specials));
        }

        return results;
    },

    getClass: function(name, pos, classes, specials) {
        var ch = name.charAt(pos);

        if(!classes.hasOwnProperty(ch)) {
            classes[ch] = 'O';
        }

        if(specials.hasOwnProperty(ch)) {
            var sp = specials[ch];

            if(pos == 0) {
                if(name.length === 0) {
                    return classes[ch];
                } else {
                    if(name[pos + 1] === ch) {
                        var key = ch + ch;

                        if(sp.hasOwnProperty(key)) {
                            return sp[key];
                        } else {
                            return classes[ch];
                        }
                    } else {
                        var next = this.getClass(name, pos + 1, classes, specials);
                        var key = ch + next;

                        if(sp.hasOwnProperty(key)) {
                            return sp[key];
                        }
                    }
                }
            } else if (pos == name.length - 1) {
                var prev = this.getClass(name, pos - 1, classes, specials);
                var key = prev + ch;

                if(sp.hasOwnProperty(key)) {
                    return sp[key];
                }
            } else {
                if(name[pos + 1] === ch) {
                    var key = ch + ch;

                    if(sp.hasOwnProperty(key)) {
                        return sp[key];
                    } else {
                        return classes[ch];
                    }
                } else {
                    var prev = this.getClass(name, pos - 1, classes, specials);
                    var next = this.getClass(name, pos + 1, classes, specials);

                    var key = prev + ch + next;

                    if(sp.hasOwnProperty(key)) {
                        return sp[key];
                    }
                }
            }
        }

        return classes[ch];
    },

    setupDefaults: function() {
        var consonants = 'bcdfghjklmnpqrstvwxyz';
        var vowels = 'aeiou';
        this.defaults.classes = {};

        for(var i = 0; i < consonants.length; ++i) {
            this.defaults.classes[consonants[i]] = 'C';
        }

        for(var i = 0; i < vowels.length; ++i) {
            this.defaults.classes[vowels[i]] = 'V';
        }
    },

    defaults: {
       specials: {
           "y": {
               "VyV": 'C',
               "VyC": 'V',
               "CyV": 'C',
               "CyC": 'V',
               "Vy": 'V',
               "Cy": 'V',
               "yy": 'V',
               "VyO": 'V',
               "CyO": 'V',
           }
       },
       classes: null,
       endings: [
           "CV", "CCV", "CCCV", "VC", "VCC", "VCCC", "CVV", "CVVV"
       ],
       flags: {
           lre: false,
           lrs: false,
           npn: false,
           nvc: false
       }
   }
}

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = loader;
} else {
    loaders[loader.id] = loader;
}
