"use strict";

var NameGenerator = require('./namegenerator.js')

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

     keys = Object.keys(obj.categoryMetaData);
     for(var i = 0; i < keys.length; ++i) {
         key = keys[i];
         this.setCategoryMetaData(key, obj.categoryMetaData[key])
     }
}

NameGeneratorSet.prototype.getGeneratorIds = function() {
    return Object.keys(this.generators);
}

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = NameGeneratorSet;
}
