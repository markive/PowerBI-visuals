/*
 *  Bullet Chart by SQLBI
 *
 *  Based on Stephen Few design
 *  Based on Clint Ivy, Jamie Love, and Jason Davies HTML implementation
 *  Based on Mike Bostock D3 implementation
 *
 *  Power BI Visualizations
 *
 *  Copyright (c) SQLBI
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

/// <reference path="../_references.ts"/>

module powerbi.visuals {

    //Model
    export interface BulletChartBySQLBIData {
        label: string;
        label2: string;
        showLabel: boolean;
        color: string;
        color2: string;
        states: number[];
        value: number;
        target: number;
        comparison: number;
        min: number;
        max: number;
        selector: data.Selector;
        toolTipInfo: TooltipDataItem[];
    }

    export var bulletChartProps = {
        general: {
            fill: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'fill' },
            fill2: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'fill2' },
        },
        label: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'label', propertyName: 'show' },
            text: <DataViewObjectPropertyIdentifier>{ objectName: 'label', propertyName: 'text' },
            text2: <DataViewObjectPropertyIdentifier>{ objectName: 'label', propertyName: 'text2' }
        },
    };

    //Visual
    export class BulletChartBySQLBI implements IVisual {

        //Variables
        private svg: D3.Selection;
        private svgBullet: D3.Selection;
        private svgTitle: D3.Selection;
        private svgSubtitle: D3.Selection;

        private dataView: DataView;
        private data: BulletChartBySQLBIData;

        public static getDefaultData(): BulletChartBySQLBIData {
            return {
                color: 'steelblue',
                color2: 'lightsteelblue',
                label: 'Actual',
                label2: '',
                showLabel: true,
                states: [],
                min: 0,
                max: 100,
                value: 0,
                target: 0,
                comparison: 0,
                toolTipInfo: [],
                selector: SelectionId.createNull().getSelector()
            };
        }

        //Capabilities
        public static capabilities: VisualCapabilities = {
            dataRoles: [
                {
                    name: 'Y',
                    kind: VisualDataRoleKind.Measure,
                    displayName: data.createDisplayNameGetter('Role_DisplayName_Value'),
                }, {
                    name: 'ComparisonValue',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Comparison Value',
                }, {
                    name: 'TargetValue',
                    kind: VisualDataRoleKind.Measure,
                    displayName: data.createDisplayNameGetter('Role_DisplayName_TargetValue'),
                }, {
                    name: 'MinValue',
                    kind: VisualDataRoleKind.Measure,
                    displayName: data.createDisplayNameGetter('Role_DisplayName_MinValue'),
                }, {
                    name: 'MaxValue',
                    kind: VisualDataRoleKind.Measure,
                    displayName: data.createDisplayNameGetter('Role_DisplayName_MaxValue'),

                }, {
                    name: 'QualitativeState1Value',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Qualitative State 1',
                }, {
                    name: 'QualitativeState2Value',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Qualitative State 2',
                }, {
                    name: 'QualitativeState3Value',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Qualitative State 3',
                }
            ],
            objects: {

                general: {
                    displayName: data.createDisplayNameGetter('Visual_General'),
                    properties: {
                        fill: {
                            displayName: 'Main Color',
                            type: { fill: { solid: { color: true } } }
                        },
                        fill2: {
                            displayName: 'Comparison Color',
                            type: { fill: { solid: { color: true } } }
                        },
                    },
                },

                label: {
                    displayName: "Label",
                    properties: {
                        show: {
                            displayName: data.createDisplayNameGetter('Visual_Show'),
                            type: { bool: true }
                        },
                        text: {
                            displayName: 'Text',
                            type: { text: true }
                        },
                        text2: {
                            displayName: 'Category',
                            type: { text: true }
                        },
                    },
                },
            },
            dataViewMappings: [{
                conditions: [
                    { 'Y': { max: 1 }, 'ComparisonValue': { max: 1 }, 'TargetValue': { max: 1 }, 'MinValue': { max: 1 }, 'MaxValue': { max: 1 }, 'QualitativeState1Value': { max: 1 }, 'QualitativeState2Value': { max: 1 }, 'QualitativeState3Value': { max: 1 } },
                ],
                categorical: {
                    values: {
                        select: [
                            { bind: { to: 'Y' } },
                            { bind: { to: 'ComparisonValue' } },
                            { bind: { to: 'TargetValue' } },
                            { bind: { to: 'MinValue' } },
                            { bind: { to: 'MaxValue' } },
                            { bind: { to: 'QualitativeState1Value' } },
                            { bind: { to: 'QualitativeState2Value' } },
                            { bind: { to: 'QualitativeState3Value' } },
                        ]
                    },
                },
            }],
            suppressDefaultTitle: true,
        };

        //One time setup
        public init(options: VisualInitOptions): void {
            this.svg = d3.select(options.element.get(0))
                .append('svg')
                .classed('bullet', true);

            this.svgBullet = this.svg
                .append('g');

            var labels = this.svgBullet
                .append('g')
                .style('text-anchor', 'end');

            this.svgTitle = labels
                .append('text')
                .classed('title', true);

            this.svgSubtitle = labels
                .append('text')
                .attr('dy', '1em')
                .classed('subtitle', true);
        }

        //Convert the dataview into its view model
        public static converter(dataView: DataView): BulletChartBySQLBIData {

            var data: BulletChartBySQLBIData = BulletChartBySQLBI.getDefaultData();
            
            if (dataView.categorical) {

                if (dataView.metadata) {
                    var objects = dataView.metadata.objects;

                    if (objects) {
                        data.color = DataViewObjects.getFillColor(objects, bulletChartProps.general.fill, data.color);
                        data.color2 = DataViewObjects.getFillColor(objects, bulletChartProps.general.fill2, data.color2);
                        data.label = DataViewObjects.getValue(objects, bulletChartProps.label.text, data.label);
                        data.label2 = DataViewObjects.getValue(objects, bulletChartProps.label.text2, data.label2);
                        data.showLabel = DataViewObjects.getValue(objects, bulletChartProps.label.show, data.showLabel);
                    }

                    var toolTipItems = [];

                    var values = dataView.categorical.values;

                    if (values && dataView.metadata.columns) {
                        for (var i = 0; i < values.length; i++) {

                            var col = dataView.metadata.columns[i];
                            var value = values[i].values[0] || 0;
                            if (col && col.roles) {

                                var pushToTooltips = false;

                                if (col.roles['Y']) {
                                    data.value = value;
                                    pushToTooltips = true;
                                } else if (col.roles['MinValue']) {
                                    data.min = value;
                                } else if (col.roles['MaxValue']) {
                                    data.max = value;
                                } else if (col.roles['TargetValue']) {
                                    data.target = value;
                                    pushToTooltips = true;
                                } else if (col.roles['ComparisonValue']) {
                                    data.comparison = value;
                                    pushToTooltips = true;
                                } else if (col.roles['QualitativeState1Value'] || col.roles['QualitativeState2Value'] || col.roles['QualitativeState3Value']) {
                                    if (value)
                                        data.states.push(value);
                                }

                                if (value && pushToTooltips)
                                    toolTipItems.push({ value: value, metadata: values[i] });
                            }
                        }
                    }

                    if (toolTipItems.length > 0) {
                        data.toolTipInfo = TooltipBuilder.createTooltipInfo({
                            objectName: 'general',
                            propertyName: 'formatString',
                        }, null, null, null, null, toolTipItems);
                    }
                }
            }

            return data;
        }

       //Drawing the visual
        public update(options: VisualUpdateOptions) {
            if (!options.dataViews || !options.dataViews[0]) return;
            var dataView = this.dataView = options.dataViews[0];
            var viewport = options.viewport;

            this.data = BulletChartBySQLBI.converter(dataView);

            var maxValue = Math.max(this.data.target, this.data.value, this.data.comparison, this.data.max);
            if (this.data.states.length === 0)
                this.data.states = [Math.ceil(maxValue) / 3, (Math.ceil(maxValue) / 3) * 2, Math.ceil(maxValue)];
            
            var sortedRanges = this.data.states.slice().sort(d3.descending);
            sortedRanges.unshift(maxValue+10);

            var titleWidth = TextMeasurementService.measureSvgTextWidth({ fontFamily: 'tahoma', fontSize: '16px', text: this.data.label });
            var showSubtitle = (this.data.label2.length > 0);
            var subtitleWidth = TextMeasurementService.measureSvgTextWidth({ fontFamily: 'tahoma', fontSize: '12px', text: this.data.label2 });
            var labelWidth = (this.data.showLabel ? Math.max(titleWidth, subtitleWidth) : 0);

            var height = 25;
            var width = viewport.width - 5;

            this.svg
                .attr({
                    'height': 50,
                    'width': viewport.width
                });

            if (this.data.showLabel) {
                this.svgTitle
                    .style('display', 'block')
                    .attr('transform', 'translate(-10,' + ((height / 2) + (showSubtitle ? 0 : 5)) + ')')
                    .text(this.data.label);
                this.svgBullet.attr('transform', 'translate(' + (labelWidth + 30) + ',5)');

                if (showSubtitle) {
                    this.svgSubtitle
                        .style('display', 'block')
                        .attr('transform', 'translate(-10,' + ((height / 2) + 1) + ')')
                        .text(this.data.label2);
                } else {
                    this.svgSubtitle.style('display', 'none');
                }

            } else {
                this.svgTitle.style('display', 'none');
                this.svgSubtitle.style('display', 'none');
                this.svgBullet.attr('transform', 'translate(10,5)');
            }

            //Scale on X-axis
            var scale = d3.scale.linear()
                .domain([0, Math.max(sortedRanges[0], this.data.target, this.data.value)])
                .range([0, width]);

            //Ranges
            var range = this.svgBullet.selectAll('rect.range')
                .data(sortedRanges);

            range.enter()
                .append('rect')
                .attr('class', function (d, i) { return 'range s' + i; });

            range
                .attr('x', 0)
                .attr('width', function (d) { return Math.abs(scale(d) - scale(0)); })
                .attr('height', height);
            
            //Comparison measure
            this.svgBullet.selectAll('rect.measure').remove();
            if (this.data.comparison > 0) {
                var comparison = this.svgBullet
                    .append('rect')
                    .classed('measure', true)
                    .style('fill', this.data.color2);

                comparison
                    .attr('width', scale(this.data.comparison))
                    .attr('height', height / 3)
                    .attr('x', 0)
                    .attr('y', height / 3);
            }

            //Main measure
            var measure = this.svgBullet
                .append('rect')
                .classed('measure', true)
                .style('fill', this.data.color);

            measure
                .attr('width', scale(this.data.value))
                .attr('height', height / 3)
                .attr('x', 0)
                .attr('y', height / 3);

            //Target markers
            this.svgBullet.selectAll('line.marker').remove();
            var marker = this.svgBullet
                .append('line')
                .classed('marker', true);

            marker
                .attr('x1', scale(this.data.target))
                .attr('x2', scale(this.data.target))
                .attr('y1', height / 6)
                .attr('y2', height * 5 / 6);

            //Ticks
            var format = scale.tickFormat(8);

            var tick = this.svgBullet.selectAll('g.tick')
                .data(scale.ticks(8), function (d) {
                    return this.textContent || format(d);
                });

            var tickEnter = tick.enter()
                .append('g')
                .attr('class', 'tick');

            tickEnter.append('line')
                .attr('y1', height)
                .attr('y2', height * 7 / 6);

            tickEnter
                .append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '1em')
                .attr('y', height * 7 / 6)
                .text(format);

            tickEnter
                .attr('transform', function (d) {
                    return 'translate(' + scale(d) + ',0)';
                });

            var tickUpdate = tick.transition()
                .duration(0)
                .attr('transform', function (d) {
                    return 'translate(' + scale(d) + ',0)';
                })
                .style('opacity', 1);

            tickUpdate.select('line')
                .attr('y1', height)
                .attr('y2', height * 7 / 6);

            tickUpdate.select('text')
                .attr('y', height * 7 / 6);

            tick.exit().transition()
                .duration(0)
                .attr('transform', function (d) {
                    return 'translate(' + scale(d) + ',0)';
                })
                .style('opacity', 1e-6)
                .remove();

            TooltipManager.addTooltip(this.svgBullet, (tooltipEvent: TooltipEvent) => this.data.toolTipInfo);
        } 

        //Make visual properties available in the property pane in Power BI
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var enumeration = new ObjectEnumerationBuilder();

            if (!this.data)
                this.data = BulletChartBySQLBI.getDefaultData();

            switch (options.objectName) {
                case 'general':
                    enumeration.pushInstance({
                        objectName: 'general',
                        displayName: 'General',
                        selector: null,
                        properties: {
                            fill: this.data.color,
                            fill2: this.data.color2
                        }
                    });
                    break;

                case 'label':
                    enumeration.pushInstance({
                        objectName: 'label',
                        displayName: 'Label',
                        selector: null,
                        properties: {
                            show: this.data.showLabel,
                            text: this.data.label,
                            text2: this.data.label2
                        }
                    });
                    break;

            }

            return enumeration.complete();
        }

        //Free up resources
        public destroy(): void {
            this.svg = null;
            this.svgTitle = this.svgSubtitle = this.svgBullet = null;
        }
    }
}