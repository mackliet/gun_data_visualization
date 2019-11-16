import * as d3 from "d3";
import {Selection} from 'd3-selection';
import {IView} from "./IView";
import {Year_to_indicators_map, State_indicators} from "../Data/State_indicators"
import {RegionEnum} from "../Data/DataUtils"
import {Dimensions} from "../Utils/svg-utils";
import { text } from "d3";


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
        .attr('fill', 'steelblue')
        .on('mouseover',
        function(d)
        {
            console.log("MOUSEOVER")
            let circle = d3.select(this);
            circle.classed('hovered', true)
            const is_float = num => num %1 !== 0;
            const x_val = d[that.activeX];
            const y_val = d[that.activeY];
            let lines = [`${d.state}`, 
                         `${Scatterplot.indicator_to_name(that.activeX)}: ${is_float(x_val) ? x_val.toFixed(4) : x_val}`, 
                         `${Scatterplot.indicator_to_name(that.activeY)}: ${is_float(y_val) ? y_val.toFixed(4) : y_val}`];
            const x: number = parseFloat(circle.attr('cx')) + parseFloat(circle.attr('r')) + 1;
            const y: number = parseFloat(circle.attr('cy')) + parseFloat(circle.attr('r')) + 1;
            Scatterplot.create_tooltip(that.svg, x, y, lines);
        })
        .on('mouseout',
        function(d)
        {
            d3.select(this).classed('hovered', false);
            that.svg.selectAll('.tooltip-group').remove();
        })
        .transition()
        .attr('r', 5)
        .attr('cx', d => this.xScale(d[this.activeX]))
        .attr('cy', d => this.yScale(d[this.activeY]))
        .duration(this.transition_time);
    }

    static create_tooltip(svg: Selection<any, any, any, any>, x: number, y:number, text_lines: Array<string>)
    {
        let tooltip = svg
        .append('g')
        .classed('tooltip-group', true)

        let tooltip_rect = 
        tooltip
        .append('rect')
        .classed('custom_tooltip',true)
        .attr('rx', 10)
        .attr('ry', 10)

        let tooltip_text = tooltip
        .append('text')
        .classed('custom_tooltip', true)
        
        for(let line of text_lines)
        {
            let tspan = tooltip_text
            .append('tspan')
            .classed('custom_tooltip', true)
            .attr('x',0)
            .attr('y', tooltip_text.node().getBBox().height)
            .text(line);
        }
        
        tooltip_rect.attr('width', tooltip_text.node().getBBox().width + 20)
        tooltip_rect.attr('height', tooltip_text.node().getBBox().height + 20)
        tooltip_text
        .selectAll('tspan')
        .attr('x', parseFloat(tooltip_rect.attr('width'))/2)
        .attr('y', 
        function()
        {
            let current_y = parseFloat(d3.select(this).attr('y'));
            let rect_height = parseFloat(tooltip_rect.attr('height'));
            return current_y + rect_height/text_lines.length;
        });

        const svg_width = parseFloat(svg.attr('width'));
        const tooltip_width = parseFloat(tooltip_rect.attr('width'));
        const tooltip_x = x + tooltip_width > svg_width
                        ? svg_width - tooltip_width - 20
                        : x
        tooltip.attr('transform', `translate (${tooltip_x} ${y})`);
    }

}