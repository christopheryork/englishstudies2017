default: author_performances.png repertoire_by_season.png

%.csv : %.sql
	psql cfrp_development -f $<
	cp /tmp/*.csv .

%.png : %.svg %.csv
	phantomjs ./rasterize.js $< $@

clean:
	rm *.csv
	rm *.png
