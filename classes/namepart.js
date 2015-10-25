"use strict";

var PartFormat = require('./partformat.js');
var LFRuleSet = require('./lfruleset.js')

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
