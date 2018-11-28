//US Education Data
const EducationData = "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json";
//US County Data
const CountyData = "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json";

// reference used:   http://bl.ocks.org/jadiehm/af4a00140c213dfbc4e6
//  https://bl.ocks.org/mbostock/4122298
// http://duspviz.mit.edu/d3-workshop/mapping-data-with-d3/

var width = 960, height = 600;

var colorDomain = [3.0, 12.0, 21.0, 30.0, 39.0, 48.0, 57.0, 66.0];
var extColorDomain = [0, 3.0, 12.0, 21.0, 30.0, 39.0, 48.0, 57.0, 66.0];
let colors = ["#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c", "#00441b"];

// var legendLabels = ["3%", "12%", "21%", "30%", "39%", "48%", "57%", "66%"]

var colorScale = d3.scaleThreshold()
    .domain(colorDomain)
    // .range(["#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c", "#00441b"]);
    .range(colors);



var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "map");

var path = d3.geoPath()

// Define the div for the tooltip
const tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

d3.queue()
    .defer(d3.json, CountyData)  // load US counties
    .defer(d3.json, EducationData)  // load education data by county
    .await(ready);

// Add description
d3.select("#description")
    .append("text")
    .text("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)");

function ready(error, us, ed) {

    if (error) throw error;

    // associate education data with each county in map
    let countyData = us.objects.counties.geometries;
    countyData.forEach(function (county) {
        var result = ed.filter(function (edCounty) {
            return edCounty.fips === county.id;
        });
        county.properties = (result[0] !== undefined) ? result[0] : null;
    });

    svg.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "county")
        .attr("fill", d => colorScale(d.properties.bachelorsOrHigher))

        .attr("data-education", function (d, i) { return d.properties.bachelorsOrHigher })
        .attr("data-fips", function (d, i) { return d.properties.fips })
        .attr("id", d => d.id)
        .on("mouseover", function (d) {
            tooltip
                .transition()
                .duration(400)
                .style("opacity", 0.9);
            tooltip
                .html(d.properties.area_name + " " + d.properties.state + " " + d.properties.bachelorsOrHigher + "% ")
                .attr("data-education", d.properties.bachelorsOrHigher)
                .style("top", d3.event.pageY - 20 + "px")
                .style("left", d3.event.pageX + 20 + "px");
        })
        .on("mouseout", function (d) {
            tooltip
                .transition()
                .duration(400)
                .style("opacity", 0);
        });

    let legendRectWidth = 40, legendRectHeight = 20;
    let legendWidth = colors.length * legendRectWidth;
    console.log(legendWidth);

    // create the scale for the x axis of the legend
    const lx = d3
        .scaleLinear()
        .domain(colorDomain)
        .range([0, legendRectWidth]);

    // create the x axis on legend
    const lxAxis = d3.axisBottom(lx)
        .tickSize(10)
        .tickSizeOuter(0)
        .tickValues(colorDomain).tickFormat((t) => t + "%");

    var legend = svg.selectAll("g.legend")
        .data(colorDomain)
        .enter().append("g")
        .attr("id", "legend");

    legend
        .append("rect")
        .attr("class", "bar")
        .attr("width", legendRectWidth)
        .attr("height", legendRectHeight)
        .attr("x", (d, i) => i * legendRectWidth)
        .attr("fill", (d, i) => colors[i])
        .attr("transform", "translate(600," + 0 + ")")

    // add the axis of the legend
    legend
        .append("g")
        .attr("transform", "translate(600," + legendRectHeight + ")")
        .call(lxAxis);
}