import "./styles.scss";
import * as d3 from "d3";

const w = 1000;
const h = 500;
const padding = 60;

function generateTooltipHtml(date, gdp) {
  const dateMonth = Math.ceil((new Date(date).getMonth() + 1) / 3);
  const dateYear = new Date(date).getFullYear();
  return `<div>Q${dateMonth} ${dateYear}</div><div>${gdp} Billion</div>`;
}

fetch(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
)
  .then((res) => res.json())
  .then((response) => {
    const dataSet = response.data;
    console.log(Date.parse(dataSet[0][0]));

    const xScale = d3
      .scaleTime()
      .domain([
        d3.min(dataSet, (d) => d3.timeDay(Date.parse(d[0]))),
        d3.max(dataSet, (d) => d3.timeDay(Date.parse(d[0]))),
      ])
      .range([padding, w - padding]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(dataSet, (d) => d[1])])
      .range([h - padding, padding]);

    const yAxis = d3.axisLeft(yScale);
    const xAxis = d3.axisBottom(xScale);

    const svg = d3
      .select("#svg-container")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0);

    svg
      .selectAll("rect")
      .data(dataSet)
      .enter()
      .append("rect")
      .attr("width", w / dataSet.length)
      .attr("height", (d) => h - yScale(d[1]) - padding)
      .attr("y", (d) => h - (h - yScale(d[1])))
      .attr("x", (d) => xScale(Date.parse(d[0])))
      .attr("class", "bar")
      .attr("data-date", (d) => d[0])
      .attr("data-gdp", (d) => d[1])
      .on("mouseover", (e, d) => {
        d3.select(this).transition().duration("50").attr("opacity", ".85");
        tooltip
          .html(generateTooltipHtml(d[0], d[1]))
          .style("left", `${e.screenX}px`)
          .style("top", `${e.screenY - 100}px`)
          .attr("data-date", d[0]);
        //    .style("left", (d3.event.pageX + 10) + "px")
        //    .style("top", (d3.event.pageY - 15) + "px");
        tooltip.transition().duration(50).style("opacity", 1);
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration("50").attr("opacity", "1");
        //Makes the new div disappear:
        tooltip.transition().duration("50").style("opacity", 0);
      });

    console.log(xScale(Date.parse(dataSet[0][0])));

    svg
      .append("g")
      .attr("transform", `translate(${padding}, 0)`)
      .attr("id", "y-axis")
      .call(yAxis);

    svg
      .append("g")
      .attr("transform", `translate(0, ${h - padding})`)
      .attr("id", "x-axis")
      .call(xAxis);
  });
