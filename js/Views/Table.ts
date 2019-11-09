import {MigrationData} from "../Data/MigrationPatterns";
import {Selection} from 'd3-selection';
import {Dimensions} from "../Utils/svg-utils";
import {IView} from "./IView";


export class Table implements IView {
    /*
        Table state variables
     */
    private readonly lastSorted: string;

    private readonly parentSvg: Selection<any, any, any, any>;
    private readonly table: Selection<any, any, any, any>;
    private readonly header: Selection<any, any, any, any>;
    private readonly axisHeader: Selection<any, any, any, any>;
    private readonly titleHeader: Selection<any, any, any, any>;
    private readonly tBody: Selection<any, any, any, any>;
    private readonly headerLabels = ['Region', 'Inflow', 'Outflow', 'Total'];

    readonly curYear: number;
    readonly currentData: MigrationData;

    constructor(data: MigrationData, container: Selection<any, any, any, any>, svgDims: Dimensions) {
        this.currentData = data;
        // TODO Create the data table objects
        // TODO Need to define columns and css classes for various states and objects
        console.debug(`Table SVG Dimensions are width: ${svgDims.width}; height: ${svgDims.height}`);
        this.parentSvg = container.append('svg').attr('width', svgDims.width).attr('height', svgDims.height);
        this.table = this.parentSvg.append('table');
        this.header = this.table.append('thead');
        this.axisHeader = this.header.append('tr');
        this.titleHeader = this.header.append('tr');
        for (const l of this.headerLabels) {
            this.axisHeader.append('td').text(l).on('click', this.labelListener);
        }
        this.tBody = this.table.append('tbody');
        this.loadTable(2017);
    }

    /**
     * Class to refresh the data table for sorting, brush, or selections
     */
    loadTable(year) {
        console.debug('Loading data table');
        this.tBody.enter().data(this.currentData[year])
    }

    labelListener(l) {
        console.debug(`Clicked ${l} header`);
    }

}