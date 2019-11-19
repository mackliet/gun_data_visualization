import * as d3 from "d3";
import {ScaleLinear, ScaleSequential} from "d3";
import {Selection} from 'd3-selection';
import * as topojson from 'topojson';
import {Feature} from 'geojson';
import {IView} from "./IView";
import {MigrationData, MigrationPatterns} from "../Data/MigrationPatterns";
import {RegionEnum} from "../Data/DataUtils"
import {Dimensions} from "../Utils/svg-utils";
import {ViewState} from "./ViewUtils";

const stateId = (name: string) => {
    name = name.replace(/\s/g, "");
    return `state${name}`;
};

export class HeatMap implements IView {

    readonly curYear: number;
    readonly migrationPatterns: MigrationPatterns;
    readonly currentData: MigrationData;
    readonly svg: Selection<any, any, any, any>;
    private readonly path;
    private readonly geoLegend: string;
    private colorScale: ScaleLinear<number, number>;
    private legendScale: ScaleSequential<string>;
    private state: ViewState = ViewState.net;
    private currentRegion: RegionEnum;
    private dataSelection;
    private us;
    private g: Selection<any, any, any, any>;


    constructor(patterns: MigrationPatterns, container: Selection<any, any, any, any>,
                svgDims: Dimensions, startYear: number = 2017) {
        this.curYear = startYear;
        this.migrationPatterns = patterns;
        this.currentData = patterns.data;
        this.svg = container.append('svg').attr('height', svgDims.height).attr('width', svgDims.width);
        d3.select('.geoLegendContainer').append('div').attr('id', 'geoLegend').attr('width', 80).attr('height', 100);
        this.geoLegend = '#geoLegend';
        this.path = d3.geoPath();
        this.setColorScale();
        d3.json("https://d3js.org/us-10m.v2.json").then((us) => {
            this.us = us;
            /**
             * Adapted from https://bl.ocks.org/mbostock/4090848
             */
            this.g = this.svg.append('g');
            this.drawMap(null);
            // Borders
            this.svg.append("path")
                .attr("class", "state-borders")
                .attr("d", this.path(topojson.mesh(us, us.objects.states, function (a, b) {
                    return a !== b;
                })))
        });

    }

    drawMap(stateSelected: RegionEnum) {
        this.currentRegion = stateSelected;
        this.setColorScale();
        this.updateLegend();
        // States
        this.dataSelection = this.g.selectAll('path')
        //@ts-ignore
            .data<Feature>(topojson.feature(this.us,  this.us.objects.states ).features);
        const enter = this.dataSelection.enter()
            .append('path').attr('d', this.path).attr("class", "states")
            .attr('id', (d) => {
                return stateId(d.properties.name)
            })
            .style('fill', (d) => {
                return this.stateFill(d, stateSelected)
            })
            .on('mouseover', (d) => {
                const name = d.properties.name;
                const nodeId = RegionEnum[name];
                const id = stateId(d.properties.name);
                d3.select(`#${id}`).style('fill', 'darkgray');
            }).on('mouseout', (d) => {
            const id = stateId(d.properties.name);
            d3.select(`#${id}`).style('fill', this.stateFill(d, this.currentRegion));
        }).on('click', (d) => this.focusNode(d));

        this.dataSelection.merge(enter).style('fill', (d) => {
            return this.stateFill(d, stateSelected)
        });

        this.dataSelection.exit(enter).remove();

    }

    focusNode(feature: Feature) {
        let region = RegionEnum[feature.properties.name];
        //@ts-ignore
        if (region === this.currentRegion) {
            region = null;
        }
        d3.select('.region-select').attr('text', feature.properties.name);
        //@ts-ignore
        this.drawMap(region);
    }

    stateFill(d: Feature, stateSelection: RegionEnum) {
        const name = d.properties.name;
        const nodeId = RegionEnum[name];
        let flowData: number;
        if (stateSelection === null) {
            switch (this.state) {
                case ViewState.out:
                    flowData = this.currentData[this.curYear][nodeId].totalLeft;
                    break;
                case ViewState.in:
                    flowData = this.currentData[this.curYear][nodeId].totalCame;
                    break;
                default:
                    flowData = this.currentData[this.curYear][nodeId].netImmigrationFlow;
            }

        } else {
            switch (this.state) {
                case ViewState.out:
                    if (this.currentData[this.curYear][nodeId].toEdges.hasOwnProperty(stateSelection)) {
                        flowData = this.currentData[this.curYear][nodeId].toEdges[stateSelection].estimate;
                    } else {
                        return 'darkgray';
                    }
                    break;
                case ViewState.in:
                    if (this.currentData[this.curYear][nodeId].fromEdges.hasOwnProperty(stateSelection)) {
                        flowData = this.currentData[this.curYear][nodeId].fromEdges[stateSelection].estimate;
                    } else {
                        return 'darkgray';
                    }
                    break;
                default:
                    if (this.currentData[this.curYear][nodeId].toEdges.hasOwnProperty(stateSelection)) {
                        flowData = this.currentData[this.curYear][nodeId].fromEdges[stateSelection].estimate -
                            this.currentData[this.curYear][nodeId].toEdges[stateSelection].estimate;
                    } else {
                        return 'darkgray';
                    }
            }

            if (flowData === undefined) {

                throw new Error(`Was not able to find a suitable edge from node ${d.properties.name} to ${RegionEnum[stateSelection]}`)
            }
        }

        return this.getInterpolate()(this.colorScale(flowData));

    }

    getInterpolate() {
        switch(this.state) {
            case ViewState.out:
                if (this.currentRegion == null) return d3.interpolateReds;
                return d3.interpolateBlues;
            case ViewState.in:
                if (this.currentRegion == null) return d3.interpolateBlues;
                return d3.interpolateReds;
            default:
                return d3.interpolateRdBu
        }
    }

    setColorScale() {
        let maxValue;
        let domain;
        switch(this.state) {
            case ViewState.out:
                if (this.currentRegion != null) {
                    maxValue = this.currentData[this.curYear][this.currentRegion].maxEdgeTo;
                } else {
                    maxValue = this.migrationPatterns.maxOutflow
                }
                domain = [0,maxValue];
                this.colorScale = d3.scaleLinear().domain(domain).range([0,1]);
                this.legendScale = d3.scaleSequential(this.getInterpolate()).domain(domain);
                break;
            case ViewState.in:
                console.log(this.currentRegion);
                if (this.currentRegion != null) {
                    maxValue = this.currentData[this.curYear][this.currentRegion].maxEdgeFrom;
                } else {
                    maxValue = this.migrationPatterns.maxInflow
                }
                domain = [0,maxValue];
                this.colorScale = d3.scaleLinear().domain([0,maxValue]).range([0,1]);
                this.legendScale = d3.scaleSequential(this.getInterpolate()).domain([0,maxValue]);
                break;
            default:
                console.log(this.currentRegion);
                if (this.currentRegion != null) {
                    maxValue = this.currentData[this.curYear][this.currentRegion].maxEdgeNet;
                    domain = [-maxValue,maxValue];
                    this.colorScale = d3.scaleLinear().domain([-maxValue,maxValue]).range([0,1]);
                    this.legendScale = d3.scaleSequential(d3.interpolateRdBu).domain(domain);
                } else {
                    const domain: number[] = [-1e5,1e5];
                    this.colorScale = d3.scaleLinear().domain([-1e5,1e5]).range([0,1]);
                    this.legendScale = d3.scaleSequential(this.getInterpolate()).domain([-1e5,1e5]);
                }

        }
    }

    private updateLegend() {
        continuous(this.geoLegend, this.legendScale)
    }

    public toggleMigrationStatistic(viewState: ViewState) {
        this.state = viewState;
        this.drawMap(this.currentRegion);
    }
}

/**
 * Lifted from http://bl.ocks.org/syntagmatic/e8ccca52559796be775553b467593a9f
 * @param selectorId
 * @param colorScale
 */
function continuous(selectorId, colorScale) {
    let legendHeight = 200,
        legendWidth = 80,
        margin = {top: 10, right: 60, bottom: 10, left: 2};
    console.log(selectorId);
    d3.select(selectorId).select('canvas').remove();
    let canvas = d3.select(selectorId)
        .style("height", legendHeight + "px")
        .style("width", legendWidth + "px")
        .style("position", "relative")
        .append("canvas")
        .attr("height", legendHeight - margin.top - margin.bottom)
        .attr("width", 1)
        .style("height", (legendHeight - margin.top - margin.bottom) + "px")
        .style("width", (legendWidth - margin.left - margin.right) + "px")
        .style("border", "1px solid #000")
        .style("position", "absolute")
        .style("top", (margin.top) + "px")
        .style("left", (margin.left) + "px")
        .node();
    console.log('Done creating canvas');
    let ctx = canvas.getContext("2d");

    let legendScale = d3.scaleLinear()
        .range([1, legendHeight - margin.top - margin.bottom])
        .domain(colorScale.domain());

    // image data hackery based on http://bl.ocks.org/mbostock/048d21cf747371b11884f75ad896e5a5
    let image = ctx.createImageData(1, legendHeight);
    d3.range(legendHeight).forEach(function(i) {
        let c = d3.rgb(colorScale(legendScale.invert(i)));
        image.data[4*i] = c.r;
        image.data[4*i + 1] = c.g;
        image.data[4*i + 2] = c.b;
        image.data[4*i + 3] = 255;
    });
    ctx.putImageData(image, 0, 0);

    // A simpler way to do the above, but possibly slower. keep in mind the legend width is stretched because the width attr of the canvas is 1
    // See http://stackoverflow.com/questions/4899799/whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas
    /*
    d3.range(legendHeight).forEach(function(i) {
      ctx.fillStyle = colorScale(legendScale.invert(i));
      ctx.fillRect(0,i,1,1);
    });
    */

    let legendAxis = d3.axisRight(legendScale).tickSize(6).ticks(8);
    console.log('Creating svg');
    d3.select(selectorId).select('svg').remove();
    let svg = d3.select(selectorId).append("svg")
        .attr("height", (legendHeight) + "px")
        .attr("width", (legendWidth) + "px")
        .style("position", "absolute")
        .style("left", "0px")
        .style("top", "0px")

    svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (legendWidth - margin.left - margin.right + 3) + "," + (margin.top) + ")")
        .call(legendAxis);
}
