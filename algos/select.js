"use strict";

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
