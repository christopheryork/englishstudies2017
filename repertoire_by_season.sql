SET search_path = warehouse;

-- for matrix of play year vs title

COPY (
  with play_sales as (select distinct * from sales_facts join play_dim ON (play_dim.id IN (play_1_id, play_2_id, play_3_id)) WHERE author <> 'Anonyme'),
       -- remove the having clause to see all authors, not just those performed more than 500 nights
       author_premieres as (select author, cfrp_season(min(date)) as author_premiere_date from play_sales group by author having count(distinct date) > 1200),
       title_premieres as (select author, title, cfrp_season(min(date)) as title_premiere_date from play_sales group by author, title)
  select author, title,
         cfrp_season(date) as season,
         count(distinct date) as performances
  from play_sales
  join author_premieres using (author)
  join title_premieres using (author, title)
  group by author, author_premiere_date, title, title_premiere_date, season
  order by author_premiere_date, author, title_premiere_date, title, season
) TO '/tmp/repertoire_by_season.csv' WITH CSV HEADER;
