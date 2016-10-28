SET search_path = warehouse;

-- for boxplot of authors by performance

COPY (
  select count(distinct date) as performances,
         author
  from sales_facts join play_dim ON (play_dim.id IN (play_1_id, play_2_id, play_3_id))
  group by author
  order by performances desc
) TO '/tmp/author_performances.csv' WITH CSV HEADER;


-- for matrix of play year vs title

COPY (
  with play_sales as (select * from sales_facts join play_dim ON (play_dim.id IN (play_1_id, play_2_id, play_3_id)) WHERE author <> 'Anonyme'),
       author_premieres as (select author, cfrp_season(min(date)) as author_premiere_date from play_sales group by author),
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


-- matrix for chord of genre to genre

CREATE OR REPLACE FUNCTION simple_genre(genre TEXT) RETURNS TEXT AS $$
  SELECT CASE WHEN genre IN ('comédie',
                             'comédie - drame',
                             'comédie héroïque',
                             'comédie-ballet',
                             'drame',
                             'tragi-comédie',
                             'tragi-comédie / tragédie',
                             'tragédie') THEN genre
              WHEN genre IS NULL THEN NULL
              ELSE 'other'
  END
$$ LANGUAGE SQL;

COPY (
  select count(distinct date) as performances,
         simple_genre(play_1.genre) as genre_1,
         simple_genre(play_2.genre) as genre_2,
         simple_genre(play_3.genre) as genre_3
  from sales_facts
  left outer join play_dim play_1 ON (play_1.id = play_1_id)
  left outer join play_dim play_2 ON (play_2.id = play_2_id)
  left outer join play_dim play_3 ON (play_3.id = play_3_id)
  group by genre_1, genre_2, genre_3
  order by performances desc
) TO '/tmp/genre_performances.csv' WITH CSV HEADER;

DROP FUNCTION simple_genre(TEXT);
