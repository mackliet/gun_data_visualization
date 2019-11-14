import {IView} from "./IView";
import {MigrationData, MigrationNodeId, MigrationPatterns} from "../Data/MigrationPatterns";
import {Selection} from "d3-selection";
import {Dimensions} from "../Utils/svg-utils";


export class ChordDiagram implements IView {

    readonly curYear: number;
    readonly currentData: MigrationData;

    constructor(patterns: MigrationPatterns, container: Selection<any, any, any, any>,
                svgDims: Dimensions, startYear: number = 2017) {

        this.curYear = 2017;
        this.currentData = patterns.data;
        container.append('svg').attr('height', svgDims.height).attr('width', svgDims.width);

    }

    showFullChord() {

    }

    focusNode(migrationNode: MigrationNodeId) {

    }

}