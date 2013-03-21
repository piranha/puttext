# puttext

Tags: i18n, internationalization, javascript, gettext

puttext is a small internationalization library for JavaScript, modelled after
gettext.

It consists of two parts: Python script to convert compiled translation file
(something.mo) into a JSON for JavaScript to use, and JavaScript library, which
takes JS object and gives you a function to translate your messages.


## API

If you use AMD modules, then puttext should behave as a good AMD module. If you
don't, it assigns itself to a `window.puttext`.

Main function has one argument - object with messages. That's the one you got
after converting your `.mo` file to JSON. And returns a function, which performs
translations. I prefer to call this function `__` (two underscores) in my
code. This is because gettext is usually called `_` in other languages, which is
taken by Underscore.js in JavaScript.

If you have no messages, you can call puttext without arguments and you'll
receive pass-through for English words.

`__` receives one, three or four arguments. When you pass a single argument, it
will return single translated string. In case of three or four arguments, you
enable plural mode and then:

- first two arguments should be strings - one for singular and one for plural
  form;
- third argument should be an integer by which puttext decides which form to
  use;
- (optional) fourths argument is an object used for string formatting.

String formatting rules: in a string like `"{something} to {replace}"` entities
`{something}` and `{replace}` will be replaced with corresponding properties of
an object.


## Examples

Initialization:

```
$.get('/locale/uk_UA.json', function(messages) {
    window.__ = puttext(messages);
});

```

Translate a single string:

```
console.log(__('this is a sample text'));
```

Translate a plural string:

```
function (bottles) {
    console.log(__('1 bottle', 'many bottles', bottles.length));
}
```

Translate a plural string with formatting:

```
function (bottles) {
    console.log(__('1 bottle', '{n} bottles',
                   bottles.length, {n: bottles.length}));
}
```

### Plural forms

Biggest complexity of translation comes from plural forms, and gettext (and
puttext along with it) handles that with a special header named
`Plural-Forms`. This header contains information about amount of plural forms
and a formula to calculate which form should be used for given number. You can
find examples of formulas in
[gettext documentation](http://www.gnu.org/software/gettext/manual/html_node/Plural-forms.html).
Just search there by your language name.

Example of a translation for Ukrainian (3 plural forms):

```
msgid "that's 1 coin"
msgid_plural "that's {n} coins"
msgstr[0] "це одна монета"
msgstr[1] "це {n} монети"
msgstr[2] "це {n} монет"
```
