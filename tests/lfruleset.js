module.exports = function(assert, info) {
    var LFRuleSet = require('../').LFRuleSet;

    var lf = new LFRuleSet();

    lf.learn("aeian");
    lf.learn("nassana");
    lf.learn("falere");
    lf.learn("a na ya");
    lf.learn("samara");
    lf.learn("tilia");
    lf.learn("careena");

    info("LFRuleSet", "Samples: aeian, nassana, a na ya, samara, tilia, careena")
    info("LFRuleSet", "Rules: " + JSON.stringify(lf.counts));
    info("LFRuleSet", "Doubles: " + Object.keys(lf.doubles).join(', '));

    assert("LFRuleSet", undefined, lf.counts[' '], "Spaces are not counted");
    assert("LFRuleSet", true, lf.check("enyala"), "Valid Name");
    assert("LFRuleSet", false, lf.check("dahlia"), "Invalid Name");
    assert("LFRuleSet", true, lf.check("e nya la"), "Valid Name (Spaces)");
    assert("LFRuleSet", true, lf.check("irissa"), "Valid Name (Double Consonant)");
    assert("LFRuleSet", false, lf.check("mallene"), "Invalid Name (Double Consonant)");
    assert("LFRuleSet", true, lf.check("aleena"), "Valid Name (Double Vowel)");
}
