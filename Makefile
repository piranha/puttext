all: puttext.js

%.js: %.coffee
	coffee -bpc $< > $@
