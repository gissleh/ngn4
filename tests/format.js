module.exports = function(assert) {
    var PartFormat = require('../').PartFormat;

    var n1 = "miranda";
    var n2 = "garrus";
    var n3 = "t'loak";
    var n4 = "mordin_solus";
    var n5 = "æ3yta";
    var n6 = "3ane_krios";
    var n7 = "garot_ii";

    assert('NameFormat', "Miranda", new PartFormat("Aa").apply(n1),
        "Aa (Basic Capitalization)");
    assert('NameFormat', "mIRANDA", new PartFormat("aA").apply(n1),
        "aA (Basic Capitalization)");
    assert('NameFormat', "GARRUS", new PartFormat("AA").apply(n2),
        "AA (Basic Capitalization)");
    assert('NameFormat', "garrus", new PartFormat("aa").apply(n2),
        "aa (Basic Capitalization)");
    assert('NameFormat', "T'Loak", new PartFormat("Aa'A").apply(n3),
        "Aa'A (Capitalization after Character)");
    assert('NameFormat', "Mordin Solus", new PartFormat("Aa_S_A").apply(n4),
        "Aa_S_A (Space Replace)");
    assert('NameFormat', "Aethyta", new PartFormat("Aa3Rth;æRae;").apply(n5),
        "Aa3Rth;æRae; (Expand Replace)");
    assert('NameFormat', "Thane Krios", new PartFormat("Aa_S3Rth;_A").apply(n6),
        "Aa_S3Rth;_A (All of them)");
    assert('NameFormat', "Garot II", new PartFormat("Aa_S_AA").apply(n7),
        "Aa_S_AA (All Uppercase)");
    assert('NameFormat', "Mordin Solus", new PartFormat("Aa_S_Aa").apply(n4),
        "Aa_S_Aa (Not Uppercase)");
}
