import {Year} from "./ImportData";

// TODO Move this global stuff in some super utility class that is executed before everything else
declare global {
    interface String {
        clean(): string
    }
}

String.prototype.clean = function (this: string) {
    return this.replace(/\s/g, "")
};
/**
 * Enumerator representing all 50 States, and other migration regions
 */
export enum MigrationNodeId {
    Alabama,
    Alaska,
    Arizona,
    Arkansas,
    California,
    Colorado,
    Connecticut,
    Delaware,
    DistrictofColumbia,
    Florida,
    Georgia,
    Hawaii,
    Idaho,
    Illinois,
    Indiana,
    Iowa,
    Kansas,
    Kentucky,
    Louisiana,
    Maine,
    Maryland,
    Massachusetts,
    Michigan,
    Minnesota,
    Mississippi,
    Missouri,
    Montana,
    Nebraska,
    Nevada,
    NewHampshire,
    NewJersey,
    NewMexico,
    NewYork,
    NorthCarolina,
    NorthDakota,
    Ohio,
    Oklahoma,
    Oregon,
    Pennsylvania,
    RhodeIsland,
    SouthCarolina,
    SouthDakota,
    Tennessee,
    Texas,
    Utah,
    Vermont,
    Virginia ,
    Washington,
    WestVirginia,
    Wisconsin,
    Wyoming,
    PuertoRico,
}

/**
 * An edge that represents migration from one state to another
 */
export interface MigrationEdge {
        estimate: number;
        moe: number;
        fromMigrationRegion: MigrationNodeId
        toMigrationRegion: MigrationNodeId;
}

export interface MigrationNode {
    year: number
    nodeId: MigrationNodeId;
    edges: Map<MigrationNodeId, MigrationEdge>;
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

    constructor(data: Array<Year>){
        this.data = {};
        for (const o of data) {
            const curYear = +o.year;
            this.data[curYear] = [];
            for (const d of o.data){
                const id = MigrationNodeId[d.state.clean()];
                const node: MigrationNode = {
                    year: curYear,
                    nodeId: MigrationNodeId[d.state.clean()],
                    netImmigrationFlow: d.net_immigration_flow,
                    totalPopulation: +d.population,
                    totalCame: d.total_came,
                    totalLeft: d.total_left,
                    edges: new Map<MigrationNodeId, MigrationEdge>()
                };

                for (const edge of d.left_to){
                    const toNodeId = MigrationNodeId[edge.state.clean()];
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
    }

    yearsAsArray() {

        Object.keys(this.data).map(key => {

        });
    }


}

