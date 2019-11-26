(function (d3, topojson) {
    'use strict';

    /**
     * Enumerator representing all 50 States
     */
    var RegionEnum;
    (function (RegionEnum) {
        RegionEnum[RegionEnum["Alabama"] = 0] = "Alabama";
        RegionEnum[RegionEnum["Alaska"] = 1] = "Alaska";
        RegionEnum[RegionEnum["Arizona"] = 2] = "Arizona";
        RegionEnum[RegionEnum["Arkansas"] = 3] = "Arkansas";
        RegionEnum[RegionEnum["California"] = 4] = "California";
        RegionEnum[RegionEnum["Colorado"] = 5] = "Colorado";
        RegionEnum[RegionEnum["Connecticut"] = 6] = "Connecticut";
        RegionEnum[RegionEnum["Delaware"] = 7] = "Delaware";
        RegionEnum[RegionEnum["District of Columbia"] = 8] = "District of Columbia";
        RegionEnum[RegionEnum["Florida"] = 9] = "Florida";
        RegionEnum[RegionEnum["Georgia"] = 10] = "Georgia";
        RegionEnum[RegionEnum["Hawaii"] = 11] = "Hawaii";
        RegionEnum[RegionEnum["Idaho"] = 12] = "Idaho";
        RegionEnum[RegionEnum["Illinois"] = 13] = "Illinois";
        RegionEnum[RegionEnum["Indiana"] = 14] = "Indiana";
        RegionEnum[RegionEnum["Iowa"] = 15] = "Iowa";
        RegionEnum[RegionEnum["Kansas"] = 16] = "Kansas";
        RegionEnum[RegionEnum["Kentucky"] = 17] = "Kentucky";
        RegionEnum[RegionEnum["Louisiana"] = 18] = "Louisiana";
        RegionEnum[RegionEnum["Maine"] = 19] = "Maine";
        RegionEnum[RegionEnum["Maryland"] = 20] = "Maryland";
        RegionEnum[RegionEnum["Massachusetts"] = 21] = "Massachusetts";
        RegionEnum[RegionEnum["Michigan"] = 22] = "Michigan";
        RegionEnum[RegionEnum["Minnesota"] = 23] = "Minnesota";
        RegionEnum[RegionEnum["Mississippi"] = 24] = "Mississippi";
        RegionEnum[RegionEnum["Missouri"] = 25] = "Missouri";
        RegionEnum[RegionEnum["Montana"] = 26] = "Montana";
        RegionEnum[RegionEnum["Nebraska"] = 27] = "Nebraska";
        RegionEnum[RegionEnum["Nevada"] = 28] = "Nevada";
        RegionEnum[RegionEnum["New Hampshire"] = 29] = "New Hampshire";
        RegionEnum[RegionEnum["New Jersey"] = 30] = "New Jersey";
        RegionEnum[RegionEnum["New Mexico"] = 31] = "New Mexico";
        RegionEnum[RegionEnum["New York"] = 32] = "New York";
        RegionEnum[RegionEnum["North Carolina"] = 33] = "North Carolina";
        RegionEnum[RegionEnum["North Dakota"] = 34] = "North Dakota";
        RegionEnum[RegionEnum["Ohio"] = 35] = "Ohio";
        RegionEnum[RegionEnum["Oklahoma"] = 36] = "Oklahoma";
        RegionEnum[RegionEnum["Oregon"] = 37] = "Oregon";
        RegionEnum[RegionEnum["Pennsylvania"] = 38] = "Pennsylvania";
        RegionEnum[RegionEnum["Rhode Island"] = 39] = "Rhode Island";
        RegionEnum[RegionEnum["South Carolina"] = 40] = "South Carolina";
        RegionEnum[RegionEnum["South Dakota"] = 41] = "South Dakota";
        RegionEnum[RegionEnum["Tennessee"] = 42] = "Tennessee";
        RegionEnum[RegionEnum["Texas"] = 43] = "Texas";
        RegionEnum[RegionEnum["Utah"] = 44] = "Utah";
        RegionEnum[RegionEnum["Vermont"] = 45] = "Vermont";
        RegionEnum[RegionEnum["Virginia"] = 46] = "Virginia";
        RegionEnum[RegionEnum["Washington"] = 47] = "Washington";
        RegionEnum[RegionEnum["West Virginia"] = 48] = "West Virginia";
        RegionEnum[RegionEnum["Wisconsin"] = 49] = "Wisconsin";
        RegionEnum[RegionEnum["Wyoming"] = 50] = "Wyoming";
    })(RegionEnum || (RegionEnum = {}));
    var GeographicAreaEnum;
    (function (GeographicAreaEnum) {
        GeographicAreaEnum[GeographicAreaEnum["New England"] = 0] = "New England";
        GeographicAreaEnum[GeographicAreaEnum["Mideast"] = 1] = "Mideast";
        GeographicAreaEnum[GeographicAreaEnum["Great Lakes"] = 2] = "Great Lakes";
        GeographicAreaEnum[GeographicAreaEnum["Plains"] = 3] = "Plains";
        GeographicAreaEnum[GeographicAreaEnum["Southeast"] = 4] = "Southeast";
        GeographicAreaEnum[GeographicAreaEnum["Southwest"] = 5] = "Southwest";
        GeographicAreaEnum[GeographicAreaEnum["Rocky Mountain"] = 6] = "Rocky Mountain";
        GeographicAreaEnum[GeographicAreaEnum["Far West"] = 7] = "Far West";
    })(GeographicAreaEnum || (GeographicAreaEnum = {}));

    /**
     * Data structure that contains all the state migration data, immutable
     */
    var MigrationPatterns = /** @class */ (function () {
        function MigrationPatterns(data) {
            this.minSum = Number.MAX_VALUE;
            this.maxSum = 0;
            this.minInflow = Number.MAX_VALUE;
            this.maxInflow = 0;
            this.minOutflow = Number.MAX_VALUE;
            this.maxOutflow = 0;
            this.data = {};
            this.years = [];
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var o = data_1[_i];
                var curYear = +o.year;
                this.years.push(curYear);
                this.data[curYear] = [];
                this.stateRanges = {};
                for (var _a = 0, _b = o.data; _a < _b.length; _a++) {
                    var d = _b[_a];
                    var id = RegionEnum[d.state.trim()];
                    if (!this.stateRanges.hasOwnProperty(id)) {
                        this.stateRanges[id] = {
                            maxEdgeTo: -Number.MAX_VALUE,
                            maxEdgeFrom: -Number.MAX_VALUE,
                            minEdgeNet: Number.MAX_VALUE,
                            maxEdgeNet: -Number.MAX_VALUE
                        };
                    }
                    var node = {
                        year: curYear,
                        nodeId: RegionEnum[d.state.trim()],
                        netImmigrationFlow: d.net_immigration_flow,
                        totalPopulation: +d.population,
                        totalCame: d.total_came,
                        totalLeft: d.total_left,
                        toEdges: new Map(),
                        fromEdges: new Map(),
                    };
                    /**
                     * Check totals get max values
                     */
                    if (node.totalLeft > this.maxOutflow) {
                        this.maxOutflow = node.totalLeft;
                    }
                    if (node.totalLeft < this.minOutflow) {
                        this.minOutflow = node.totalLeft;
                    }
                    if (node.totalCame > this.maxInflow) {
                        this.maxInflow = node.totalLeft;
                    }
                    if (node.totalCame < this.minInflow) {
                        this.minInflow = node.totalCame;
                    }
                    if (node.netImmigrationFlow > this.maxSum) {
                        this.maxSum = node.totalLeft;
                    }
                    if (node.netImmigrationFlow < this.minSum) {
                        this.minSum = node.netImmigrationFlow;
                    }
                    for (var _c = 0, _d = d.left_to; _c < _d.length; _c++) {
                        var edge = _d[_c];
                        var toNodeId = RegionEnum[edge.state.trim()];
                        node.toEdges[toNodeId] = {
                            fromMigrationRegion: id,
                            toMigrationRegion: toNodeId,
                            moe: 0,
                            estimate: +edge.estimate
                        };
                        // Calculate max migration number for that state for color scale determination
                        if (+edge.estimate > this.stateRanges[id].maxEdgeTo) {
                            this.stateRanges[id].maxEdgeTo = +edge.estimate;
                        }
                    }
                    for (var _e = 0, _f = d.came_from; _e < _f.length; _e++) {
                        var edge = _f[_e];
                        var fromNodeId = RegionEnum[edge.state.trim()];
                        node.fromEdges[fromNodeId] = {
                            fromMigrationRegion: id,
                            toMigrationRegion: fromNodeId,
                            moe: 0,
                            estimate: +edge.estimate
                        };
                        // Calculate max migration number for that state for color scale determination
                        if (+edge.estimate > this.stateRanges[id].maxEdgeFrom) {
                            this.stateRanges[id].maxEdgeFrom = +edge.estimate;
                        }
                        if (Math.abs(+edge.estimate - node.toEdges[fromNodeId].estimate) > this.stateRanges[id].maxEdgeNet) {
                            this.stateRanges[id].maxEdgeNet = Math.abs(+edge.estimate - node.toEdges[fromNodeId].estimate);
                        }
                    }
                    this.data[curYear].push(node);
                }
            }
        }
        return MigrationPatterns;
    }());

    var Table = /** @class */ (function () {
        /**
         *
         * @param migrationPatterns
         * @param container HTML selection where the view will be placed in
         * @param svgDims dimensions of the SVG
         * @param startYear year to start the visualization
         */
        function Table(migrationPatterns, container, svgDims, startYear) {
            if (startYear === void 0) { startYear = 2017; }
            // TODO May just overlay these with total being the red/blue on the axis and the overlay being pruple
            this.headerLabels = ['Region', 'Total Flow', 'pop %', 'Pop. Growth %', 'Population'];
            /**
             * Table constants
             */
            this.RECT_WIDTH = 200;
            this.currentData = migrationPatterns.data;
            // TODO Create the data table objects
            // TODO Need to define columns and css classes for various states and objects
            console.debug("Table SVG Dimensions are width: " + svgDims.width + "; height: " + svgDims.height);
            this.flowScale = d3.scaleLinear().range([0, this.RECT_WIDTH])
                .domain([migrationPatterns.minSum, migrationPatterns.maxInflow]);
            this.table = container.append('table');
            this.header = this.table.append('thead');
            this.axisHeader = this.header.append('tr');
            this.titleHeader = this.header.append('tr');
            for (var _i = 0, _a = this.headerLabels; _i < _a.length; _i++) {
                var l = _a[_i];
                this.axisHeader.append('th').text(l).on('click', this.labelListener);
            }
            this.tBody = this.table.append('tbody');
            this.loadTable(startYear);
        }
        /**
         * Class to refresh the data table for sorting, brush, or selections
         */
        Table.prototype.loadTable = function (year) {
            var _this = this;
            console.debug("Loading data table " + year);
            var data = this.currentData[year];
            console.log(data[0].year);
            //@ts-ignore
            var update = this.tBody.selectAll('tr').data(data, function (d) {
                var e = d;
                return e.nodeId;
            }).join(function (enter) {
                var rows = enter.append('tr');
                rows.append('td').append('text').text(function (d) {
                    return RegionEnum[d.nodeId];
                });
                var tds = rows.append('td');
                tds.attr('class', 'svg');
                var svg = tds.append('svg').attr('width', _this.RECT_WIDTH).style('max-height', '100%')
                    .style('display', 'block');
                /**
                 * Create net rectangle.  Blue for net inflow, red for net outflow
                 */
                svg.append('rect').classed('net', true).selectAll('rect').classed('net', true).attr('x', function (d) {
                    if (d.netImmigrationFlow < 0) {
                        return _this.flowScale(d.netImmigrationFlow);
                    }
                    return _this.flowScale(0);
                }).attr('y', 0).attr('height', 5).attr('width', function (d) {
                    var flow = _this.flowScale(0) - _this.flowScale(d.netImmigrationFlow);
                    return flow < 0 ? 0 : flow;
                }).attr('fill', function (d) {
                    d = _this.currentData[year][d.nodeId];
                    if (d.netImmigrationFlow < 0) {
                        return 'red';
                    }
                    else {
                        return 'blue';
                    }
                });
                /**
                 * Create net rectangle.  Blue for net inflow, red for net outflow
                 */
                svg.append('rect').classed('in', true).attr('x', function (d) {
                    if (d.netImmigrationFlow < 0) {
                        return _this.flowScale(0);
                    }
                    return _this.flowScale(0);
                }).attr('y', 5).attr('height', 5).attr('width', function (d) {
                    var width = _this.flowScale(d.totalCame) - _this.flowScale(0);
                    return width;
                }).attr('fill', 'blue');
                /**
                 * Create difference rectangle.  Should be purple until it ends
                 */
                svg.append('rect').classed('out', true).attr('x', function (d) {
                    if (d.netImmigrationFlow < 0) {
                        return _this.flowScale(0);
                    }
                    return _this.flowScale(d.netImmigrationFlow);
                }).attr('y', 10).attr('height', 5).attr('width', function (d) {
                    var width;
                    if (d.netImmigrationFlow < 0) {
                        width = (_this.flowScale(d.totalCame) - _this.flowScale(0)) +
                            (_this.flowScale(0) - _this.flowScale(d.netImmigrationFlow)) - (_this.flowScale(0) - _this.flowScale(d.netImmigrationFlow));
                    }
                    else {
                        width = (_this.flowScale(d.totalCame) - _this.flowScale(d.netImmigrationFlow));
                    }
                    return width;
                }).attr('fill', 'purple');
                rows.append('td').classed('pop', true).append('text').text(function (d) {
                    return Math.round((d.netImmigrationFlow / d.totalPopulation) * 100) / 100;
                });
                rows.append('td').classed('popGrowth', true).append('text').text(function (d) {
                    d = _this.currentData[year][d.nodeId];
                    if (year === 2015) {
                        return 'N/A';
                    }
                    return (Math.round((d.totalPopulation / _this.currentData[year - 1][d.nodeId].totalPopulation) * 100) / 100).toFixed(2);
                });
                rows.append('td').classed('popTotal', true).append('text').text(function (d) {
                    d = _this.currentData[year][d.nodeId];
                    return d.totalPopulation;
                });
            }, function (update) {
                console.log(update);
                update = update.transition();
                update.selectAll('rect').filter('.net').attr('x', function (d) {
                    d = _this.currentData[year][d.nodeId];
                    if (d.netImmigrationFlow < 0) {
                        return _this.flowScale(d.netImmigrationFlow);
                    }
                    return _this.flowScale(0);
                }).attr('y', 0).attr('height', 5).attr('width', function (d) {
                    d = _this.currentData[year][d.nodeId];
                    var flow = _this.flowScale(0) - _this.flowScale(d.netImmigrationFlow);
                    return flow < 0 ? 0 : flow;
                }).attr('fill', function (d) {
                    d = _this.currentData[year][d.nodeId];
                    if (d.netImmigrationFlow < 0) {
                        return 'red';
                    }
                    else {
                        return 'blue';
                    }
                });
                update.selectAll('rect').filter('.in').attr('x', function (d) {
                    d = _this.currentData[year][d.nodeId];
                    if (d.netImmigrationFlow < 0) {
                        return _this.flowScale(0);
                    }
                    return _this.flowScale(0);
                }).attr('y', 5).attr('height', 5).attr('width', function (d) {
                    d = _this.currentData[year][d.nodeId];
                    var width = _this.flowScale(d.totalCame) - _this.flowScale(0);
                    return width;
                }).attr('fill', 'blue');
                update.selectAll('rect').filter('.out').attr('x', function (d) {
                    d = _this.currentData[year][d.nodeId];
                    if (d.netImmigrationFlow < 0) {
                        return _this.flowScale(0);
                    }
                    return _this.flowScale(d.netImmigrationFlow);
                }).attr('y', 10).attr('height', 5).attr('width', function (d) {
                    var width;
                    d = _this.currentData[year][d.nodeId];
                    if (d.netImmigrationFlow < 0) {
                        width = (_this.flowScale(d.totalCame) - _this.flowScale(0)) +
                            (_this.flowScale(0) - _this.flowScale(d.netImmigrationFlow)) - (_this.flowScale(0) - _this.flowScale(d.netImmigrationFlow));
                    }
                    else {
                        width = (_this.flowScale(d.totalCame) - _this.flowScale(d.netImmigrationFlow));
                    }
                    return width;
                }).attr('fill', 'purple');
                update.selectAll('td').filter('.pop').select('text').text(function (d) {
                    d = _this.currentData[year][d.nodeId];
                    return (Math.round((d.netImmigrationFlow / d.totalPopulation) * 100) / 100).toFixed(2);
                });
                update.selectAll('td').filter('.popGrowth').select('text').text(function (d) {
                    d = _this.currentData[year][d.nodeId];
                    if (year === 2005) {
                        return 'N/A';
                    }
                    return (Math.round((d.totalPopulation / _this.currentData[year - 1][d.nodeId].totalPopulation) * 100) / 100).toFixed(2);
                });
                update.selectAll('td').filter('.popTotal').select('text').text(function (d) {
                    d = _this.currentData[year][d.nodeId];
                    return d.totalPopulation;
                });
            });
        };
        Table.prototype.labelListener = function (l) {
            console.debug("Clicked " + l + " header");
        };
        Table.prototype.changeYear = function (year) {
            console.log("Year: " + year);
            this.curYear = year;
            this.loadTable(year);
        };
        return Table;
    }());

    var ViewState;
    (function (ViewState) {
        ViewState["net"] = "net";
        ViewState["out"] = "out";
        ViewState["in"] = "in";
    })(ViewState || (ViewState = {}));
    function getTooltipPadding() {
        return 5;
    }
    function addTooltipLines(tooltip_text, tooltip_rect, text_lines) {
        var test_tspan = tooltip_text.append('tspan').text('TEST');
        var oneLineHeight = test_tspan.node().getBBox().height;
        test_tspan.remove();
        for (var _i = 0, text_lines_1 = text_lines; _i < text_lines_1.length; _i++) {
            var line = text_lines_1[_i];
            tooltip_text
                .append('tspan')
                .classed('custom_tooltip', true)
                .attr('x', 0)
                .attr('y', tooltip_text.node().getBBox().height)
                .text(line);
        }
        var padding = getTooltipPadding();
        tooltip_rect.attr('width', tooltip_text.node().getBBox().width + 2 * padding);
        tooltip_rect.attr('height', tooltip_text.node().getBBox().height + 2 * padding);
        tooltip_text
            .selectAll('tspan')
            .attr('x', parseFloat(tooltip_rect.attr('width')) / 2)
            .attr('y', function (d, i) {
            return (i + 1) * oneLineHeight;
        });
    }
    function placeTooltip(svg, tooltip, tooltip_rect, _a) {
        var x = _a[0], y = _a[1];
        var padding = getTooltipPadding();
        var svg_width = parseFloat(svg.attr('width'));
        var tooltip_width = parseFloat(tooltip_rect.attr('width'));
        var tooltip_x = x + tooltip_width > svg_width
            ? svg_width - tooltip_width - 2 * padding
            : x;
        var _b = d3.mouse(svg.node()), _ = _b[0], mouseY = _b[1];
        var tooltip_y = y == mouseY ? (y + 2) : y;
        tooltip.attr('transform', "translate (" + tooltip_x + " " + tooltip_y + ")");
    }
    function createTooltip(svg, _a, text_lines) {
        var x = _a[0], y = _a[1];
        var tooltip = svg
            .append('g')
            .classed('tooltip-group', true);
        var tooltip_rect = tooltip
            .append('rect')
            .classed('custom_tooltip', true)
            .attr('rx', 10)
            .attr('ry', 10);
        var tooltip_text = tooltip
            .append('text')
            .classed('custom_tooltip', true);
        addTooltipLines(tooltip_text, tooltip_rect, text_lines);
        placeTooltip(svg, tooltip, tooltip_rect, [x, y]);
    }
    function updateTooltip(svg, _a, text_lines) {
        var x = _a[0], y = _a[1];
        var tooltip = svg.select('.tooltip-group');
        var tooltip_rect = tooltip.select('rect');
        var tooltip_text = tooltip.select('text');
        tooltip_text
            .selectAll('tspan')
            .remove();
        addTooltipLines(tooltip_text, tooltip_rect, text_lines);
        placeTooltip(svg, tooltip, tooltip_rect, [x, y]);
    }
    function removeTooltip(svg) {
        svg.select('.tooltip-group').remove();
    }

    var stateId = function (name) {
        name = name.replace(/\s/g, "");
        return "state" + name;
    };
    var HeatMap = /** @class */ (function () {
        function HeatMap(patterns, container, svgDims, startYear) {
            var _this = this;
            if (startYear === void 0) { startYear = 2011; }
            this.state = ViewState.net;
            this.curYear = startYear;
            this.migrationPatterns = patterns;
            this.currentData = patterns.data;
            this.svg = container.append('svg').attr('height', svgDims.height).attr('width', svgDims.width);
            d3.select('.geoLegendContainer').append('div').attr('id', 'geoLegend').attr('width', 80).attr('height', 100);
            this.geoLegend = '#geoLegend';
            this.path = d3.geoPath();
            this.setColorScale();
            d3.json("https://d3js.org/us-10m.v2.json").then(function (us) {
                _this.us = us;
                /**
                 * Adapted from https://bl.ocks.org/mbostock/4090848
                 */
                _this.g = _this.svg.append('g');
                _this.drawMap(null);
                // Borders
                _this.svg.append("path")
                    .attr("class", "state-borders")
                    .attr("d", _this.path(topojson.mesh(us, us.objects.states, function (a, b) {
                    return a !== b;
                })));
            });
        }
        HeatMap.prototype.drawMap = function (stateSelected) {
            var _this = this;
            this.currentRegion = stateSelected;
            this.setColorScale();
            this.updateLegend();
            // States
            this.dataSelection = this.g.selectAll('path')
                //@ts-ignore
                .data(topojson.feature(this.us, this.us.objects.states).features);
            var enter = this.dataSelection.enter()
                .append('path').attr('d', this.path).attr("class", "states")
                .attr('id', function (d) {
                return stateId(d.properties.name);
            })
                .style('fill', function (d) {
                return _this.stateFill(d, stateSelected);
            })
                .on('mouseover', function (d) {
                var id = stateId(d.properties.name);
                var hoveredState = d3.select("#" + id).style('fill', 'darkgray');
                _this.handleTooltip(d, hoveredState, createTooltip);
            })
                .on('mousemove', function (d) {
                var id = stateId(d.properties.name);
                var hoveredState = d3.select("#" + id).style('fill', 'darkgray');
                _this.handleTooltip(d, hoveredState, updateTooltip);
            })
                .on('mouseout', function (d) {
                removeTooltip(_this.svg);
                var id = stateId(d.properties.name);
                d3.select("#" + id).style('fill', _this.stateFill(d, _this.currentRegion));
            }).on('click', function (d) { return _this.focusNode(d); });
            this.dataSelection.merge(enter).transition().style('fill', function (d) {
                return _this.stateFill(d, stateSelected);
            });
            this.dataSelection.exit(enter).remove();
        };
        HeatMap.prototype.focusNode = function (feature) {
            var region = RegionEnum[feature.properties.name];
            //@ts-ignore
            if (region === this.currentRegion) {
                region = null;
            }
            d3.select('.region-select').attr('text', feature.properties.name);
            //@ts-ignore
            this.drawMap(region);
        };
        HeatMap.prototype.stateFill = function (d, stateSelection) {
            var name = d.properties.name;
            var nodeId = RegionEnum[name];
            var flowData;
            if (stateSelection === null) {
                switch (this.state) {
                    case ViewState.out:
                        flowData = this.currentData[this.curYear][nodeId].totalLeft;
                        break;
                    case ViewState.in:
                        flowData = this.currentData[this.curYear][nodeId].totalCame;
                        break;
                    default:
                        flowData = this.currentData[this.curYear][nodeId].netImmigrationFlow;
                }
            }
            else {
                switch (this.state) {
                    case ViewState.out:
                        if (this.currentData[this.curYear][nodeId].toEdges.hasOwnProperty(stateSelection)) {
                            flowData = this.currentData[this.curYear][nodeId].toEdges[stateSelection].estimate;
                        }
                        else {
                            return 'darkgray';
                        }
                        break;
                    case ViewState.in:
                        if (this.currentData[this.curYear][nodeId].fromEdges.hasOwnProperty(stateSelection)) {
                            flowData = this.currentData[this.curYear][nodeId].fromEdges[stateSelection].estimate;
                        }
                        else {
                            return 'darkgray';
                        }
                        break;
                    default:
                        if (this.currentData[this.curYear][nodeId].toEdges.hasOwnProperty(stateSelection)) {
                            flowData = this.currentData[this.curYear][nodeId].fromEdges[stateSelection].estimate -
                                this.currentData[this.curYear][nodeId].toEdges[stateSelection].estimate;
                        }
                        else {
                            return 'darkgray';
                        }
                }
                if (flowData === undefined) {
                    throw new Error("Was not able to find a suitable edge from node " + d.properties.name + " to " + RegionEnum[stateSelection]);
                }
            }
            return this.getInterpolate()(this.colorScale(flowData));
        };
        HeatMap.prototype.getInterpolate = function () {
            switch (this.state) {
                case ViewState.out:
                    return d3.interpolateReds;
                case ViewState.in:
                    return d3.interpolateBlues;
                default:
                    return d3.interpolateRdBu;
            }
        };
        HeatMap.prototype.setColorScale = function () {
            var maxValue;
            var domain;
            switch (this.state) {
                case ViewState.out:
                    if (this.currentRegion != null) {
                        maxValue = this.migrationPatterns.stateRanges[this.currentRegion].maxEdgeTo;
                    }
                    else {
                        maxValue = this.migrationPatterns.maxOutflow;
                    }
                    domain = [0, maxValue];
                    this.colorScale = d3.scaleLinear().domain(domain).range([0, 1]);
                    this.legendScale = d3.scaleSequential(this.getInterpolate()).domain(domain);
                    break;
                case ViewState.in:
                    if (this.currentRegion != null) {
                        maxValue = this.migrationPatterns.stateRanges[this.currentRegion].maxEdgeFrom;
                    }
                    else {
                        maxValue = this.migrationPatterns.maxInflow;
                    }
                    domain = [0, maxValue];
                    this.colorScale = d3.scaleLinear().domain([0, maxValue]).range([0, 1]);
                    this.legendScale = d3.scaleSequential(this.getInterpolate()).domain([0, maxValue]);
                    break;
                default:
                    if (this.currentRegion != null) {
                        maxValue = this.migrationPatterns.stateRanges[this.currentRegion].maxEdgeNet;
                        domain = [-maxValue, maxValue];
                        this.colorScale = d3.scaleLinear().domain([-maxValue, maxValue]).range([0, 1]);
                        this.legendScale = d3.scaleSequential(d3.interpolateRdBu).domain(domain);
                    }
                    else {
                        this.colorScale = d3.scaleLinear().domain([-1e5, 1e5]).range([0, 1]);
                        this.legendScale = d3.scaleSequential(this.getInterpolate()).domain([-1e5, 1e5]);
                    }
            }
        };
        HeatMap.prototype.handleTooltip = function (feature, hoveredState, tooltipFunc) {
            var _this = this;
            var tooltipTextLines = [];
            var name = feature.properties.name;
            var nodeId = RegionEnum[name];
            var stateSelection = this.currentRegion;
            if (stateSelection === null) {
                var tooltipStatFunc = function (selectedStat) {
                    switch (selectedStat) {
                        case ViewState.out:
                            return "Total left: " + _this.currentData[_this.curYear][nodeId].totalLeft;
                        case ViewState.in:
                            return "Total came: " + _this.currentData[_this.curYear][nodeId].totalCame;
                        case ViewState.net:
                    }
                    return "Net immigration: " + _this.currentData[_this.curYear][nodeId].netImmigrationFlow;
                };
                tooltipTextLines = [name,
                    tooltipStatFunc(this.state)];
            }
            else if (RegionEnum[stateSelection] === name) {
                var tooltipStatFunc = function (selectedStat) {
                    switch (selectedStat) {
                        case ViewState.out:
                            return "Total from other states: " + _this.currentData[_this.curYear][nodeId].totalCame;
                        case ViewState.in:
                            return "Total to other states: " + _this.currentData[_this.curYear][nodeId].totalLeft;
                        case ViewState.net:
                    }
                    return "Net immigration: " + _this.currentData[_this.curYear][nodeId].netImmigrationFlow;
                };
                tooltipTextLines = [name,
                    tooltipStatFunc(this.state)];
            }
            else {
                var stateSelectionName_1 = RegionEnum[stateSelection];
                var tooltipStatFunc = function (selectedStat) {
                    switch (selectedStat) {
                        case ViewState.out:
                            return "To " + stateSelectionName_1 + ": " + _this.currentData[_this.curYear][nodeId].toEdges[stateSelection].estimate;
                        case ViewState.in:
                            return "From " + stateSelectionName_1 + ": " + _this.currentData[_this.curYear][nodeId].fromEdges[stateSelection].estimate;
                        case ViewState.net:
                    }
                    return "Net immigration to " + stateSelectionName_1 + ": " + (_this.currentData[_this.curYear][nodeId].toEdges[stateSelection].estimate -
                        _this.currentData[_this.curYear][nodeId].fromEdges[stateSelection].estimate);
                };
                tooltipTextLines = [name,
                    tooltipStatFunc(this.state)];
            }
            tooltipFunc(this.svg, d3.mouse(this.svg.node()), tooltipTextLines);
        };
        HeatMap.prototype.updateLegend = function () {
            continuous(this.geoLegend, this.legendScale);
        };
        HeatMap.prototype.toggleMigrationStatistic = function (viewState) {
            this.state = viewState;
            this.drawMap(this.currentRegion);
        };
        HeatMap.prototype.changeYear = function (year) {
            this.curYear = year;
            this.drawMap(this.currentRegion);
        };
        return HeatMap;
    }());
    /**
     * Lifted from http://bl.ocks.org/syntagmatic/e8ccca52559796be775553b467593a9f
     * @param selectorId
     * @param colorScale
     */
    function continuous(selectorId, colorScale) {
        var legendHeight = 200, legendWidth = 80, margin = { top: 10, right: 60, bottom: 10, left: 2 };
        d3.select(selectorId).select('canvas').remove();
        var canvas = d3.select(selectorId)
            .style("height", legendHeight + "px")
            .style("width", legendWidth + "px")
            .style("position", "relative")
            .append("canvas")
            .attr("height", legendHeight - margin.top - margin.bottom)
            .attr("width", 1)
            .style("height", (legendHeight - margin.top - margin.bottom) + "px")
            .style("width", (legendWidth - margin.left - margin.right) + "px")
            .style("border", "1px solid #000")
            .style("position", "absolute")
            .style("top", (margin.top) + "px")
            .style("left", (margin.left) + "px")
            .node();
        var ctx = canvas.getContext("2d");
        var legendScale = d3.scaleLinear()
            .range([1, legendHeight - margin.top - margin.bottom])
            .domain(colorScale.domain());
        // image data hackery based on http://bl.ocks.org/mbostock/048d21cf747371b11884f75ad896e5a5
        var image = ctx.createImageData(1, legendHeight);
        d3.range(legendHeight).forEach(function (i) {
            var c = d3.rgb(colorScale(legendScale.invert(i)));
            image.data[4 * i] = c.r;
            image.data[4 * i + 1] = c.g;
            image.data[4 * i + 2] = c.b;
            image.data[4 * i + 3] = 255;
        });
        ctx.putImageData(image, 0, 0);
        // A simpler way to do the above, but possibly slower. keep in mind the legend width is stretched because the width attr of the canvas is 1
        // See http://stackoverflow.com/questions/4899799/whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas
        /*
        d3.range(legendHeight).forEach(function(i) {
          ctx.fillStyle = colorScale(legendScale.invert(i));
          ctx.fillRect(0,i,1,1);
        });
        */
        var legendAxis = d3.axisRight(legendScale).tickSize(6).ticks(8);
        console.log('Creating svg');
        d3.select(selectorId).select('svg').remove();
        var svg = d3.select(selectorId).append("svg")
            .attr("height", (legendHeight) + "px")
            .attr("width", (legendWidth) + "px")
            .style("position", "absolute")
            .style("left", "0px")
            .style("top", "0px");
        svg
            .append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + (legendWidth - margin.left - margin.right + 3) + "," + (margin.top) + ")")
            .call(legendAxis);
    }

    String.prototype.clean = function () {
        return this.replace(/\s|%/g, "_");
    };
    var tableSelection = d3.select('.dataTable');
    var tableDims = {
        height: 1000,
        width: 500
    };
    var geoSelection = d3.select('.geoHeat');
    var geoDims = {
        height: 650,
        width: 1000
    };
    var scatterSelection = d3.select('.scatterplot');
    var slider = document.getElementById("myRange");
    //@ts-ignore
    var geo;
    var table;
    var migrationPatterns;
    d3.json('data/migration_and_economic_data.json').then(function (data) {
        migrationPatterns = new MigrationPatterns(data);
        table = new Table(migrationPatterns, tableSelection, tableDims);
        geo = new HeatMap(migrationPatterns, geoSelection, geoDims);
        // scatter = new Scatterplot(build_year_to_indicators_map(data), scatterSelection, scatterDims);
        // TODO Chord Diagram Integration
        // const chord = new ChordDiagram(migrationPatterns, chordSelection, chordDims)
    });
    // Bind year event to various views
    // TODO Bind to scatterplot and table
    slider.oninput = function () {
        //@ts-ignore
        var minYear = Math.min.apply(Math, migrationPatterns.years);
        var maxYear = Math.max.apply(Math, migrationPatterns.years);
        var scale = d3.scaleLinear().domain([1, 100]).range([minYear, maxYear]);
        //@ts-ignore
        var curYear = Math.round(scale(this.value));
        // geo.changeYear(curYear);
        // scatter.change_year(curYear);
        for (var _i = 0, _a = Array.from([geo, table]); _i < _a.length; _i++) {
            var obj = _a[_i];
            obj.changeYear(curYear);
        }
        console.log("Year: " + curYear);
    };
    // Bind migration statistic to event listeners on the migration statistic dropdown
    d3.selectAll('.dropdown-item').data([ViewState.net, ViewState.in, ViewState.out]).on('click', function (d) {
        geo.toggleMigrationStatistic(d);
    });

}(d3, topojson));
