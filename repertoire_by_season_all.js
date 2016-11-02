import * as d3 from 'd3'

const radius = 1.5

const margins = { left: 65, top: 200, right: 0, bottom: 0 }

d3.text('repertoire_by_season_all.css', (err, styles) => {
  if(err) throw err

  d3.csv('repertoire_by_season_all.csv', (err, data) => {
    if(err) throw err

    data.forEach( (d) => d.performances = +d.performances )

    let premieres = d3.nest()
          .key( (d) => d.author + d.title)
          .rollup( (leaves) => d3.min(leaves.map((d) => d.season)) )
          .object(data)

    let titles = d3.keys(premieres).sort( (a,b) => d3.ascending(premieres[a] + a, premieres[b] + b) )

    let years = data.map( (d) => d.season.split('-').map( (e) => +e ))
      .reduce( (a, b) => a.concat(b), [])

    let height = (d3.max(years) - d3.min(years)) * radius * 2
    let width = titles.length * radius * 2

    let y = d3.scaleLinear()
      .domain(d3.extent(years))
      .range([0,height])

    let x = d3.scaleBand()
      .domain(titles)
      .range([0,width])

    let svg = d3.select('svg')
        .attr('width', width + margins.left + margins.right)
        .attr('height', height + margins.top + margins.bottom)

    svg.append('style').text(styles)

    svg = svg.append('g')
        .attr('transform', 'translate(' + [margins.left, margins.top] + ')')

    let quantile = d3.scaleQuantile()
      .range(d3.range(5).map(function(i) { return "q" + i + "-5"; }))
      .domain(data.map( (d) => d.performances).sort())

    let y_ticks = svg.append('g')
      .selectAll('text')
        .data(y.ticks())
        .enter().append('text')
          .attr('transform', (d) => 'translate(0,' + y(d) + ')')
          .attr('x', -5)
          .attr('dy', '0.33em')
          .attr('text-anchor', 'end')
          .text( (d) => [d, d+1].join('-') )

    let circle = svg.append('g')
      .selectAll('circle')
        .data(data)
        .enter().append('circle')
          .attr('class', (d) => quantile(d.performances))
          .attr('transform', (d) => 'translate(' + [x(d.author+d.title), y(+d.season.split('-')[0])] + ')')
          .attr('r', radius)
          .append('title')
            .text( (d) => d.title + '\n' + d.author + '\n' + d.season + '\n' + d.performances + ' performances')
  })
})
