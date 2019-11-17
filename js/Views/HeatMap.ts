import * as d3 from "d3";
import {ScaleLinear} from "d3";
import {Selection} from 'd3-selection';
import * as topojson from 'topojson';
import {Feature} from 'geojson';
import {IView} from "./IView";
import {MigrationData, MigrationPatterns} from "../Data/MigrationPatterns";
import {RegionEnum} from "../Data/DataUtils"
import {Dimensions} from "../Utils/svg-utils";

export enum State {
    net = 'net',
    out = 'out',
    in = 'in'
}

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
    readonly migrationPatterns: MigrationPatterns;
    readonly currentData: MigrationData;
    readonly svg: Selection<any, any, any, any>;
    private readonly path;
    private colorScale: ScaleLinear<number, number>;
    private state: State = State.net;
    private currentRegion: RegionEnum;
    private dataSelection;
    private us;

    constructor(patterns: MigrationPatterns, container: Selection<any, any, any, any>,
                svgDims: Dimensions, startYear: number = 2017) {
        this.curYear = startYear;
        this.migrationPatterns = patterns;
        this.currentData = patterns.data;
        this.svg = container.append('svg').attr('height', svgDims.height).attr('width', svgDims.width);
        this.path = d3.geoPath();
        this.setColorScale();
        d3.json("https://d3js.org/us-10m.v2.json").then((us) => {
            this.us = us;
            /**
             * Adapted from https://bl.ocks.org/mbostock/4090848
             */
            this.dataSelection = this.svg.append('g').selectAll('path')
            //@ts-ignore
                .data<Feature>(topojson.feature(this.us,  this.us.objects.states ).features);
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
        console.log(this.currentRegion, this.state)
        this.currentRegion = stateSelected;
        // TODO Needs better logic than this, but there is no selector so later
        this.setColorScale();
        console.debug("Display US Map");
        console.debug(this.currentData[this.curYear]);
        // States

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
            d3.select(`#${id}`).style('fill', this.stateFill(d, stateSelected));
        }).on('click', (d) => this.focusNode(d));

        this.dataSelection.merge(enter).attr('fill', (d) => {
            return this.stateFill(d, stateSelected)
        });

    }

    focusNode(feature: Feature) {
        console.log(`Changing the state selection context ${feature.properties.name}`);
        console.log(`Collecting edges for state node ID ${RegionEnum[feature.properties.name]}...`);
        d3.select('.region-select').attr('text', feature.properties.name);
        //@ts-ignore
        this.drawMap(RegionEnum[feature.properties.name])
    }

    stateFill(d: Feature, stateSelection: RegionEnum) {
        const name = d.properties.name;
        const nodeId = RegionEnum[name];
        let flowData: number;
        if (stateSelection === null) {
            switch (this.state) {
                case State.out:
                    flowData = this.currentData[this.curYear][nodeId].totalLeft;
                    break;
                case State.in:
                    flowData = this.currentData[this.curYear][nodeId].totalCame;
                    break;
                default:
                    flowData = this.currentData[this.curYear][nodeId].netImmigrationFlow;
            }

        } else {
            switch (this.state) {
                case State.out:
                    if (this.currentData[this.curYear][nodeId].toEdges.hasOwnProperty(stateSelection)) {
                        flowData = this.currentData[this.curYear][nodeId].toEdges[stateSelection].estimate;
                    } else {
                        return 'darkgray';
                    }
                    break;
                case State.in:
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
        // Need to add third case of migration from
        switch(this.state) {
            case State.out:
                return d3.interpolateBlues(this.colorScale(flowData));
            case State.in:
                return d3.interpolateReds(this.colorScale(flowData));
            default:
                return d3.interpolateRdBu(this.colorScale(flowData))
        }

    }

    setColorScale() {
        switch(this.state) {
            case State.out:
                var maxValue;
                if (this.currentRegion != null) {
                    maxValue = this.currentData[this.curYear][this.currentRegion].maxEdgeTo;
                } else {
                    maxValue = this.migrationPatterns.maxOutflow
                }
                console.log(`Max: ${maxValue}`);
                this.colorScale = d3.scaleLinear().domain([0,maxValue]).range([0,1]);
                break;
            case State.in:
                var maxValue;
                console.log(this.currentRegion);
                if (this.currentRegion != null) {
                    maxValue = this.currentData[this.curYear][this.currentRegion].maxEdgeFrom;
                } else {
                    maxValue = this.migrationPatterns.maxInflow
                }
                console.log(`Max: ${maxValue}`);
                this.colorScale = d3.scaleLinear().domain([0,maxValue]).range([0,1]);
                break;
            default:
                var maxValue;
                console.log(this.currentRegion);
                if (this.currentRegion != null) {
                    maxValue = this.currentData[this.curYear][this.currentRegion].maxEdgeNet;
                    const minValue = this.currentData[this.curYear][this.currentRegion].minEdgeNet;
                    this.colorScale = d3.scaleLinear().domain([-maxValue,maxValue]).range([0,1]);
                } else {
                    this.colorScale = d3.scaleLinear().domain([-1e5,1e5]).range([0,1]);
                }

        }
    }

    public toggleMigrationStatistic(state: State) {
        this.state = state;
        // TODO calculate net for each region
        this.drawMap(this.currentRegion);
    }




}