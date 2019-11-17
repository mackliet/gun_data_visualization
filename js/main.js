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
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var o = data_1[_i];
                var curYear = +o.year;
                this.data[curYear] = [];
                for (var _a = 0, _b = o.data; _a < _b.length; _a++) {
                    var d = _b[_a];
                    var id = RegionEnum[d.state.trim()];
                    var node = {
                        year: curYear,
                        nodeId: RegionEnum[d.state.trim()],
                        netImmigrationFlow: d.net_immigration_flow,
                        totalPopulation: +d.population,
                        totalCame: d.total_came,
                        totalLeft: d.total_left,
                        toEdges: new Map(),
                        fromEdges: new Map(),
                        maxEdgeTo: 0,
                        maxEdgeFrom: 0,
                        maxEdgeNet: -Number.MAX_VALUE,
                        minEdgeNet: Number.MAX_VALUE
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
                        if (+edge.estimate > node.maxEdgeTo) {
                            node.maxEdgeTo = +edge.estimate;
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
                        if (+edge.estimate > node.maxEdgeFrom) {
                            node.maxEdgeFrom = +edge.estimate;
                        }
                        if (Math.abs(+edge.estimate - node.toEdges[fromNodeId].estimate) > node.maxEdgeNet) {
                            node.maxEdgeNet = Math.abs(+edge.estimate - node.toEdges[fromNodeId].estimate);
                        }
                    }
                    this.data[curYear].push(node);
                }
            }
            console.info(this.data);
            console.info("Max values: \nMax Inflow: " + this.maxInflow + ", Max Outflow: " + this.maxOutflow + ", Max Total: " + this.maxSum + "\n " +
                ("Min values: \nMin Inflow " + this.minInflow + ", Min Outflow: " + this.minOutflow + ", Min Total: " + this.minSum + " "));
        }
        MigrationPatterns.prototype.yearsAsArray = function () {
            Object.keys(this.data).map(function (key) {
            });
        };
        return MigrationPatterns;
    }());

    function build_year_to_indicators_map(json_data) {
        var year_to_indicators = {};
        for (var _i = 0, json_data_1 = json_data; _i < json_data_1.length; _i++) {
            var o = json_data_1[_i];
            var curYear = +o.year;
            year_to_indicators[curYear] = [];
            for (var _a = 0, _b = o.data; _a < _b.length; _a++) {
                var d = _b[_a];
                var state_indicators = {
                    state: d.state,
                    population: d.population,
                    total_came: d.total_came,
                    total_left: d.total_left,
                    net_immigration_flow: d.net_immigration_flow,
                    GDP_per_capita: d.GDP_per_capita,
                    GDP_percent_change: d.GDP_percent_change,
                    jobs: d.jobs,
                    jobs_per_capita: d.jobs_per_capita,
                    personal_income_per_capita: d.personal_income_per_capita,
                    personal_disposable_income_per_capita: d.personal_disposable_income_per_capita,
                    personal_taxes_per_capita: d.personal_taxes_per_capita,
                };
                year_to_indicators[curYear].push(state_indicators);
            }
        }
        return year_to_indicators;
    }

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
            this.headerLabels = ['Region', 'Total Flow'];
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
            console.debug('Loading data table');
            var rows = this.tBody.selectAll('tr').data(this.currentData[year]).enter().append('tr');
            for (var _i = 0, _a = this.headerLabels; _i < _a.length; _i++) {
                var header = _a[_i];
                this[header.toLocaleLowerCase().clean()](rows);
            }
        };
        Table.prototype.labelListener = function (l) {
            console.debug("Clicked " + l + " header");
        };
        Table.prototype.region = function (rows) {
            rows.append('td').append('text').text(function (d) {
                return RegionEnum[d.nodeId];
            });
        };
        Table.prototype.total_flow = function (rows) {
            var _this = this;
            var tds = rows.append('td');
            tds.attr('class', 'svg'); //.append('div').attr('max-height', 20);
            var svg = tds.append('svg').attr('width', this.RECT_WIDTH).style('max-height', '100%')
                .style('display', 'block');
            /**
             * Create net rectangle.  Blue for net inflow, red for net outflow
             */
            svg.append('rect').attr('x', function (d) {
                if (d.netImmigrationFlow < 0) {
                    return _this.flowScale(d.netImmigrationFlow);
                }
                return _this.flowScale(0);
            }).attr('y', 0).attr('height', 5).attr('width', function (d) {
                var flow = _this.flowScale(0) - _this.flowScale(d.netImmigrationFlow);
                return flow < 0 ? 0 : flow;
            }).attr('fill', function (d) {
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
            svg.append('rect').attr('x', function (d) {
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
            svg.append('rect').attr('x', function (d) {
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
        };
        return Table;
    }());

    var State;
    (function (State) {
        State["net"] = "net";
        State["out"] = "out";
        State["in"] = "in";
    })(State || (State = {}));
    var stateId = function (name) {
        name = name.replace(/\s/g, "");
        return "state" + name;
    };
    var HeatMap = /** @class */ (function () {
        function HeatMap(patterns, container, svgDims, startYear) {
            var _this = this;
            if (startYear === void 0) { startYear = 2017; }
            this.state = State.net;
            this.curYear = startYear;
            this.migrationPatterns = patterns;
            this.currentData = patterns.data;
            this.svg = container.append('svg').attr('height', svgDims.height).attr('width', svgDims.width);
            this.path = d3.geoPath();
            this.setColorScale();
            d3.json("https://d3js.org/us-10m.v2.json").then(function (us) {
                _this.us = us;
                /**
                 * Adapted from https://bl.ocks.org/mbostock/4090848
                 */
                _this.dataSelection = _this.svg.append('g').selectAll('path')
                    //@ts-ignore
                    .data(topojson.feature(_this.us, _this.us.objects.states).features);
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
            console.log(this.currentRegion, this.state);
            this.currentRegion = stateSelected;
            // TODO Needs better logic than this, but there is no selector so later
            this.setColorScale();
            console.debug("Display US Map");
            console.debug(this.currentData[this.curYear]);
            // States
            var enter = this.dataSelection.enter()
                .append('path').attr('d', this.path).attr("class", "states")
                .attr('id', function (d) {
                return stateId(d.properties.name);
            })
                .style('fill', function (d) {
                return _this.stateFill(d, stateSelected);
            })
                .on('mouseover', function (d) {
                var name = d.properties.name;
                var nodeId = RegionEnum[name];
                var id = stateId(d.properties.name);
                d3.select("#" + id).style('fill', 'darkgray');
            }).on('mouseout', function (d) {
                var id = stateId(d.properties.name);
                d3.select("#" + id).style('fill', _this.stateFill(d, stateSelected));
            }).on('click', function (d) { return _this.focusNode(d); });
            this.dataSelection.merge(enter).attr('fill', function (d) {
                return _this.stateFill(d, stateSelected);
            });
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
                    case State.out:
                        flowData = this.currentData[this.curYear][nodeId].totalLeft;
                        break;
                    case State.in:
                        flowData = this.currentData[this.curYear][nodeId].totalCame;
                        break;
                    default:
                        flowData = this.currentData[this.curYear][nodeId].netImmigrationFlow;
                }
            }
            else {
                switch (this.state) {
                    case State.out:
                        if (this.currentData[this.curYear][nodeId].toEdges.hasOwnProperty(stateSelection)) {
                            flowData = this.currentData[this.curYear][nodeId].toEdges[stateSelection].estimate;
                        }
                        else {
                            return 'darkgray';
                        }
                        break;
                    case State.in:
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
            // Need to add third case of migration from
            switch (this.state) {
                case State.out:
                    if (this.currentRegion == null)
                        return d3.interpolateReds(this.colorScale(flowData));
                    return d3.interpolateBlues(this.colorScale(flowData));
                case State.in:
                    if (this.currentRegion == null)
                        return d3.interpolateBlues(this.colorScale(flowData));
                    return d3.interpolateReds(this.colorScale(flowData));
                default:
                    return d3.interpolateRdBu(this.colorScale(flowData));
            }
        };
        HeatMap.prototype.setColorScale = function () {
            var maxValue;
            switch (this.state) {
                case State.out:
                    if (this.currentRegion != null) {
                        maxValue = this.currentData[this.curYear][this.currentRegion].maxEdgeTo;
                    }
                    else {
                        maxValue = this.migrationPatterns.maxOutflow;
                    }
                    console.log("Max: " + maxValue);
                    this.colorScale = d3.scaleLinear().domain([0, maxValue]).range([0, 1]);
                    break;
                case State.in:
                    console.log(this.currentRegion);
                    if (this.currentRegion != null) {
                        maxValue = this.currentData[this.curYear][this.currentRegion].maxEdgeFrom;
                    }
                    else {
                        maxValue = this.migrationPatterns.maxInflow;
                    }
                    console.log("Max: " + maxValue);
                    this.colorScale = d3.scaleLinear().domain([0, maxValue]).range([0, 1]);
                    break;
                default:
                    console.log(this.currentRegion);
                    if (this.currentRegion != null) {
                        maxValue = this.currentData[this.curYear][this.currentRegion].maxEdgeNet;
                        this.colorScale = d3.scaleLinear().domain([-maxValue, maxValue]).range([0, 1]);
                    }
                    else {
                        this.colorScale = d3.scaleLinear().domain([-1e5, 1e5]).range([0, 1]);
                    }
            }
        };
        HeatMap.prototype.toggleMigrationStatistic = function (state) {
            this.state = state;
            // TODO calculate net for each region
            this.drawMap(this.currentRegion);
        };
        return HeatMap;
    }());

    var Scatterplot = /** @class */ (function () {
        function Scatterplot(state_data, container, svgDims, startYear) {
            if (startYear === void 0) { startYear = 2017; }
            this.curYear = startYear;
            this.year_to_indicators = state_data;
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
        }
        Scatterplot.indicator_to_name = function (indicator) {
            var no_underscores = indicator.replace(new RegExp('_', 'g'), ' ');
            return no_underscores[0].toUpperCase() + no_underscores.slice(1);
        };
        Scatterplot.prototype.create_dropdowns = function () {
            var _this = this;
            var yWrap = this.dropdownWrapper.append('div').classed('dropdown-panel', true);
            yWrap.append('div').classed('y-label', true)
                .append('text')
                .text('Y Axis Data');
            yWrap.append('div').attr('id', 'dropdown_y').classed('dropdown', true).append('div').classed('dropdown-content', true)
                .append('select');
            var xWrap = this.dropdownWrapper.append('div').classed('dropdown-panel', true);
            xWrap.append('div').classed('x-label', true)
                .append('text')
                .text('X Axis Data');
            xWrap.append('div').attr('id', 'dropdown_x').classed('dropdown', true).append('div').classed('dropdown-content', true)
                .append('select');
            var that = this;
            /* X DROPDOWN */
            var dropX = this.dropdownWrapper.select('#dropdown_x').select('.dropdown-content').select('select');
            var optionsX = dropX.selectAll('option').data(this.indicators).join('option');
            optionsX
                .append('option')
                .attr('value', function (d) { return d; });
            optionsX
                .append('text')
                .text(function (d) { return Scatterplot.indicator_to_name(d); });
            optionsX.filter(function (indicator) { return indicator === _this.activeX; })
                .attr('selected', true);
            dropX.on('change', function (d, i) {
                var this_select = this;
                that.activeX = that.indicators[this_select.selectedIndex];
                that.update_plot();
            });
            /* Y DROPDOWN */
            var dropY = this.dropdownWrapper.select('#dropdown_y').select('.dropdown-content').select('select');
            var optionsY = dropY.selectAll('option').data(this.indicators).join('option');
            optionsY
                .append('option')
                .attr('value', function (indicator) { return indicator; });
            optionsY
                .append('text')
                .text(function (d) { return Scatterplot.indicator_to_name(d); });
            optionsY.filter(function (indicator) { return indicator === _this.activeY; })
                .attr('selected', true);
            dropY.on('change', function (d, i) {
                var this_select = this;
                that.activeY = that.indicators[this_select.selectedIndex];
                that.update_plot();
            });
        };
        Scatterplot.prototype.create_scales = function () {
            this.axesGroup.append('g')
                .attr('id', 'x-axis');
            this.axesGroup.append('g')
                .attr('id', 'y-axis');
            this.axesGroup
                .append('text')
                .classed('x-label', true);
            this.axesGroup
                .append('text')
                .classed('y-label', true);
        };
        Scatterplot.prototype.update_scales = function () {
            var _this = this;
            var padding = this.padding;
            var svgDims = this.svgDims;
            var label_padding = 50;
            var xDomain = [d3.min(this.cur_year_data, function (d) { return d[_this.activeX]; }),
                d3.max(this.cur_year_data, function (d) { return d[_this.activeX]; })];
            var yDomain = [d3.min(this.cur_year_data, function (d) { return d[_this.activeY]; }),
                d3.max(this.cur_year_data, function (d) { return d[_this.activeY]; })];
            var xScale = d3.scaleLinear()
                .domain(xDomain)
                .range([padding, svgDims.width - padding]);
            var yScale = d3.scaleLinear()
                .domain(yDomain)
                .range([svgDims.height - padding, padding]);
            this.axesGroup.select('#x-axis')
                .attr('transform', "translate (0," + yScale.range()[0] + ")")
                .transition()
                .call(d3.axisBottom(xScale).ticks(6))
                .duration(this.transition_time);
            this.axesGroup.select('#y-axis')
                .attr('transform', "translate (" + padding + ",0)")
                .transition()
                .call(d3.axisLeft(yScale).ticks(6))
                .duration(this.transition_time);
            this.axesGroup.select('.x-label')
                .style('text-anchor', 'middle')
                .attr('transform', "translate(" + (xScale.range()[0] + (xScale.range()[1] - xScale.range()[0]) / 2.0) + ", " + (svgDims.height - label_padding) + ")")
                .text(Scatterplot.indicator_to_name(this.activeX));
            this.axesGroup.select('.y-label')
                .style('text-anchor', 'middle')
                .attr('transform', "translate(" + label_padding + ", " + (yScale.range()[0] + (yScale.range()[1] - yScale.range()[0]) / 2.0) + ") rotate(-90)")
                .text(Scatterplot.indicator_to_name(this.activeY));
            this.xScale = xScale;
            this.yScale = yScale;
        };
        Scatterplot.prototype.update_plot = function () {
            var _this = this;
            this.update_scales();
            var that = this;
            this.circleGroup
                .selectAll('circle')
                .data(this.cur_year_data.filter(function (d) { return typeof (d[_this.activeX]) !== 'undefined' && typeof (d[_this.activeY]) !== 'undefined'; }))
                .join('circle')
                .attr('fill', 'steelblue')
                .on('mouseover', function (d) {
                console.log("MOUSEOVER");
                var circle = d3.select(this);
                circle.classed('hovered', true);
                var is_float = function (num) { return num % 1 !== 0; };
                var x_val = d[that.activeX];
                var y_val = d[that.activeY];
                var lines = ["" + d.state,
                    Scatterplot.indicator_to_name(that.activeX) + ": " + (is_float(x_val) ? x_val.toFixed(4) : x_val),
                    Scatterplot.indicator_to_name(that.activeY) + ": " + (is_float(y_val) ? y_val.toFixed(4) : y_val)];
                var x = parseFloat(circle.attr('cx')) + parseFloat(circle.attr('r')) + 1;
                var y = parseFloat(circle.attr('cy')) + parseFloat(circle.attr('r')) + 1;
                Scatterplot.create_tooltip(that.svg, x, y, lines);
            })
                .on('mouseout', function (d) {
                d3.select(this).classed('hovered', false);
                that.svg.selectAll('.tooltip-group').remove();
            })
                .transition()
                .attr('r', 5)
                .attr('cx', function (d) { return _this.xScale(d[_this.activeX]); })
                .attr('cy', function (d) { return _this.yScale(d[_this.activeY]); })
                .duration(this.transition_time);
        };
        Scatterplot.create_tooltip = function (svg, x, y, text_lines) {
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
            for (var _i = 0, text_lines_1 = text_lines; _i < text_lines_1.length; _i++) {
                var line = text_lines_1[_i];
                var tspan = tooltip_text
                    .append('tspan')
                    .classed('custom_tooltip', true)
                    .attr('x', 0)
                    .attr('y', tooltip_text.node().getBBox().height)
                    .text(line);
            }
            tooltip_rect.attr('width', tooltip_text.node().getBBox().width + 20);
            tooltip_rect.attr('height', tooltip_text.node().getBBox().height + 20);
            tooltip_text
                .selectAll('tspan')
                .attr('x', parseFloat(tooltip_rect.attr('width')) / 2)
                .attr('y', function () {
                var current_y = parseFloat(d3.select(this).attr('y'));
                var rect_height = parseFloat(tooltip_rect.attr('height'));
                return current_y + rect_height / text_lines.length;
            });
            var svg_width = parseFloat(svg.attr('width'));
            var tooltip_width = parseFloat(tooltip_rect.attr('width'));
            var tooltip_x = x + tooltip_width > svg_width
                ? svg_width - tooltip_width - 20
                : x;
            tooltip.attr('transform', "translate (" + tooltip_x + " " + y + ")");
        };
        return Scatterplot;
    }());

    String.prototype.clean = function () {
        return this.replace(/\s/g, "_");
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
    var scatterDims = {
        height: 700,
        width: 700
    };
    // TODO Chord Diagram Integration
    // const chordSelection = d3.select('.chord');
    // const chordDims = {
    //     height: 500,
    //     width: 1000
    // };
    var geo;
    var table;
    var scatter;
    d3.json('data/migration_and_economic_data.json').then(function (data) {
        var migrationPatterns = new MigrationPatterns(data);
        table = new Table(migrationPatterns, tableSelection, tableDims);
        geo = new HeatMap(migrationPatterns, geoSelection, geoDims);
        scatter = new Scatterplot(build_year_to_indicators_map(data), scatterSelection, scatterDims);
        // TODO Chord Diagram Integration
        // const chord = new ChordDiagram(migrationPatterns, chordSelection, chordDims)
    });
    // Bind migration statistic to event listeners on the migration statistic dropdown
    d3.selectAll('.dropdown-item').data([State.net, State.in, State.out]).on('click', function (d) {
        geo.toggleMigrationStatistic(d);
    });

}(d3, topojson));
