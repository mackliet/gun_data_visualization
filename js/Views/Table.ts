import {MigrationData, MigrationNode, MigrationPatterns} from "../Data/MigrationPatterns";
import {RegionEnum} from "../Data/DataUtils"
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
    private readonly yearContainer: Selection<any, any, any, any>;
    private readonly tBody: Selection<any, MigrationNode, any, any>;
    private readonly flowScale: ScaleLinear<number, number>;
    private readonly migrationScale: ScaleLinear<number, number>;
    private readonly growthScale: ScaleLinear<number, number>;
    // TODO May just overlay these with total being the red/blue on the axis and the overlay being pruple
    private readonly headerLabels = ['Region', 'Total Flow', 'Pop. Flow', 'Pop. Growth']; //, 'Population'];

    public curYear: number;
    readonly currentData: MigrationData;

    /**
     * Table constants
     */
    private readonly FLOW_RECT_WIDTH = 100;
    private readonly GROWTH_RECT_WIDTH = 75;
    private readonly MIGRATION_RECT_WIDTH = 75;
    private readonly POP_RECT_WIDTH = 150;
    private readonly column_widths = [135, 110, 110, 110, 65]

    /**
     *
     * @param migrationPatterns
     * @param container HTML selection where the view will be placed in
     * @param svgDims dimensions of the SVG
     * @param startYear year to start the visualization
     */
    constructor(migrationPatterns: MigrationPatterns, container: Selection<any, any, any, any>,
                svgDims: Dimensions, startYear: number = 2017) {
        this.currentData = migrationPatterns.data;
        console.debug(`Table SVG Dimensions are width: ${svgDims.width}; height: ${svgDims.height}`);
        this.flowScale = d3.scaleLinear<number, number>().range([0, this.FLOW_RECT_WIDTH])
            .domain([migrationPatterns.minSum, migrationPatterns.maxInflow]);
        this.migrationScale = d3.scaleLinear<number, number>().range([0, this.MIGRATION_RECT_WIDTH])
            .domain([-.1, .04]);
        this.growthScale = d3.scaleLinear<number, number>().range([0, this.GROWTH_RECT_WIDTH])
            .domain([.94, 1.03]);
        this.table = container.append('table').classed('stat_table', true).style('width', `${svgDims.width}px`);
        this.header = this.table.append('thead');
        this.titleHeader = this.header.append('tr');
        this.axisHeader = this.header.append('tr');
        for (const l in this.headerLabels) {
            this.titleHeader.append('th').text(this.headerLabels[l]).on('click', this.labelListener);
            const axis = this.axisHeader.append('th').classed(`Axis${l}`, true);
            const svgAxis = axis.append('svg').attr('height', 60).attr('width', this.FLOW_RECT_WIDTH + 30);
            if (l === '1') {
                //@ts-ignore
                const axis = d3.axisBottom().scale(this.flowScale).ticks(8);
                this.addAxis(svgAxis, axis);

            } else if (l == '2'){
                //@ts-ignore
                const axis = d3.axisBottom().scale(this.migrationScale).ticks(5).tickFormat((d) => {
                    return Number.parseFloat(d) * 100 + '%';
                });
                this.addAxis(svgAxis, axis);

            } else if (l == '3'){
                //@ts-ignore
                const axis = d3.axisBottom().scale(this.growthScale).ticks(5).tickFormat((d) => {
                    return (Number.parseFloat(d) * 100) - 100 + '%';
                });
                this.addAxis(svgAxis, axis, 15);
            }
        }
        this.tBody = this.table.append('tbody').style('height', `${svgDims.height}px`);
        this.loadTable(startYear);
    }

    /**
     * Class to refresh the data table for sorting, brush, or selections
     */
    loadTable(year) {
        const data = this.currentData[year];
        //@ts-ignore
        this.tBody.selectAll('tr').data(data, (d) => {
            const e: MigrationNode = <MigrationNode>d;
            return e.nodeId
        }).join(
            enter => {

                const rows = enter.append('tr');
                rows.append('td').append('text').text((d) => {
                    return RegionEnum[d.nodeId];
                });
                const tds = rows.append('td');
                tds.attr('class', 'svg');
                const svg = tds.append('svg').attr('width', this.FLOW_RECT_WIDTH).style('max-height', '100%')
                    .style('display', 'block');
                /**
                 * Create net rectangle.  Blue for net inflow, red for net outflow
                 */
                this.net(svg.append('rect').classed('net', true)
                            .selectAll('rect').classed('net', true)
                         , year);
                /**
                 * Create net rectangle.  Blue for net inflow, red for net outflow
                 */
                this.in(svg.append('rect').classed('in', true), year);


                /**
                 * Create difference rectangle.  Should be purple until it ends
                 */
                this.out(svg.append('rect').classed('out', true), year);

                this.pop(rows.append('td').attr('width', this.MIGRATION_RECT_WIDTH).append('svg')
                            .attr('width', '100%').attr('height', 10)
                            .append('rect').classed('pop', true), year);

                this.popGrowth(rows.append('td').attr('width', this.GROWTH_RECT_WIDTH).append('svg')
                                    .attr('width', '100%').attr('height', 10)
                                    .append('rect').classed('popGrowth', true), year);

                //this.popTotal(rows.append('td').classed('popTotal', true).append('text'), year);

                this.table.selectAll('tr').selectAll('td').data(this.column_widths).attr('width', d => d);
                this.table.selectAll('tr').selectAll('th').data(this.column_widths).attr('width', d => d);

            },
            update => {

                update = update.transition();
                this.net(update.selectAll('rect').filter('.net'), year);
                this.in(update.selectAll('rect').filter('.in'), year);
                this.out(update.selectAll('rect').filter('.out'), year);

                this.pop(update.selectAll('rect').filter('.pop'), year);

                this.popGrowth(update.selectAll('rect').filter('.popGrowth'), year);

                //this.popTotal(update.selectAll('td').filter('.popTotal').select('text'), year)
            }
        );

    }

    /**
     *
     * @param join selection for updating/creating attributes
     * @param year current year for the view
     */
    net(join, year) {
        join.attr('x', (d) => {
            d = this.currentData[year][d.nodeId];
            if (d.netImmigrationFlow < 0) {
                return this.flowScale(d.netImmigrationFlow);
            }
            return this.flowScale(0);
        }).attr('y', 0).attr('height', 5).attr('width', (d) => {
            d = this.currentData[year][d.nodeId];
            const flow = this.flowScale(0) - this.flowScale(d.netImmigrationFlow);
            return flow < 0 ? 0 : flow;
        }).attr('fill', (d) => {
            d = this.currentData[year][d.nodeId];
            if (d.netImmigrationFlow < 0) {
                return 'red';
            } else {
                return 'blue';
            }
        });
    }

    /**
     *
     * @param join selection for updating/creating attributes
     * @param year current year for the view
     */
    in(join, year) {
        join.attr('x', (d) => {
            d = this.currentData[year][d.nodeId];
            if (d.netImmigrationFlow < 0) {
                return this.flowScale(0);
            }
            return this.flowScale(0);
        }).attr('y', 5).attr('height', 5).attr('width', (d) => {
            d = this.currentData[year][d.nodeId];
            const width = this.flowScale(d.totalCame) - this.flowScale(0);
            return width;
        }).attr('fill', 'blue');
    }

    /**
     *
     * @param join selection for updating/creating attributes
     * @param year current year for the view
     */
    out(join, year) {
        join.attr('x', (d) => {
            d = <MigrationNode>this.currentData[year][d.nodeId];
            if (d.netImmigrationFlow < 0) {
                return this.flowScale(0)
            }
            return this.flowScale(d.netImmigrationFlow);
        }).attr('y', 10).attr('height', 5).attr('width', (d) => {
            let width;
            d = <MigrationNode>this.currentData[year][d.nodeId];
            if (d.netImmigrationFlow < 0) {
                width = (this.flowScale(d.totalCame) - this.flowScale(0)) +
                    (this.flowScale(0) - this.flowScale(d.netImmigrationFlow)) - (this.flowScale(0) - this.flowScale(d.netImmigrationFlow));
            } else {
                width = (this.flowScale(d.totalCame) - this.flowScale(d.netImmigrationFlow));
            }
            return width;
        }).attr('fill', 'purple');
    }

    /**
     *
     * @param join selection for updating/creating attributes
     * @param year current year for the view
     */
    pop(join, year) {
        join.attr('x', (d) => {
            d = <MigrationNode>this.currentData[year][d.nodeId];
            if (d.netImmigrationFlow < 0) {
                return this.migrationScale(d.netImmigrationFlow / d.totalPopulation);
            }
            return this.migrationScale(0);
        }).attr('y', 5).attr('height', 10).attr('width', (d) => {
            d = <MigrationNode>this.currentData[year][d.nodeId];
            const migration = this.migrationScale(0) - this.migrationScale(d.netImmigrationFlow / d.totalPopulation);
            return Math.abs(migration);
        }).attr('fill', (d) => {
            d = this.currentData[year][d.nodeId];
            if (d.netImmigrationFlow < 0) {
                return 'red';
            } else {
                return 'blue';
            }
        });
    }

    /**
     *
     * @param join selection for updating/creating attributes
     * @param year current year for the view
     */
    popGrowth(join, year){
        join.attr('x', (d) => {
            if (year === 2005) {
                return this.growthScale(1);
            }
            d = <MigrationNode>this.currentData[year][d.nodeId];
            const popDiff = d.totalPopulation / this.currentData[year - 1][d.nodeId].totalPopulation;
            if (popDiff < 1) {
                return this.growthScale(popDiff);
            }
            return this.growthScale(1.00);
        }).attr('y', 5).attr('height', 10).attr('width', (d) => {
            d = <MigrationNode>this.currentData[year][d.nodeId];
            if (year === 2005) {
                return 0;
            }
            const popDiff = d.totalPopulation / this.currentData[year - 1][d.nodeId].totalPopulation;
            if (popDiff > 1) {
                return this.growthScale(popDiff) - this.growthScale(1);
            }

            return this.growthScale(1.00) - this.growthScale(popDiff);
        }).attr('fill', (d) => {
            if (year === 2005) {
                return 0;
            }
            d = this.currentData[year][d.nodeId];
            const popDiff = d.totalPopulation / this.currentData[year - 1][d.nodeId].totalPopulation;
            if (popDiff < 1.00) {
                return 'red';
            } else {
                return 'blue';
            }
        });
    }

    /**
     *
     * @param join selection for updating/creating attributes
     * @param year current year for the view
     */
    popTotal(join, year) {
        join.text((d) => {
            d = this.currentData[year][d.nodeId];
            return d.totalPopulation;
        });
    }

    addAxis(el: Selection<any, any, any, any>, axis: d3.AxisScale<number>, x: number = 8){
        //@ts-ignore
        el.append('g').attr("transform", `translate(${x}, 48)`).call(axis).selectAll('text').style("text-anchor", "end")
            .attr("dx", "-.5em")
            // .attr("dy", ".01em")
            .attr("transform", `translate(${-x + 8}, 0) rotate(90)`)
    }

    labelListener(l) {
        console.debug(`Clicked ${l} header`);
    }

    changeYear(year: number) {
        this.curYear = year;
        this.loadTable(year);
    }

}