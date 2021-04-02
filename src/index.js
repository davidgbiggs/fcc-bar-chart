import "./styles.scss";
import * as d3 from "d3";

const width = 950;
const height = 550;
const padding = 60;

function generateTooltipHtml(date, gdp) {
  const dateMonth = Math.ceil((new Date(date).getMonth() + 1) / 3);
  const dateYear = new Date(date).getFullYear();
  return `<div>Q${dateMonth} ${dateYear}</div><div>$${gdp} Billion</div>`;
}

fetch(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
)
  .then((res) => res.json())
  .then((response) => {
    const dataSet = response.data;

    const svg = d3
      .select("#svg-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // attach x axis
    const xScale = d3
      .scaleTime()
      .domain([
        d3.min(dataSet, (d) => d3.timeDay(Date.parse(d[0]))),
        d3.max(dataSet, (d) => d3.timeDay(Date.parse(d[0]))),
      ])
      .range([padding, width - padding]);

    const xAxis = d3.axisBottom(xScale);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - padding})`)
      .attr("id", "x-axis")
      .call(xAxis);

    // attach y axis
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(dataSet, (d) => d[1])])
      .range([height - padding, padding]);

    const yAxis = d3.axisLeft(yScale);

    svg
      .append("g")
      .attr("transform", `translate(${padding}, 0)`)
      .attr("id", "y-axis")
      .call(yAxis);

    // y axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", padding + 20)
      .attr("x", -height / 2)
      .style("text-anchor", "middle")
      .text("Gross Domestic Product");

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
      .attr("width", width / dataSet.length)
      .attr("height", (d) => height - yScale(d[1]) - padding)
      .attr("y", (d) => height - (height - yScale(d[1])))
      .attr("x", (d) => xScale(Date.parse(d[0])))
      .attr("class", "bar")
      .attr("stroke", "white")
      .attr("stroke-width", 0.2)
      .attr("data-date", (d) => d[0])
      .attr("data-gdp", (d) => d[1])
      .on("mousemove", (e, d) => {
        tooltip
          .html(generateTooltipHtml(d[0], d[1]))
          .style("left", `${e.screenX}px`)
          .style("top", `${e.screenY - 100}px`)
          .attr("data-date", d[0]);
        tooltip.transition().duration("50").style("opacity", 1);
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration("50").attr("opacity", "1");
        // Makes the tooltip disappear:
        tooltip.transition().duration("50").style("opacity", 0);
      });
  });
