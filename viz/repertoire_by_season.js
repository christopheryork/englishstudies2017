const radius = 2.5

const margins = { left: 85, top: 200, right: 20, bottom: 20 }

let shorten = function(x, len) {
  if(!x) return ""
  x = "" + x
  if(!len) return x

  let hard = x.search(/\s*[(,;]/)
  hard = (hard > -1) ? hard : Infinity
  let soft = x.indexOf(' ', len)
  soft = (soft > -1) ? soft : Infinity

  return x.slice(0, Math.min(hard, soft))
}

d3.csv('repertoire_by_season.csv', (err, data) => {
  if(err) throw err

  // NB the data file is already in the correct order so we just compute offsets
  let columns = d3.set()
  let author_brackets = {}
  data.forEach( (d,i) => {
    d.performances = +d.performances
    columns.add(d.author + d.title)
    d.index = columns.size()

    let bckts = author_brackets[d.author] || []
    author_brackets[d.author] = d3.extent(bckts.concat([i]))
  })

  let years = data.map( (d) => d.season.split('-').map( (e) => +e ))
    .reduce( (a, b) => a.concat(b), [])

  let height = (d3.max(years) - d3.min(years)) * radius * 2
  let width = columns.size() * radius * 2

  let y = d3.scaleLinear()
    .domain(d3.extent(years))
    .range([0,height])

  let x = d3.scaleLinear()
    .domain([0,columns.size()])
    .range([0,width])

  let svg = d3.select('body')
    .append('svg')
      .attr('width', width + margins.left + margins.right)
      .attr('height', height + margins.top + margins.bottom)

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
        .attr('transform', (d) => 'translate(' + [x(d.index), y(+d.season.split('-')[0])] + ')')
        .attr('r', radius)
        .append('title')
          .text( (d) => d.title + '\n' + d.author + '\n' + d.season + '\n' + d.performances + ' performances')

  const author_title_breakpoint = 3
  let brackets = svg.append('g')
    .selectAll('.author')
      .data(d3.entries(author_brackets))
      .enter().append('g')
      .attr('class', 'author')
      .attr('transform', (d) => {
        let i = data[d.value[0]]
        return 'translate(' + [x(i.index), y(+i.season.split('-')[0])] + ')'
      })
      .attr('visibility', (d) => {
        let i = data[d.value[0]]
        let j = data[d.value[1]]
        return j.index - i.index >= author_title_breakpoint ? 'visible' : 'hidden'
      })

  brackets.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', 15)
    .attr('y', (d) => {
      let i = data[d.value[0]]
      let j = data[d.value[1]]
      return (x(j.index) - x(i.index)) / 2
    })
    .text( (d) => d.key.indexOf('Corneille') > -1 ? d.key : shorten(d.key, 10) )

  brackets.append('path')
    .attr('d', (d) => {
      let i = data[d.value[0]]
      let j = data[d.value[1]]
      return 'M-' + (radius) + ' -5v-3h' + (x(j.index) - x(i.index) + radius) + 'v3'
    })
    .attr('fill', 'none')
    .attr('stroke', 'grey')

  // legend

  const legend_size = { width: 320, height: 110, padding: 10, margin: 15 }
  const qtile_height = 15

  let legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(' + [width - legend_size.width - legend_size.margin, -150 /*legend_size.margin*/] + ')')

  legend.append('rect')
    .attr('width', legend_size.width)
    .attr('height', legend_size.height)
    .attr('stroke', 'grey')
    .attr('fill', 'none')

  let legend_title = legend.append('text')
    .attr('transform', 'translate(' + [ legend_size.padding, legend_size.padding ] + ')')
    .selectAll('tspan')
      .data(['CF Repertory', 'Major Authors', '1680 - 1793'])
      .enter().append('tspan')
        .attr('y', (d,i) => ((i+1) * 1.5) + 'em')
        .attr('x', 0)
        .text( (d) => d )

  let quantiles = quantile.range()
  let legend_quantiles = legend.append('g')
    .attr('transform', 'translate(' + [legend_size.width - 100,
                                       legend_size.margin + legend_size.height - legend_size.padding * 2 - qtile_height * quantile.range().length ] + ')')
    .selectAll('.qtile')
    .data( quantiles )
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
    .text( (d,i) => quantile.invertExtent(d).join(' - '))
})
