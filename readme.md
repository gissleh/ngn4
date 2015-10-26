# ngn4 - Open Name Generator Engine
## NOTE
This has nothing to do with the distributed services platfor called "ngn". The name is to remain consistent with ngn3. I'll make a note to search the npm the next time I name a module.

## Install
This module is available in the npm registry under the name ``ngn4``, so ``npm install ngn4`` will work. This is a node.js module, not an end-user application that can be used.

## See it in action
A express-based website can be found [here](http://ngn4.apeloff.com). It generates on the server-side and sends them in batches of 24 to the client, which requests a new batch when there's 12 or fewer in its buffer. It's just for testing, as a well-designed website will take its place when it's finished.

I also made a quick and dirty app to test compiling a name-part in browser, which you can find [here](http://ngn4.apeloff.com/static/test.html).

## About
A few years ago, I was dissatisfied with the lack of name generators for Mass Effect aliens. I took matters in my own hands and started developing my own to fit that. This is the fourth time I've developed one, as the third one, while good enough, was scattered (the compiler was in .NET and separate from the website and all that) and messy.

It's usable right now, and I hope the examples provide enough information if you're looking for something like this. The MIT licence and disclaimer. applies, however. It does not come with any samples, and is not intended to generate a specific type of name.

## Loaders
A loader is what turns formatted samples into structured data the algorithm can compile into usable data. The examples here are basic, as the algorithms provide loader examples relevant to them.

## Run client-side in browser
In linux, run ``node makewebversion.js >/path/to/website/ngn4.js`` and it'll concaterate and process the scripts to a single script that can be used in the browser. It won't use a ngn4 "namespace" there, however. ``algos`` and ``loaders`` are global objects.

### fullname
This loads each token into a separate list, and each list ends up as an array with just the content.

#### Example
```
$loader fullanems
$list first last
John Smith
```

### tokens
This loads each token into a list of "groups" which has the following format.
```json
[
    {
        "id": "CV-CV",
        "headers": ["CV-CV", "2"],
        "lines": [
            ["ra", "na"],
            ["ta", "na"],
            ["da", "ra"]
        ]
    }
]
```

#### Example
This produces the object notated in JSON above
```
$loader tokens
$idtoken 0
$group CV-CV 2
ra na
ta na
da ra
```

## Algorithms
There are two loaders and four 'algorithms' that can be used to generate, and each part can have a different algorithm. The four of them are

### grammar
This uses a set of symbol-lists (called "words") to generate names. All words in a dataset share the symbol-list. A symbol-list can be "SC" (starting-consonant) or "V2" (second vowel), and a word can be ["SC", "V1", "C2", "V2", "CEND"]. For every reference in a word, a random symbol is picked from the list. This can get out of hand fast, so it's recommended only for limited sample materials of 5-20. A symbol can contain more than one character.

**Loader**: tokens
#### Loader Example
```
$loader tokens
$group SC V END
s i la
r a na

$group SV C V END
a n a ya
i l e na
```

This is equalent to the following Backus–Naur notation:
```
<output> ::= <SV><VL><END> | <SV><CL><VL><END>
<SC> ::= "s" | "v",
<SV> ::= "a" | "i"
<V> ::= "i" | "a" | "a" | "e"
<C> ::= "n" | "l"
<END> ::= "la" | "na" | "ya" | "na"
```

### syllables
This is very similar to grammar, but each group keep their own symbol lists. For example, [["da", "ra"], ["va", "li"]] can generate vara and dali. This is ideal for 50 or fewer samples. While it's called syllables, it can generate words from any arbitrary word definition.  

**Loader**: token
#### Loader Example
```
$loader tokens
$idtoken 0

$list first.female
$group C2.2 0.1
Ny reen
Ve reen

# This will fail if another file doesn't have anything
#   to add to this group.
$group C2
La na

$group V2
A ne xi
O ri nia

# ...
```

### markov
This is the method that's been with the generator since ngn1, and learns from the samples without any work other than listing them up. However, it's the most memory-intensive one and least efficient (as in unique names per sample provided). While it's worked well enough with 50 samples, it's best when there's at least a hundred.

**loader**; fullname

#### Loader Example
```
$loader fullname
$skip NONE

$list first.female last
# Source: Online
Dathlyn
Rana
Saalu
Drathyra
Durena Avani
NONE Balen

# ...
```

### select
This is nothing special, but sometimes you just want it to pick a random sample and put it out there. For example, a canon clan name, location name, prefix or particle.

**loader**; fullname

#### Loader Example
See "markov" for loader example, though as of 0.1.3, it doesn't use a skip token.

## Example
This is a long example, and is included in the examples/ folder and can be run with `node example/main.js` from the ngn4 root directory.

### Some notes
Despite the use of "male" and "female" in this example, genders are arbitrary case-insensitve text strings; for versatility is a major goal of this generator. I haven't tested if no genders being specified do affect the generators, so I recommend using a "none" or other placeholder when it doesn't apply to the setting, race, species, etc... it's to generate names for.

Also, it's mostly meant to generate names where an algorithm is used to make unique new ones, and may thus not be suited when picking from a predetermined set is the only way you need it (e.g. to generate names for humans in a present setting). The example below is a bit contrived.

### main.js
```javascript
var ngn4 = require('../ngn4.js'); // Change to "ngn4" in your project

var generator = new ngn4.NameGenerator(require('./examplegen.json'));
var loader = new ngn4.SampleLoader();

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
```
### examplegen.json
```json
{
    "id": "test",
    "name": "Test",
    "genders": [
        "Male",
        "Female"
    ],
    "parts": {
        "first.male": {
            "algo": "select",
            "options": {},
            "list": "first.male",
            "format": "Aa"
        },
        "first.female": {
            "algo": "select",
            "options": {},
            "list": "first.female",
            "format": "Aa",
            "data": [
                "mary",
                "linda",
                "patricia",
                "barbara",
                "elizabeth"
            ]
        },
        "last": {
            "algo": "syllables",
            "options": {},
            "list": "last",
            "format": "Aa"
        }
    },
    "formats": {
        "full_name": {
            "name": "Full Name",
            "format": "{first} {last}"
        },
        "first_name": {
            "name": "First Name",
            "format": "{first}"
        },
        "last_name": {
            "name": "Last Name",
            "format": "{last}"
        }
    }
}
```

## ChangeLog
The changelog is for the node.js module version, and may include silly things like readme being updated.

```
0.3.0
- Formats can now have multiple different output formats (e.g.
    formats.full_name.format = ["{first}, the {title}", "{title} {first}",
    "{first}"])
- Formats can now be gendered, as well; e.g. "full_name.female" and
    "full_name.male". These are chosen when available. This along with the
    other change will make sample files incompatible with 0.2.3 and earlier.

0.2.3
- Updated readme and package.json to reflect that it's now on GitHub.

0.2.2
- Readme...

0.2.1
- Adapted the code to work after makewebversion.js has processed it for browser running. It doesn't affect how it works in node.js

0.2.0
- Made "tokens" loader remove double-spaces and tabs so you can align the
    tokens in sample files. That is not compatible both ways, so I'll bump
    the minor version up.
- Readme edits

0.1.5
- Readme edit (if there's a way to do this without updating the module, my
    email is right there.)
- Fixed the changelog so it displays better on the npm page.

0.1.4
- Replaced shitty example in readme.
- Moved changelog to readme.

0.1.3
- Fixed crash in 0.1.2 because of a mistake in precompiled "grammar", "markov"
    or "syllables" parts.

0.1.2
- "tokens" loader now support replacing, just as "fullname" does. This is for
    when you want for example "sh" to be parsed differently from "s" and "h"
    separately. If "sh" is replaced with "5", be sure to add a "5Rsh;" to the
    part format (The "format" in the json that starts with "Aa" or "aa").
- Added a lfOverrides option to "grammar", "markov" and "syllables" algo to set
    letter frequency rules after loading. This is a band aid fix when a single
    sample adds a unwanted letter frequency rule, like one single name
    containing two 'r's, but the generated results being generally worsened by
    that.
- Moved an changelog entry from 0.1.1 to 0.1.0 as it was put there in error.
- Added an example that should show you how to get started with a single
    generator. It doesn't show how ngn4.NameGeneratorSet works, however.

0.1.1
- Added a debug helper to warn of potential crashes with grammar samples
- Made the option-concateration not concaterate when there's a comment between,
    to avoid long weird groups

0.1.0
- Added grammar algorithms
- Made a quick readme.
- Made it possible to use two or more name parts in a replacable token in
    name-formats. Example: "{first|first_s} {last}" The purpose is to be able
    to use two or more algorithms without adding a separate format. 0.0.x
    versions will not properly handle name formats using this feature.

0.0.3
- Made a simple script to export a browser version of the ngn4 code:
    makewebversion.js. Use "node makewebversion.js >ngn4-web.js" to make one.

0.0.2
- Separated requireAll-scripts from ngn4.js to avoid having to require that
    when those are needed.

0.0.1
- First publish.
```

## Contributing
The generator is complete for my use, but feel free to extend it with another algorithm (and loader if need be) and report (or fix) bugs.

See the scripts in ``loaders/`` and ``algos/`` to get an idea about how to extend that to another algorithm. All loaders get the lines tokenized, but array joins are cheap, especially for a one-time script that end-users won't have to run.

There's no sample repository at the moment. If someone with know-how about the legal aspects of listing names that are part of potentially trademarked or copyrighted fictional material does so, I'll gladly contribute to it and link it from here. Fanfiction and roleplaying communities have been my greatest sources of sample names. Let me know on the email address associated with this user, or the issue tracker, if you made one.

I'm new to github, so I might have to learn some things about git that are unique to projects that does git right.
