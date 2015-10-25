"use strict";

require('./ngn4.js');

process.nextTick(function() {
    function assert(type, expectation, result, description) {
        if(expectation === result) {
            console.log('\x1b[32m[PASS]\x1b[0m ['+type+']: ' + description);
            return true;
        } else {
            console.log('\x1b[31m[FAIL]\x1b[0m ['+type+']: ' + description);
            console.log('\tResult: ' + JSON.stringify(result));
            console.log('\tExpectation: ' + JSON.stringify(expectation));
            return false;
        }
    }

    function assertList(type, expectations, results, description) {
        var alike = (expectations.length == results.length);

        if(alike) {
            for(var i = 0; i < expectations.length; ++i) {
                if(expectations[i] !== results[i]) {
                    alike = false;
                    break;
                }
            }
        }

        if(alike) {
            console.log('\x1b[32m[PASS]\x1b[0m ['+type+']: ' + description);
            return true;
        } else {
            console.log('\x1b[31m[FAIL]\x1b[0m ['+type+']: ' + description);
            console.log('\tResult: ' + JSON.stringify(results));
            console.log('\tExpectation: ' + JSON.stringify(expectations));
            return false;
        }
    }

    function info(type, text) {
        console.log("\x1b[36m[INFO]\x1b[0m ["+type+"]: " + text);
        return true;
    }

    if(process.argv.length >= 3) {
        require('./tests/' + process.argv[2].split('.')[0] + '.js')(assert, info, assertList);
    } else {
        require("fs").readdirSync('./tests/').forEach(function(file) {
            //console.log("\x1b[33m[FILE] " + file + "\x1b[0m");
            require("./tests/" + file)(assert, info, assertList);
        });
    }
});
