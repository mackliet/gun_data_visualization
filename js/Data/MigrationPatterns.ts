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
    edges: Map<RegionEnum, MigrationEdge>;
    netImmigrationFlow: number;
    totalPopulation: number;
    totalCame: number;
    totalLeft: number;
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

    public readonly minSum: number = Number.MAX_VALUE;
    public readonly maxSum: number = 0;
    public readonly minInflow: number = Number.MAX_VALUE;
    public readonly maxInflow: number = 0;
    public readonly minOutflow: number = Number.MAX_VALUE;
    public readonly maxOutflow: number = 0;

    constructor(data: Array<Year>){
        this.data = {};
        for (const o of data) {
            const curYear = +o.year;
            this.data[curYear] = [];
            for (const d of o.data){
                const id = RegionEnum[d.state.trim()];
                const node: MigrationNode = {
                    year: curYear,
                    nodeId: RegionEnum[d.state.trim()],
                    netImmigrationFlow: d.net_immigration_flow,
                    totalPopulation: +d.population,
                    totalCame: d.total_came,
                    totalLeft: d.total_left,
                    edges: new Map<RegionEnum, MigrationEdge>()
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
                    node.edges[toNodeId] = {
                        fromMigrationRegion: id,
                        toMigrationRegion: toNodeId,
                        moe: 0, // TODO Get MOE
                        estimate: +edge.estimate
                    };
                }
                this.data[curYear].push(node);
            }

        }
        console.info(this.data);
        console.info(`Max values: \nMax Inflow: ${this.maxInflow}, Max Outflow: ${this.maxOutflow}, Max Total: ${this.maxSum}\n ` +
                                `Min values: \nMin Inflow ${this.minInflow}, Min Outflow: ${this.minOutflow}, Min Total: ${this.minSum} `)
    }

    yearsAsArray() {

        Object.keys(this.data).map(key => {

        });
    }


}

