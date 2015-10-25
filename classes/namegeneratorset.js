"use strict";

var NameGenerator = require('./namegenerator.js')

function NameGeneratorSet() {
    this.categoryNames = {};
    this.generators = {};
}

NameGeneratorSet.prototype.setCategoryName = function(id, name) {
    this.categoryNames[id] = name;
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
    if(id.indexOf('/') === -1) {
        var categoryKeys = Object.keys(this.categoryNames);

        for(var i = 0; i < categoryKeys.length; ++i) {
            var key = categoryKeys[i] + '/' + id;

            if(this.generators.hasOwnProperty(key)) {
                id = key;
                break;
            }
        }
    }

    if(this.generators.hasOwnProperty(id)) {
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
        generators: {}
    };

    var keys = Object.keys(this.generators);

    for(var i = 0; i < keys.length; ++i) {
        r.generators[keys[i]] = this.generators[keys[i]].export();
    }

    return r;
}

NameGeneratorSet.prototype.import = function(obj) {
     var keys, key;

     keys = Object.keys(obj.categories);
     for(var i = 0; i < keys.length; ++i) {
         key = keys[i];
         this.setCategoryName(key, obj.categories[key])
     }

     keys = Object.keys(obj.generators);
     for(var i = 0; i < keys.length; ++i) {
         key = keys[i];
         this.addGenerator(key, obj.generators[key]);
     }
}

NameGeneratorSet.prototype.getGeneratorIds = function(id) {
    return Object.keys(this.generators);
}

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = NameGeneratorSet;
}
