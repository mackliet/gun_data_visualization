import {MigrationData} from "../Data/MigrationPatterns";

export class Table {
    /*
        Table state variables
     */
    private readonly lastSorted: string;
    private currentData: MigrationData

    constructor(data: MigrationData) {
        // TODO Create the data table objects
        // Need to define columns and css classes for various states and objects
    }

    /**
     * Class to refresh the data table for sorting, brush, or selections
     */
    refreshTable() {

    }

}