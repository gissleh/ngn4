module.exports = function(assert, info, assertList) {
    var ngn4 = require('../ngn4.js');
    var data = {
        "id": "test", "name": "Test", "genders": ["Male", "Female"],
        "parts": {
            "first": {"algo": "select","options": {},"list": "first","format": "Aa", "data": ["aaa", "bbb", "ccc"]},
            "last": {"algo": "select","list": "last","format": "Aa", "data": ["ddd", "eee", "fff"]}
        },
        "formats": {
            "full_name": {"name": "Full Name","format": "{first} {last}"},
            "first_name": {"name": "Given Name","format": "{first}"},
            "last_name":{"name": "Last Name","format": "{last}"}
        }
    };
    var set = new ngn4.NameGeneratorSet();
    var ng1 = new ngn4.NameGenerator(data);

    set.setCategoryName("test", "Test Category");
    set.addGenerator('test/test', ng1);
    set.addGenerator('test/test2', data);

    var ng2 = set.getGenerator('test2');

    if (assert("NameGeneratorSet", true, (ng2 instanceof ngn4.NameGenerator), "ng2 is instance of NameGenerator")) {
        if (assertList("NameGeneratorSet", ['first', 'last'], Object.keys(ng1.parts), "part ids")
            && assertList("NameGeneratorSet", ['full_name', 'first_name', 'last_name'], Object.keys(ng1.formats), "formats ids")) {

            assertList("NameGeneratorSet", Object.keys(ng2), Object.keys(ng1), "preloaded and postloaded match");
            assertList("NameGeneratorSet", Object.keys(ng2.parts), Object.keys(ng1.parts), "preloaded and postloaded match: parts");
            assertList("NameGeneratorSet", Object.keys(ng2.formats), Object.keys(ng1.formats), "preloaded and postloaded match: formats");
        }
    }
}
