const width = 50
const height = 1024
const margins = { left: 150, top: 20, right: 150, bottom: 20 }

const radius = 2.5

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

let fmt = d3.format(',d')

d3.csv('author_performances.csv', (err, data) => {
  if(err) throw err

  data.forEach( (d) => d.performances = +d.performances )
  data.sort( (a,b) => d3.ascending(a.performances, b.performances) )

  let breaks = [ .03, .25, .5, .75, .97 ]
  let thresholds = breaks.map( (q) => {
    return d3.quantile(data, q, (d) => d.performances )
  })

  let svg = d3.select('body')
    .append('svg')
      .attr('width', width + margins.left + margins.right)
      .attr('height', height + margins.top + margins.bottom)

  let g = svg.append('g')
      .attr('transform', 'translate(' + [margins.left, margins.top] + ')')

  let y = d3.scalePow()
    .exponent(0.5)
    .domain(d3.extent(data, (d) => d.performances))
    .range([height, 0])

  let axis = svg.append('g')
    .attr('class', 'axis y')
    .attr('transform', 'translate(' + [0, margins.top] + ')')
    .call(d3.axisLeft()
      .scale(y)
      .ticks(20)
    )

  axis.selectAll('.tick line')
    .attr('x1', width + margins.left + margins.right)
  axis.selectAll('.tick text')
    .attr('x', 35)
    .attr('dy', '1.2em')
    .attr('text-anchor', 'left')

  let threshold = g.selectAll('.threshold')
    .data(thresholds)
    .enter().append('g')
      .attr('class', 'threshold')
      .attr('transform', (d) => 'translate(0,' + Math.round(y(d)) + ')')

  threshold.append('path')
    .attr('d', (d) => 'M0 0H' + width)
  threshold.append('text')
    .attr('x', width)
    .attr('dx', 10)
    .attr('dy', '0.3em')
    .text( (d,i) => fmt(d) + (i === 2 ? ' performance evenings' : '') )

  g.selectAll('.side')
    .data(d3.pairs(thresholds))
    .enter().append('path')
      .attr('class', 'side')
      .attr('d', (d,i) => {
        let center = i === 0 || i === breaks.length - 2
        return center ? 'M' + (width / 2) + ' ' + Math.round(y(d[0])) + 'V' + Math.round(y(d[1]))
                      : 'M0 ' + Math.round(y(d[0])) + 'V' + Math.round(y(d[1])) +
                        'M ' + width + ' ' + Math.round(y(d[0])) + 'V' + Math.round(y(d[1]))
      })

  let outdata = data.filter( (d) => d.performances < d3.min(thresholds) || d.performances > d3.max(thresholds) )

  let outlier = g.selectAll('.outlier')
    .data(outdata)
    .enter().append('g')
      .attr('class', 'outlier')
      .attr('transform', (d) => 'translate(' + [width/2, Math.round(y(d.performances))] + ')')

  outlier.append('circle')
    .attr('r', radius)
    .attr('fill', 'none')

  outlier.append('text')
    .attr('dy', '0.3em')
    .attr('x', (d,i) => (i % 2 ? 1 : -1) * 10)
    .attr('text-anchor', (d,i) => i % 2 ? 'start' : 'end')
    .text( (d) => [shorten(d.author, 10), fmt(d.performances)].join('  '))
})
