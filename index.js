import * as d3 from 'd3'

const radius = 2.5

const margins = { left: 65, top: 50, right: 0, bottom: 0 }

d3.text('styles.css', (err, styles) => {
  if(err) throw err

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

    let height = (d3.max(years) - d3.min(years)) * radius * 2
    let width = titles.length * radius * 2

    let y = d3.scaleLinear()
      .domain(d3.extent(years))
      .range([0,height])

    let x = d3.scaleBand()
      .domain(titles)
      .range([0,width])
      .padding(0.05)

    let svg = d3.select('body')
      .append('svg')
        .attr('width', width + margins.left + margins.right)
        .attr('height', height + margins.top + margins.bottom)

    svg.append('style').text(styles)

    svg = svg.append('g')
        .attr('transform', 'translate(' + [margins.left, margins.top] + ')')

    let quantile = d3.scaleQuantile()
      .range(d3.range(5).map(function(i) { return "q" + i + "-5"; }))
      .domain(data.map( (d) => d.performances))

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
          .attr('transform', (d) => 'translate(' + [x(d.author + d.title), y(+d.season.split('-')[0])] + ')')
          .attr('r', radius)
          .append('title')
            .text( (d) => d.title + '\n' + d.author + '\n' + d.season + '\n' + d.performances + ' performances')

    const legend_size = { width: 250, height: 350, padding: 15, margin: 15 }
    const qtile_height = 15

    let legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(' + [width - legend_size.width - legend_size.margin, legend_size.margin] + ')')

    legend.append('rect')
      .attr('width', legend_size.width)
      .attr('height', legend_size.height)
      .attr('stroke', 'grey')
      .attr('fill', 'none')

    let legend_title = legend.append('text')
      .attr('transform', 'translate(' + [ legend_size.padding, legend_size.padding ] + ')')
      .selectAll('tspan')
        .data(['Repertory', 'of the', 'Comédie Française', '1680 - 1793'])
        .enter().append('tspan')
          .attr('y', (d,i) => ((i+1) * 1.5) + 'em')
          .attr('x', 0)
          .text( (d) => d )

    let thresholds = quantile.quantiles()
    let legend_quantiles = legend.append('g')
      .attr('transform', 'translate(' + [legend_size.margin,
                                         legend_size.margin + legend_size.height - legend_size.padding - qtile_height * quantile.range().length ] + ')')
      .selectAll('.qtile')
      .data( quantile.range() )
        .enter().append('g')
          .attr('class', 'qtile')
          .attr('transform', (d,i) => 'translate(0,' + qtile_height * i +')')

    legend_quantiles.append('circle')
      .attr('class', (d) => d )
      .attr('cy', qtile_height / 2)
      .attr('r', qtile_height / 2 - 2)

    legend_quantiles.append('text')
      .attr('x', qtile_height + 2)
      .attr('dy', '.8em')
      .text( (d,i) => (i < thresholds.length) ? '≤ ' + (thresholds[i]-1) : '≥ ' + thresholds[thresholds.length-1] + ' performances')
  })
})
