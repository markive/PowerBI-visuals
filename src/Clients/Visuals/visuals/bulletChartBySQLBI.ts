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
        value: number;
        targetValue: number;
        comparisonValue: number;
        min: number;
        max: number;
        states: number[];
        settings: BulletChartSettings;
        selector: data.Selector;
        toolTipInfo: TooltipDataItem[];
        legendData: LegendData;
        legendObjectProperties?: DataViewObject;
    }

    export interface BulletChartSettings {
        valueColor: string;
        comparisonColor: string;
        verticalOrientation: boolean;
        showLabels: boolean;
        text: string;
        textColor: string;
        unitText: string;
        unitColor: string;
        qualitativeState1: BulletChartState;
        qualitativeState2: BulletChartState;
        qualitativeState3: BulletChartState;
        showAxis: boolean;
        axisColor: string;
        axisMin?: number;
        axisMax?: number;
    }

    export interface BulletChartState {
        color: string;
        value?: number;
    }

    export var bulletChartProps = {
        general: {
            valueColor: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'valueColor' },
            comparisonColor: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'comparisonColor' },
            verticalOrientation: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'verticalOrientation' },
        },
        labels: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'show' },
            text: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'text' },
            textColor: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'textColor' },
            unitText: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'unitText' },
            unitColor: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'unitColor' }
        },
        axis: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'axis', propertyName: 'show' },
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'axis', propertyName: 'color' },
            min: <DataViewObjectPropertyIdentifier>{ objectName: 'axis', propertyName: 'min' },
            max: <DataViewObjectPropertyIdentifier>{ objectName: 'axis', propertyName: 'max' },
        },
        qualitativeState1: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'qualitativeState1', propertyName: 'color' },
            value: <DataViewObjectPropertyIdentifier>{ objectName: 'qualitativeState1', propertyName: 'value' },
        },
        qualitativeState2: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'qualitativeState2', propertyName: 'color' },
            value: <DataViewObjectPropertyIdentifier>{ objectName: 'qualitativeState2', propertyName: 'value' },
        },
        qualitativeState3: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'qualitativeState3', propertyName: 'color' },
            value: <DataViewObjectPropertyIdentifier>{ objectName: 'qualitativeState3', propertyName: 'value' },
        },
        legend: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'show' },
            position: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'position' },
            showTitle: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'showTitle' },
            titleText: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'titleText' },
        },
    };

    //Visual
    export class BulletChartBySQLBI implements IVisual {

        //Variables
        private svg: D3.Selection;
        private svgBullet: D3.Selection;
        private svgTitle: D3.Selection;
        private svgSubtitle: D3.Selection;
        private legend: ILegend;
        private dataView: DataView;
        private data: BulletChartBySQLBIData;

        public static getDefaultData(): BulletChartBySQLBIData {
            return {
                value: 0,
                targetValue: 0,
                comparisonValue: 0,
                min: 0,
                max: 1,
                states: [],
                settings: {
                    valueColor: 'steelblue',
                    comparisonColor: 'lightsteelblue',
                    verticalOrientation: false,
                    showLabels: true,
                    text: '',
                    textColor: '#000',
                    unitText: '',
                    unitColor: '#999',
                    qualitativeState1: { color: '#ccc' },
                    qualitativeState2: { color: '#ddd' },
                    qualitativeState3: { color: '#eee' },
                    showAxis: true,
                    axisColor: '#999',
                },
                selector: SelectionId.createNull().getSelector(),
                toolTipInfo: [],
                legendData: { title: '', dataPoints: [] },
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
                        valueColor: {
                            displayName: 'Value Color',
                            type: { fill: { solid: { color: true } } }
                        },
                        comparisonColor: {
                            displayName: 'Comparison Color',
                            type: { fill: { solid: { color: true } } }
                        },
                        verticalOrientation: {
                            displayName: 'Vertical Orientation',
                            type: { bool: true }
                        }
                    },
                },
                qualitativeState1: {
                    displayName: 'Qualitative State 1',
                    properties: {
                        color: {
                            displayName: data.createDisplayNameGetter('Visual_LabelsFill'),
                            type: { fill: { solid: { color: true } } }
                        },
                        value: {
                            displayName: 'Value',
                            type: { numeric: true }
                        },
                    },
                },
                qualitativeState2: {
                    displayName: 'Qualitative State 2',
                    properties: {
                        color: {
                            displayName: data.createDisplayNameGetter('Visual_LabelsFill'),
                            type: { fill: { solid: { color: true } } }
                        },
                        value: {
                            displayName: 'Value',
                            type: { numeric: true }
                        },
                    },
                },
                qualitativeState3: {
                    displayName: 'Qualitative State 3',
                    properties: {
                        color: {
                            displayName: data.createDisplayNameGetter('Visual_LabelsFill'),
                            type: { fill: { solid: { color: true } } }
                        },
                        value: {
                            displayName: 'Value',
                            type: { numeric: true }
                        },
                    },
                },
                labels: {
                    displayName: "Labels",
                    properties: {
                        show: {
                            displayName: data.createDisplayNameGetter('Visual_Show'),
                            type: { bool: true }
                        },
                        text: {
                            displayName: 'Text',
                            type: { text: true }
                        },
                        textColor: {
                            displayName: 'Text Color',
                            type: { fill: { solid: { color: true } } }
                        },
                        unitText: {
                            displayName: 'Unit',
                            type: { text: true }
                        },
                        unitColor: {
                            displayName: 'Unit Color',
                            type: { fill: { solid: { color: true } } }
                        },
                    },
                },
                axis: {
                    displayName: 'Axis',
                    properties: {
                        show: {
                            displayName: data.createDisplayNameGetter('Visual_Show'),
                            type: { bool: true }
                        },
                        color: {
                            displayName: data.createDisplayNameGetter('Visual_LabelsFill'),
                            type: { fill: { solid: { color: true } } },
                        },
                        min: {
                            displayName: 'Minimum',
                            type: { number: true },
                        },
                        max: {
                            displayName: 'Maximum',
                            type: { number: true },
                        }
                    }
                },
                legend: {
                    displayName: data.createDisplayNameGetter('Visual_Legend'),
                    properties: {
                        show: {
                            displayName: data.createDisplayNameGetter('Visual_Show'),
                            type: { bool: true }
                        },
                        position: {
                            displayName: data.createDisplayNameGetter('Visual_LegendPosition'),
                            type: { formatting: { legendPosition: true } }
                        },
                        showTitle: {
                            displayName: data.createDisplayNameGetter('Visual_LegendShowTitle'),
                            type: { bool: true }
                        },
                        titleText: {
                            displayName: data.createDisplayNameGetter('Visual_LegendTitleText'),
                            type: { text: true }
                        }
                    }
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

            this.legend = createLegend(options.element, false, null, true);
         
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
                        data.settings.valueColor = DataViewObjects.getValue(objects, bulletChartProps.general.valueColor, data.settings.valueColor);
                        data.settings.comparisonColor = DataViewObjects.getValue(objects, bulletChartProps.general.comparisonColor, data.settings.comparisonColor);
                        data.settings.verticalOrientation = DataViewObjects.getValue(objects, bulletChartProps.general.verticalOrientation, data.settings.verticalOrientation);

                        data.settings.showLabels = DataViewObjects.getValue(objects, bulletChartProps.labels.show, data.settings.showLabels);
                        data.settings.text = DataViewObjects.getValue(objects, bulletChartProps.labels.text, data.settings.text);
                        data.settings.textColor = DataViewObjects.getValue(objects, bulletChartProps.labels.textColor, data.settings.textColor);
                        data.settings.unitText = DataViewObjects.getValue(objects, bulletChartProps.labels.unitText, data.settings.unitText);
                        data.settings.unitColor = DataViewObjects.getValue(objects, bulletChartProps.labels.unitColor, data.settings.unitColor);
                        data.settings.showAxis = DataViewObjects.getValue(objects, bulletChartProps.axis.show, data.settings.showAxis);
                        data.settings.axisColor = DataViewObjects.getValue(objects, bulletChartProps.axis.color, data.settings.axisColor);
                        data.settings.axisMin = DataViewObjects.getValue(objects, bulletChartProps.axis.min, data.settings.axisMin);
                        data.min = data.settings.axisMin;
                        data.settings.axisMax = DataViewObjects.getValue(objects, bulletChartProps.axis.max, data.settings.axisMax);
                        data.max = data.settings.axisMax;
                        data.settings.qualitativeState1.color = DataViewObjects.getValue(objects, bulletChartProps.qualitativeState1.color, data.settings.qualitativeState1.color);
                        data.settings.qualitativeState1.value = DataViewObjects.getValue(objects, bulletChartProps.qualitativeState1.value, data.settings.qualitativeState1.value);
                        data.settings.qualitativeState2.color = DataViewObjects.getValue(objects, bulletChartProps.qualitativeState2.color, data.settings.qualitativeState2.color);
                        data.settings.qualitativeState2.value = DataViewObjects.getValue(objects, bulletChartProps.qualitativeState2.value, data.settings.qualitativeState2.value);
                        data.settings.qualitativeState3.color = DataViewObjects.getValue(objects, bulletChartProps.qualitativeState3.color, data.settings.qualitativeState3.color);
                        data.settings.qualitativeState3.value = DataViewObjects.getValue(objects, bulletChartProps.qualitativeState3.value, data.settings.qualitativeState3.value);
                    }

                    var toolTipItems = [];
                    var states = [data.settings.qualitativeState1.value, data.settings.qualitativeState2.value, data.settings.qualitativeState3.value];

                    var values = dataView.categorical.values;
                    if (values && dataView.metadata.columns) {

                        for (var i = 0; i < values.length; i++) {

                            var col = dataView.metadata.columns[i];
                            var value = values[i].values[0] || 0;
                            if (col && col.roles) {

                                var pushToTooltips = false;

                                if (col.roles['Y']) {
                                    if (data.settings.text === '') data.settings.text = col.displayName;
                                    data.value = value;
                                    pushToTooltips = true;
                                } else if (col.roles['MinValue']) {
                                    data.min = value;
                                } else if (col.roles['MaxValue']) {
                                    data.max = value;
                                } else if (col.roles['TargetValue']) {
                                    data.targetValue = value;
                                    pushToTooltips = true;
                                } else if (col.roles['ComparisonValue']) {
                                    data.comparisonValue = value;
                                    pushToTooltips = true;
                                }

                                if (col.roles['QualitativeState1Value']) {
                                    if (value) states[0] = value;
                                } else if (col.roles['QualitativeState2Value']) {
                                    if (value) states[1] = value;
                                } else if (col.roles['QualitativeState3Value']) {
                                    if (value) states[2] = value;
                                }

                                if (value && pushToTooltips)
                                    toolTipItems.push({ value: value, metadata: values[i] });
                            }
                        }
                    }

                    for (var i = 0; i < states.length; i++){
                        if ((states[i]))
                            data.states.push(states[i]);
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

            var maxValue = Math.max(this.data.targetValue, this.data.value, this.data.comparisonValue, this.data.max);
            if (this.data.states.length === 0)
                this.data.states = [Math.ceil(maxValue) / 3, (Math.ceil(maxValue) / 3) * 2, Math.ceil(maxValue)];
            
            var sortedRanges = this.data.states.slice().sort(d3.descending);
            sortedRanges.unshift(maxValue+10);

            var titleWidth = TextMeasurementService.measureSvgTextWidth({ fontFamily: 'tahoma', fontSize: '16px', text: this.data.settings.text });
            var showSubtitle = (this.data.settings.unitText.length > 0);
            var subtitleWidth = TextMeasurementService.measureSvgTextWidth({ fontFamily: 'tahoma', fontSize: '12px', text: this.data.settings.unitText });
            var labelWidth = (this.data.settings.showLabels ? Math.max(titleWidth, subtitleWidth) : 0);

            var height = 25;
            var width = viewport.width - 5;
            var vertical = this.data.settings.verticalOrientation;

            this.svg
                .attr({
                    'height': (vertical ? viewport.height : 50),
                    'width': (vertical ? 100 : viewport.width)
                });

            if (this.data.settings.showLabels) {
                this.svgTitle
                    .style('display', 'block')
                    .style('fill', this.data.settings.textColor)
                    .attr('transform', 'translate(-10,' + ((height / 2) + (showSubtitle ? 0 : 5)) + ')')
                    .text(this.data.settings.text);

                //TODO vertical
                this.svgBullet.attr('transform', 'translate(' + (labelWidth + 30) + ',5)');

                if (showSubtitle) {
                    this.svgSubtitle
                        .style('display', 'block')
                        .style('fill', this.data.settings.unitColor)
                        .attr('transform', 'translate(-10,' + ((height / 2) + 1) + ')')
                        .text(this.data.settings.unitText);
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
                .domain([this.data.min, Math.max(sortedRanges[0], this.data.targetValue, this.data.value)])
                .range(vertical ? [width, 0] : [0, width]);

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
            if (this.data.comparisonValue > 0) {
                var comparison = this.svgBullet
                    .append('rect')
                    .classed('measure', true)
                    .style('fill', this.data.settings.comparisonColor);

                comparison
                    .attr('width', scale(this.data.comparisonValue))
                    .attr('height', height / 3)
                    .attr('x', 0)
                    .attr('y', height / 3);
            }

            //Main measure
            var measure = this.svgBullet
                .append('rect')
                .classed('measure', true)
                .style('fill', this.data.settings.valueColor);

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
                .attr('x1', scale(this.data.targetValue))
                .attr('x2', scale(this.data.targetValue))
                .attr('y1', height / 6)
                .attr('y2', height * 5 / 6);

            //Ticks
            var no = Math.max(width / 75, 2);
            /*var valFormatter =  valueFormatter.create({
                format: valueFormatter.getFormatString(
                    dataView.categorical.values[0].source,{
                        objectName: 'general',
                        propertyName: 'formatString',
                    }),
                value: interval,
            });*/
            var format = scale.tickFormat(8);

            var tick = this.svgBullet.selectAll('g.tick')
                .data(scale.ticks(no), function (d) {
                    return this.textContent || format(d);
                });

            var tickEnter = tick.enter()
                .append('g')
                .attr('class', 'tick');

            tickEnter.append('line')
                .style('stroke', this.data.settings.axisColor)
                .attr('y1', height)
                .attr('y2', height * 7 / 6);

            tickEnter
                .append('text')
                .style('fill', this.data.settings.axisColor)
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

            tick.exit()
                .attr('transform', function (d) {
                    return 'translate(' + scale(d) + ',0)';
                })
                .style('opacity', 1e-6)
                .remove();

            TooltipManager.addTooltip(this.svgBullet, (tooltipEvent: TooltipEvent) => this.data.toolTipInfo);

            var legendObjectProperties = this.data.legendObjectProperties;
            if (legendObjectProperties) {
                var legendData = this.data.legendData;
                LegendData.update(legendData, legendObjectProperties);
                var position = <string>legendObjectProperties[legendProps.position];
                if (position)
                    this.legend.changeOrientation(LegendPosition[position]);
                this.legend.drawLegend(legendData, options.viewport);
            } else {
                this.legend.changeOrientation(LegendPosition.Top);
                this.legend.drawLegend({ dataPoints: [] }, options.viewport);
            }
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
                        selector: null,
                        properties: {
                            valueColor: this.data.settings.valueColor,
                            comparisonColor: this.data.settings.comparisonColor,
                            verticalOrientation: this.data.settings.verticalOrientation
                        }
                    });
                    break;

                case 'labels':
                    enumeration.pushInstance({
                        objectName: 'labels',
                        selector: null,
                        properties: {
                            show: this.data.settings.showLabels,
                            text: this.data.settings.text,
                            textColor: this.data.settings.textColor,
                            unitText: this.data.settings.unitText,
                            unitColor: this.data.settings.unitColor,
                        }
                    });
                    break;

                case 'qualitativeState1':
                    enumeration.pushInstance({
                        objectName: 'qualitativeState1',
                        selector: null,
                        properties: {
                            color: this.data.settings.qualitativeState1.color,
                            value: this.data.settings.qualitativeState1.value,
                        }
                    });
                    break;

                case 'qualitativeState2':
                    enumeration.pushInstance({
                        objectName: 'qualitativeState2',
                        selector: null,
                        properties: {
                            color: this.data.settings.qualitativeState2.color,
                            value: this.data.settings.qualitativeState2.value,
                        }
                    });
                    break;
                
                case 'qualitativeState3':
                    enumeration.pushInstance({
                        objectName: 'qualitativeState3',
                        selector: null,
                        properties: {
                            color: this.data.settings.qualitativeState3.color,
                            value: this.data.settings.qualitativeState3.value,
                        }
                    });
                    break;

                case 'axis':
                    enumeration.pushInstance({
                        objectName: 'axis',
                        selector: null,
                        properties: {
                            show: this.data.settings.showAxis,
                            color: this.data.settings.axisColor,
                            min: this.data.settings.axisMin,
                            max: this.data.settings.axisMax,
                        }
                    });
                    break;

                case 'legend':
                    var legendObjectProperties: DataViewObjects = { legend: this.data.legendObjectProperties };

                    var showLegend = DataViewObjects.getValue(legendObjectProperties, bulletChartProps.legend.show, this.legend.isVisible());
                    var showLegendTitle = DataViewObjects.getValue(legendObjectProperties, bulletChartProps.legend.showTitle, true);
                    var legendTitle = DataViewObjects.getValue(legendObjectProperties, bulletChartProps.legend.titleText, this.data.legendData.title);

                    enumeration.pushInstance({
                        selector: null,
                        objectName: 'legend',
                        properties: {
                            show: showLegend,
                            position: LegendPosition[this.legend.getOrientation()],
                            showTitle: showLegendTitle,
                            titleText: legendTitle
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