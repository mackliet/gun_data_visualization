import * as d3 from "d3";
import {ScaleLinear} from "d3";
import {Selection} from 'd3-selection';
import * as topojson from 'topojson';
import {Feature} from 'geojson';
import {IView} from "./IView";
import {MigrationData, MigrationNodeId, MigrationPatterns} from "../Data/MigrationPatterns";
import {Dimensions} from "../Utils/svg-utils";

const borderId = (name: string) => {
    name = name.replace(/\s/g, "");
    return `border${name}`;
};

const stateId = (name: string) => {
    name = name.replace(/\s/g, "");
    return `state${name}`;
};

export class HeatMap implements IView {

    readonly curYear: number;
    readonly currentData: MigrationData;
    readonly colorScale: ScaleLinear<number, number>;

    constructor(patterns: MigrationPatterns, container: Selection<any, any, any, any>,
                svgDims: Dimensions, startYear: number = 2017) {
        this.curYear = startYear;
        this.currentData = patterns.data;
        this.colorScale = d3.scaleLinear().domain([-1e5,1e5]).range([0,1]);
        var path = d3.geoPath();
        const svg = container.append('svg').attr('height', svgDims.height).attr('width', svgDims.width);
        /**
         * Adapted from https://bl.ocks.org/mbostock/4090848
         */
        d3.json("https://d3js.org/us-10m.v2.json").then((us) => {
            console.debug("Display US Map");
            console.debug(this.currentData[this.curYear]);
            // States
            //@ts-ignore
            svg.append('g').selectAll('path').data<Feature>(topojson.feature(us,  us.objects.states ).features).enter()
                .append('path').attr('d', path).attr("class", "states")
                .attr('id', (d) => {
                    return stateId(d.properties.name)
                })
                .style('fill', (d) => {
                    return this.stateFill(d)
                })
                .on('mouseover', (d) => {
                    const name = d.properties.name;
                    const nodeId = MigrationNodeId[name];
                    console.debug(name);
                    const id = stateId(d.properties.name);
                    d3.select(`#${id}`).style('fill', 'darkgray');
                }).on('mouseout', (d) => {
                    const id = stateId(d.properties.name);
                    d3.select(`#${id}`).style('fill', this.stateFill(d));
            });

            // Borders
            //@ts-ignore
            svg.append("path")
                .attr("class", "state-borders")
                .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })))
            });

    }

    initMap() {

    }

    showFullMap() {

    }

    focusNode(migrationNode: MigrationNodeId) {

    }

    stateFill(d) {
        console.log(d);
        const name = d.properties.name;
        const nodeId = MigrationNodeId[name];
        const t = this.currentData[this.curYear][nodeId].netImmigrationFlow;
        console.log(t, this.colorScale(t));
        return d3.interpolateRdBu(this.colorScale(t))
    }




}