"use strict";

var algos = require('../ngn4-algos.js');
var NamePart = require('./namepart.js');
var NameFormat = require('./nameformat.js');

function NameGenerator(/*obj OR id, name*/) {
    // Initialize
    this.genders = null;
    this.parts = {};
    this.formats = {};
    this.listIds = {};

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
    this.genders = obj.genders || null;

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
        parts: {}
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
