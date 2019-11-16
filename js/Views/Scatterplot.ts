import * as d3 from "d3";
import {Selection} from 'd3-selection';
import {IView} from "./IView";
import {Year_to_indicators_map, State_indicators} from "../Data/State_indicators"
import {RegionEnum} from "../Data/DataUtils"
import {Dimensions} from "../Utils/svg-utils";


export class Scatterplot implements IView 
{
    readonly year_to_indicators: Year_to_indicators_map;
    readonly container: Selection<any, any, any, any>
    readonly dropdownWrapper: Selection<any, any, any, any>
    readonly svg: Selection<any, any, any, any>;
    readonly svgDims: Dimensions;
    readonly padding: number;
    readonly axesGroup: Selection<any, any, any, any>;
    readonly circleGroup: Selection<any, any, any, any>;
    readonly indicators: Array<string>
    readonly transition_time: number
    activeX: string
    activeY: string
    xScale: d3.ScaleLinear<number, number>
    yScale: d3.ScaleLinear<number, number>
    curYear: number;
    cur_year_data: Array<State_indicators>;

    constructor(state_data: Year_to_indicators_map, container: Selection<any, any, any, any>,
                svgDims: Dimensions, startYear: number = 2017) 
    {
        this.curYear = startYear;
        this.year_to_indicators = state_data
        this.cur_year_data = this.year_to_indicators[this.curYear];
        this.container = container;
        this.dropdownWrapper = container.append('div');
        this.svg = container.append('svg').attr('height', svgDims.height).attr('width', svgDims.width);
        this.axesGroup = this.svg.append('g');
        this.circleGroup = this.svg.append('g');
        this.indicators = ['population', 'total_left', 'total_came', 'net_immigration_flow', 'GDP_per_capita', 'GDP_percent_change', 'jobs', 'jobs_per_capita', 'personal_income_per_capita', 'personal_disposable_income_per_capita', 'personal_taxes_per_capita'];
        this.activeX = 'jobs_per_capita';
        this.activeY = 'net_immigration_flow';
        this.svgDims = svgDims;
        this.padding = 110;
        this.transition_time = 800;
        
        this.create_dropdowns();
        this.create_scales();
        this.update_plot();
    };

    static indicator_to_name(indicator)
    {
        let no_underscores = indicator.replace(new RegExp('_', 'g'), ' ');
        return no_underscores[0].toUpperCase() + no_underscores.slice(1)
    }

    create_dropdowns()
    {
        let yWrap = this.dropdownWrapper.append('div').classed('dropdown-panel', true);

        yWrap.append('div').classed('y-label', true)
            .append('text')
            .text('Y Axis Data');

        yWrap.append('div').attr('id', 'dropdown_y').classed('dropdown', true).append('div').classed('dropdown-content', true)
            .append('select');

        let xWrap = this.dropdownWrapper.append('div').classed('dropdown-panel', true);

        xWrap.append('div').classed('x-label', true)
            .append('text')
            .text('X Axis Data');

        xWrap.append('div').attr('id', 'dropdown_x').classed('dropdown', true).append('div').classed('dropdown-content', true)
            .append('select');


        const that = this;
        /* X DROPDOWN */
        let dropX = this.dropdownWrapper.select('#dropdown_x').select('.dropdown-content').select('select');

        let optionsX = dropX.selectAll('option').data(this.indicators).join('option');

        optionsX
        .append('option')
        .attr('value', d => d);

        optionsX
        .append('text')
        .text(d => Scatterplot.indicator_to_name(d));

        optionsX.filter(indicator => indicator === this.activeX)
        .attr('selected', true);

        dropX.on('change', function(d, i) {
            const this_select = this as HTMLSelectElement;
            that.activeX = that.indicators[this_select.selectedIndex];
            that.update_plot(); 
        });

        /* Y DROPDOWN */
        let dropY = this.dropdownWrapper.select('#dropdown_y').select('.dropdown-content').select('select');

        let optionsY = dropY.selectAll('option').data(this.indicators).join('option');

        optionsY
        .append('option')
        .attr('value', indicator => indicator);

        optionsY
        .append('text')
        .text(d => Scatterplot.indicator_to_name(d));

        optionsY.filter(indicator => indicator === this.activeY)
        .attr('selected', true);

        dropY.on('change', function(d, i) {
            const this_select = this as HTMLSelectElement;
            that.activeY = that.indicators[this_select.selectedIndex];
            that.update_plot(); 
        });
    }

    create_scales()
    {
        this.axesGroup.append('g')
        .attr('id', 'x-axis')

        this.axesGroup.append('g')
        .attr('id', 'y-axis')

        this.axesGroup
        .append('text')
        .classed('x-label', true)

        this.axesGroup
        .append('text')
        .classed('y-label', true)
    }

    update_scales()
    {
        const padding = this.padding;
        const svgDims = this.svgDims;
        const label_padding = 50;

        const xDomain = [d3.min(this.cur_year_data, d => d[this.activeX]), 
                         d3.max(this.cur_year_data, d => d[this.activeX])]

        const yDomain = [d3.min(this.cur_year_data, d => d[this.activeY]), 
                         d3.max(this.cur_year_data, d => d[this.activeY])]
        
        const xScale = d3.scaleLinear()
                  .domain(xDomain)
                  .range([padding, svgDims.width-padding]);

        const yScale = d3.scaleLinear()
                  .domain(yDomain)
                  .range([svgDims.height - padding, padding]);

        this.axesGroup.select('#x-axis')
        .attr('transform', `translate (0,${yScale.range()[0]})`)
        .transition()
        .call(d3.axisBottom(xScale).ticks(6) as any)
        .duration(this.transition_time);

        this.axesGroup.select('#y-axis')
        .attr('transform', `translate (${padding},0)`)
        .transition()
        .call(d3.axisLeft(yScale).ticks(6) as any)
        .duration(this.transition_time);

        this.axesGroup.select('.x-label')
        .style('text-anchor', 'middle')
        .attr('transform', `translate(${xScale.range()[0] + (xScale.range()[1] - xScale.range()[0])/2.0}, ${svgDims.height - label_padding})`)
        .text(Scatterplot.indicator_to_name(this.activeX));

        this.axesGroup.select('.y-label')
        .style('text-anchor', 'middle')
        .attr('transform', `translate(${label_padding}, ${yScale.range()[0] + (yScale.range()[1] - yScale.range()[0])/2.0}) rotate(-90)`)
        .text(Scatterplot.indicator_to_name(this.activeY));

        this.xScale = xScale;
        this.yScale = yScale;
    }

    update_plot()
    {
        this.update_scales();

        const that = this;
        this.circleGroup
        .selectAll('circle')
        .data(this.cur_year_data.filter(d => typeof(d[this.activeX]) !== 'undefined' &&  typeof(d[this.activeY]) !== 'undefined'))
        .join('circle')
        .transition()
        .attr('r', 5)
        .attr('cx', d => this.xScale(d[this.activeX]))
        .attr('cy', d => this.yScale(d[this.activeY]))
        .duration(this.transition_time);
    }

}