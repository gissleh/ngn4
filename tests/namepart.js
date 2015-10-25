module.exports = function(assert, info) {
    var ngn4 = require('../ngn4.js');

    info('NamePart', 'Algos loaded: ' + Object.keys(ngn4.algos).join(', '));

    var p1 = new ngn4.NamePart("test", ngn4.algos.select, {}, "Aa_AA_S");
    p1.loadList([
        "hurp",
        "durp",
        "surp_ii"
    ]);

    var p2 = new ngn4.NamePart("test", ngn4.algos.syllables, {}, "Aa");
    p2.loadList([
        {
            id: "C2.1",
            headers: ["C2.1"],
            lines: [
                ["ra", "na"],
                ["ta", "na"],
                ["da", "ra"]
            ]
        }, {
            id: "C3",
            headers: ["C3"],
            lines: [
                ['ne', 'ly', 'na'],
                ['sa', 'ma', 'ra'],
                ['se', 'ry', 'na'],
                ['ka', 'la', 'ra'],
                ['sha', '\'i', 'ra'],
                ['sa', 'phy', 'ria'],
                ['na', 'ssa', 'na']
            ]
        }
    ]);

    var r1 = [];
    var r2 = [];
    for(var i = 0; i < 8; ++i) {
        r1.push(p1.generate());
        r2.push(p2.generate());
    }

    info("NamePart", "p1 (static): " + r1.join(', '));
    info("NamePart", "p2 (syllables): " + r2.join(', '));
}
