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

    readonly currentData: MigrationData;

    constructor(data: MigrationData, container: Selection<any, any, any, any>, svgDims: Dimensions) {
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
        this.loadTable();
    }

    /**
     * Class to refresh the data table for sorting, brush, or selections
     */
    loadTable() {
        console.debug('Loading data table');
        this.tBody.enter().data(this.currentData, (v, k) => {
            return k
        })
    }

    labelListener(l) {
        console.debug(`Clicked ${l} header`);
    }

}