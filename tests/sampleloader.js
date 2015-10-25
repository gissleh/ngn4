"use strict";

module.exports = function(assert, info, assertList) {
    var ngn4 = require('../ngn4.js');

    info("SampleLoader", "Loaders loaded: " + Object.keys(ngn4.loaders));

    var sl = new ngn4.SampleLoader();
    var sl2 = new ngn4.SampleLoader();

    sl.loadFromLines([
        "$list first_s",
        "$loader tokens",
        "$idtoken 0",
        "$group C3",
        "#co mm ent",
        "Se lya na",
        "Li ha  na",
        "Se la  ya",
        "$group C2.1 2",
        "\tRa na",
        "\tDa ra"
    ]);

    sl2.loadFromLines([
        "$source Canon Material",
        "$list first last",
        "$loader fullname",
        "$skip NONE",
        "$replace th 3",
        "$replace ae æ",
        "$replace sh 5",
        "$replace st 6",
        "Aethyta",
        "Alestia",
        "Polgara T'Suzsa",
        "Rana Thanoptis",
        "NONE T'Kisha",
        "NONE Kurin"
    ]);

    info("SampleLoader", "Lists (tokens): " + Object.keys(sl.lists));
    info("SampleLoader", "Groups (tokens): " + JSON.stringify(sl.lists['first_s']));
    info("SampleLoader", "Lists (fullname): " + Object.keys(sl2.lists));
    info("SampleLoader", "Part \"first\" (fullname): " + JSON.stringify(sl2.lists['first']));
    info("SampleLoader", "Part \"last\" (fullname): " + JSON.stringify(sl2.lists['last']));

    if(assert("SampleLoader", true, sl.lists.hasOwnProperty('first_s'), 'tokens: list "first_s" exists')) {
        if(assert("SampleLoader", 2, sl.lists.first_s.length, 'tokens: list "first_s" has two groups')) {
            if(assert("SampleLoader", 3, sl.lists.first_s[0].lines.length, 'tokens: first group in "first_s" has 3 lines')) {
                assertList("SampleLoader", ["se", "lya", "na"], sl.lists['first_s'][0].lines[0], "tokens: first_s group 0 line 0");
                assertList("SampleLoader", ["li", "ha", "na"], sl.lists['first_s'][0].lines[1], "tokens: first_s group 0 line 1");
                assertList("SampleLoader", ["se", "la", "ya"], sl.lists['first_s'][0].lines[2], "tokens: first_s group 0 line 2");
            }
            if(assert("SampleLoader", 2, sl.lists.first_s[1].lines.length, 'tokens: second group in "first_s" has 2 lines')) {
                assertList("SampleLoader", ["ra", "na"], sl.lists['first_s'][1].lines[0], "tokens: first_s group 1 line 0");
                assertList("SampleLoader", ["da", "ra"], sl.lists['first_s'][1].lines[1], "tokens: first_s group 1 line 1");
            }
        }
    }

    if(assert("SampleLoader", true, sl2.lists.hasOwnProperty('first'), 'fullname: list "first" exists')) {
        assertList("SampleLoader", ["æ3yta","ale6ia","polgara","rana"], sl2.lists['first'], "fullname: first list");
    }
    if(assert("SampleLoader", true, sl2.lists.hasOwnProperty('last'), 'fullname: list "last" exists')) {
        assertList("SampleLoader", ["t'suzsa","3anoptis","t'ki5a","kurin"], sl2.lists['last'], "fullname: last list");
    }
}
