"use strict";

var loader = {
    id: "fullname",
    name: "Full Name",

    load: function(tokens, lists, options) {
        var skip = 'NONE';
        var listIds = options.list;
        var replaces = null;

        // Get skip token (for when you just have a last name)
        if(options.hasOwnProperty('skip')) {
            skip = options.skip[0];
        }

        // Check if replacements should be done.
        if(options.hasOwnProperty('replace')) {
            replaces = options.replace;
        }

        // Add the tokens to the right list.
        for(var i = 0; i < tokens.length; ++i) {
            var token = tokens[i];

            if(token === skip) {
                continue;
            }

            if(i >= listIds.length) {
                break;
            }

            token = token.toLowerCase();

            if(replaces !== null) {
                for(var j = 0; j < replaces.length; j += 2) {
                    var fromChars = replaces[j];

                    while(token.indexOf(fromChars) != -1) {
                        token = token.replace(fromChars, replaces[j + 1]);
                    }
                }
            }

            var listId = listIds[i];

            if(!lists.hasOwnProperty(listId)) {
                lists[listId] = [];
            }

            lists[listId].push(token);
        }
    }
}

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = loader;
} else {
    loaders[loader.id] = loader;
}
