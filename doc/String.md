# `String::ns`
Jump to: [Namespaces](#Namespaces), [Functions](#Functions), [Values](#Values)


## Namespaces

## Functions
#### `capitalize::fn`
`(str)::(is_str)`<br/>
Capitalizes the first character of a string, lowercasing the rest. Does not test whether the first character is a letter; if the first character cannot be capitalized, returns the string unharmed.

#### `chars::fn`
`(str)::(is_str)`<br/>
Splits a string into "characters," strings of size 1. Returns an array of "chars." E.g., `chars('abc'); //=> ['a', 'b', 'c']`.

#### `code_at::fn`
`(char)::(is_num)`<br/>
`(char, str)::(is_num, is_str)`<br/>
Returns the unicode representation of the given character in a string.

#### `concat::fn`
`()`<br/>
`(x)::(is_str)`<br/>
`(x, y)`<br/>
`(x, y, z, ...more)`<br/>
Concatenates strings togheter, returning a new string made up of each argument in order.

#### `conj::fn`
`(...args)`<br/>
`conj`oins two strings.

#### `count::fn`
`(str)::(is_str)`<br/>
Tells the length of a string.

#### `empty::fn`
`()`<br/>
Returns an empty string.

#### `ends_with::fn`
`(test)::(is_str)`<br/>
`(test, target)`<br/>
Given a test string and a target to test, returns `true` if the target string ends with the test string.

#### `from::fn`
`(iter)::(or<is_iter, is_undef>)`<br/>
`(iter, separator)::(or<is_iter, is_undef>, is_str)`<br/>
Produces a string from any iterable. Takes an optional separator argument.

#### `from_code::fn`
`(code)::(is_num)`<br/>
Creates a 1-character string from its unicode representation.

#### `includes::fn`
`(test)::(is_str)`<br/>
`(test, target)`<br/>
Given a test string and a target to test, returns `true` if the target string includes the test string.

#### `index_of::fn`
`(search)::(is_str)`<br/>
`(search, target)`<br/>
Takes a search string and a target string, and returns the index of the first character of the search string in the target string, if indeed the target string includes the whole search string. Returns `undefined` if the target string does not include the search string. If there are multiple matches, returns only the first instance.

#### `is_blank::fn`
`(str)::(is_str)`<br/>
Tells if a string is nothing but whitespace (spaces, newlines, tabs, etc.).

#### `is_char::fn`
`(x)`<br/>
Tells if something is a char, i.e. a string of length 1. Returns false if the input is not a string.

#### `is_empty::fn`
`(str)::(is_str)`<br/>
Tells if a string is the empty string.

#### `join_with::fn`
`(separator)::(is_str)`<br/>
`(separator, iter)::(is_str, or<is_iter, is_undef>)`<br/>
Produces a string from any iterable, separator first.

#### `last_index_of::fn`
`(search)::(is_str)`<br/>
`(search, target)`<br/>
Takes a search string and a target string, and returns the index of the first character of the search string in the target string, if indeed the target string includes the whole search string. Returns `undefined` if the target string does not include the search string. If there are multiple matches, returns the last instance.

#### `lowcase::fn`
`(str)::(is_str)`<br/>
Lowercases all characters in a string.

#### `pad_left::fn`
`(size, str)::(is_num, is_str)`<br/>
`(size, str, padding)`<br/>
Pads a string to the left, by prepending spaces, or the optional string given in `padding`, over and over until the string reaches the specified size. It will truncate the padding if need be.

#### `pad_right::fn`
`(size, str)`<br/>
`(size, str, padding)`<br/>
Pads a string to the right, by appending spaces, or the optional string given in `padding`, over and over until the string reaches the specified size. It will truncate the padding if need be.

#### `repeat::fn`
`(times)::(is_num)`<br/>
`(times, str)::(is_num, is_str)`<br/>
Repeats a string a given number of times.

#### `replace::fn`
`(search, replace_with)`<br/>
`(search, replace_with, target)`<br/>
Replaces all instances of a search string in a target string with a replacement string. If no instances of the search are found, returns the original string. Case-sensitive.

#### `replace_first::fn`
`(search, replace_with)`<br/>
`(search, replace_with, target)`<br/>
Replaces the first instance of a search string in a target string with a replacement string. If no instances of the search are found, returns the original string Case-sensitive.

#### `show::fn`
`(str)::(is_str)`<br/>
Shows a string.

#### `slice::fn`
`(str, start)::(is_str, is_num)`<br/>
`(str, start, end)::(is_str, is_num, is_num)`<br/>
Takes a "slice" of a string, returning the substring specified by `start`, and, optionally, `end`. Negative numbers wrap around, taking numbers from the end of the string. E.g., `slice(3, 'foobar'); //=> 'bar'`, and `slice(-2, 'foobar'); //=> 'ar'`.

#### `split::fn`
`(sep)::(is_str)`<br/>
`(sep, str)`<br/>
Splits a string into substrings, using a separator that is also a string. Returns an array of strings. With one argument, returns a function that splits strings using the argument as a separator. With two arguments, splits the second string using the first as the separator.

#### `starts_with::fn`
`(test)::(is_str)`<br/>
`(test, target)`<br/>
Given a test string and a target string to test, returns `true` if the target string starts with the test string.

#### `str::fn`
`()`<br/>
`(x)`<br/>
`(x, y, ...more)`<br/>
Produces a quick and dirty string representation of any arguments it is given, concatenating the resulting strings. It returns strings unharmed. With zero arguments, it returns the empty string. Note that these string representations dispatch to JS's `toString` method on a value, which may not produce lovely or especially informative results: `string({}); //=> '[object Object]'` and `string([1, 2, 3]); //=> '1,2,3'`. For prettier (and slower) output, see `show`.

#### `trim::fn`
`(str)::(is_str)`<br/>
Trims all preceding and trailing whitespace from a string. E.g., `trim('    foo  '); //=>  'foo'`.

#### `trim_left::fn`
`(str)::(is_str)`<br/>
Trims whitespace from the beginning of a string.

#### `trim_right::fn`
`(str)::(is_str)`<br/>
Trims whitespace from the end of a string.

#### `upcase::fn`
`(str)::(is_str)`<br/>
Uppercases all characters in a string.

#### `words::fn`
`(str)::(is_str)`<br/>
Splits a string into "words," by splitting and removing any whitespace, and stripping common punctuation marks. Numbers, emoji, other characters, etc., remain.

## Values
`t`