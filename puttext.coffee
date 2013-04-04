###
# (c) 2013 Instant Communication Ltd.
# under terms of ISC License
###

((define) ->
  define ->

    pluralRe = /^Plural-Forms:\s*nplurals\s*=\s*(\d+);\s*plural\s*=\s*([^a-zA-Z0-9\$]*([a-zA-Z0-9\$]+).+)$/m

    parsePlural = (header) ->
        rv = {pluralNum: 2, isPlural: (n) -> n != 1}
        return rv unless header

        match = header.match(pluralRe)
        return rv unless match

        rv.pluralNum = parseInt(match[1])
        expr = match[2]
        varName = match[3]

        try
            rv.isPlural = eval("function(#{varName}) { return #{expr} }")
        catch e
            true

        return rv

    format = (s, ctx) ->
        s.replace /(^|.)\{([^\}]+)\}/g, (match, prev, k) ->
            if prev == '\\'
                return '{' + k + '}'
            prev + ctx[k]

    return (messages) ->
        __ = (msg1, msg2, num, ctx) ->
            # single message with formatting context
            if typeof msg2 == 'object' and num == undefined and ctx == undefined
                ctx = msg2
                msg2 = undefined

            if not __.messages or not __.messages[msg1]
                if num != undefined and __.plural(num)
                    text = msg2
                else
                    text = msg1
            else
                trans = __.messages[msg1]
                if msg2 == undefined and num == undefined
                    text = if typeof trans == 'string' then trans else trans[0]
                else
                    if num != undefined and typeof trans == 'string'
                        throw "Plural number (#{num}) provided for '#{msg1}', " +
                            "but only singular translation exists: #{trans}"
                    text = trans[__.plural(num)]

            if ctx
                return format(text, ctx)
            return text

        __.format = format

        __.setMessages = (messages) ->
            __.messages = messages
            {pluralNum, isPlural} = parsePlural(messages?[""])
            __.pluralNum = pluralNum
            __.plural = isPlural

        __.setMessages(messages)

        return __

)(if typeof define != 'undefined' then define else (factory) ->
    window.puttext = factory())
