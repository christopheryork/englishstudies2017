default: author_performances.pdf repertoire_by_season.pdf repertoire_by_season_all.pdf

%.csv : %.sql
	psql cfrp_development -f $<
	mv /tmp/*.csv .

%.es5.js : %.js
	babel $< -o $@

%.pdf : %.html %.css %.csv %.es5.js
	phantomjs ./rasterize.js $< $@

clean :
	rm *.csv
	rm *.es5.js
	rm *.pdf
