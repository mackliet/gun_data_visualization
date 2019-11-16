(function (d3, topojson) {
    'use strict';

    /**
     * Enumerator representing all 50 States, and other migration regions
     */
    var MigrationNodeId;
    (function (MigrationNodeId) {
        MigrationNodeId[MigrationNodeId["Alabama"] = 0] = "Alabama";
        MigrationNodeId[MigrationNodeId["Alaska"] = 1] = "Alaska";
        MigrationNodeId[MigrationNodeId["Arizona"] = 2] = "Arizona";
        MigrationNodeId[MigrationNodeId["Arkansas"] = 3] = "Arkansas";
        MigrationNodeId[MigrationNodeId["California"] = 4] = "California";
        MigrationNodeId[MigrationNodeId["Colorado"] = 5] = "Colorado";
        MigrationNodeId[MigrationNodeId["Connecticut"] = 6] = "Connecticut";
        MigrationNodeId[MigrationNodeId["Delaware"] = 7] = "Delaware";
        MigrationNodeId[MigrationNodeId["District of Columbia"] = 8] = "District of Columbia";
        MigrationNodeId[MigrationNodeId["Florida"] = 9] = "Florida";
        MigrationNodeId[MigrationNodeId["Georgia"] = 10] = "Georgia";
        MigrationNodeId[MigrationNodeId["Hawaii"] = 11] = "Hawaii";
        MigrationNodeId[MigrationNodeId["Idaho"] = 12] = "Idaho";
        MigrationNodeId[MigrationNodeId["Illinois"] = 13] = "Illinois";
        MigrationNodeId[MigrationNodeId["Indiana"] = 14] = "Indiana";
        MigrationNodeId[MigrationNodeId["Iowa"] = 15] = "Iowa";
        MigrationNodeId[MigrationNodeId["Kansas"] = 16] = "Kansas";
        MigrationNodeId[MigrationNodeId["Kentucky"] = 17] = "Kentucky";
        MigrationNodeId[MigrationNodeId["Louisiana"] = 18] = "Louisiana";
        MigrationNodeId[MigrationNodeId["Maine"] = 19] = "Maine";
        MigrationNodeId[MigrationNodeId["Maryland"] = 20] = "Maryland";
        MigrationNodeId[MigrationNodeId["Massachusetts"] = 21] = "Massachusetts";
        MigrationNodeId[MigrationNodeId["Michigan"] = 22] = "Michigan";
        MigrationNodeId[MigrationNodeId["Minnesota"] = 23] = "Minnesota";
        MigrationNodeId[MigrationNodeId["Mississippi"] = 24] = "Mississippi";
        MigrationNodeId[MigrationNodeId["Missouri"] = 25] = "Missouri";
        MigrationNodeId[MigrationNodeId["Montana"] = 26] = "Montana";
        MigrationNodeId[MigrationNodeId["Nebraska"] = 27] = "Nebraska";
        MigrationNodeId[MigrationNodeId["Nevada"] = 28] = "Nevada";
        MigrationNodeId[MigrationNodeId["New Hampshire"] = 29] = "New Hampshire";
        MigrationNodeId[MigrationNodeId["New Jersey"] = 30] = "New Jersey";
        MigrationNodeId[MigrationNodeId["New Mexico"] = 31] = "New Mexico";
        MigrationNodeId[MigrationNodeId["New York"] = 32] = "New York";
        MigrationNodeId[MigrationNodeId["North Carolina"] = 33] = "North Carolina";
        MigrationNodeId[MigrationNodeId["North Dakota"] = 34] = "North Dakota";
        MigrationNodeId[MigrationNodeId["Ohio"] = 35] = "Ohio";
        MigrationNodeId[MigrationNodeId["Oklahoma"] = 36] = "Oklahoma";
        MigrationNodeId[MigrationNodeId["Oregon"] = 37] = "Oregon";
        MigrationNodeId[MigrationNodeId["Pennsylvania"] = 38] = "Pennsylvania";
        MigrationNodeId[MigrationNodeId["Rhode Island"] = 39] = "Rhode Island";
        MigrationNodeId[MigrationNodeId["South Carolina"] = 40] = "South Carolina";
        MigrationNodeId[MigrationNodeId["South Dakota"] = 41] = "South Dakota";
        MigrationNodeId[MigrationNodeId["Tennessee"] = 42] = "Tennessee";
        MigrationNodeId[MigrationNodeId["Texas"] = 43] = "Texas";
        MigrationNodeId[MigrationNodeId["Utah"] = 44] = "Utah";
        MigrationNodeId[MigrationNodeId["Vermont"] = 45] = "Vermont";
        MigrationNodeId[MigrationNodeId["Virginia"] = 46] = "Virginia";
        MigrationNodeId[MigrationNodeId["Washington"] = 47] = "Washington";
        MigrationNodeId[MigrationNodeId["West Virginia"] = 48] = "West Virginia";
        MigrationNodeId[MigrationNodeId["Wisconsin"] = 49] = "Wisconsin";
        MigrationNodeId[MigrationNodeId["Wyoming"] = 50] = "Wyoming";
    })(MigrationNodeId || (MigrationNodeId = {}));
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
                    var id = MigrationNodeId[d.state.trim()];
                    var node = {
                        year: curYear,
                        nodeId: MigrationNodeId[d.state.trim()],
                        netImmigrationFlow: d.net_immigration_flow,
                        totalPopulation: +d.population,
                        totalCame: d.total_came,
                        totalLeft: d.total_left,
                        edges: new Map()
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
                        var toNodeId = MigrationNodeId[edge.state.trim()];
                        node.edges[toNodeId] = {
                            fromMigrationRegion: id,
                            toMigrationRegion: toNodeId,
                            moe: 0,
                            estimate: +edge.estimate
                        };
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

    /**
     * Enumerator representing all 50 States and DC
     */
    var State_id;
    (function (State_id) {
        State_id[State_id["Alabama"] = 0] = "Alabama";
        State_id[State_id["Alaska"] = 1] = "Alaska";
        State_id[State_id["Arizona"] = 2] = "Arizona";
        State_id[State_id["Arkansas"] = 3] = "Arkansas";
        State_id[State_id["California"] = 4] = "California";
        State_id[State_id["Colorado"] = 5] = "Colorado";
        State_id[State_id["Connecticut"] = 6] = "Connecticut";
        State_id[State_id["Delaware"] = 7] = "Delaware";
        State_id[State_id["District of Columbia"] = 8] = "District of Columbia";
        State_id[State_id["Florida"] = 9] = "Florida";
        State_id[State_id["Georgia"] = 10] = "Georgia";
        State_id[State_id["Hawaii"] = 11] = "Hawaii";
        State_id[State_id["Idaho"] = 12] = "Idaho";
        State_id[State_id["Illinois"] = 13] = "Illinois";
        State_id[State_id["Indiana"] = 14] = "Indiana";
        State_id[State_id["Iowa"] = 15] = "Iowa";
        State_id[State_id["Kansas"] = 16] = "Kansas";
        State_id[State_id["Kentucky"] = 17] = "Kentucky";
        State_id[State_id["Louisiana"] = 18] = "Louisiana";
        State_id[State_id["Maine"] = 19] = "Maine";
        State_id[State_id["Maryland"] = 20] = "Maryland";
        State_id[State_id["Massachusetts"] = 21] = "Massachusetts";
        State_id[State_id["Michigan"] = 22] = "Michigan";
        State_id[State_id["Minnesota"] = 23] = "Minnesota";
        State_id[State_id["Mississippi"] = 24] = "Mississippi";
        State_id[State_id["Missouri"] = 25] = "Missouri";
        State_id[State_id["Montana"] = 26] = "Montana";
        State_id[State_id["Nebraska"] = 27] = "Nebraska";
        State_id[State_id["Nevada"] = 28] = "Nevada";
        State_id[State_id["New Hampshire"] = 29] = "New Hampshire";
        State_id[State_id["New Jersey"] = 30] = "New Jersey";
        State_id[State_id["New Mexico"] = 31] = "New Mexico";
        State_id[State_id["New York"] = 32] = "New York";
        State_id[State_id["North Carolina"] = 33] = "North Carolina";
        State_id[State_id["North Dakota"] = 34] = "North Dakota";
        State_id[State_id["Ohio"] = 35] = "Ohio";
        State_id[State_id["Oklahoma"] = 36] = "Oklahoma";
        State_id[State_id["Oregon"] = 37] = "Oregon";
        State_id[State_id["Pennsylvania"] = 38] = "Pennsylvania";
        State_id[State_id["Rhode Island"] = 39] = "Rhode Island";
        State_id[State_id["South Carolina"] = 40] = "South Carolina";
        State_id[State_id["South Dakota"] = 41] = "South Dakota";
        State_id[State_id["Tennessee"] = 42] = "Tennessee";
        State_id[State_id["Texas"] = 43] = "Texas";
        State_id[State_id["Utah"] = 44] = "Utah";
        State_id[State_id["Vermont"] = 45] = "Vermont";
        State_id[State_id["Virginia"] = 46] = "Virginia";
        State_id[State_id["Washington"] = 47] = "Washington";
        State_id[State_id["West Virginia"] = 48] = "West Virginia";
        State_id[State_id["Wisconsin"] = 49] = "Wisconsin";
        State_id[State_id["Wyoming"] = 50] = "Wyoming";
    })(State_id || (State_id = {}));
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
         * @param data data to bind to the view
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
                console.debug("calling " + header.clean() + " method");
                this[header.toLocaleLowerCase().clean()](rows);
            }
        };
        Table.prototype.labelListener = function (l) {
            console.debug("Clicked " + l + " header");
        };
        Table.prototype.region = function (rows) {
            console.debug("entering region column creation method");
            rows.append('td').append('text').text(function (d) {
                return MigrationNodeId[d.nodeId];
            });
        };
        Table.prototype.total_flow = function (rows) {
            var _this = this;
            console.debug("entering inflow column creation method");
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
                console.debug(MigrationNodeId[d.nodeId] + ": " + d.netImmigrationFlow + ", " + _this.flowScale(d.netImmigrationFlow));
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
                console.debug(MigrationNodeId[d.nodeId] + ": " + d.totalCame + ", " + _this.flowScale(d.totalCame));
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
                console.debug(MigrationNodeId[d.nodeId] + ": " + d.totalCame + ", " + _this.flowScale(d.totalCame));
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

    var stateId = function (name) {
        name = name.replace(/\s/g, "");
        return "state" + name;
    };
    var HeatMap = /** @class */ (function () {
        function HeatMap(patterns, container, svgDims, startYear) {
            var _this = this;
            if (startYear === void 0) { startYear = 2017; }
            this.curYear = startYear;
            this.currentData = patterns.data;
            this.colorScale = d3.scaleLinear().domain([-1e5, 1e5]).range([0, 1]);
            var path = d3.geoPath();
            var svg = container.append('svg').attr('height', svgDims.height).attr('width', svgDims.width);
            /**
             * Adapted from https://bl.ocks.org/mbostock/4090848
             */
            d3.json("https://d3js.org/us-10m.v2.json").then(function (us) {
                console.debug("Display US Map");
                console.debug(_this.currentData[_this.curYear]);
                // States
                //@ts-ignore
                svg.append('g').selectAll('path').data(topojson.feature(us, us.objects.states).features).enter()
                    .append('path').attr('d', path).attr("class", "states")
                    .attr('id', function (d) {
                    return stateId(d.properties.name);
                })
                    .style('fill', function (d) {
                    return _this.stateFill(d);
                })
                    .on('mouseover', function (d) {
                    var name = d.properties.name;
                    var nodeId = MigrationNodeId[name];
                    console.debug(name);
                    var id = stateId(d.properties.name);
                    d3.select("#" + id).style('fill', 'darkgray');
                }).on('mouseout', function (d) {
                    var id = stateId(d.properties.name);
                    d3.select("#" + id).style('fill', _this.stateFill(d));
                });
                // Borders
                //@ts-ignore
                svg.append("path")
                    .attr("class", "state-borders")
                    .attr("d", path(topojson.mesh(us, us.objects.states, function (a, b) { return a !== b; })));
            });
        }
        HeatMap.prototype.initMap = function () {
        };
        HeatMap.prototype.showFullMap = function () {
        };
        HeatMap.prototype.focusNode = function (migrationNode) {
        };
        HeatMap.prototype.stateFill = function (d) {
            console.log(d);
            var name = d.properties.name;
            var nodeId = MigrationNodeId[name];
            var t = this.currentData[this.curYear][nodeId].netImmigrationFlow;
            console.log(t, this.colorScale(t));
            return d3.interpolateRdBu(this.colorScale(t));
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
            this.circleGroup
                .selectAll('circle')
                .data(this.cur_year_data.filter(function (d) { return typeof (d[_this.activeX]) !== 'undefined' && typeof (d[_this.activeY]) !== 'undefined'; }))
                .join('circle')
                .transition()
                .attr('r', 5)
                .attr('cx', function (d) { return _this.xScale(d[_this.activeX]); })
                .attr('cy', function (d) { return _this.yScale(d[_this.activeY]); })
                .duration(this.transition_time);
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
    d3.json('data/migration_and_economic_data.json').then(function (data) {
        var migrationPatterns = new MigrationPatterns(data);
        var table = new Table(migrationPatterns, tableSelection, tableDims);
        var geo = new HeatMap(migrationPatterns, geoSelection, geoDims);
        var scatter = new Scatterplot(build_year_to_indicators_map(data), scatterSelection, scatterDims);
        // TODO Chord Diagram Integration
        // const chord = new ChordDiagram(migrationPatterns, chordSelection, chordDims)
    });

}(d3, topojson));
