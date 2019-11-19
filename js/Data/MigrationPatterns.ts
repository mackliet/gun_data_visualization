import {Year} from "./ImportData";
import {RegionEnum} from "./DataUtils"
/**
 * An edge that represents migration from one state to another
 */
export interface MigrationEdge {
        estimate: number;
        moe: number;
        fromMigrationRegion: RegionEnum
        toMigrationRegion: RegionEnum;
}

export interface MigrationNode {
    year: number
    nodeId: RegionEnum;
    toEdges: Map<RegionEnum, MigrationEdge>;
    fromEdges: Map<RegionEnum, MigrationEdge>;
    netImmigrationFlow: number;
    totalPopulation: number;
    totalCame: number;
    totalLeft: number;
}

export interface StateRange {
    maxEdgeTo: number;
    maxEdgeFrom: number;
    minEdgeNet: number;
    maxEdgeNet: number;
}

/**
 *
 */
export interface MigrationData {
    [key: number]: MigrationNode[]
}

/**
 * Data structure that contains all the state migration data, immutable
 */
export class MigrationPatterns {

    // TODO review this data structure, may not be optimal
    public readonly data: MigrationData;
    public readonly stateRanges: { [key: number]: StateRange };
    public readonly years: number[];
    public readonly minSum: number = Number.MAX_VALUE;
    public readonly maxSum: number = 0;
    public readonly minInflow: number = Number.MAX_VALUE;
    public readonly maxInflow: number = 0;
    public readonly minOutflow: number = Number.MAX_VALUE;
    public readonly maxOutflow: number = 0;

    constructor(data: Array<Year>){
        this.data = {};
        this.years = [];
        for (const o of data) {
            const curYear = +o.year;
            this.years.push(curYear);
            this.data[curYear] = [];
            this.stateRanges = {};
            for (const d of o.data) {
                const id = RegionEnum[d.state.trim()];
                if (!this.stateRanges.hasOwnProperty(id)){
                    this.stateRanges[id] = {
                        maxEdgeTo: -Number.MAX_VALUE,
                        maxEdgeFrom: -Number.MAX_VALUE,
                        minEdgeNet: Number.MAX_VALUE,
                        maxEdgeNet: -Number.MAX_VALUE
                    }
                }
                const node: MigrationNode = {
                    year: curYear,
                    nodeId: RegionEnum[d.state.trim()],
                    netImmigrationFlow: d.net_immigration_flow,
                    totalPopulation: +d.population,
                    totalCame: d.total_came,
                    totalLeft: d.total_left,
                    toEdges: new Map<RegionEnum, MigrationEdge>(),
                    fromEdges: new Map<RegionEnum, MigrationEdge>(),
                };

                /**
                 * Check totals get max values
                 */
                if (node.totalLeft > this.maxOutflow) {
                    this.maxOutflow = node.totalLeft;
                }
                if (node.totalLeft < this.minOutflow) {
                    this.minOutflow = node.totalLeft;
                }
                if (node.totalCame > this.maxInflow) {
                    this.maxInflow = node.totalLeft;
                }
                if (node.totalCame < this.minInflow) {
                    this.minInflow = node.totalCame;
                }
                if (node.netImmigrationFlow > this.maxSum) {
                    this.maxSum = node.totalLeft;
                }
                if (node.netImmigrationFlow < this.minSum) {
                    this.minSum = node.netImmigrationFlow;
                }

                for (const edge of d.left_to){
                    const toNodeId = RegionEnum[edge.state.trim()];
                    node.toEdges[toNodeId] = {
                        fromMigrationRegion: id,
                        toMigrationRegion: toNodeId,
                        moe: 0, // TODO Get MOE
                        estimate: +edge.estimate
                    };
                    // Calculate max migration number for that state for color scale determination
                    if (+edge.estimate > this.stateRanges[id].maxEdgeTo) {
                        this.stateRanges[id].maxEdgeTo = +edge.estimate;
                    }
                }
                for (const edge of d.came_from){
                    const fromNodeId = RegionEnum[edge.state.trim()];
                    node.fromEdges[fromNodeId] = {
                        fromMigrationRegion: id,
                        toMigrationRegion: fromNodeId,
                        moe: 0, // TODO Get MOE
                        estimate: +edge.estimate
                    };
                    // Calculate max migration number for that state for color scale determination
                    if (+edge.estimate > this.stateRanges[id].maxEdgeFrom) {
                        this.stateRanges[id].maxEdgeFrom = +edge.estimate;
                    }
                    if (Math.abs(+edge.estimate - node.toEdges[fromNodeId].estimate) > this.stateRanges[id].maxEdgeNet) {
                        this.stateRanges[id].maxEdgeNet = Math.abs(+edge.estimate - node.toEdges[fromNodeId].estimate);
                    }
                }
                this.data[curYear].push(node);
            }

        }
    }

}

