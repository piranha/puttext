#!/bin/bash

xgettext --language=Python --from-code=utf-8 -c --keyword=__ --keyword=__:1,2 test.js -o out.po
VERSION_CONTROL=none msgmerge -U locale/ru_RU.po out.po
rm out.po


# compile
# msgfmt -cv -o locale/ru_RU.mo locale/ru_RU.po
