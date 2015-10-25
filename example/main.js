var ngn4 = require('../ngn4.js'); // Change to "ngn4" in your project

var generator = new ngn4.NameGenerator(require('./examplegen.json'));
var loader = new ngn4.SampleLoader();

/*
    Despite the example using real human names, the generator is not very
    suited for it.

    It's best with fantasy names that aren't from a finite list and
    can be made up from letters, grammar rules or syllables.
*/

/*
    If the "part"s in the laoded .json above has a "data" property,
    which "first.female" does, loading it like this is not necessary.
    For the end user, it's best to supply a ready .json as they're a couple
    dozen milliseconds faster.
*/

loader.loadFromLines([     // There's no included fromFile function as
    "$loader fullname",    //   it's meant to be separate from node.js
    "$list first.male",    //   as much as possible to make it portable
    "james",               //   to browser environments.
    "john",                // When loading files, make sure to remove
    "robert",              //   the '\r' (carriage return) characters
    "michael",
    "william"
]);

loader.loadFromLines([
    "$loader tokens",
    "$idtoken 0", // Take group name from first token after $group.
    "$list last", //   to avoid the weight being part of the id.
    "$group group0", // Name is up to you, and is for when you have multiple
    "Craw ford",     //   files for the same generator.
    "Cald well",
    "New ton",
    "Hamp ton",
    "$group group1 0.5", // Weight multiplier
    "William s",         //   Weight is group width (number of tokens *
    "Erick son",         //   number of lines in group * multiplier)
    "Ander son"
]);

generator.addList('first.male', loader.lists['first.male']);
generator.addList('last', loader.lists['last']);

console.log("Formats: " + Object.keys(generator.formats).join(', '));
console.log("Parts: " + Object.keys(generator.parts).join(', '));

for(var i = 0; i < 3; ++i) {
    console.log(generator.generate()); // first format, random gender
    console.log(generator.generate('last_name')); // last name name, random
    console.log(generator.generate('first_name', 'female')); //       gender
    console.log(generator.generate('first_name', 'MALE')); // case insenitive
    console.log(' ');
}

/*

    Other algorithms are "grammar" and "markov".

    "grammar" is like syllables, but that two or more groups can
    share tokens (be it a syllable, letter, diphtong, ...)

        $group SC VL END
        s i la
        r a na

        $group SV CL VL END
        a n a ya
        i l e na

    This is equalent to this context-free grammar (Backus–Naur notation)
        <output> ::= <SV><VL><END> | <SV><CL><VL><END>
        <SC> ::= "s" | "v",
        <SV> ::= "a" | "i"
        <VL> ::= "i" | "a" | "a" | "e"
        <CL> ::= "n" | "l"
        <END> ::= "la" | "na" | "ya" | "na"

    Both group's VL and END token are shared. This can get out of hand
    fast, so it's not recommended to maintain one with fifty samples.
    "syllables" is more suited for that as each group is self-contained.

    "markov" loads samples like static, but constructs new unique names.
    However, it needs a lot of samples to be effective and would make
    this example more complicated than it needs to be.

        $skip NONE
        $lists first.male last
        Tonn Actus
        Desolas Arterius
        Saren Arterius
        Chellick
        NONE Corinthus
        ...

    Another thing to keep in mind is that two $options in a row have
    their values concaterated, making

        $replace sh 5
        $replace th 7

    equalent to

        $replace sh 5 th 7

    One last thing is that "markov" does not avoid samples by default, but
    does so if {"flags": "as"} is added to "options" in the metadata json.
    Here are all the flags it uses.

    +---------------------------------------------+
    |            GENERATOR FLAGS                  |
    +--------+------------------------------------+
    |  lrs   | Length restriction on start, mid,  |
    |  lrm   | and/or end rules the length of the |
    |  lre   | rule's source sample               |
    +--------+------------------------------------+
    |  f2o   | Force 2nd or 3rd order chain. f3o  |
    |  f3o   | override f2o if both are set       |
    +--------+------------------------------------+
    |  to2c  | Third order on 2 consonants        |
    |  to2v  | and/or vowels                      |
    +--------+------------------------------------+
    |  todc  | Third order on double consonants   |
    |  todv  | and/or vowels                      |
    +--------+------------------------------------+
    |  rlf   | Restrict letter frequency          |
    +--------+------------------------------------+
    |  as    | Avoid samples being generated      |
    +--------+------------------------------------+
*/
