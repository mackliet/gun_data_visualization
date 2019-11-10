import * as d3 from "d3";
import {Selection} from 'd3-selection';
import {GeoProjection} from 'd3-geo';
import * as topojson from 'topojson';
import {IView} from "./IView";
import {MigrationData, MigrationNode, MigrationNodeId, MigrationPatterns} from "../Data/MigrationPatterns";
import {Dimensions} from "../Utils/svg-utils";


export class HeatMap implements IView {

    readonly curYear: number;
    readonly currentData: MigrationData;

    constructor(patterns: MigrationPatterns, container: Selection<any, any, any, any>,
                svgDims: Dimensions, startYear: number = 2017) {
        this.curYear = startYear;
        this.currentData = patterns.data;
        var path = d3.geoPath();
        const svg = container.append('svg').attr('height', svgDims.height).attr('width', svgDims.width);
        /**
         * Adapted from https://bl.ocks.org/mbostock/4090848
         */
        d3.json("https://d3js.org/us-10m.v1.json").then((us) => {
            console.log("Display US Map");
            // States
            //@ts-ignore
            svg.append('g').selectAll('path').data(topojson.feature(us,  us.objects.states ).features).enter()
                .append('path').attr('d', path).attr("class", "states");
            // Borders
            svg.append("path")
                .attr("class", "state-borders")
                .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));
        });

    }

    initMap() {

    }

    showFullMap() {

    }

    focusNode(migrationNode: MigrationNodeId) {

    }

}