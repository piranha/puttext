#!/usr/bin/env python

import sys
import json
import gettext


def gettext_json(f, indent=False):
    t = gettext.GNUTranslations(f)
    # for unknown reasons, instead of having plural entries like
    # key: [sg, pl1...]
    # tr._catalog has (key, n): pln,
    keys = sorted(t._catalog)
    ret = {}
    for k in keys:
        v = t._catalog[k]
        if isinstance(k, tuple):
            ret.setdefault(k[0], []).append(v)
        else:
            ret[k] = v
    return json.dumps(ret, ensure_ascii=False, indent=indent)


def main():
    if len(sys.argv) < 2:
        print 'Usage: %s [path-to-translation.mo]' % sys.argv[0]
        sys.exit(0)
    try:
        f = file(sys.argv[1])
    except IOError:
        print 'Cannot find file: %s' % sys.argv[1]
        sys.exit(1)
    print gettext_json(f)


if __name__ == "__main__":
    main()
