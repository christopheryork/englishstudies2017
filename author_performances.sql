SET search_path = warehouse;

-- for boxplot of authors by performance

COPY (
  select count(distinct date) as performances,
         author
  from sales_facts join play_dim ON (play_dim.id IN (play_1_id, play_2_id, play_3_id))
  group by author
  order by performances desc
) TO '/tmp/author_performances.csv' WITH CSV HEADER;
