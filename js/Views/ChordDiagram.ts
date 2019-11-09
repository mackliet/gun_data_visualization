import {IView} from "./IView";
import {MigrationData, MigrationNodeId} from "../Data/MigrationPatterns";


class ChordDiagram implements IView {

    readonly curYear: number;
    readonly currentData: MigrationData;

    constructor(data: MigrationData) {

        this.currentData = data;

    }

    showFullChord() {

    }

    focusNode(migrationNode: MigrationNodeId) {

    }

}