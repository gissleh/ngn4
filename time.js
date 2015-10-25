"use strict";

var tokens = ["ae", "thy", "ta"];
var or = ["ae", "æ", "th", "3", "sh", "5", "st", "6"];

for(var zzz = 0; zzz < 5000000; ++zzz) {
    var fullLine = tokens.join(' ');

    for(var i = 0; i < or.length; i += 2) {
        var fr = or[i];

        while(fullLine.indexOf(fr) != -1) {
            fullLine = fullLine.replace(fr, or[i + 1]);
        }
    }

    tokens = fullLine.split(' ');
}
