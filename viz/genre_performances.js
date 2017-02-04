import * as d3 from 'd3'

const width = 960
const height = 960

const margins = { left: 25, top: 25, right: 25, bottom: 25 }

d3.text('genre_performances.css', (err, styles) => {
  if(err) throw err

  d3.csv('genre_performances.csv', (err, data) => {
    if(err) throw err

    // data processing
    let genres = {}
    data.forEach( (d) => {
      genres[d.genre_1] = 1
      genres[d.genre_2] = 1
      genres[d.genre_3] = 1
    })
    genres = d3.keys(genres).sort()

    let matrix = Array(genres.length)
    genres.forEach( (g,i) => matrix[i] = d3.range(0,genres.length).map( () => 0 ))

    data.forEach( (d) => {
      let i = genres.indexOf(d.genre_1)
      let j = genres.indexOf(d.genre_2)
      matrix[i][j] = +d.performances
    })

    console.log(JSON.stringify(matrix))

    // set up DOM

    let frame = d3.select('svg')
      .attr('width', width + margins.left + margins.right)
      .attr('height', height + margins.top + margins.bottom)

    frame.append('style')
        .text(styles)

    let svg = frame.append('g')
        .attr('transform', 'translate(' + [margins.left, margins.top] + ')')

    let outerRadius = Math.min(width, height) * 0.5 - 40
    let innerRadius = outerRadius - 30

    let chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending)

    let arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)

    let ribbon = d3.ribbon()
        .radius(innerRadius);

    let color = d3.scaleOrdinal()
        .domain(d3.range(4))
        .range(["#FFDD89", "#957244", "#F26223"])

    let g = svg.append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .datum(chord(matrix))

    let group = g.append("g")
        .attr("class", "groups")
      .selectAll("g")
      .data( (chords) => chords.groups )
      .enter().append("g")

    group.append("path")
        .attr("id", (d) => "group" + d.index )
        .style("fill", (d) => color(d.index) )
        .style("stroke", (d) => d3.rgb(color(d.index)).darker() )
        .attr("d", arc)

    group.append("text")
        .attr("x", 6)
        .attr("dy", 15)
        .filter((d) => d.value > 110)
      .append("textPath")
        .attr("xlink:href", (d) => "#group" + d.index )
        .text((d) => genres[d.index] )

    g.append("g")
        .attr("class", "ribbons")
      .selectAll("path")
      .data((chords) => chords )
      .enter().append("path")
        .attr("d", ribbon)
        .style("fill", (d) => color(d.target.index))
        .style("stroke", (d) => d3.rgb(color(d.target.index)).darker())

  })
})
