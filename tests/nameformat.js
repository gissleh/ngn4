"use strict";

module.exports = function(assert, info, assertList) {
    var ngn4 = require('../ngn4.js');

    var nf = new ngn4.NameFormat('full_name', 'Full Name', '{first} {last}, the {title}');
    info("NameFormat", "Format used for test: " + nf.format);
    assertList("NameFormat", ['first', 'last', 'title'], nf.partIds, "Name part IDs.")
    //assertList("NameFormat", ['{first}', '{last}', '{title}'], nf.replaceIds, "Name replace tokens.")

    var parts = {};
    parts.first = new ngn4.NamePart("first", ngn4.algos.select, {}, "Aa");
    parts.last = new ngn4.NamePart("last", ngn4.algos.select, {}, "Aa");
    parts.title = new ngn4.NamePart("title", ngn4.algos.select, {}, "Aa");
    parts.first2 = new ngn4.NamePart("first2", ngn4.algos.select, {}, "Aa");
    parts.first.loadList(["john", "jane"]);
    parts.last.loadList(["smith", "johnson", "williams", "brown"]);
    parts.title.loadList(["first", "second", "third"]);
    parts.first2.loadList(["kaidan", "ashley"]);


    info("NameFormat", "Example 1: " + nf.generateParts(parts));
    info("NameFormat", "Example 2: " + nf.generateParts(parts));
    info("NameFormat", "Example 3: " + nf.generateParts(parts));

    var parts2 = {};
    parts2.first = new ngn4.NamePart("first", ngn4.algos.select, {}, "Aa");
    parts2.last = new ngn4.NamePart("last", ngn4.algos.select, {}, "Aa");
    parts2.title = new ngn4.NamePart("title", ngn4.algos.select, {}, "Aa");
    parts2.first.loadList(["john"]);
    parts2.last.loadList(["smith"]);
    parts2.title.loadList(["third"]);

    assert("NameFormat", "John Smith, the Third", nf.generateParts(parts2), "Format replacement.")

    var nf2 = new ngn4.NameFormat('full_name', 'Full Name', '{first|first2} {last}, the {title}');

    info("NameFormat", "Example 1: " + nf2.generateParts(parts, null, Math.random));
    info("NameFormat", "Example 2: " + nf2.generateParts(parts, null, Math.random));
    info("NameFormat", "Example 3: " + nf2.generateParts(parts, null, Math.random));

    var nf3 = new ngn4.NameFormat('full_name', 'Full Name', ['{first} {last}, the {title}', "{first} {last}"]);

    info("NameFormat", "Example 1: " + nf3.generateParts(parts, null, Math.random));
    info("NameFormat", "Example 2: " + nf3.generateParts(parts, null, Math.random));
    info("NameFormat", "Example 3: " + nf3.generateParts(parts, null, Math.random));
}
