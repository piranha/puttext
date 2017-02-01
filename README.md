# puttext

Tags: i18n, internationalization, javascript, gettext

puttext is a small internationalization library for JavaScript, modelled after
gettext.

It consists of two parts: Python script to convert compiled translation file
(something.mo) into a JSON for JavaScript to use, and JavaScript library, which
takes JS object and gives you a function to translate your messages.

Dependencies:

- client-side: **none**.
- server-side: Node.js, Python, Shell, GNU gettext (for merging and compiling
  messages).

There is a short rant about it, both
[in Russian](http://solovyov.net/blog/2013/i18n/) and
[in English](http://solovyov.net/en/2013/i18n/).

## Index

- [API](#api)
  - [Additional properties](#additional-properties)
  - [Examples](#examples)
- [Plural forms](#plural-forms)
- [Generating .po](#generating-.po)

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

`__` receives from one to four arguments:

- with a single argument, it will return a single translated string;
- with two arguments, first is considered a string to translate and second is
  context for it (if you have variable parts in your message);
- with three or four arguments, you enable plural mode and then:
  - first two arguments should be strings - one for singular and one for plural
    form;
  - third argument should be an integer by which puttext decides which form to
    use;
  - (optional) fourths argument is an object used for string formatting.

String formatting rules: in a string like `"{something} to {replace # name of
person}"` entities `{something}` and `{replace # name of person}` will be
replaced with corresponding properties of an object, and `# name of person` is
considered to be a commentary for someone who does translation, so only
`replace` is used as a key.

### Additional properties

`__` has few additional properties which can be useful, namely:

- `__.setMessages(messages)` - if you have to have `__` function before you've
  loaded messages, you can set them later using that function. Or you can change
  language in runtime (sounds crazy, you'll get interface in two languages
  simultaneously).

- `__.messages` - currently used messages. Please do not set this property
  directly, use `setMessages` for that (it does more than setting a property).

- `__.format(string, context)` - formatting function, used by `__`, so you can
  use it yourself. Example: `__.format("stuff: {stuff}", {stuff: 5})`.

- `__.plural(number)` - function to check which variant of translation a number
  will use.

- `__.pluralNum` - total number of variants for plural forms.

### Examples

Initialization:

```javascript
$.get('/locale/uk_UA.json', function(messages) {
    window.__ = puttext(messages);
});

// or

window.__ = puttext();
$.get('/locale/uk_UA.json', __.setMessages);
```

Translate a single string:

```javascript
console.log(__('this is a sample text'));
```

Translate a single string with formatting:

```javascript
console.log(__('this happened on {date}', {date: '2010-10-20'}));
```

Translate a single string with comment, this is for the comment to appear in
`.po` file after running `i18n-collect` on your files (note: supports comments
only in this position, before actual phrase inside of the call):

```javascript
console.log(__(/*some comment for phrase*/'this is a sample with comment'));
```

Translate a plural string:

```javascript
function (bottles) {
    console.log(__('1 bottle', 'many bottles', bottles.length));
}
```

Translate a plural string with formatting:

```javascript
function (bottles) {
    console.log(__('1 bottle', '{n} bottles',
                   bottles.length, {n: bottles.length}));
}
```

## Plural forms

One of the complexities of translation comes from plural forms, and this is
handled with a special header named `Plural-Forms`. This header contains
information about amount of plural forms and a formula to calculate which form
should be used for given number. You can find examples of formulas in
[gettext documentation](http://www.gnu.org/software/gettext/manual/html_node/Plural-forms.html).
Just search there by your language name.

So for example Ukrainian would have this header (you'll have to put it in your
`.po` file):

```
Plural-Forms: nplurals=3; \
    plural=n%10==1 && n%100!=11 ? 0 : \
           n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2;
```

And then have a translation like that:

```
msgid "1 bottle"
msgid_plural "{n} bottles"
msgstr[0] "одна пляшка"
msgstr[1] "{n} пляшки"
msgstr[2] "{n} пляшок"
```

## Generating .po

There is a shell script called `i18n-collect` (or `i18n-collect.bat` for
Windows), which calls out to provided `xgettext.js`, and to `msguniq` and
`msgmerge` commands from actual `gettext` package (so make sure it's installed),
which you give a path to a `.po` file (it may exist or may not yet), and a path
to directory (run without arguments to see usage), and it'll collect your
messages.

Run `i18n-collect` without arguments to see usage. Sorry, but `i18n-collect.bat`
can't handle custom markers, just write your own version if you need that.
