(function (d3) {
    'use strict';

    String.prototype.clean = function () {
        return this.replace(/\s/g, "_");
    };
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
        MigrationNodeId[MigrationNodeId["Puerto Rico"] = 51] = "Puerto Rico";
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
                ("Min values: \nMin Inflow " + this.maxInflow + ", Min Outflow: " + this.minOutflow + ", Min Total: " + this.minSum + " "));
        }
        MigrationPatterns.prototype.yearsAsArray = function () {
            Object.keys(this.data).map(function (key) {
            });
        };
        return MigrationPatterns;
    }());

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
            this.RECT_WIDTH = 100;
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
            var svg = rows.append('td').append('svg').attr('width', 100).attr('height', 20);
            svg.append('rect').attr('x', function (d) {
                if (d.netImmigrationFlow < 0) {
                    return _this.flowScale(0) - _this.flowScale(d.netImmigrationFlow);
                }
                return _this.flowScale(0);
            }).attr('y', 0).attr('height', 20).attr('width', function (d) {
                console.debug(MigrationNodeId[d.nodeId] + ": " + d.netImmigrationFlow + ", " + _this.flowScale(d.netImmigrationFlow));
                var flow = _this.flowScale(d.netImmigrationFlow);
                return flow;
            }).attr('fill', function (d) {
                if (d.netImmigrationFlow < 0) {
                    return 'red';
                }
                else {
                    return 'blue';
                }
            });
        };
        return Table;
    }());

    var tableSelection = d3.select('.dataTable');
    var tableDims = {
        height: 1000,
        width: 500
    };
    d3.json('data/migration.json').then(function (data) {
        var migrationPatterns = new MigrationPatterns(data);
        var table = new Table(migrationPatterns, tableSelection, tableDims);
        console.log(migrationPatterns.yearsAsArray());
    });

}(d3));
