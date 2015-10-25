var fs = require('fs');
var path = require('path');

var result = '"use strict";\nvar algos = {};\nvar loaders = {};';

function run() {
    var directories = getDirectories('./');

    console.error("[INFO] Directories: " + directories.join(' '));

    for(var i = 0; i < directories.length; ++i) {
        var dir = directories[i];

        if(dir.charAt(0) === '.' || dir === "example" || dir === 'node_modules' || dir === 'tests') {
            continue;
        }

        processFiles(dir, parse);
    }
}

function parse(data, directory, isLast) {
    var lines = data.split('\n');
    for(var i = 0; i < lines.length; ++i) {
        if(lines[i].indexOf('= require') !== -1) {
            continue;
        }

        if(lines[i].indexOf('"use strict";') !== -1) {
            continue;
        }

        result += lines[i] + '\n';
    }

    if(isLast) {
        console.log(result);
    }
}




// Adapted from solution in here http://stackoverflow.com/questions/10049557/reading-all-files-in-a-directory-store-them-in-objects-and-send-the-object
function processFiles(directory, callback) {
    var data;

    fs.readdir(directory, function(err, files){
        if (err) {
            throw err;
        }

        var c = 0;

        files.forEach(function(file){
            if(fs.statSync(path.join(directory, file)).isDirectory()) {
                return;
            }

            c++;

            fs.readFile(directory+'/'+file,'utf-8',function(err, data) {
                if (err) {
                    throw err;
                }

                var isLast = (--c === 0);

                callback(data, directory, isLast);
            });
        });
    });
}

// http://stackoverflow.com/questions/18112204/get-all-directories-within-directory-nodejs
function getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function(file) {
        return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
}

run();
