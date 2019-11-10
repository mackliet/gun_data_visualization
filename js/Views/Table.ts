import {MigrationData, MigrationNode, MigrationNodeId, MigrationPatterns} from "../Data/MigrationPatterns";
import {ScaleLinear} from 'd3';
import {Selection} from 'd3-selection';
import {Dimensions} from "../Utils/svg-utils";
import {IView} from "./IView";
import * as d3 from "d3";


export class Table implements IView {

    /*
        Table state variables
     */
    private readonly lastSorted: string;

    private readonly parentSvg: Selection<any, any, any, any>;
    private readonly table: Selection<any, MigrationNode, any, MigrationNode>;
    private readonly header: Selection<any, any, any, any>;
    private readonly axisHeader: Selection<any, any, any, any>;
    private readonly titleHeader: Selection<any, any, any, any>;
    private readonly tBody: Selection<any, any, any, any>;
    private readonly flowScale: ScaleLinear<number, number>;
    // TODO May just overlay these with total being the red/blue on the axis and the overlay being pruple
    private readonly headerLabels = ['Region', 'Total Flow'];

    readonly curYear: number;
    readonly currentData: MigrationData;

    /**
     * Table constants
     */
    private readonly RECT_WIDTH = 200;

    /**
     *
     * @param data data to bind to the view
     * @param container HTML selection where the view will be placed in
     * @param svgDims dimensions of the SVG
     * @param startYear year to start the visualization
     */
    constructor(migrationPatterns: MigrationPatterns, container: Selection<any, any, any, any>,
                svgDims: Dimensions, startYear: number = 2017) {
        this.currentData = migrationPatterns.data;
        // TODO Create the data table objects
        // TODO Need to define columns and css classes for various states and objects
        console.debug(`Table SVG Dimensions are width: ${svgDims.width}; height: ${svgDims.height}`);
        this.flowScale = d3.scaleLinear<number, number>().range([0, this.RECT_WIDTH])
            .domain([migrationPatterns.minSum, migrationPatterns.maxInflow]);
        this.table = container.append('table');
        this.header = this.table.append('thead');
        this.axisHeader = this.header.append('tr');
        this.titleHeader = this.header.append('tr');
        for (const l of this.headerLabels) {
            this.axisHeader.append('th').text(l).on('click', this.labelListener);
        }
        this.tBody = this.table.append('tbody');
        this.loadTable(startYear);
    }

    /**
     * Class to refresh the data table for sorting, brush, or selections
     */
    loadTable(year) {
        console.debug('Loading data table');
        const rows = this.tBody.selectAll('tr').data<MigrationNode>(this.currentData[year]).enter().append('tr');
        for (const header of this.headerLabels) {
            console.debug(`calling ${header.clean()} method`);
            this[header.toLocaleLowerCase().clean()](rows)
        }
    }

    labelListener(l) {
        console.debug(`Clicked ${l} header`);
    }

    private region(rows: Selection<any, any, any, any>) {
        console.debug("entering region column creation method");
        rows.append('td').append('text').text((d) => {
            return MigrationNodeId[d.nodeId];
        });
    }

    private total_flow(rows: Selection<any, any, any, any>) {
        console.debug("entering inflow column creation method");
        const svg = rows.append('td').append('svg').attr('width', this.RECT_WIDTH).attr('height', 20);
        /**
         * Create net rectangle.  Blue for net inflow, red for net outflow
         */
        svg.append('rect').attr('x', (d) => {
            if (d.netImmigrationFlow < 0) {
                return this.flowScale(d.netImmigrationFlow);
            }
            return this.flowScale(0);
        }).attr('y', 0).attr('height', 20).attr('width', (d) => {
            console.debug(`${MigrationNodeId[d.nodeId]}: ${d.netImmigrationFlow}, ${this.flowScale(d.netImmigrationFlow)}`);
            const flow = this.flowScale(0) - this.flowScale(d.netImmigrationFlow);
            return flow;
        }).attr('fill', (d) => {
            if (d.netImmigrationFlow < 0) {
                return 'red';
            } else {
                return 'blue';
            }
        });
        /**
         * Create net rectangle.  Blue for net inflow, red for net outflow
         */
        svg.append('rect').attr('x', (d) => {
            if (d.netImmigrationFlow < 0) {
                return this.flowScale(0);
            }
            return this.flowScale(0);
        }).attr('y', 0).attr('height', 20).attr('width', (d) => {
            console.debug(`${MigrationNodeId[d.nodeId]}: ${d.totalCame}, ${this.flowScale(d.totalCame)}`);
            const width = this.flowScale(d.totalCame) - this.flowScale(0);
            return width;
        }).attr('fill', 'blue');

        /**
         * Create difference rectangle.  Should be purple until it ends
         */
        svg.append('rect').attr('x', (d) => {
            if (d.netImmigrationFlow < 0) {
                return this.flowScale(0)
            }
            return this.flowScale(d.netImmigrationFlow);
        }).attr('y', 0).attr('height', 20).attr('width', (d) => {
            console.debug(`${MigrationNodeId[d.nodeId]}: ${d.totalCame}, ${this.flowScale(d.totalCame)}`);
            const width = (this.flowScale(d.totalCame) - this.flowScale(0)) +
                (this.flowScale(0) - this.flowScale(d.netImmigrationFlow)) - (this.flowScale(0) - this.flowScale(d.netImmigrationFlow));
            return width;
        }).attr('fill', 'purple');
    }

}