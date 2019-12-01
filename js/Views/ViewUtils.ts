import * as d3 from "d3";
import {Selection} from 'd3-selection';

export enum ViewState {
    net = 'net',
    out = 'out',
    in = 'in'
}

function getTooltipPadding()
{
    return 5;
}

function addTooltipLines(tooltip_text: Selection<any, any, any, any>,
                         tooltip_rect: Selection<any, any, any, any>,
                         text_lines: string[])
{
    let test_tspan = tooltip_text.append('tspan').text('TEST');
    let oneLineHeight = test_tspan.node().getBBox().height;
    test_tspan.remove();
    for(let line of text_lines)
    {
        tooltip_text
        .append('tspan')
        .classed('custom_tooltip', true)
        .attr('x',0)
        .attr('y', tooltip_text.node().getBBox().height)
        .text(line);
    }
    
    const padding = getTooltipPadding();
    tooltip_rect.attr('width', tooltip_text.node().getBBox().width + 2*padding)
    tooltip_rect.attr('height', tooltip_text.node().getBBox().height + 2*padding)
    tooltip_text
    .selectAll('tspan')
    .attr('x', parseFloat(tooltip_rect.attr('width'))/2)
    .attr('y', 
    function(d,i)
    {
        return (i+1)*oneLineHeight;
    });
}

function placeTooltip(svg: Selection<any, any, any, any>,
                      tooltip: Selection<any, any, any, any>,
                      tooltip_rect: Selection<any, any, any, any>,
                      [x,y]: [number,number])
{
    const padding = getTooltipPadding();
    const svg_width = parseFloat(svg.attr('width'));
    const tooltip_width = parseFloat(tooltip_rect.attr('width'));
    const tooltip_x = x + tooltip_width > svg_width
                    ? svg_width - tooltip_width - 2*padding
                    : x
                    
    let mouseY = y;
    try
    {
        mouseY = d3.mouse(svg.node())[1];
    }
    catch
    {
        mouseY = y
    }
    const tooltip_y = y == mouseY ? (y+2) : y;
    tooltip.attr('transform', `translate (${tooltip_x} ${tooltip_y})`);
}

export function createTooltip(svg: Selection<any, any, any, any>, [x,y]:[number,number], text_lines: string[])
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
    
    addTooltipLines(tooltip_text, tooltip_rect, text_lines);
    placeTooltip(svg, tooltip, tooltip_rect, [x,y]);
}

export function updateTooltip(svg: Selection<any, any, any, any>, [x,y]: [number, number], text_lines: string[])
{
    const tooltip = svg.select('.tooltip-group');
    const tooltip_rect = tooltip.select('rect')
    const tooltip_text = tooltip.select('text') as Selection<SVGTextElement, any, any, any>;
    
    tooltip_text
    .selectAll('tspan')
    .remove();

    addTooltipLines(tooltip_text, tooltip_rect, text_lines);
    placeTooltip(svg, tooltip, tooltip_rect, [x,y]);
}


export function removeTooltip(svg: Selection<any, any, any, any>)
{
    svg.select('.tooltip-group').remove();
}

export function removeAllTooltips(svg: Selection<any, any, any, any>)
{
    svg.selectAll('.tooltip-group').remove();
}