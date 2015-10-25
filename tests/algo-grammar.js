module.exports = function(assert, info, assertList) {
    var ngn4 = require('../ngn4.js');

    var lines = [
        "$loader tokens",
        "$list first",
        "$replace dr 8",
        "$group SC V1 ECC",
        "L u sk",
        "K a kk",
        "$group SC V1 EC",
        "M a k",
        "$group SC V1 C2 V2 ECC",
        "N a dr e k",
        "R e n a k",
        "$group SCC V1 EC",
        "Dr e k",
        "Ch a r"
    ];

    var loader = new ngn4.SampleLoader();
    loader.loadFromLines(lines);

    var p = new ngn4.NamePart("test", ngn4.algos.grammar, {}, "Aa_AA_S");
    p.loadList(loader.lists['first']);

    assert('algo.grammar', 1, p.lfRules.getCount('8'), 'Token loader can replace.');

    info("algo.grammar", "Loaded data: " + JSON.stringify(p.data));

    assertList("algo.grammar", ["lusk", "kakk", "mak", "na8ek", "renak", "8ek", "char"], p.temp, "Sample reconstruction works.");

    info("algo.grammar", "Generated: " + p.generate());
    info("algo.grammar", "Generated: " + p.generate());
    info("algo.grammar", "Generated: " + p.generate());
}
