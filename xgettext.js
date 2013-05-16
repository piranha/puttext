#!/usr/bin/env node

var path = require('path'),
    fs = require('fs'),
    Getopt = require('node-getopt'),
    U = require('uglify-js');

function check(node, markers) {
    if (!(node instanceof U.AST_Call)) {
        return false;
    }

    for (var i = 0; i < markers.length; i++) {
        var m = markers[i].split('.');
        if (node.start.value === m[0] &&
            node.expression.end.value === m[m.length - 1]) {
            return true;
        }
    }

    return false;
}


function extract(fn, markers) {
    var ast, code, results, visitor, walker;
    results = [];

    visitor = function(node, descend) {
        if (!check(node, markers)) {
            return;
        }

        var a = node.args;
        var entry = ["#: " + fn + ":" + node.start.line];

        if (a.length > 1 && typeof a[1].value === 'string') {
            entry.push([a[0].value, a[1].value]);
        } else {
            entry.push(a[0].value);
        }

        results.push(entry);
    };

    code = fs.readFileSync(fn).toString();
    try {
        ast = U.parse(code);
    } catch (e) {
        console.log(fn);
        throw e;
    }

    walker = new U.TreeWalker(visitor);
    ast.walk(walker);
    return results;
}


function walk(filepath, callback) {
    return fs.stat(filepath, function(err, stat) {
        if (err) {
            return callback(err);
        }

        if (stat.isDirectory()) {
            return fs.readdir(filepath, function(err, files) {
                return files.forEach(function(fn) {
                    return walk(path.join(filepath, fn), callback);
                });
            });
        } else if (path.extname(filepath) === '.js') {
            return callback(null, filepath);
        }
    });
}


function format(s, ctx) {
    return s.replace(/\{([^\}]+)\}/g, function(match, k) {
        return ctx[k];
    });
}

function e(s) {
    return JSON.stringify(s);
}

function format_msgid(data) {
    data = extract_comments(data)
    if (typeof data.m === 'string') {
        return format(data.c + 'msgid {msg}\nmsgstr ""\n',
                           {msg: e(data.m)});
    }
    return format(data.c + 'msgid {one}\nmsgid_plural {two}\n' +
                  'msgstr[0] ""\nmsgstr[1] ""\n',
                  {one: e(data.m[0]), two: e(data.m[1])});
}

function extract_comments(msg) {
    var comments = []

    msg = [].concat(msg).map(function(m) {
        return m.replace(/\{([^\}]+)\}/g, function(_, k) {
            k = k.split('#').map(eval.call, ''.trim)
            if (k[1]) {
                comments.push('#. ' + k[0] + ' - ' + k[1] + '\n')
            }
            return '{' + k[0] + '}'
        })
    })

    return {
        c: comments.join(''), 
        m: msg[1] ? msg : msg[0]
    }
}

function process(fn, markers) {
    if (!markers || !markers.length) {
        markers = ['__'];
    }

    // print minimal sufficient header
    console.log(
        'msgid ""\nmsgstr ""\n"Content-Type: text/plain; charset=UTF-8\\n"\n');

    return walk(fn, function(err, fn) {
        var messages = extract(fn, markers);
        var msg, comment;

        for (var i = 0; i < messages.length; i++) {
            comment = messages[i][0];
            msg = messages[i][1];

            // hard stop if we received something strange
            if (msg === undefined) {
                console.log("ERROR: something went wrong in " + fn);
                process.exit(1);
            }

            // output message string
            console.log(comment);
            console.log(format_msgid(msg));
        }
    });
}


function run() {
    var getopt = new Getopt([
        ['m', 'marker=ARG+',
         'function name identifying a translatable string (default: __)'],
        ['h', 'help', 'display this help']
    ]).bindHelp();

    var opt = getopt.parseSystem();

    if (!opt.argv.length) {
        return getopt.showHelp();
    }

    process(opt.argv[0], opt.options.marker);
}


run();
