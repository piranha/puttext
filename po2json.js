#!/usr/bin/env node

var GetOpt = require('node-getopt'),
    p2j = require('po2json');


function unparseHeader(header) {
    return Object.keys(header)
        .map(function(x) { return x + ': '+ header[x]; })
        .join('\n') +
        // it always ends with an \n in xgettext-created files
        '\n';
}

function run() {

    var getOpt = new GetOpt([
        ['', 'space=[NUMBER]', 'print formatted JSON with spaces (default 0, non-formatted JSON)'],
        ['f', 'formatted', 'Same as --space=2'],
        ['h', 'help', 'display this help']
    ]).bindHelp();

    var opt = getOpt.parseSystem();

    if (!opt.argv.length) {
        return getOpt.showHelp();
    }

    var space = opt.options.formatted === true? 2 : parseInt(opt.options.space) || false;

    try {
        var parsed = p2j.parseFileSync(opt.argv[0]);
    } catch (e) {
        console.error(["Can't parse PO file: ", opt.argv[0]].join());
        console.log(e);
        return;
    }

    var data = {}, item;
    for (var key in parsed) {
        item = parsed[key];
        if (key === '') {
            data[key] = unparseHeader(item);
        } else if (item[0] === null) {
            data[key] = item[1];
        } else {
            data[key] = item.slice(1);
        }
    }

    console.log(JSON.stringify(data, null, space));
}

run();
