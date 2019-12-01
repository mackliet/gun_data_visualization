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
    function getRegionStrings() {
        var regions = [];
        for (var val in RegionEnum) {
            if (isNaN(Number(val))) {
                regions.push(val);
            }
        }
        return regions;
    }
    function getGeographicAreaStrings() {
        var geographic_areas = [];
        for (var val in GeographicAreaEnum) {
            if (isNaN(Number(val))) {
                geographic_areas.push(val);
            }
        }
        return geographic_areas;
    }

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
                        GDPPerCapita: d.GDP_per_capita
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
                    total_came_per_capita: d.total_came / d.population,
                    total_left_per_capita: d.total_left / d.population,
                    net_immigration_flow_per_capita: d.net_immigration_flow / d.population,
                    geographic_area: d.geographic_area,
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
            var _this = this;
            if (startYear === void 0) { startYear = 2017; }
            // TODO May just overlay these with total being the red/blue on the axis and the overlay being pruple
            this.headerLabels = ['Region', 'GDP per Capita', 'Total Flow', 'Pop. Flow', 'Pop. Growth', 'Population'];
            /**
             * Table constants
             */
            this.FLOW_RECT_WIDTH = 100;
            this.GROWTH_RECT_WIDTH = 75;
            this.MIGRATION_RECT_WIDTH = 75;
            this.POP_RECT_WIDTH = 150;
            this.column_widths = [150, this.FLOW_RECT_WIDTH + 30, this.FLOW_RECT_WIDTH + 30, this.FLOW_RECT_WIDTH + 30, this.FLOW_RECT_WIDTH + 30, 65];
            this.currentData = JSON.parse(JSON.stringify(migrationPatterns.data)); // Make deep copy. Sorting was screwing up heat map
            this.curYear = startYear;
            console.debug("Table SVG Dimensions are width: " + svgDims.width + "; height: " + svgDims.height);
            this.flowScale = d3.scaleLinear().range([5, this.FLOW_RECT_WIDTH])
                .domain([migrationPatterns.minSum, migrationPatterns.maxInflow]);
            this.migrationScale = d3.scaleLinear().range([0, this.MIGRATION_RECT_WIDTH])
                .domain([-.1, .04]);
            this.growthScale = d3.scaleLinear().range([0, this.GROWTH_RECT_WIDTH])
                .domain([.94, 1.03]);
            this.table = container.append('table').classed('stat_table', true).style('height', svgDims.height + "px").style('width', svgDims.width + "px");
            this.header = this.table.append('thead');
            this.titleHeader = this.header.append('tr');
            this.axisHeader = this.header.append('tr');
            this.lastSorted = null;
            this.sortOrder = 1;
            var sortFunctions = [function (a, b, _) { return a.nodeId - b.nodeId; },
                function (a, b, _) { return a.GDPPerCapita - b.GDPPerCapita; },
                function (a, b, _) { return a.netImmigrationFlow - b.netImmigrationFlow; },
                function (a, b, _) { return a.netImmigrationFlow / a.totalPopulation - b.netImmigrationFlow / b.totalPopulation; },
                function (a, b, year) {
                    if ((year - 1) in _this.currentData)
                        return a.totalPopulation / _this.currentData[year - 1][a.nodeId].totalPopulation
                            - b.totalPopulation / _this.currentData[year - 1][b.nodeId].totalPopulation;
                    return 0;
                },
                function (a, b, _) { return a.totalPopulation - b.totalPopulation; }];
            this.sortFunctions = d3.scaleOrdinal()
                .domain(this.headerLabels)
                .range(sortFunctions);
            var _loop_1 = function (header, index) {
                this_1.titleHeader.append('th').style('top', '0px')
                    .text(header).classed('table_header', true)
                    .on('click', function () { return _this.labelListener(header); });
                var axis = this_1.axisHeader.append('th').classed("Axis" + index, true);
                var svgAxis = axis.append('svg').attr('height', 60);
                if (index === 2) {
                    //@ts-ignore
                    var axis_1 = d3.axisBottom().scale(this_1.flowScale).ticks(8);
                    this_1.addAxis(svgAxis, axis_1);
                }
                else if (index === 3) {
                    //@ts-ignore
                    var axis_2 = d3.axisBottom().scale(this_1.migrationScale).ticks(5).tickFormat(function (d) {
                        return Number.parseFloat(d) * 100 + '%';
                    });
                    this_1.addAxis(svgAxis, axis_2);
                }
                else if (index === 4) {
                    //@ts-ignore
                    var axis_3 = d3.axisBottom().scale(this_1.growthScale).ticks(5).tickFormat(function (d) {
                        return (Number.parseFloat(d) * 100) - 100 + '%';
                    });
                    this_1.addAxis(svgAxis, axis_3, 15);
                }
            };
            var this_1 = this;
            for (var _i = 0, _a = this.headerLabels.map(function (v, i) { return [v, i]; }); _i < _a.length; _i++) {
                var _b = _a[_i], header = _b[0], index = _b[1];
                _loop_1(header, index);
            }
            var rowHeight = this.titleHeader.node().getBoundingClientRect().height;
            this.axisHeader.selectAll('th').style('top', rowHeight + "px");
            this.tBody = this.table.append('tbody');
            this.loadTable(startYear);
        }
        /**
         * Class to refresh the data table for sorting, brush, or selections
         */
        Table.prototype.loadTable = function (year) {
            var _this = this;
            var data = JSON.parse(JSON.stringify(this.currentData[year]));
            // if (sortFunction) {
            //     // data.sort(sortFunction);
            //     // const sortFunction = (a,b) => this.sortOrder * this.sortFunctions(this.lastSorted)(a,b,this.curYear);
            //     // this.tBody.selectAll('tr').sort(sortFunction);
            // }
            //@ts-ignore
            this.tBody.selectAll('tr').data(data, function (d) {
                var e = d;
                return e.nodeId;
            }).join(function (enter) {
                var rows = enter.append('tr');
                rows.append('td').style('text-align', 'left').classed('region_name', true)
                    .append('text').text(function (d) {
                    return RegionEnum[d.nodeId];
                });
                rows.append('td').classed('gdp', true).append('text').text(function (d) {
                    return d.GDPPerCapita;
                });
                var tds = rows.append('td');
                tds.attr('class', 'svg');
                var svg = tds.append('svg').attr('width', _this.FLOW_RECT_WIDTH).style('max-height', '100%')
                    .style('display', 'block');
                /**
                 * Create net rectangle.  Blue for net inflow, red for net outflow
                 */
                _this.net(svg.append('rect').classed('net', true)
                    .selectAll('rect').classed('net', true), year);
                /**
                 * Create net rectangle.  Blue for net inflow, red for net outflow
                 */
                _this.in(svg.append('rect').classed('in', true), year);
                /**
                 * Create difference rectangle.  Should be purple until it ends
                 */
                _this.out(svg.append('rect').classed('out', true), year);
                _this.pop(rows.append('td').attr('width', _this.MIGRATION_RECT_WIDTH)
                    .style('text-align', 'left')
                    .append('svg')
                    .attr('width', '100%').attr('height', 10)
                    .append('rect').classed('pop', true), year);
                _this.popGrowth(rows.append('td').attr('width', _this.GROWTH_RECT_WIDTH).append('svg')
                    .attr('width', '100%').attr('height', 10)
                    .append('rect').classed('popGrowth', true), year);
                _this.popTotal(rows.append('td').classed('popTotal', true).append('text'), year);
                var that = _this;
                var update_width = function (d, i) { d3.select(this).attr('width', that.column_widths[i]); };
                _this.table.selectAll('tr').selectAll('td').each(update_width).select('svg').each(update_width);
                _this.table.selectAll('tr').selectAll('th').each(update_width).select('svg').each(update_width);
            }, function (update) {
                var sortFunction = function (a, b) { return _this.sortOrder * _this.sortFunctions(_this.lastSorted)(a, b, _this.curYear); };
                _this.tBody.selectAll('tr').sort(sortFunction);
                update = update.transition();
                _this.net(update.selectAll('rect').filter('.net'), year);
                _this.in(update.selectAll('rect').filter('.in'), year);
                _this.out(update.selectAll('rect').filter('.out'), year);
                _this.pop(update.selectAll('rect').filter('.pop'), year);
                _this.popGrowth(update.selectAll('rect').filter('.popGrowth'), year);
                _this.popTotal(update.selectAll('td').filter('.popTotal').select('text'), year);
                update.selectAll('td').filter('.gdp').select('text').text(function (d) { return _this.currentData[year][d.nodeId].GDPPerCapita; });
                _this.region(update.selectAll('td').filter('.region_name').select('text'), year);
            });
        };
        /**
         *
         * @param join selection for updating/creating attributes
         * @param year current year for the view
         */
        Table.prototype.region = function (join, year) {
            var _this = this;
            join.text(function (d) { return RegionEnum[_this.currentData[year][d.nodeId].nodeId]; });
        };
        /**
         *
         * @param join selection for updating/creating attributes
         * @param year current year for the view
         */
        Table.prototype.net = function (join, year) {
            var _this = this;
            join.attr('x', function (d) {
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
        };
        /**
         *
         * @param join selection for updating/creating attributes
         * @param year current year for the view
         */
        Table.prototype.in = function (join, year) {
            var _this = this;
            join.attr('x', function (d) {
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
        };
        /**
         *
         * @param join selection for updating/creating attributes
         * @param year current year for the view
         */
        Table.prototype.out = function (join, year) {
            var _this = this;
            join.attr('x', function (d) {
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
        };
        /**
         *
         * @param join selection for updating/creating attributes
         * @param year current year for the view
         */
        Table.prototype.pop = function (join, year) {
            var _this = this;
            join.attr('x', function (d) {
                d = _this.currentData[year][d.nodeId];
                if (d.netImmigrationFlow < 0) {
                    return _this.migrationScale(d.netImmigrationFlow / d.totalPopulation);
                }
                return _this.migrationScale(0);
            }).attr('y', 5).attr('height', 10).attr('width', function (d) {
                d = _this.currentData[year][d.nodeId];
                var migration = _this.migrationScale(0) - _this.migrationScale(d.netImmigrationFlow / d.totalPopulation);
                return Math.abs(migration);
            }).attr('fill', function (d) {
                d = _this.currentData[year][d.nodeId];
                if (d.netImmigrationFlow < 0) {
                    return 'red';
                }
                else {
                    return 'blue';
                }
            });
        };
        /**
         *
         * @param join selection for updating/creating attributes
         * @param year current year for the view
         */
        Table.prototype.popGrowth = function (join, year) {
            var _this = this;
            join.attr('x', function (d) {
                if (year === 2005) {
                    return _this.growthScale(1);
                }
                d = _this.currentData[year][d.nodeId];
                var popDiff = d.totalPopulation / _this.currentData[year - 1][d.nodeId].totalPopulation;
                if (popDiff < 1) {
                    return _this.growthScale(popDiff);
                }
                return _this.growthScale(1.00);
            }).attr('y', 5).attr('height', 10).attr('width', function (d) {
                d = _this.currentData[year][d.nodeId];
                if (year === 2005) {
                    return 0;
                }
                var popDiff = d.totalPopulation / _this.currentData[year - 1][d.nodeId].totalPopulation;
                if (popDiff > 1) {
                    return _this.growthScale(popDiff) - _this.growthScale(1);
                }
                return _this.growthScale(1.00) - _this.growthScale(popDiff);
            }).attr('fill', function (d) {
                if (year === 2005) {
                    return 0;
                }
                d = _this.currentData[year][d.nodeId];
                var popDiff = d.totalPopulation / _this.currentData[year - 1][d.nodeId].totalPopulation;
                if (popDiff < 1.00) {
                    return 'red';
                }
                else {
                    return 'blue';
                }
            });
        };
        /**
         *
         * @param join selection for updating/creating attributes
         * @param year current year for the view
         */
        Table.prototype.popTotal = function (join, year) {
            var _this = this;
            join.text(function (d) {
                d = _this.currentData[year][d.nodeId];
                return d.totalPopulation;
            });
        };
        Table.prototype.addAxis = function (el, axis, x) {
            if (x === void 0) { x = 8; }
            //@ts-ignore
            el.append('g').attr("transform", "translate(" + x + ", 48)").call(axis).selectAll('text').style("text-anchor", "end")
                .attr("dx", "-.5em")
                // .attr("dy", ".01em")
                .attr("transform", "translate(" + (-x + 8) + ", 0) rotate(90)");
        };
        Table.prototype.labelListener = function (l) {
            console.log(l);
            if (this.lastSorted !== l) {
                this.sortOrder = 1;
            }
            this.lastSorted = l;
            this.sortOrder *= -1;
            this.loadTable(this.curYear);
        };
        Table.prototype.changeYear = function (year) {
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
        var mouseY = y;
        try {
            mouseY = d3.mouse(svg.node())[1];
        }
        catch (_b) {
            mouseY = y;
        }
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
    function removeAllTooltips(svg) {
        svg.selectAll('.tooltip-group').remove();
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
                _this.features = topojson.feature(_this.us, _this.us.objects.states).features;
                _this.drawMap(null);
                // Borders
                _this.svg.append("path")
                    .attr("class", "state-borders")
                    .attr("d", _this.path(topojson.mesh(us, us.objects.states, function (a, b) {
                    return a !== b;
                })));
            });
        }
        HeatMap.prototype.setHighlightCallback = function (callback) {
            this.highlightCallback = callback;
        };
        HeatMap.prototype.setClearCallback = function (callback) {
            this.clearCallback = callback;
        };
        HeatMap.prototype.highlightState = function (state) {
            this.focusNode(this.features.find(function (d) { return d.properties.name == state; }));
            var highlighted = this.currentRegion !== null;
            return highlighted;
        };
        HeatMap.prototype.clearHighlightedState = function () {
            this.focusNode(this.currentData[this.curYear]["" + this.currentRegion]);
        };
        HeatMap.prototype.drawMap = function (stateSelected) {
            var _this = this;
            this.currentRegion = stateSelected;
            this.setColorScale();
            this.updateLegend();
            // States
            this.dataSelection = this.g.selectAll('path')
                //@ts-ignore
                .data(this.features);
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
            }).on('click', function (d) { return _this.highlightCallback(d.properties.name); });
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

    var Scatterplot = /** @class */ (function () {
        function Scatterplot(state_data, container, svg_dims, start_year) {
            if (start_year === void 0) { start_year = 2017; }
            var plot_div = container.append('div').classed('plot_container', true);
            this.curYear = start_year;
            this.year_to_indicators = state_data;
            this.current_year_data = this.year_to_indicators[this.curYear];
            this.container = container;
            this.state_table_div = plot_div.append('div').append('div');
            this.padding = 110;
            this.circle_radius = 5;
            this.label_padding = 50;
            this.svg = plot_div.append('svg').attr('height', svg_dims.height - this.label_padding + 10).attr('width', svg_dims.width);
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
            for (var _i = 0, _a = this.current_year_data; _i < _a.length; _i++) {
                var state = _a[_i];
                this.state_to_geo_area["" + state.state] = "" + state.geographic_area;
            }
            this.create_state_table();
            this.create_dropdowns();
            this.create_scales();
            this.update_plot();
        }
        Scatterplot.indicator_to_name = function (indicator) {
            var no_underscores = indicator.replace(new RegExp('_', 'g'), ' ');
            return no_underscores[0].toUpperCase() + no_underscores.slice(1);
        };
        Scatterplot.prototype.setHighlightCallback = function (callback) {
            this.highlightCallback = callback;
        };
        Scatterplot.prototype.setClearCallback = function (callback) {
            this.clearCallback = callback;
        };
        Scatterplot.prototype.highlightState = function (state) {
            var that = this;
            this.highlightedState = state;
            this.circle_group.selectAll('circle').filter(function (d) {
                return d.state === state;
            }).each(function (d) {
                that.createTooltip(d, d3.select(this));
            });
        };
        Scatterplot.prototype.clearHighlightedState = function () {
            this.highlightedState = null;
            this.circle_group.selectAll('circle').classed('hovered', false);
            removeAllTooltips(this.svg);
        };
        // Currently not used. Can use if we want to, but this data
        // is now in the state selection table
        Scatterplot.prototype.create_legend = function () {
            var _this = this;
            var geographic_areas = getGeographicAreaStrings();
            var legend_svg = this.legend_div
                .append('div')
                .classed('legend_svg_div', true)
                .attr('height', 200)
                .append('svg')
                .attr('width', 130)
                .attr('height', 200)
                .style('float', 'right');
            legend_svg.selectAll('circle')
                .data(geographic_areas)
                .join('circle')
                .attr("cx", 10)
                .attr("cy", function (d, i) { return 10 + i * 25; })
                .attr("r", 5)
                .style("fill", function (d) { return _this.color_map(d); });
            legend_svg.selectAll('text')
                .data(geographic_areas)
                .join('text')
                .attr("x", 20)
                .attr("y", function (d, i) { return 11 + i * 25; })
                .text(function (d) { return d; })
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle");
        };
        Scatterplot.prototype.create_state_table = function () {
            var _this = this;
            var that = this;
            this.state_table_div.classed('dropdown_div', true);
            this.state_table_div.append('span')
                .style('font-weight', 'bold')
                .style('text-align', 'right')
                .text('Select States');
            var state_table = this.state_table_div
                .append('div').classed('dropdown_div-content', true)
                .append('table').classed('state_table', true);
            var thead = state_table.append('thead');
            var tbody = state_table.append('tbody');
            tbody.attr('height', (this.svg_dims.height - this.padding) / 2);
            var states = getRegionStrings();
            var geographic_areas = getGeographicAreaStrings();
            var all_arr = ['All'];
            var table_data = [];
            for (var i = 0; i < states.length; i++) {
                var col1 = i < all_arr.length ? all_arr[i] : '';
                var col2 = i < geographic_areas.length ? geographic_areas[i] : '';
                var col3 = i < states.length ? states[i] : '';
                table_data.push({ col1: col1, col2: col2, col3: col3 });
            }
            var add_switch = function (selection, col_name) {
                var label = selection.append('label');
                label.append('input').attr('type', 'checkbox').each(function (d) { this.checked = true; });
                label.append('font').text(function (d) { return d[col_name]; });
            };
            var rows = tbody.selectAll('tr')
                .data(table_data);
            var rows_enter = rows.enter().append('tr');
            var all_column = rows_enter.append('td');
            var geo_area_column = rows_enter.append('td');
            var region_column = rows_enter.append('td');
            all_column = all_column.filter(function (d) { return d.col1 != ''; });
            geo_area_column = geo_area_column.filter(function (d) { return d.col2 != ''; });
            add_switch(all_column, 'col1');
            add_switch(geo_area_column, 'col2');
            add_switch(region_column, 'col3');
            rows = rows.merge(rows_enter);
            geo_area_column.select('font').classed('outlined', true).attr('color', function (d) { return _this.color_map(d.col2); });
            region_column.select('font').classed('outlined', true).attr('color', function (d) { return _this.color_map(_this.state_to_geo_area[d.col3]); });
            all_column
                .select('label')
                .select('input')
                .on("change", function () {
                var checkbox = this;
                that.circle_selection.classed('unselected', !checkbox.checked);
                rows.selectAll('input')
                    .each(function () { this.checked = checkbox.checked; });
            });
            geo_area_column
                .select('label')
                .select('input')
                .on("change", function (d) {
                var geo_area_filter = function (region_d) { return d.col2 == that.state_to_geo_area[region_d.col3]; };
                var checkbox = this;
                that.circle_selection.filter(function (state_data) { return "" + state_data.geographic_area == d.col2; })
                    .classed('unselected', !checkbox.checked);
                region_column.filter(geo_area_filter)
                    .select('input')
                    .each(function () { this.checked = checkbox.checked; });
                var num_region = region_column.select('input').size();
                var num_checked_region = region_column.select('input').filter(function () { return this.checked; }).size();
                all_column.select('input').each(function () { this.checked = num_region == num_checked_region; });
            });
            region_column
                .select('label')
                .select('input')
                .on("change", function (d) {
                var checkbox = this;
                that.update_checked_states(d.col3, checkbox.checked);
                var region_same_geo_area = function (region_d) { return that.state_to_geo_area[d.col3] == that.state_to_geo_area[region_d.col3]; };
                var geo_area_for_region = function (geo_col) { return geo_col.col2 == that.state_to_geo_area[d.col3]; };
                var num_in_geo_area = region_column.filter(region_same_geo_area).select('input').size();
                var num_checked_in_geo_area = region_column.filter(region_same_geo_area).select('input').filter(function () { return this.checked; }).size();
                geo_area_column.filter(geo_area_for_region).select('input').each(function () { this.checked = num_in_geo_area == num_checked_in_geo_area; });
                var num_region = region_column.select('input').size();
                var num_checked_region = region_column.select('input').filter(function () { return this.checked; }).size();
                all_column.select('input').each(function () { this.checked = num_region == num_checked_region; });
            });
            this.region_column = region_column;
        };
        Scatterplot.prototype.update_checked_states = function (state, checked) {
            this.circle_selection.filter(function (d) { return "" + d.state == state; })
                .classed('unselected', function (d) { return !checked; });
        };
        Scatterplot.prototype.create_dropdowns = function () {
            var _this = this;
            var dropdown_wrapper = this.legend_div.append('div');
            var y_wrap = dropdown_wrapper.append('div').classed('dropdown-panel', true);
            y_wrap.append('div').classed('y-label', true)
                .append('text')
                .text('Y Axis Data');
            y_wrap.append('div').attr('id', 'dropdown_y').classed('dropdown', true).append('div').classed('dropdown-content', true)
                .append('select');
            var x_wrap = dropdown_wrapper.append('div').classed('dropdown-panel', true);
            x_wrap.append('div').classed('x-label', true)
                .append('text')
                .text('X Axis Data');
            x_wrap.append('div').attr('id', 'dropdown_x').classed('dropdown', true).append('div').classed('dropdown-content', true)
                .append('select');
            var that = this;
            /* X DROPDOWN */
            var drop_x = dropdown_wrapper.select('#dropdown_x').select('.dropdown-content').select('select');
            var options_x = drop_x.selectAll('option').data(this.indicators).join('option');
            options_x
                .append('option')
                .attr('value', function (d) { return d; });
            options_x
                .append('text')
                .text(function (d) { return Scatterplot.indicator_to_name(d); });
            options_x.filter(function (indicator) { return indicator === _this.active_x_indicator; })
                .attr('selected', true);
            drop_x.on('change', function (d, i) {
                var this_select = this;
                that.active_x_indicator = that.indicators[this_select.selectedIndex];
                that.update_plot();
            });
            /* Y DROPDOWN */
            var drop_y = dropdown_wrapper.select('#dropdown_y').select('.dropdown-content').select('select');
            var options_y = drop_y.selectAll('option').data(this.indicators).join('option');
            options_y
                .append('option')
                .attr('value', function (indicator) { return indicator; });
            options_y
                .append('text')
                .text(function (d) { return Scatterplot.indicator_to_name(d); });
            options_y.filter(function (indicator) { return indicator === _this.active_y_indicator; })
                .attr('selected', true);
            drop_y.on('change', function (d, i) {
                var this_select = this;
                that.active_y_indicator = that.indicators[this_select.selectedIndex];
                that.update_plot();
            });
        };
        Scatterplot.prototype.create_scales = function () {
            this.axes_group.append('g')
                .attr('id', 'x-axis');
            this.axes_group.append('g')
                .attr('id', 'y-axis');
            this.axes_group
                .append('text')
                .classed('x-label', true);
            this.axes_group
                .append('text')
                .classed('y-label', true);
        };
        Scatterplot.prototype.change_year = function (year) {
            this.current_year_data = this.year_to_indicators[year];
            this.curYear = year;
            this.update_plot_with_time(this.year_change_transition_time);
        };
        Scatterplot.prototype.update_scales_with_time = function (transition_time) {
            var _this = this;
            var padding = this.padding;
            var svg_dims = this.svg_dims;
            var label_padding = this.label_padding;
            var find_extreme = function (indicator, extreme_func) {
                var extreme_val = null;
                for (var year in _this.year_to_indicators) {
                    var year_data = _this.year_to_indicators[year];
                    var extreme_for_year = extreme_func(year_data, function (d) { return d[indicator]; });
                    extreme_val = extreme_val === null
                        ? extreme_for_year
                        : extreme_func([extreme_val, extreme_for_year]);
                }
                return extreme_val;
            };
            var x_domain = [find_extreme(this.active_x_indicator, d3.min),
                find_extreme(this.active_x_indicator, d3.max)];
            var y_domain = [find_extreme(this.active_y_indicator, d3.min),
                find_extreme(this.active_y_indicator, d3.max)];
            var x_scale = d3.scaleLinear()
                .domain(x_domain)
                .range([padding, svg_dims.width - 2 * this.circle_radius]);
            var y_scale = d3.scaleLinear()
                .domain(y_domain)
                .range([svg_dims.height - padding, 2 * this.circle_radius]);
            this.axes_group.select('#x-axis')
                .attr('transform', "translate (0," + y_scale.range()[0] + ")")
                .transition()
                .call(d3.axisBottom(x_scale).ticks(6))
                .duration(transition_time);
            this.axes_group.select('#y-axis')
                .attr('transform', "translate (" + padding + ",0)")
                .transition()
                .call(d3.axisLeft(y_scale).ticks(6))
                .duration(transition_time);
            this.axes_group.select('.x-label')
                .style('text-anchor', 'middle')
                .attr('transform', "translate(" + (x_scale.range()[0] + (x_scale.range()[1] - x_scale.range()[0]) / 2.0) + ", " + (svg_dims.height - label_padding) + ")")
                .text(Scatterplot.indicator_to_name(this.active_x_indicator));
            this.axes_group.select('.y-label')
                .style('text-anchor', 'middle')
                .attr('transform', "translate(" + label_padding + ", " + (y_scale.range()[0] + (y_scale.range()[1] - y_scale.range()[0]) / 2.0) + ") rotate(-90)")
                .text(Scatterplot.indicator_to_name(this.active_y_indicator));
            this.x_scale = x_scale;
            this.y_scale = y_scale;
        };
        Scatterplot.prototype.update_plot = function () {
            this.update_plot_with_time(this.default_transition_time);
        };
        Scatterplot.prototype.createTooltip = function (d, circle) {
            circle.classed('hovered', true);
            var is_float = function (num) { return num % 1 !== 0; };
            var x_val = d[this.active_x_indicator];
            var y_val = d[this.active_y_indicator];
            var lines = ["" + d.state,
                Scatterplot.indicator_to_name(this.active_x_indicator) + ": " + (is_float(x_val) ? x_val.toFixed(4) : x_val),
                Scatterplot.indicator_to_name(this.active_y_indicator) + ": " + (is_float(y_val) ? y_val.toFixed(4) : y_val)];
            var x = parseFloat(circle.attr('cx')) + parseFloat(circle.attr('r')) + 1;
            var y = parseFloat(circle.attr('cy')) + parseFloat(circle.attr('r')) + 1;
            createTooltip(this.svg, [x, y], lines);
        };
        Scatterplot.prototype.updateTooltip = function (d, circle) {
            circle.classed('hovered', true);
            var is_float = function (num) { return num % 1 !== 0; };
            var x_val = d[this.active_x_indicator];
            var y_val = d[this.active_y_indicator];
            var lines = ["" + d.state,
                Scatterplot.indicator_to_name(this.active_x_indicator) + ": " + (is_float(x_val) ? x_val.toFixed(4) : x_val),
                Scatterplot.indicator_to_name(this.active_y_indicator) + ": " + (is_float(y_val) ? y_val.toFixed(4) : y_val)];
            var x = parseFloat(circle.attr('cx')) + parseFloat(circle.attr('r')) + 1;
            var y = parseFloat(circle.attr('cy')) + parseFloat(circle.attr('r')) + 1;
            updateTooltip(this.svg, [x, y], lines);
        };
        Scatterplot.prototype.update_plot_with_time = function (transition_time) {
            var _this = this;
            this.update_scales_with_time(transition_time);
            var that = this;
            this.circle_selection =
                this.circle_group
                    .selectAll('circle')
                    .data(this.current_year_data.filter(function (d) { return typeof (d[_this.active_x_indicator]) !== 'undefined' && typeof (d[_this.active_y_indicator]) !== 'undefined'; }))
                    .join('circle')
                    .attr('fill', function (d) { return _this.color_map("" + d.geographic_area); })
                    .classed('unselected', function (d) { return !_this.region_column.filter(function (row_d) { return "" + d.state == "" + row_d.col3; }).select('input').node().checked; })
                    .on('mouseover', function (d) {
                    if (that.highlightedState === null) {
                        console.log('Called!');
                        var circle = d3.select(this);
                        that.createTooltip(d, circle);
                    }
                })
                    .on('mouseout', function (d) {
                    if (that.highlightedState === null) {
                        that.clearHighlightedState();
                    }
                })
                    .on('click', function (d) {
                    _this.highlightCallback(d.state);
                });
            this.circle_selection
                .transition()
                .attr('r', this.circle_radius)
                .attr('cx', function (d) { return _this.x_scale(d[_this.active_x_indicator]); })
                .attr('cy', function (d) { return _this.y_scale(d[_this.active_y_indicator]); })
                .duration(transition_time)
                .on('end', function (d) {
                if (that.highlightedState !== null && d.state === that.highlightedState) {
                    that.updateTooltip(d, d3.select(this));
                }
            });
        };
        return Scatterplot;
    }());

    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    var _this = undefined;
    String.prototype.clean = function () {
        return this.replace(/\s|%/g, "_");
    };
    var tableSelection = d3.select('.dataTable');
    var tableDims = {
        height: 600,
        width: 780
    };
    var geoSelection = d3.select('.geoHeat');
    var geoDims = {
        height: 650,
        width: 1000
    };
    var scatterSelection = d3.select('.scatterplot');
    var scatterDims = {
        height: 600,
        width: 600
    };
    var slider = document.getElementById("yearSlider");
    var play = d3.select(".play");
    //@ts-ignore
    var geo;
    var table;
    var scatter;
    var migrationPatterns;
    d3.json('data/migration_and_economic_data.json').then(function (data) {
        migrationPatterns = new MigrationPatterns(data);
        table = new Table(migrationPatterns, tableSelection, tableDims);
        geo = new HeatMap(migrationPatterns, geoSelection, geoDims);
        scatter = new Scatterplot(build_year_to_indicators_map(data), scatterSelection, scatterDims);
        d3.select('.activeYear').text('2017');
        var clearHighlight = function () {
            scatter.clearHighlightedState();
            geo.clearHighlightedState();
        };
        var highlight = function (state) {
            scatter.clearHighlightedState();
            if (geo.highlightState(state)) {
                scatter.highlightState(state);
            }
        };
        scatter.setHighlightCallback(highlight);
        geo.setHighlightCallback(highlight);
        scatter.setClearCallback(clearHighlight);
        geo.setClearCallback(clearHighlight);
        // Couldn't figure out how to do this in CSS...hacky JS fix
        var container = d3.select('.container');
        var visualizationWidth = container.select('.view').node().getBoundingClientRect().width;
        var containerWidth = container.node().getBoundingClientRect().width;
        container.style('padding-left', (containerWidth - visualizationWidth) / 2 + "px").classed('hidden', false);
        // TODO Chord Diagram Integration
        // const chord = new ChordDiagram(migrationPatterns, chordSelection, chordDims)
    });
    // Bind year event to various views
    // TODO Bind to scatterplot and table
    slider.oninput = function () {
        //@ts-ignore
        var minYear = Math.min.apply(Math, migrationPatterns.years);
        var maxYear = Math.max.apply(Math, migrationPatterns.years);
        var scale = d3.scaleLinear().domain([1, 13]).range([minYear, maxYear]);
        //@ts-ignore
        var curYear = Math.round(scale(this.value));
        geo.changeYear(curYear);
        scatter.change_year(curYear);
        for (var _i = 0, _a = Array.from([geo, table]); _i < _a.length; _i++) {
            var obj = _a[_i];
            obj.changeYear(curYear);
        }
        d3.select('.activeYear').text(curYear);
    };
    var clickNum = 0;
    play.on('click', function () { return __awaiter(_this, void 0, void 0, function () {
        var current, _a, _b, _i, year, t;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    clickNum += 1;
                    current = clickNum;
                    // @ts-ignore
                    slider.value = 1;
                    slider.dispatchEvent(new Event('input'));
                    _a = [];
                    for (_b in migrationPatterns.years)
                        _a.push(_b);
                    _i = 0;
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    year = _a[_i];
                    t = (Number.parseInt(year) + 1) * 1000;
                    return [4 /*yield*/, setTimeout(function () {
                            if (clickNum !== current) {
                                return;
                            }
                            //@ts-ignore
                            slider.stepUp();
                            slider.dispatchEvent(new Event('input'));
                        }, t)];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    // Bind migration statistic to event listeners on the migration statistic dropdown
    d3.selectAll('.dropdown-item').data([ViewState.net, ViewState.in, ViewState.out]).on('click', function (d) {
        geo.toggleMigrationStatistic(d);
    });

}(d3, topojson));
