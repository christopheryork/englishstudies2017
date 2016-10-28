import * as d3 from 'd3'

import './styles.css!'

const radius = 3

const margins = { left: 10, top: 10, right: 50, bottom: 35 }

d3.csv('repertoire_by_season.csv', (err, data) => {
  if(err) throw err

  let premieres = d3.nest()
    .key( (d) => d.author + d.title)
    .rollup( (leaves) => d3.min(leaves.map((d) => d.season)) )
    .object(data)

  let titles = d3.keys(premieres).sort( (a,b) => d3.ascending(premieres[a] + a, premieres[b] + b) )

  data.forEach( (d) => d.performances = +d.performances )

  let years = data.map( (d) => d.season.split('-').map( (e) => +e ))
    .reduce( (a, b) => a.concat(b), [])

  let width = (d3.max(years) - d3.min(years)) * radius * 2
  let height = titles.length * radius * 2

  let x = d3.scaleLinear()
    .domain(d3.extent(years))
    .range([0,width])

  let x_axis = d3.axisBottom(x)
    .ticks(10, "f")

  let y = d3.scaleBand()
    .domain(titles)
    .range([0,height])
    .padding(0.05)

  let svg = d3.select('body')
    .append('svg')
      .attr('width', width + margins.left + margins.right)
      .attr('height', height + margins.top + margins.bottom)
    .append('g')
      .attr('transform', 'translate(' + [margins.left, margins.top] + ')')

  svg.append('g')
    .attr('transform', 'translate(' + [0,height] + ')')
    .call(x_axis)
      .selectAll('text')
      .attr('y', 0)
      .attr('x', -9)
      .attr('dy', '.35em')
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'end')

  let quantile = d3.scaleQuantile()
    .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }))
    .domain(data.map( (d) => d.performances))

  let circle = svg.append('g')
    .selectAll('circle')
      .data(data)
      .enter().append('circle')
        .attr('class', (d) => quantile(d.performances))
        .attr('transform', (d) => 'translate(' + [x(+d.season.split('-')[0]), y(d.author + d.title)] + ')')
        .attr('r', radius)
        .append('title')
          .text( (d) => d.title + '\n' + d.author + '\n' + d.season + '\n' + d.performances + ' performances')
})
