module.exports = function(assert, info, assertList) {
    var ngn4 = require('../ngn4.js');

    var att = ngn4.loaders.autotokens;
    var loader = new ngn4.SampleLoader();

    att.setupDefaults();

    var c = att.defaults.classes;
    var s = att.defaults.specials;
    var e = att.defaults.endings;
    var f = att.defaults.flags;

    assert('loader.autotokens', 'V', att.getClass("name", 1, c, s, f), "'a' is a vowel");
    assert('loader.autotokens', 'C', att.getClass("name", 2, c, s, f), "'m' is a consonant");
    assertList('loader.autotokens', ['C', 'V', 'C', 'V'], att.getClasses("name", c, s, f), '"name" == [C,V,C,V]');
    assertList('loader.autotokens', ['C', 'V', 'V', 'C', 'V'], att.getClasses("nayme", c, s, f), '"nayme" == [C,V,V,C,V]');
    assertList('loader.autotokens', ['C', 'V', 'V', 'V', 'C', 'V'], att.getClasses("nayyme", c, s, f), '"nayyme" == [C,V,V,V,C,V]');
    assertList('loader.autotokens', ['C', 'V', 'V', 'V', 'C', 'V'], att.getClasses("nayyme", c, s, f), '"nayyme" == [C,V,V,V,C,V]');
    assertList('loader.autotokens', ['V','V','V','O','C','C','V','V'], att.getClasses("ayy lmao", c, s, f), '"ayy lmao" == [V,V,V,O,C,C,V,V]');
    assertList('loader.autotokens', ['C', 'V', 'C', 'V', 'V'], att.getClasses("namey", c, s, f), '"namey" == [C,V,C,V,V]');
    assertList('loader.autotokens', ['C', 'V', 'C', 'V'], att.getClasses("namy", c, s, f), '"namy" == [C,V,C,V]');

    var n1 = "ereba", n2 = "manava", n3 = "enyala", n4 = "falere", n5 = "liselle"
    var sr1 = att.getSyllables(n1, c, s, f);
    var sr2 = att.getSyllables(n2, c, s, f);
    var sr3 = att.getSyllables(n3, c, s, f);
    var sr4 = att.getSyllables(n4, c, s, f);
    var sr5 = att.getSyllables(n5, c, s, f);
    var fr1 = att.getFragments(n1, c, s, f);
    var fr2 = att.getFragments(n2, c, s, f);
    var fr3 = att.getFragments(n3, c, s, f);
    var fr4 = att.getFragments(n4, c, s, f);
    var fr5 = att.getFragments(n5, c, s, f);

    e = e.concat(["CeCe", "CeDCe"]);

    assertList('loader.autotokens', ['V', 'CV', 'CV'], sr1.classes, '"ereba" syllables classes');
    assertList('loader.autotokens', ['CV', 'CV', 'CV'], sr2.classes, '"manava" syllables classes');
    assertList('loader.autotokens', ['V', 'CCV', 'CV'], sr3.classes, '"enyala" syllables classes');

    assertList('loader.autotokens', ['e', 're', 'ba'], sr1.fragments, '"ereba" syllables fragments');
    assertList('loader.autotokens', ['ma', 'na', 'va'], sr2.fragments, '"manava" syllables fragments');
    assertList('loader.autotokens', ['e', 'nya', 'la'], sr3.fragments, '"enyala" syllables fragments');

    assertList('loader.autotokens', ['V', 'C', 'V', 'C', 'V'], fr1.classes, '"ereba" fragments classes');
    assertList('loader.autotokens', ['C', 'V', 'C', 'V', 'C', 'V'], fr2.classes, '"manava" fragments classes');
    assertList('loader.autotokens', ['V', 'CC', 'V', 'C', 'V'], fr3.classes, '"enyala" fragments classes');

    assertList('loader.autotokens', ['e', 'r', 'e', 'b', 'a'], fr1.fragments, '"ereba" fragments fragments');
    assertList('loader.autotokens', ['m', 'a', 'n', 'a', 'v', 'a'], fr2.fragments, '"manava" fragments fragments');
    assertList('loader.autotokens', ['e', 'ny', 'a', 'l', 'a'], fr3.fragments, '"enyala" fragments fragments');
    assertList('loader.autotokens', ['f', 'a', 'l', 'e', 'r', 'e'], fr4.fragments, '"enyala" fragments fragments');

    att.applyEndings(fr1, e);
    att.applyEndings(fr2, e);
    att.applyEndings(fr3, e);
    att.applyEndings(fr4, e);
    att.applyEndings(fr5, e);
    att.applyEndings(sr1, e);
    att.applyEndings(sr2, e);
    att.applyEndings(sr3, e);
    att.applyEndings(sr4, e);
    att.applyEndings(sr5, e);

    assertList('loader.autotokens', ['V', 'C', 'V', 'CV'], fr1.classes, '"ereba" fragments classes, endings applied');
    assertList('loader.autotokens', ['C', 'V', 'C', 'V', 'CV'], fr2.classes, '"manava" fragments classes, endings applied');
    assertList('loader.autotokens', ['V', 'CC', 'V', 'CV'], fr3.classes, '"enyala" fragments classes, endings applied');
    assertList('loader.autotokens', ['e', 'r', 'e', 'ba'], fr1.fragments, '"ereba" fragments fragments, endings applied');
    assertList('loader.autotokens', ['m', 'a', 'n', 'a', 'va'], fr2.fragments, '"manava" fragments fragments, endings applied');
    assertList('loader.autotokens', ['e', 'ny', 'a', 'la'], fr3.fragments, '"enyala" fragments fragments, endings applied');
    assertList('loader.autotokens', ['f', 'a', 'lere'], fr4.fragments, '"falere" fragments fragments, endings applied');
    assertList('loader.autotokens', ['l', 'i', 'selle'], fr5.fragments, '"lieselle" fragments fragments, endings applied');

    assertList('loader.autotokens', ['CV', 'CVCV'], sr4.classes, '"falere" syllables classes, endings applied');
    assertList('loader.autotokens', ['CV', 'CVDCV'], sr5.classes, '"lieselle" syllables classes, endings applied');
    assertList('loader.autotokens', ['fa', 'lere'], sr4.fragments, '"falere" syllables fragments, endings applied');
    assertList('loader.autotokens', ['li', 'selle'], sr5.fragments, '"lieselle" syllables fragments, endings applied');

    att.applyNumbers(fr1, e);
    att.applyNumbers(fr2, e);
    att.applyNumbers(fr3, e);
    att.applyNumbers(fr4, e);
    att.applyNumbers(fr5, e);

    assertList('loader.autotokens', ['SV', 'CL', 'VL', 'ECV'], fr1.classes, '"ereba" fragments classes, endings applied');
    assertList('loader.autotokens', ['SC', 'V1', 'CL', 'VL', 'ECV'], fr2.classes, '"manava" fragments classes, endings applied');
    assertList('loader.autotokens', ['SV', 'CCL', 'VL', 'ECV'], fr3.classes, '"enyala" fragments classes, endings applied');
    assertList('loader.autotokens', ['SC', 'VL', 'ECVCV'], fr4.classes, '"falere" fragments fragments, endings applied');
    assertList('loader.autotokens', ['SC', 'VL', 'ECVDCV'], fr5.classes, '"lieselle" fragments fragments, endings applied');

    loader.loadFromLines([
        "$loader autotokens",
        "$list at1",
        "$at_syllables true",
        "Anaya",
        "Manava",
        "Elnora",
        "Salora",
        "Ereba",
        "Enyala",

        "$list at2",
        "$at_syllables false",
        "Anaya",
        "Manava",
        "Elnora",
        "Salora",
        "Ereba",
        "Enyala",

        "$list at3",
        "$at_classes '=S",
        "$at_flags nvc npn",
        "T'Soni"
    ]);

    assert("loader.autotokens", 3, loader.lists.at1.length, '3 groups in at1');
    assert("loader.autotokens", 3, loader.lists.at2.length, '3 groups in at2');

    info('loader.autotokens', "Syllables: " + JSON.stringify(loader.lists.at1));
    info('loader.autotokens', "Fragments: " + JSON.stringify(loader.lists.at2));

    var p1 = new ngn4.NamePart("test", ngn4.algos.syllables, {}, "Aa");
    var p2 = new ngn4.NamePart("test", ngn4.algos.grammar, {}, "Aa");

    p1.loadList(loader.lists.at1);
    p2.loadList(loader.lists.at2);

    info('loader.autotokens', "Syllables / Generated 1: "  + p1.generate());
    info('loader.autotokens', "Syllables / Generated 2: "  + p1.generate());
    info('loader.autotokens', "Syllables / Generated 3: "  + p1.generate());
    info('loader.autotokens', "Grammar / Generated 1: "  + p2.generate());
    info('loader.autotokens', "Grammar / Generated 2: "  + p2.generate());
    info('loader.autotokens', "Grammar / Generated 3: "  + p2.generate());

    f.nvc = true;
    c["'"] = 'S';
    var fr6 = att.getFragments("t'soni", c, s, f);

    assertList('loader.autotokens', ['CSC', 'V', 'C', 'V'], fr6.classes, '"t\'soni" fragments classes');

    assertList('loader.autotokens', ['SCSC', 'V', 'ECV'], loader.lists.at3[0].headers, '"t\'soni" fragments classes in loaded list');
}
