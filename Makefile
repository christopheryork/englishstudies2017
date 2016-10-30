default: queries.sql
	psql cfrp_development -f ./queries.sql
	cp /tmp/*.csv .

png: author_performances.png repertoire_by_season.png

%.png : %.svg
	phantomjs ./rasterize.js $< $@
