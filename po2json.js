#!/usr/bin/env node

var path = require('path'),
    p2j = require('po2json');


function unparseHeader(header) {
    return Object.keys(header)
        .map(function(x) { return x + ': '+ header[x]; })
        .join('\n') +
        // it always ends with an \n in xgettext-created files
        '\n';
}

function run() {
    if (process.argv.length < 3) {
        console.log("Usage: po2json.js <INPUT>");
        process.exit();
    }

    var name = path.basename(process.argv[2], '.po');
    var parsed = p2j.parseSync(process.argv[2])[name];

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

    console.log(JSON.stringify(data));
}

run();
