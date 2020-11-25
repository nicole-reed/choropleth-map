import React, { useEffect } from 'react';
import './App.css';
import axios from 'axios';
import * as topojson from 'topojson';
import * as d3 from 'd3';


function App() {

  // const [counties, setCounties] = useState({})
  // const [education, setEducation] = useState([])

  useEffect(async () => {
    try {
      const countiesResponse = await axios.get('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json')
      const educationResponse = await axios.get('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json')
      console.log(educationResponse)
      drawMap(countiesResponse.data, educationResponse.data)
    } catch (error) {
      console.log('error fetching data:\n', error)
    }
  }, [])

  const drawMap = (countiesData, educationData) => {
    console.log('education data', educationData)

    const percentages = educationData.map(county => county.bachelorsOrHigher)
    console.log('percentages', percentages)
    const percentageDifs = (d3.max(percentages) - d3.min(percentages)) / 6;
    console.log(percentageDifs)

    const getEducationCountyById = (id) => educationData.find(county => county.fips === id)

    // const minPercentage = d3.min(percentages)
    // const maxPercentage = d3.max(percentages)


    const colors = ['#00008b', '#58ccf3', '#94f3b8ee', '#f8cf60', '#ffa500', '#f33d3dc5'];
    const colorScale = d3.scaleQuantize()
      .domain([d3.min(educationData, (d) => d.bachelorsOrHigher), d3.max(educationData, (d) => d.bachelorsOrHigher)])
      .range(colors);


    const svg = d3.select('#chart')
      .append('svg')
      .attr('width', 1000)
      .attr('height', 1000)

    svg.append('text')
      .attr('id', 'description')
      .attr('x', 250)
      .attr('y', 15)
      .text('Adults 25 And Older With a Bachelor\'s Degree Or Higher (2010-2014)')

    const legend = svg.append('g')
      .attr('id', 'legend')

    const legendColors = [];
    for (let i = 0; i < 6; i++) {
      legendColors.push(d3.min(percentages) + ((percentageDifs * i) + (percentageDifs / 2)));
    };
    console.log('legend colors', legendColors)

    legend.selectAll('rect')
      .data(legendColors)
      .enter()
      .append('rect')
      .attr('x', (d, i) => (30 * i) + 815)
      .attr('y', 400)
      .attr('val', d => d)
      .attr('class', 'legend-cell')
      .attr('width', 30)
      .attr('height', 20)
      .style('fill', d => colorScale(d));


    const legendTicks = [];
    for (let i = 0; i < 7; i++) {
      legendTicks.push(d3.min(percentages) + (percentageDifs * i))
    };
    console.log(legendTicks)

    const legendScale = d3.scaleLinear()
      .domain([legendTicks[0], legendTicks[legendTicks.length - 1]])
      .range([815, 814 + (30 * 6)])

    const legendAxis = d3.axisBottom(legendScale)
      .tickValues(legendTicks)
      .tickFormat(d3.format('.1f'))


    legend.append('g')
      .attr('id', 'legend-axis')
      .attr("transform", `translate(0, ${420})`)
      .call(legendAxis);

    legend.append('text')
      .attr('id', 'legend')
      .attr('x', 845)
      .attr('y', 395)
      .text('% By County')

    const map = svg.append('g')

    map.append('g')
      .attr('class', 'county')
      .selectAll('path')
      .data(topojson.feature(countiesData, countiesData.objects.counties).features)
      .enter().append("path")
      .attr('data-fips', (d) => d.id)
      .attr('data-education', (d) => getEducationCountyById(d.id).bachelorsOrHigher)
      .attr('d', d3.geoPath())
      .style('fill', (d) => colorScale(getEducationCountyById(d.id).bachelorsOrHigher))
      .append("title")
      .attr('id', 'tooltip')
      .attr('data-education', (d) => getEducationCountyById(d.id).bachelorsOrHigher)
      .text((d) => `${getEducationCountyById(d.id).area_name}\n${getEducationCountyById(d.id).bachelorsOrHigher}%`)

  }

  return (
    <div className="App">
      <h1 id='title'>United States Educational Attainment</h1>
      <div id='chart'></div>
    </div>
  );
}

export default App;
