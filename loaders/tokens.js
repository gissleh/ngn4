"use strict";

var nextId = 0;

var loader = {
    id: "tokens",
    name: "Tokenized Part",

    load: function(tokens, lists, options) {
        var headers = options.group;
        var listId = options.list[0];
        var groupId = headers;
        var list = null, group = null;

        // Ensure the list exists, and select it.
        if(!lists.hasOwnProperty(listId)) {
            lists[listId] = [];
        }
        list = lists[listId];

        // Join the name for lowercasing
        var name = tokens.join(' ').toLowerCase();

        // Before splitting it back up, do replacing if requested.
        if(options.hasOwnProperty('replace')) {
            var replaces = options.replace;

            for(var i = 0; i < replaces.length; i += 2) {
                var fromChars = replaces[i];

                while(name.indexOf(fromChars) != -1) {
                    name = name.replace(fromChars, replaces[i + 1]);
                }
            }


        }

        // Split the name again
        tokens = name.split(' ');

        // Get group name
        if(options.hasOwnProperty('idtoken')) {
            if(options.idtoken === 'ALL') {
                groupId = headers.join(' ');
            } else if(options.idtoken === 'ANON') {
                groupId = '.anonymous' + (nextId++);
            } else {
                groupId = headers[parseInt(options.idtoken)];
            }
        }

        // Try find group
        for(var i = 0; i < list.length; ++i) {
            if(list[i].id == groupId) {
                group = list[i];
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
        group.lines.push(tokens);
    }
}

if(typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
    module.exports = loader;
} else {
    loaders[loader.id] = loader;
}
