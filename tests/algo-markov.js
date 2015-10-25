module.exports = function(assert, info, assertList) {
    var ngn4 = require('../ngn4.js');

    var list = [ "dara", "tara", "atana", "etara", "adava"];
    var p = new ngn4.NamePart("test", ngn4.algos.markov, {flagsStr: "as"}, "Aa_AA_S");
    p.loadList(list);

    var ss = [];
    for(var i = 0; i < p.data.starts.length; ++i) {
        ss.push(p.data.starts[i].s);
    }

    var mks = Object.keys(p.data.mids);
    var ms = [];
    for(var i = 0; i < mks.length; ++i) {
        var mids = p.data.mids[mks[i]];

        for(var j = 0; j < mids.length; ++j) {
            ms.push(mks[i] + mids[j].ch);
        }
    }

    var eks = Object.keys(p.data.ends);
    var es = [];
    for(var i = 0; i < eks.length; ++i) {
        var ends = p.data.ends[eks[i]];

        for(var j = 0; j < mids.length; ++j) {
            es.push(eks[i] + ends[j].ch);
        }
    }

    info("algos.markov", "Starts: " + ss.join(', '));
    info("algos.markov", "Mids: " + ms.join(', '));
    info("algos.markov", "Ends: " + es.join(', '));
    assertList("algos.markov", list, p.temp, "Sample Reconstruction");

    var r = [];
    for(var i = 0; i < 5; ++i) {
        try {
            r.push(p.generate());
        } catch(err) {

        }
    }

    info("algos.markov", "Generatoed: " + r.join(', '));
}
