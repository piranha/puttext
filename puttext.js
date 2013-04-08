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
                return prev + ctx[k];
            });
        }


        function parsePlural(header) {
            var expr, match, rv, varName;
            rv = {
                pluralNum: 2,
                isPlural: function(n) {
                    return n !== 1;
                }
            };
            if (!header) {
                return rv;
            }
            match = header.match(pluralRe);
            if (!match) {
                return rv;
            }
            rv.pluralNum = parseInt(match[1], 10);
            expr = match[2];
            varName = match[3];

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

            return trans[isPlural(num)];
        }

        return function(messages) {
            function __(msg1, msg2, num, ctx) {
                // in case of `__(msg, ctx);`
                if (typeof msg2 === 'object' && num === undefined &&
                    ctx === undefined) {
                    ctx = msg2;
                    msg2 = undefined;
                }

                var text = gettrans(__.messages, __.plural, msg1, msg2, num);
                if (ctx) {
                    return format(text, ctx);
                }
                return text;
            }

            __.format = format;
            __.setMessages = function(messages) {
                __.messages = messages;
                var parsed = parsePlural(messages && messages[""]);
                __.pluralNum = parsed.pluralNum;
                __.plural = parsed.isPlural;
            };
            __.setMessages(messages);

            return __;
        };
    });
})(typeof define !== 'undefined' ? define : function(factory) {
    return window.puttext = factory();
});
