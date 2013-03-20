# (c) 2013 Instant Communication Ltd.
# under terms of ISC License

((define) ->
  define ->

    pluralRe = /^Plural-Forms:\s*nplurals\s*=\s*(\d+);\s*plural\s*=\s*([^a-zA-Z0-9\$]*([a-zA-Z0-9\$]+).+)$/m

    parsePlural = (header) ->
        match = header.match(pluralRe)
        num = parseInt(pl[1])
        expr = pl[2]
        varName = pl[3]

        try
            fn = eval("function(#{varName}) { return #{expr} }")
        catch e
            fn = (n) -> n != 1

        {pluralNum: num, isPlural: fn}

    format = (s, ctx) ->
        s.replace /(^|.)\{([^\}]+)\}/g, (match, prev, k) ->
            if prev == '\\'
                return '{' + k + '}'
            prev + ctx[k]

    return (messages) ->
        if not messages
            # default rules for English language
            return (msg1, msg2, num) ->
                if num != undefined and num != 1
                    return msg2
                return msg1

        {pluralNum, isPlural} = parsePlural(messages[""])

        return (msg1, msg2, num, ctx) ->
            trans = messages[msg1]
            if msg2 == undefined && num == undefined
                # check in case if some string with plural form was used in
                # non-plural context
                return if typeof trans == 'string' then trans else trans[0]
            if num != undefined and typeof trans == 'string'
                throw "Plural number (#{num}) provided for '#{msg1}', but " +
                    "only singular translation exists: #{trans}"

            text = trans[plural(num)]
            if ctx
                return format(text, ctx)
            return text

)(if typeof define != 'undefined' then define else (factory) ->
    window.puttext = factory())
