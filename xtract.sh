#!/bin/bash

xgettext --language=Python --from-code=utf-8 -c --keyword=__ --keyword=__:1,2 test.js -o out.po
VERSION_CONTROL=none msgmerge -U locale/uk_UA.po out.po
rm out.po


## compile
# msgfmt -cv -o locale/uk_UA.mo locale/uk_UA.po
