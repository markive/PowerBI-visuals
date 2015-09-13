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
    export interface BulletChartBySQLBIModel {
        label: string;
        color: string;
        states: number[];
        value: number;
        target: number;
        min: number;
        max: number;
        orientation: number; //0=horizontal, 1=vertical 
        selector: data.Selector;
        toolTipInfo: TooltipDataItem[];
    }

    //Visual
    export class BulletChartBySQLBI implements IVisual {

        //Variables
        private svg: D3.Selection;
        private svgBullet: D3.Selection;
        private svgTitle: D3.Selection;
        private svgSubtitle: D3.Selection;

        private dataView: DataView;
        private selectionManager: SelectionManager;

        //Capabilities - moved to BulletChartBySQLBI.capabilities.ts
        /*public static capabilities: VisualCapabilities = {

        };*/

        //One time setup
        public init(options: VisualInitOptions): void {
            this.svg = d3.select(options.element.get(0))
                .append('svg')
                .classed('bullet', true);

            this.svgBullet = this.svg
                .append('g');

            this.svgTitle = this.svgBullet
                .append('g')
                .style('text-anchor', 'end')
                .append('text')
                .classed('title', true);

            /*this.svgSubtitle = this.svgTitle
                .append('text')
                .attr('dy', '1em')
                .classed('subtitle', true);*/

            this.selectionManager = new SelectionManager({ hostServices: options.host });
        }

        //Convert the dataview into its view model
        public static converter(dataView: DataView): BulletChartBySQLBIModel {
            var viewModel: BulletChartBySQLBIModel = {
                orientation: 0,
                color: BulletChartBySQLBI.getFill(dataView).solid.color,
                label: BulletChartBySQLBI.getLabel(dataView),
                states: [],
                min: 0,
                max: 100,
                value: 0, 
                target: 0,
                toolTipInfo: [],
                selector: SelectionId.createNull().getSelector()
            };

            var toolTipItems = [];

            if (dataView && dataView.categorical && dataView.categorical.values && dataView.metadata && dataView.metadata.columns) {
                var values = dataView.categorical.values;
                var metadataColumns = dataView.metadata.columns;

                for (var i = 0; i < values.length; i++) {
                    var col = metadataColumns[i],
                        value = values[i].values[0] || 0;
                    if (col && col.roles) {
                        if (col.roles['Y']) {
                            viewModel.value = value;
                            if (value)
                                toolTipItems.push({ value: value, metadata: values[i] });
                            //if (viewModel.label === '') viewModel.label = values[i].source.displayName;
                        } else if (col.roles['MinValue']) {
                            viewModel.min = value;
                        } else if (col.roles['MaxValue']) {
                            viewModel.max = value;
                        } else if (col.roles['TargetValue']) {
                            viewModel.target = value;
                            if (value)
                                toolTipItems.push({ value: value, metadata: values[i] });

                        } else if (col.roles['QualitativeState1Value'] || col.roles['QualitativeState2Value'] || col.roles['QualitativeState3Value']) {
                            if (value)
                                viewModel.states.push(value);
                        }
                    }
                }

                if (toolTipItems.length > 0) {
                    viewModel.toolTipInfo = TooltipBuilder.createTooltipInfo({
                        objectName: 'general',
                        propertyName: 'formatString',
                    }, null, null, null, null, toolTipItems);
                }
            }

            return viewModel;
        }

       //Drawing the visual
        public update(options: VisualUpdateOptions) {
            if (!options.dataViews && !options.dataViews[0]) return;
            var dataView = this.dataView = options.dataViews[0];
            var viewport = options.viewport;
            var viewModel: BulletChartBySQLBIModel = BulletChartBySQLBI.converter(dataView);
 
            var maxValue = Math.max(viewModel.target, viewModel.value, viewModel.max);
            if (viewModel.states.length === 0)
                viewModel.states = [Math.ceil(maxValue) / 3, (Math.ceil(maxValue) / 3) * 2, Math.ceil(maxValue)];
            
            var sortedRanges = viewModel.states.slice().sort(d3.descending);
            sortedRanges.unshift(maxValue+10);

            var labelProperties = {
                fontFamily: 'tahoma',
                fontSize: '16px',
                text: viewModel.label
            };
            var labelWidth = (BulletChartBySQLBI.getLabelShow(dataView) ? TextMeasurementService.measureSvgTextWidth(labelProperties) : 0);

            var height = 25; //viewport.height - ;
            var width = viewport.width - 5;

            this.svg
                .attr({
                    'height': 50, //viewport.height,
                    'width': viewport.width
                });
           
            if (labelWidth > 0) {
                this.svgTitle
                    .style('display', 'block')
                    .attr('transform', 'translate(-10,' + ((height / 2) + 5) + ')')
                    .text(viewModel.label);
                this.svgBullet.attr('transform', 'translate(' + (labelWidth + 30) + ',5)');
            } else {
                this.svgTitle.style('display', 'none');
                this.svgBullet.attr('transform', 'translate(10,5)');
            }
            //this.svgSubtitle.text(viewModel.subLabel);

            //Scale on X-axis
            var scale = d3.scale.linear()
                .domain([0, Math.max(sortedRanges[0], viewModel.target, viewModel.value)])
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

            //Main measure
            this.svgBullet.selectAll('rect.measure').remove();
            var measure = this.svgBullet
                .append('rect')
                .classed('measure', true)
                .style('fill', viewModel.color);

            measure
                .attr('width', scale(viewModel.value))
                .attr('height', height / 3)
                .attr('x', 0)
                .attr('y', height / 3);

            //Target markers
            this.svgBullet.selectAll('line.marker').remove();
            var marker = this.svgBullet
                .append('line')
                .classed('marker', true);

            marker
                .attr('x1', scale(viewModel.target))
                .attr('x2', scale(viewModel.target))
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

            TooltipManager.addTooltip(this.svgBullet, (tooltipEvent: TooltipEvent) => viewModel.toolTipInfo);
        } 

        //Make visual properties available in the property pane in Power BI
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
            var instances: VisualObjectInstance[] = [];
            var dataView = this.dataView;
            switch (options.objectName) {
                case 'general':
                    var general: VisualObjectInstance = {
                        objectName: 'general',
                        displayName: 'General',
                        selector: null,
                        properties: {
                            fill: BulletChartBySQLBI.getFill(dataView)
                        }
                    };
                    instances.push(general);
                    break;

                case 'label':
                    var label: VisualObjectInstance = {
                        objectName: 'label',
                        displayName: 'Label',
                        selector: null,
                        properties: {
                            show: BulletChartBySQLBI.getLabelShow(dataView),
                            text: BulletChartBySQLBI.getLabel(dataView)
                        }
                    };
                    instances.push(label);
                    break;
            }

            return instances;
        }

        //Free up resources
        public destroy(): void {
            this.svg = null;
            this.svgTitle = this.svgSubtitle = this.svgBullet = null;
        }

        //Properties
        private static getFill(dataView: DataView): Fill {
            if (dataView) {
                var objects = dataView.metadata.objects;
                if (objects) {
                    var general = objects['general'];
                    if (general) {
                        var fill = <Fill>general['fill'];
                        if (fill)
                            return fill;
                    }
                }
            }
            return { solid: { color: 'steelblue' } };
        }

        private static getLabel(dataView: DataView): string {
            if (dataView) {
                var objects = dataView.metadata.objects;
                if (objects) {
                    var label = objects['label'];
                    if (label) {
                        var text = <string>label['text'];
                        if (text)
                            return text;
                    }
                }
            }
            return 'Actual';
        }

        private static getLabelShow(dataView: DataView): boolean {
            if (dataView) {
                var objects = dataView.metadata.objects;
                if (objects) {
                    var label = objects['label'];
                    if (label) {
                        return <boolean>label['show'];
                    }
                }
            }
            return true;
        }
    }
}