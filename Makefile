default:
	psql cfrp_development -f ./queries.sql
	cp /tmp/*.csv .
