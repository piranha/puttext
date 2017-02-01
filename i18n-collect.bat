@echo off


if "%1"=="" (
    echo "Usage: %~nx0 <path-to.po> <dir-with-sources>"
    goto DONE
)

node %~dp0\xgettext.js %2 | msguniq > out.po

IF EXIST %1 (
    msgmerge -U -s %1 out.po
) ELSE (
    COPY out.po $1 > NUL
)

DEL out.po

:DONE