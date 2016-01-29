/*
*  Power BI Visualizations
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved. 
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*   
*  The above copyright notice and this permission notice shall be included in 
*  all copies or substantial portions of the Software.
*   
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/

/* Please make sure that this path is correct */
// -- /// <reference path="../_references.ts"/>

module powerbi.visuals {

    //Model
    export interface BulletChartModel {
        value: number;
        targetValue: number;
        minimum: number;
        satisfactory: number;
        good: number;
        maximum: number;
        orientation: string;
        badColor: string;
        satisfactoryColor: string;
        goodColor: string;
        bulletColor: string;
        axis: boolean;
        axisColor: string;
        measureName: string;
        measureColor: string;
        measureUnits: string;
        unitsColor: string;
        labelsReservedArea: number;
        toolTipInfo: TooltipDataItem[];
        //states: number[];
        //comparison: number;
        //selector: data.Selector;
        //toolTipInfo: TooltipDataItem[];
        //legendData: LegendData;
    }

    export class BulletChart implements IVisual {

        private static bulletChartRoleNames = {
            value: 'Value',
            targetValue: 'TargetValue',
            minValue: 'Minimum',
            satisfactoryValue: 'Satisfactory',
            goodValue: 'Good',
            maxValue: 'Maximum'
        };

        public static capabilities: VisualCapabilities = {
            dataRoles: [
                {
                    name: 'Value',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Value',
                }, {
                    name: 'TargetValue',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Target Value',
                }, {
                    name: 'Minimum',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Minimum',
                }, {
                    name: BulletChart.bulletChartRoleNames.satisfactoryValue,
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Satisfactory',
                }, {
                    name: BulletChart.bulletChartRoleNames.goodValue,
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Good',
                }, {
                    name: BulletChart.bulletChartRoleNames.maxValue,
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Maximum',
                }
            ],
            objects: {
                values: {
                    displayName: 'Data values',
                    properties: {
                        targetValue: {
                            displayName: 'Target Value',
                            type: { numeric: true }
                        },
                        minimum: {
                            displayName: 'Minimum',
                            type: { numeric: true }
                        },
                        satisfactory: {
                            displayName: 'Satisfactory',
                            type: { numeric: true }
                        },
                        good: {
                            displayName: 'Good',
                            type: { numeric: true }
                        },
                        maximum: {
                            displayName: 'Maximum',
                            type: { numeric: true }
                        },
                    }
                },
                orientation: {
                    displayName: 'Orientation',
                    properties: {
                        orientation: {
                            displayName: 'Orientation',
                            type: { text: true }
                        }
                    }
                },
                colors: {
                    displayName: 'Colors',
                    properties: {
                        badColor: {
                            type: { fill: { solid: { color: true } } },
                            displayName: 'Bad Color'
                        },
                        satisfactoryColor: {
                            type: { fill: { solid: { color: true } } },
                            displayName: 'Satisfactory Color'
                        },
                        goodColor: {
                            type: { fill: { solid: { color: true } } },
                            displayName: 'Good Color'
                        },
                        bulletColor: {
                            type: { fill: { solid: { color: true } } },
                            displayName: 'Bullet Color'
                        }
                    },
                },
                axis: {
                    displayName: 'Axis',
                    properties: {
                        axis: {
                            displayName: 'Axis',
                            type: { bool: true }
                        },
                        axisColor: {
                            type: { fill: { solid: { color: true } } },
                            displayName: 'Axis Color'
                        }
                    }
                },
                measure: {
                    displayName: 'Measure',
                    properties: {
                        measureName: {
                            type: { text: true },
                            displayName: 'Measure Name '
                        },
                        measureColor: {
                            type: { fill: { solid: { color: true } } },
                            displayName: 'Measure Color'
                        }
                    }
                },
                units: {
                    displayName: 'Units',
                    properties: {
                        measureUnits: {
                            type: { text: true },
                            displayName: 'Measure Units '
                        },
                        unitsColor: {
                            type: { fill: { solid: { color: true } } },
                            displayName: 'Units Color'
                        }
                    }
                },
                label: {
                    displayName: "Label",
                    properties: {
                        labelsReservedArea: {
                            displayName: 'Labels Reserved Area',
                            type: { numeric: true }
                        }
                    },
                }
            },
            dataViewMappings: [{
                conditions: [
                    {
                        'Value': { max: 1 }, 'TargetValue': { max: 1 }, 'Minimum': { max: 1 },
                        'Satisfactory': { max: 1 }, 'Good': { max: 1 }, 'Maximum': { max: 1 }
                    },
                ],
                categorical: {
                    values: {
                        select: [
                            { bind: { to: 'Value' } },
                            { bind: { to: 'TargetValue' } },
                            { bind: { to: 'Minimum' } },
                            { bind: { to: 'Satisfactory' } },
                            { bind: { to: 'Good' } },
                            { bind: { to: 'Maximum' } },
                        ]
                    },
                },
            }],
        };
              
        //Variables
        private svg: D3.Selection;
        private svgBullet: D3.Selection;
        private svgWrap: D3.Selection;
        private svgTitle: D3.Selection;
        private svgSubtitle: D3.Selection;

        private dataView: DataView;

        // Convert a DataView into a view model
        public static converter(dataView: DataView): BulletChartModel {
            var targetValue = BulletChart.getMetadataNumber(dataView, 'values', 'targetValue', 0);
            var minimumValue = BulletChart.getMetadataNumber(dataView, 'values', 'minimum', 0);
            var maximumValue = BulletChart.getMetadataNumber(dataView, 'values', 'maximum', parseFloat((targetValue * 2).toFixed(2)));
            var orientation = BulletChart.getMetadataText(dataView, 'orientation', 'orientation', 'HL');
            var model: BulletChartModel = {
                value: 0,
                targetValue: targetValue,
                minimum: minimumValue,
                satisfactory: BulletChart.getMetadataNumber(dataView, 'values', 'satisfactory', minimumValue + 33 / 100 * (maximumValue - minimumValue)),
                good: BulletChart.getMetadataNumber(dataView, 'values', 'good', minimumValue + 66 / 100 * (maximumValue - minimumValue)),
                maximum: maximumValue,
                orientation: orientation,
                badColor: BulletChart.getMetadataFill(dataView, 'colors', 'badColor', 'Red').solid.color,
                satisfactoryColor: BulletChart.getMetadataFill(dataView, 'colors', 'satisfactoryColor', 'Yellow').solid.color,
                goodColor: BulletChart.getMetadataFill(dataView, 'colors', 'goodColor', 'Green').solid.color,
                bulletColor: BulletChart.getMetadataFill(dataView, 'colors', 'bulletColor', 'Black').solid.color,
                axis: BulletChart.getMetadataBool(dataView, 'axis', 'axis', true),
                axisColor: BulletChart.getMetadataFill(dataView, 'axis', 'axisColor', 'Grey').solid.color,
                measureName: BulletChart.getMetadataText(dataView, 'measure', 'measureName', ''),
                measureColor: BulletChart.getMetadataFill(dataView, 'measure', 'measureColor', 'Black').solid.color,
                measureUnits: BulletChart.getMetadataText(dataView, 'units', 'measureUnits', ''),
                unitsColor: BulletChart.getMetadataFill(dataView, 'units', 'unitsColor', 'Grey').solid.color,
                labelsReservedArea: BulletChart.getMetadataNumber(dataView, 'label', 'labelsReservedArea', (orientation === 'VT' || orientation === 'VB') ? 40 : 80),
                toolTipInfo: []
            };

            var toolTipItems = [];
            if (dataView && dataView.categorical && dataView.categorical.values && dataView.metadata && dataView.metadata.columns) {
                var values = dataView.categorical.values;
                var metadataColumns = dataView.metadata.columns;

                for (var i = 0; i < values.length; i++) {

                    var col = metadataColumns[i];
                    model.measureName = model.measureName === '' ? col.displayName : model.measureName;
                    var value = values[i].values[0] || 0;
                    if (col && col.roles) {
                        if (col.roles[BulletChart.bulletChartRoleNames.value]) {
                            toolTipItems.push({ value: value, metadata: values[i] });
                            model.value = value;
                        } else if (col.roles[BulletChart.bulletChartRoleNames.targetValue]) {
                            toolTipItems.push({ value: value, metadata: values[i] });
                            model.targetValue = value;
                        } else if (col.roles[BulletChart.bulletChartRoleNames.minValue]) {
                            model.minimum = value;
                        } else if (col.roles[BulletChart.bulletChartRoleNames.satisfactoryValue]) {
                            model.satisfactory = value;
                        } else if (col.roles[BulletChart.bulletChartRoleNames.goodValue]) {
                            model.good = value;
                        } else if (col.roles[BulletChart.bulletChartRoleNames.maxValue]) {
                            model.maximum = value;
                        }
                    }
                }

                model.toolTipInfo = TooltipBuilder.createTooltipInfo({
                    objectName: 'general',
                    propertyName: 'formatString',
                }, null, null, null, null, toolTipItems);
            }

            model.satisfactory = Math.max(model.satisfactory, model.minimum);
            model.good = Math.max(model.good, model.satisfactory);
            model.maximum = Math.max(model.maximum, model.good);

            return model;
        }

        /* One time setup*/
        public init(options: VisualInitOptions): void {
            this.svg = d3.select(options.element.get(0))
                .append('svg')
                .classed('bullet', true);

            this.svgBullet = this.svg
                .append('g');

            this.svgWrap = this.svgBullet
                .append('g')
                .attr("class", "wrap");

            var labels = this.svgBullet
                .append('g');

            this.svgTitle = labels
                .append('text')
                .classed('title', true);

            this.svgSubtitle = labels
                .append('text')
                .classed('subtitle', true);
        }

        /* Called for data, size, formatting changes*/
        public update(options: VisualUpdateOptions) {
            if (!options.dataViews || !options.dataViews[0] || !options.dataViews[0].categorical || !options.dataViews[0].categorical.values) return;

            var dataView = this.dataView = options.dataViews[0];
            var viewport = options.viewport;
            var model: BulletChartModel = BulletChart.converter(dataView);

            var ranges = [model.minimum, model.satisfactory, model.good, model.maximum];
            var sortedRanges = ranges.sort(d3.descending);

            var height = 25;
            var width = viewport.width - model.labelsReservedArea - 15;
            var reverse = false, vertical = false;

            this.svgTitle
                .style('display', 'block')
                .text(model.measureName)
                .attr("fill", model.measureColor);

            this.svgSubtitle
                .style('display', 'block')
                .text(model.measureUnits)
                .attr("fill", model.unitsColor);

            if (model.orientation === 'HR' || model.orientation === 'VB') {
                reverse = true;
            }

            if (model.orientation === 'VT' || model.orientation === 'VB') {
                vertical = true;
                width = viewport.height - model.labelsReservedArea - 5;
                this.svgWrap.attr("transform", "rotate(90)translate(" + (reverse ? 0 : model.labelsReservedArea - 5) + "," + -75 + ")");
                this.svgTitle
                    .attr('transform', 'translate(62.5,' + (reverse ? width + 20 : model.labelsReservedArea - 30) + ')')
                    .style('text-overflow', 'ellipsis')
                    .style('overflow', 'hidden')
                    .style('text-anchor', 'middle');
                this.svgSubtitle
                    .attr('transform', 'translate(62.5,' + (reverse ? width + 35 : model.labelsReservedArea - 15) + ')')
                    .style('text-anchor', 'middle');
                this.svgBullet.attr('transform', 'translate(0,' + (reverse ? 5 : 0) + ')');
            }
            else {
                this.svgWrap.attr("transform", "translate(0)");
                this.svgTitle
                    .attr('transform', 'translate(' + (reverse ? 0 : -10) + ',' + ((height / 2) + 5) + ')')
                    .attr('x', (reverse ? width + 10 : 0))
                    .style('text-anchor', reverse ? 'start' : 'end')
                    .attr('width', model.labelsReservedArea);
                this.svgSubtitle
                    .attr('transform', 'translate(' + (reverse ? 0 : -10) + ',' + (height + 17) + ')')
                    .attr('x', (reverse ? width + 15 : 0))
                    .style('text-anchor', reverse ? 'start' : 'end')
                    .attr('width', model.labelsReservedArea);
                this.svgBullet.attr('transform', 'translate(' + (reverse ? 15 : model.labelsReservedArea) + ',5)');
            }

            var maxLabelWidth = vertical ? 80 : model.labelsReservedArea - 10;
            powerbi.TextMeasurementService.svgEllipsis(this.svgTitle[0][0], maxLabelWidth);
            powerbi.TextMeasurementService.svgEllipsis(this.svgSubtitle[0][0], maxLabelWidth);

            this.svg
                .attr({
                    'height': vertical ? viewport.height : 50,
                    'width': vertical ? 100 : viewport.width
                });

            //Scale on X-axis
            var scale = d3.scale.linear()
                .domain([model.minimum, Math.max(sortedRanges[0], model.targetValue, model.value)])
                .range(vertical ? [width, 0] : [0, width]);

            //Set the color Scale
            var color = d3.scale.ordinal();
            if (model.good >= model.satisfactory) {
                color.domain([model.satisfactory, model.good, model.maximum])
                    .range([model.badColor, model.satisfactoryColor, model.goodColor]);
            }
            else {
                color.domain([model.satisfactory, model.good, model.maximum])
                    .range([model.satisfactoryColor, model.goodColor, model.badColor]);
            }
            //Ranges
            var range = this.svgWrap.selectAll('rect.range')
                .data(sortedRanges);

            range.enter()
                .append('rect')
                .attr('class', function (d, i) { return 'range s' + i; });

            range
                .attr("x", (vertical ? scale : scale(model.minimum)))
                .attr('width', function (d) { return Math.abs(scale(d) - scale(model.minimum)); })
                .attr('height', height)
                .attr("fill", function (d) { return color(d); });
            //Comparison measure
            this.svgBullet.selectAll('rect.measure').remove();

            //Main measure
            var measure = this.svgWrap
                .append('rect')
                .classed('measure', true)
                .style('fill', model.bulletColor);

            measure
                .attr('width', Math.abs(scale(model.value) - scale(model.minimum)))
                .attr('height', height / 3)
                .attr("x", vertical ? scale(model.value) : scale(model.minimum))
                .attr('y', height / 3);

            //Target markers
            this.svgWrap.selectAll('line.marker').remove();
            var marker = this.svgWrap
                .append('line')
                .classed('marker', true);

            marker
                .attr('x1', scale(model.targetValue))
                .attr('x2', scale(model.targetValue))
                .attr('y1', height / 6)
                .attr('y2', height * 5 / 6)
                .style('stroke', model.bulletColor);

            var interval = (Math.max(model.maximum, model.value) - model.minimum) / 6;
            var valFormatter = powerbi.visuals.valueFormatter.create({
                format: powerbi.visuals.valueFormatter.getFormatString(
                    dataView.categorical.values[0].source,
                    {
                        objectName: 'general',
                        propertyName: 'formatString',
                    }),
                value: interval,
            });
				
            //Ticks
            this.svgBullet.selectAll('g.axis').remove();
            if (model.axis) {
                var numTicks = Math.max(width / 75, 2);
                var xAxis = d3.svg.axis().ticks(numTicks).tickFormat(d => valFormatter.format(d));
                xAxis.orient(vertical ? "left" : "bottom");
                var axis = this.svgBullet.selectAll("g.axis").data([0]);
                axis.enter().append("g")
                    .attr("class", "axis")
                    .attr('transform', 'translate(' + (vertical ? 50 : 0) + ',' + (vertical ? (reverse ? 0 : model.labelsReservedArea - 5) : height) + ')');
                axis.call(xAxis.scale(scale));
                axis.selectAll('line').style('stroke', model.axisColor);
                axis.selectAll('text').style('fill', model.axisColor);
            }
            TooltipManager.addTooltip(this.svgBullet, (tooltipEvent: TooltipEvent) => model.toolTipInfo);
        }

        /*About to remove your visual, do clean up here */
        public destroy() { }

        //Make visual properties available in the property pane in Power BI
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
            var instances: VisualObjectInstance[] = [];
            var dataView = this.dataView;
            switch (options.objectName) {
                case 'values':
                    var values: VisualObjectInstance = {
                        objectName: 'values',
                        displayName: 'Data values',
                        selector: null,
                        properties: {
                            targetValue: BulletChart.getMetadataNumber(dataView, 'values', 'targetValue', undefined),
                            minimum: BulletChart.getMetadataNumber(dataView, 'values', 'minimum', undefined),
                            satisfactory: BulletChart.getMetadataNumber(dataView, 'values', 'satisfactory', undefined),
                            good: BulletChart.getMetadataNumber(dataView, 'values', 'good', undefined),
                            maximum: BulletChart.getMetadataNumber(dataView, 'values', 'maximum', undefined)
                        }
                    };
                    instances.push(values);
                    break;

                case 'orientation':
                    var orientation: VisualObjectInstance = {
                        objectName: 'orientation',
                        displayName: 'Orientation',
                        selector: null,
                        properties: {
                            orientation: BulletChart.getMetadataText(dataView, 'orientation', 'orientation', null)
                        }
                    };
                    instances.push(orientation);
                    break;

                case 'colors':
                    var colors: VisualObjectInstance = {
                        objectName: 'colors',
                        displayName: 'Colors',
                        selector: null,
                        properties: {
                            badColor: BulletChart.getMetadataFill(dataView, 'colors', 'badColor', 'Red'),
                            satisfactoryColor: BulletChart.getMetadataFill(dataView, 'colors', 'satisfactoryColor', 'Yellow'),
                            goodColor: BulletChart.getMetadataFill(dataView, 'colors', 'goodColor', 'Green'),
                            bulletColor: BulletChart.getMetadataFill(dataView, 'colors', 'bulletColor', 'Black')
                        }
                    };
                    instances.push(colors);
                    break;
                case 'axis':
                    var axis: VisualObjectInstance = {
                        objectName: 'axis',
                        displayName: 'Axis',
                        selector: null,
                        properties: {
                            axis: BulletChart.getMetadataBool(dataView, 'axis', 'axis', true),
                            axisColor: BulletChart.getMetadataFill(dataView, 'axis', 'axisColor', 'Grey')
                        }
                    };
                    instances.push(axis);
                    break;
                case 'measure':
                    var measure: VisualObjectInstance = {
                        objectName: 'measure',
                        displayName: 'Measure',
                        selector: null,
                        properties: {
                            measureName: BulletChart.getMetadataText(dataView, 'measure', 'measureName', null),
                            measureColor: BulletChart.getMetadataFill(dataView, 'measure', 'measureColor', 'Black')
                        }
                    };
                    instances.push(measure);
                    break;
                case 'units':
                    var units: VisualObjectInstance = {
                        objectName: 'units',
                        displayName: 'Measure Units',
                        selector: null,
                        properties: {
                            measureUnits: BulletChart.getMetadataText(dataView, 'units', 'measureUnits', null),
                            unitsColor: BulletChart.getMetadataFill(dataView, 'units', 'unitsColor', 'Grey')
                        }
                    };
                    instances.push(units);
                    break;
                case 'label':
                    //var orientationVal = RectOrientation.HorizontalLeftRight;
                    var label: VisualObjectInstance = {
                        objectName: 'label',
                        displayName: 'Label',
                        selector: null,
                        properties: {
                            labelsReservedArea: BulletChart.getMetadataNumber(dataView, 'label', 'labelsReservedArea', null)
                        }
                    };
                    instances.push(label);
                    break;
            }

            return instances;
        }

        /*Get metadata property of type fill*/
        private static getMetadataFill(dataView: DataView, field: string, property: string, defaultValue: string): Fill {
            if (dataView) {
                var metadata = dataView.metadata.objects;
                if (metadata) {
                    var val = metadata[field];
                    if (val && val.hasOwnProperty(property)) {
                        var fill = <Fill>val[property];
                        if (fill)
                            return fill;
                    }
                }
            }
            return { solid: { color: defaultValue } };
        }

        private static getMetadataText(dataView: DataView, field: string, property: string, defaultValue: string = ''): string {
            if (dataView) {
                var metadata = dataView.metadata.objects;
                if (metadata) {
                    var val = metadata[field];
                    if (val && val.hasOwnProperty(property) && val[property] !== '') {
                        var text = <string>val[property];
                        if (text)
                            return text;
                    }
                }
            }
            return defaultValue;
        }

        private static getMetadataBool(dataView: DataView, field: string, property: string, defaultValue: boolean = true): boolean {
            if (dataView) {
                var metadata = dataView.metadata.objects;
                if (metadata) {
                    var val = metadata[field];
                    if (val && val.hasOwnProperty(property))
                        return <boolean>val[property];
                }
            }
            return defaultValue;
        }

        private static getMetadataNumber(dataView: DataView, field: string, property: string, defaultValue: number): number {
            if (dataView) {
                var metadata = dataView.metadata.objects;
                if (metadata) {
                    var val = metadata[field];
                    if (val && val.hasOwnProperty(property) && val[property] !== '')
                        return <number>val[property];
                }
            }
            return defaultValue;
        }
    }
}
