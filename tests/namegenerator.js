module.exports = function(assert, info, assertList) {
    var ngn4 = require('../ngn4.js');

    var ng = new ngn4.NameGenerator('test', 'Test');

    ng.genders = ["m", "f"];

    ng.addPart('first', {algo: 'syllables', list: "first", options: {lfOverrides: {'i': 1}}, format: 'Aa'});
    ng.addPart('first.f', {algo: 'syllables', list: "first.f", options: {}, format: 'Aa'});
    ng.addPart('title', {algo: 'select', list: "title", options: {}, format: 'Aa'});
    ng.addFormat('full_name.m', {name: "Full Name", format: "{first}, the {title}"});
    ng.addFormat('full_name.f', {name: "Full Name", format: "{title} {first}"});

    ng.addList('first', [{id: ".anon0", headers: [".anon0"], lines: [['e', 'ri', 'nus'], ['a', 'vi', 'rus'], ['i', 'me', 'lix']]}])
    ng.addList('first.f', [{id: ".anon0", headers: [".anon0"], lines: [['e', 'ri', 'na'], ['a', 'vi', 'ra'], ['i', 'me', 'lis']]}])
    ng.addList('title', ["idiot", "derp", "test"])

    info("NameGenerator", "Example 1: " + ng.generate('full_name', 'm'));
    info("NameGenerator", "Example 2: " + ng.generate('full_name', 'f'));
    info("NameGenerator", "Example 3: " + ng.generate('full_name', 'm'));
    info("NameGenerator", "Example 4: " + ng.generate('full_name', 'f'));

    var ngJson = new ngn4.NameGenerator({
        "id": "test2", "name": "Test 2", "genders": ["Male", "Female"],
        "parts": {
            "first": {"algo": "select","options": {},"list": "first","format": "Aa", "data": ["aaa", "bbb", "ccc"]},
            "last": {"algo": "select","list": "last","format": "Aa", "data": ["ddd", "eee", "fff"]}
        },
        "formats": {
            "full_name": {"name": "Full Name","format": "{first} {last}"},
            "first_name": {"name": "Given Name","format": "{first}"},
            "last_name":{"name": "Last Name","format": "{last}"}
        }
    });

    assertList("NameGenerator", ['first', 'last'], Object.keys(ngJson.parts), "part ids");
    assertList("NameGenerator", ['full_name', 'first_name', 'last_name'], Object.keys(ngJson.formats), "formats ids");
    info("NameGenerator", "Example 1: " + ngJson.generate('full_name'));
    info("NameGenerator", "Example 2: " + ngJson.generate('first_name'));
    info("NameGenerator", "Example 3: " + ngJson.generate('last_name'));

    var exported = ng.export();

    assertList("NameGenerator", exported.genders, ng.genders, "Exported genders match original.");
    assertList("NameGenerator", Object.keys(exported.parts), Object.keys(ng.parts), "Exported parts' keys match original.");
    assertList("NameGenerator", Object.keys(exported.formats), Object.keys(ng.formats), "Exported formats' keys match original.");

    assert("NameGenerator", 1, ng.parts.first.lfRules.getCount('i'), "lfOverride works.");
}
