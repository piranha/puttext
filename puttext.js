/*
  (c) 2013 Instant Communication Ltd.
  under terms of ISC License
*/

(function(define) {
    return define(function() {
        var pluralRe = /^Plural-Forms:\s*nplurals\s*=\s*(\d+);\s*plural\s*=\s*([^a-zA-Z0-9\$]*([a-zA-Z0-9\$]+).+)$/m;

        function format(s, ctx) {
            return s.replace(/(^|.)\{([^\}]+)\}/g, function(match, prev, k) {
                if (prev === '\\') {
                    return '{' + k + '}';
                }
                return prev + ctx[k.split('#')[0].trim()];
            });
        }


        function parsePlural(header) {
            var rv = {
                pluralNum: 2,
                isPlural: function(n) {
                    return n !== 1;
                }
            };
            if (!header) {
                return rv;
            }

            var match = header.match(pluralRe);
            if (!match) {
                return rv;
            }

            rv.pluralNum = parseInt(match[1], 10);
            var expr = match[2];
            var varName = match[3];

            var code = "(function (" + varName + ") { return " + expr + " })";
            try {
                rv.isPlural = eval(code);
            } catch (e) {
                console.log("Could not evaluate: " + code);
            }
            return rv;
        }

        function gettrans(messages, isPlural, msg1, msg2, num) {
            if (!messages || !messages[msg1]) {
                return num !== undefined && isPlural(num) ? msg2 : msg1;
            }

            var trans = messages[msg1];

            if (msg2 === undefined && num === undefined) {
                return typeof trans === 'string' ? trans : trans[0];
            }

            if (num !== undefined && typeof trans === 'string') {
                throw format('Plural number ({num}) provided for "{msg1}", ' +
                             'but only singular translation exists: {trans}',
                             {num: num, msg1: msg1, trans: trans});
            }

            return trans[+isPlural(num)];
        }

        return function(messages) {
            function puttext(msg1, msg2, num, ctx) {
                // in case of `puttext(msg, ctx);`
                if (typeof msg2 === 'object' && num === undefined &&
                    ctx === undefined) {
                    ctx = msg2;
                    msg2 = undefined;
                }

                var text = gettrans(puttext.messages, puttext.plural,
                                    msg1, msg2, num);
                if (ctx) {
                    return format(text, ctx);
                }
                return text;
            }

            puttext.format = format;
            puttext.setMessages = function(messages) {
                puttext.messages = messages;
                var parsed = parsePlural(messages && messages[""]);
                puttext.pluralNum = parsed.pluralNum;
                puttext.plural = parsed.isPlural;
            };
            puttext.setMessages(messages);

            return puttext;
        };
    });
})(typeof define !== 'undefined' ? define : function(factory) {
    if (typeof module !== 'undefined' && typeof exports !== 'undefined') {
        return module.exports = factory();
    } else {
        return window.puttext = factory();
    }
});
