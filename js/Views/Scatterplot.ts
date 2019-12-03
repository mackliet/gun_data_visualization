import * as d3 from "d3";
import {Selection} from 'd3-selection';
import {IView} from "./IView";
import {createTooltip, removeTooltip, removeAllTooltips, updateTooltip} from "./ViewUtils"
import {Year_to_indicators_map, State_indicators} from "../Data/State_indicators"
import {RegionEnum,GeographicAreaEnum, getGeographicAreaStrings, getRegionStrings} from "../Data/DataUtils"
import {Dimensions} from "../Utils/svg-utils";
import { text } from "d3";
import { maxHeaderSize } from "http";
import { types } from "@babel/core";
import { thisTypeAnnotation } from "@babel/types";
import { endianness } from "os";
import {Table} from "./Table";


export class Scatterplot implements IView 
{
    readonly year_to_indicators: Year_to_indicators_map;
    readonly container: Selection<any, any, any, any>;
    readonly legend_div: Selection<any, any, any, any>;
    readonly state_table_div: Selection<any, any, any, any>;
    readonly svg: Selection<any, any, any, any>;
    readonly svg_dims: Dimensions;
    readonly padding: number;
    readonly circle_radius: number;
    readonly label_padding: number;
    readonly axes_group: Selection<any, any, any, any>;
    readonly circle_group: Selection<any, any, any, any>;
    readonly indicators: Array<string>;
    readonly default_transition_time: number;
    readonly year_change_transition_time: number;
    readonly color_map: d3.ScaleOrdinal<string, string>;
    readonly state_to_geo_area: {[key:string]:string};
    readonly table: Table;
    region_column: Selection<any, any, any, any>;
    circle_selection: Selection<any, any, any, any>;
    active_x_indicator: string;
    active_y_indicator: string;
    x_scale: d3.ScaleLinear<number, number>;
    y_scale: d3.ScaleLinear<number, number>;
    curYear: number;
    current_year_data: Array<State_indicators>;
    highlightedState: RegionEnum;
    highlightCallback: (RegionEnum) => void;
    clearCallback: () => void;

    constructor(state_data: Year_to_indicators_map, container: Selection<any, any, any, any>,
                svg_dims: Dimensions, table: Table, start_year: number = 2017)
    {
        const plot_div = container.append('div').classed('plot_container', true);
        this.table = table;
        this.curYear = start_year;
        this.year_to_indicators = state_data
        this.current_year_data = this.year_to_indicators[this.curYear];
        this.container = container;
        this.state_table_div = plot_div.append('div').append('div');
        this.padding = 110;
        this.circle_radius = 5;
        this.label_padding = 50;
        this.svg = plot_div.append('svg').attr('height', svg_dims.height-this.label_padding+10).attr('width', svg_dims.width);
        this.legend_div = plot_div.append('div');
        this.axes_group = this.svg.append('g');
        this.circle_group = this.svg.append('g');
        this.indicators = ['population', 'total_left', 'total_came', 'net_immigration_flow', 'total_left_per_capita', 'total_came_per_capita', 'net_immigration_flow_per_capita', 'GDP_per_capita', 'GDP_percent_change', 'jobs', 'jobs_per_capita', 'personal_income_per_capita', 'personal_disposable_income_per_capita', 'personal_taxes_per_capita'];
        this.active_x_indicator = 'personal_taxes_per_capita';
        this.active_y_indicator = 'net_immigration_flow';
        this.svg_dims = svg_dims;
        this.default_transition_time = 800;
        this.year_change_transition_time = 150;
        this.color_map = d3.scaleOrdinal(d3.schemeDark2).domain(getGeographicAreaStrings());
        this.highlightedState = null;

        this.state_to_geo_area = {};
        for(let state of this.current_year_data)
        {
            this.state_to_geo_area[`${state.state}`] = `${state.geographic_area}`;
        }

        this.create_state_table();
        this.create_dropdowns();
        this.create_scales();
        this.update_plot();
    };

    static indicator_to_name(indicator)
    {
        let no_underscores = indicator.replace(new RegExp('_', 'g'), ' ');
        return no_underscores[0].toUpperCase() + no_underscores.slice(1)
    }

    setHighlightCallback(callback: (RegionEnum)=>void)
    {
        this.highlightCallback = callback;
    }

    setClearCallback(callback: ()=>void)
    {
        this.clearCallback = callback;
    }

    highlightState(state: RegionEnum)
    {
        const that = this;
        this.highlightedState = state;
        this.circle_group.selectAll('circle').filter((d:State_indicators) => 
        {
            return d.state === state;
        }).each(function(d)
            {
                that.createTooltip(d, d3.select(this));
            }
        );
    }

    clearHighlightedState()
    {
        this.highlightedState = null;
        this.circle_group.selectAll('circle').classed('hovered', false);
        removeAllTooltips(this.svg);
    }

    // Currently not used. Can use if we want to, but this data
    // is now in the state selection table
    create_legend()
    {
        const geographic_areas = getGeographicAreaStrings();
        const legend_svg = this.legend_div
                            .append('div')
                            .classed('legend_svg_div',true)
                            .attr('height', 200)
                            .append('svg')
                            .attr('width', 130)
                            .attr('height', 200)
                            .style('float', 'right');
        legend_svg.selectAll('circle')
        .data(geographic_areas)
        .join('circle')
        .attr("cx", 10)
        .attr("cy", (d,i) => 10 + i*25) 
        .attr("r", 5)
        .style("fill", d => this.color_map(d))

        legend_svg.selectAll('text')
        .data(geographic_areas)
        .join('text')
        .attr("x", 20)
        .attr("y", (d,i) => 11 + i*25) 
        .text(d => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
    }

    create_state_table()
    {
        const that = this;
        this.state_table_div.classed('dropdown_div', true);
        this.state_table_div.append('span')
                            .style('font-weight', 'bold')
                            .style('text-align', 'right')
                            .text('Select States');
        const state_table = this.state_table_div
            .append('div').classed('dropdown_div-content',true)
            .append('table').classed('state_table', true);
        const thead = state_table.append('thead');
        const tbody = state_table.append('tbody');

        tbody.attr('height', (this.svg_dims.height - this.padding)/2)
        
        const states = getRegionStrings();
        const geographic_areas = getGeographicAreaStrings();
        const all_arr = ['All'];
        const table_data = []
        for(let i = 0; i < states.length; i++)
        {
            let col1 = i < all_arr.length ? all_arr[i] : '';
            let col2 = i < geographic_areas.length ? geographic_areas[i] : '' 
            let col3 = i < states.length ? states[i] : ''
            table_data.push({col1: col1, col2: col2, col3: col3});
        }

        const add_switch =
        function(selection: Selection<any, any, any, any>, col_name: string)
        {
            const label = selection.append('label');
            label.append('input').attr('type', 'checkbox').each(function(d){this.checked = true;});
            label.append('font').text(d => d[col_name]);
        };

        let rows = 
        tbody.selectAll('tr')
        .data(table_data)

        const rows_enter = rows.enter().append('tr');

        let all_column = rows_enter.append('td');
        let geo_area_column = rows_enter.append('td');
        let region_column = rows_enter.append('td');

        all_column = all_column.filter(d => d.col1 != '');
        geo_area_column = geo_area_column.filter(d => d.col2 != '');

        add_switch(all_column, 'col1');
        add_switch(geo_area_column, 'col2');
        add_switch(region_column, 'col3');
        rows = rows.merge(rows_enter);

        geo_area_column.select('font').classed('outlined', true).attr('color', d => this.color_map(d.col2));
        region_column.select('font').classed('outlined', true).attr('color', d => this.color_map(this.state_to_geo_area[d.col3]));

        all_column
        .select('label')
        .select('input')
        .on("change", 
        function()
        {
            const checkbox = this as HTMLInputElement;
            that.table.tBody.selectAll('tr').classed('hide-row', !checkbox.checked);
            that.circle_selection.classed('unselected', !checkbox.checked);
            rows.selectAll('input')
            .each(function(){(this as HTMLInputElement).checked = checkbox.checked})
        });
        geo_area_column
        .select('label')
        .select('input')
        .on("change", 
        function(d)
        {
            const geo_area_filter = region_d => d.col2 == that.state_to_geo_area[region_d.col3];
            const checkbox = this as HTMLInputElement;
            that.circle_selection.filter(state_data => `${state_data.geographic_area}` == d.col2)
            .classed('unselected', !checkbox.checked);
            that.table.tBody.selectAll('tr').filter(`.${d.col2.clean()}`).classed('hide-row', !checkbox.checked);
            region_column.filter(geo_area_filter)
            .select('input')
            .each(function(){(this as HTMLInputElement).checked = checkbox.checked});

            const num_region= region_column.select('input').size();
            const num_checked_region = region_column.select('input').filter(function(){return (this as HTMLInputElement).checked}).size();
            all_column.select('input').each(function(){(this as HTMLInputElement).checked = num_region == num_checked_region});
        });

        region_column
        .select('label')
        .select('input')
        .on("change", 
        function(d)
        {
            const checkbox = this as HTMLInputElement;
            that.table.tBody.selectAll('tr').filter(`#${d.col3.clean()}`).classed('hide-row', checkbox.checked);
            that.update_checked_states(d.col3, checkbox.checked);

            const region_same_geo_area = region_d => that.state_to_geo_area[d.col3] == that.state_to_geo_area[region_d.col3];
            const geo_area_for_region = geo_col => geo_col.col2 == that.state_to_geo_area[d.col3];

            const num_in_geo_area= region_column.filter(region_same_geo_area).select('input').size();
            const num_checked_in_geo_area = region_column.filter(region_same_geo_area).select('input').filter(function(){return (this as HTMLInputElement).checked}).size();
            geo_area_column.filter(geo_area_for_region).select('input').each(function(){(this as HTMLInputElement).checked = num_in_geo_area == num_checked_in_geo_area});

            const num_region= region_column.select('input').size();
            const num_checked_region = region_column.select('input').filter(function(){return (this as HTMLInputElement).checked}).size();
            all_column.select('input').each(function(){(this as HTMLInputElement).checked = num_region == num_checked_region});
        });

        this.region_column = region_column;
    }

    update_checked_states(state: string, checked: boolean)
    {
        this.circle_selection.filter(d => `${d.state}` == state)
        .classed('unselected', d => !checked);
    }

    create_dropdowns()
    {
        const dropdown_wrapper = this.legend_div.append('div');
        let y_wrap = dropdown_wrapper.append('div').classed('dropdown-panel', true);

        y_wrap.append('div').classed('y-label', true)
            .append('text')
            .text('Y Axis Data');

        y_wrap.append('div').attr('id', 'dropdown_y').classed('dropdown', true).append('div').classed('dropdown-content', true)
            .append('select');

        let x_wrap = dropdown_wrapper.append('div').classed('dropdown-panel', true);

        x_wrap.append('div').classed('x-label', true)
            .append('text')
            .text('X Axis Data');

        x_wrap.append('div').attr('id', 'dropdown_x').classed('dropdown', true).append('div').classed('dropdown-content', true)
            .append('select');


        const that = this;
        /* X DROPDOWN */
        let drop_x = dropdown_wrapper.select('#dropdown_x').select('.dropdown-content').select('select');

        let options_x = drop_x.selectAll('option').data(this.indicators).join('option');

        options_x
        .append('option')
        .attr('value', d => d);

        options_x
        .append('text')
        .text(d => Scatterplot.indicator_to_name(d));

        options_x.filter(indicator => indicator === this.active_x_indicator)
        .attr('selected', true);

        drop_x.on('change', function(d, i) {
            const this_select = this as HTMLSelectElement;
            that.active_x_indicator = that.indicators[this_select.selectedIndex];
            that.update_plot(); 
        });

        /* Y DROPDOWN */
        let drop_y = dropdown_wrapper.select('#dropdown_y').select('.dropdown-content').select('select');

        let options_y = drop_y.selectAll('option').data(this.indicators).join('option');

        options_y
        .append('option')
        .attr('value', indicator => indicator);

        options_y
        .append('text')
        .text(d => Scatterplot.indicator_to_name(d));

        options_y.filter(indicator => indicator === this.active_y_indicator)
        .attr('selected', true);

        drop_y.on('change', function(d, i) {
            const this_select = this as HTMLSelectElement;
            that.active_y_indicator = that.indicators[this_select.selectedIndex];
            that.update_plot(); 
        });
    }

    create_scales()
    {
        this.axes_group.append('g')
        .attr('id', 'x-axis')

        this.axes_group.append('g')
        .attr('id', 'y-axis')

        this.axes_group
        .append('text')
        .classed('x-label', true)

        this.axes_group
        .append('text')
        .classed('y-label', true)
    }

    change_year(year: number)
    {
        this.current_year_data = this.year_to_indicators[year];
        this.curYear = year;
        this.update_plot_with_time(this.year_change_transition_time);
    }

    update_scales_with_time(transition_time: number)
    {
        const padding = this.padding;
        const svg_dims = this.svg_dims;
        const label_padding = this.label_padding;

        const find_extreme = 
        (indicator: string, extreme_func: typeof d3.min) =>
        {
            let extreme_val = null;
            for(let year in this.year_to_indicators)
            {
                const year_data = this.year_to_indicators[year];
                let extreme_for_year = extreme_func(year_data, d => d[indicator])
                extreme_val = extreme_val === null 
                            ? extreme_for_year
                            : extreme_func([extreme_val, extreme_for_year]);
            }
            return extreme_val;
        }
        const x_domain = [find_extreme(this.active_x_indicator, d3.min), 
                          find_extreme(this.active_x_indicator, d3.max)]

        const y_domain = [find_extreme(this.active_y_indicator, d3.min), 
                          find_extreme(this.active_y_indicator, d3.max)]
        
        const x_scale = d3.scaleLinear()
                  .domain(x_domain)
                  .range([padding, svg_dims.width-2*this.circle_radius]);

        const y_scale = d3.scaleLinear()
                  .domain(y_domain)
                  .range([svg_dims.height - padding, 2*this.circle_radius]);

        this.axes_group.select('#x-axis')
        .attr('transform', `translate (0,${y_scale.range()[0]})`)
        .transition()
        .call(d3.axisBottom(x_scale).ticks(6) as any)
        .duration(transition_time);

        this.axes_group.select('#y-axis')
        .attr('transform', `translate (${padding},0)`)
        .transition()
        .call(d3.axisLeft(y_scale).ticks(6) as any)
        .duration(transition_time);

        this.axes_group.select('.x-label')
        .style('text-anchor', 'middle')
        .attr('transform', `translate(${x_scale.range()[0] + (x_scale.range()[1] - x_scale.range()[0])/2.0}, ${svg_dims.height - label_padding})`)
        .text(Scatterplot.indicator_to_name(this.active_x_indicator));

        this.axes_group.select('.y-label')
        .style('text-anchor', 'middle')
        .attr('transform', `translate(${label_padding}, ${y_scale.range()[0] + (y_scale.range()[1] - y_scale.range()[0])/2.0}) rotate(-90)`)
        .text(Scatterplot.indicator_to_name(this.active_y_indicator));

        this.x_scale = x_scale;
        this.y_scale = y_scale;
    }

    update_plot()
    {
        this.update_plot_with_time(this.default_transition_time);
    }

    createTooltip(d, circle)
    {
        circle.classed('hovered', true)
            const is_float = num => num %1 !== 0;
            const x_val = d[this.active_x_indicator];
            const y_val = d[this.active_y_indicator];
            let lines = [`${d.state}`, 
                         `${Scatterplot.indicator_to_name(this.active_x_indicator)}: ${is_float(x_val) ? x_val.toFixed(4) : x_val}`, 
                         `${Scatterplot.indicator_to_name(this.active_y_indicator)}: ${is_float(y_val) ? y_val.toFixed(4) : y_val}`];
            const x: number = parseFloat(circle.attr('cx')) + parseFloat(circle.attr('r')) + 1;
            const y: number = parseFloat(circle.attr('cy')) + parseFloat(circle.attr('r')) + 1;
            createTooltip(this.svg, [x,y], lines);
    }

    updateTooltip(d, circle)
    {
        circle.classed('hovered', true)
            const is_float = num => num %1 !== 0;
            const x_val = d[this.active_x_indicator];
            const y_val = d[this.active_y_indicator];
            let lines = [`${d.state}`, 
                         `${Scatterplot.indicator_to_name(this.active_x_indicator)}: ${is_float(x_val) ? x_val.toFixed(4) : x_val}`, 
                         `${Scatterplot.indicator_to_name(this.active_y_indicator)}: ${is_float(y_val) ? y_val.toFixed(4) : y_val}`];
            const x: number = parseFloat(circle.attr('cx')) + parseFloat(circle.attr('r')) + 1;
            const y: number = parseFloat(circle.attr('cy')) + parseFloat(circle.attr('r')) + 1;
            updateTooltip(this.svg, [x,y], lines);
    }
    
    update_plot_with_time(transition_time: number)
    {
        this.update_scales_with_time(transition_time);

        const that = this;
        
        this.circle_selection =
        this.circle_group
        .selectAll('circle')
        .data(this.current_year_data.filter(d => typeof(d[this.active_x_indicator]) !== 'undefined' &&  typeof(d[this.active_y_indicator]) !== 'undefined'))
        .join('circle')
        .attr('fill', d => this.color_map(`${d.geographic_area}`))
        .classed('unselected', d => !(this.region_column.filter(row_d => `${d.state}` == `${row_d.col3}`).select('input').node() as HTMLInputElement).checked)
        .on('mouseover',
        function(d)
        {
            if(that.highlightedState === null)
            {
                console.log('Called!');
                let circle = d3.select(this);
                that.createTooltip(d, circle);
            }
        })
        .on('mouseout',
        function(d)
        {
            if(that.highlightedState === null)
            {
                that.clearHighlightedState();
            }
        })
        .on('click', d=>
        {
            this.highlightCallback(d.state);
        });

        this.circle_selection
        .transition()
        .attr('r', this.circle_radius)
        .attr('cx', d => this.x_scale(d[this.active_x_indicator]))
        .attr('cy', d => this.y_scale(d[this.active_y_indicator]))
        .duration(transition_time)
        .on('end', function(d) 
        {
            if(that.highlightedState !== null && d.state === that.highlightedState)
            {
                that.updateTooltip(d, d3.select(this));
            }
        });
    }
}