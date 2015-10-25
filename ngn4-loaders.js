var fs = require('fs');
var path = require('path');

function requireAll(directory) {
    var dir = path.join(__dirname, directory);
    var results = {};

    require("fs").readdirSync(dir).forEach(function(file) {
        var mod = require("./"+directory+"/" + file);
        results[mod.id] = mod;
    });

    return results;
}

module.exports = requireAll('loaders');
