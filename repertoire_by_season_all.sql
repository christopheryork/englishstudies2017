SET search_path = warehouse;

-- for matrix of play year vs title

COPY (
  with play_sales as (select * from sales_facts join play_dim ON (play_dim.id IN (play_1_id, play_2_id, play_3_id)))
  select cfrp_season(date) as season,
         author, title,
         count(distinct date) as performances
  from play_sales
  group by author, title, season
  order by author, title, season
) TO '/tmp/repertoire_by_season_all.csv' WITH CSV HEADER;
