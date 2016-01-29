/*
 *  Card With States By SQLBI
 *  v1.2.0
 *  Based on the Power BI builtin Card, this visual allows you to bind a performance measure and define up to 3 states that determine the color of the data label. Moreover, the category label is fully customizable (text size and word wrap included) and you can display an additional performance label. 
 * 
 *  Contact info@sqlbi.com
 *  Support URL http://www.sqlbi.com/
 *  Github URL https://github.com/danieleperilli/PowerBI-visuals/blob/master/src/Clients/Visuals/visuals/cardWithStatesBySQLBI.ts
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

//Remove the first three chars from the line below to make it working with local playground
//-/// <reference path="../_references.ts"/>

module powerbi.visuals {
    import ClassAndSelector = jsCommon.CssConstants.ClassAndSelector;
    
    export interface CardWithStatesBySQLBIStyle {
        card: {
            maxFontSize: number;
        };
        label: {
            fontSize: number;
            color: string;
        };
        value: {
            fontSize: number;
            color: string;
            fontFamily: string;
        };
    }

    export interface CardWithStatesBySQLBIConstructorOptions {
        displayUnitSystemType?: DisplayUnitSystemType;
        animator?: IGenericAnimator;
    }

    export interface CardWithStatesBySQLBIDataState {
        color: string;
        dataMin: number;
        dataMax: number;
        showLabel: boolean;
        label: string;
        inBinding: boolean;
    }

    export interface CardWithStatesBySQLBITitle {
        color: string;
        text?: string;
        show: boolean;
        fontSize?: number;
        wordWrap?: boolean;
        topMargin?: number;
    }

    export interface CardWithStatesBySQLBIFormatSettings {
        labelSettings: VisualDataLabelsSettings;
        titleSettings: CardWithStatesBySQLBITitle;
        dataState1: CardWithStatesBySQLBIDataState;
        dataState2: CardWithStatesBySQLBIDataState;
        dataState3: CardWithStatesBySQLBIDataState;
    }

    export var cardWithStatesBySQLBIProps = {
        cardTitle: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'cardTitle', propertyName: 'show' },
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'cardTitle', propertyName: 'color' },
            text: <DataViewObjectPropertyIdentifier>{ objectName: 'cardTitle', propertyName: 'text' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'cardTitle', propertyName: 'fontSize' },
            wordWrap: <DataViewObjectPropertyIdentifier>{ objectName: 'cardTitle', propertyName: 'wordWrap' },
            topMargin: <DataViewObjectPropertyIdentifier>{ objectName: 'cardTitle', propertyName: 'topMargin' },
        },
        labels: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'color' },
            labelPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelPrecision' },
            labelDisplayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelDisplayUnits' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'fontSize' },
        },
        dataState1: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState1', propertyName: 'color' },
            dataMin: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState1', propertyName: 'dataMin' },
            dataMax: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState1', propertyName: 'dataMax' },
            showLabel: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState1', propertyName: 'showLabel' },
            label: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState1', propertyName: 'label' },
        },
        dataState2: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState2', propertyName: 'color' },
            dataMin: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState2', propertyName: 'dataMin' },
            dataMax: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState2', propertyName: 'dataMax' },
            showLabel: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState2', propertyName: 'showLabel' },
            label: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState2', propertyName: 'label' },
        },
        dataState3: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState3', propertyName: 'color' },
            dataMin: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState3', propertyName: 'dataMin' },
            dataMax: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState3', propertyName: 'dataMax' },
            showLabel: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState3', propertyName: 'showLabel' },
            label: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState3', propertyName: 'label' },
        }
    };

    export class CardWithStatesBySQLBI extends AnimatedText implements IVisual {
        private static cardClassName: string = 'cardWithStates';
        private static Label: ClassAndSelector = {
            class: 'label',
            selector: '.label'
        };
        private static Value: ClassAndSelector = {
            class: 'value',
            selector: '.value'
        };
        public static DefaultStyle: CardWithStatesBySQLBIStyle = {
            card: {
                maxFontSize: 200
            },
            label: {
                fontSize: 12,
                color: '#a6a6a6',
                height: 26
            },
            value: {
                fontSize: 27,
                color: '#333333',
                fontFamily: 'wf_segoe-ui_Semibold'
            }
        };

        private toolTip: D3.Selection;
        private animationOptions: AnimationOptions;
        private displayUnitSystemType: DisplayUnitSystemType;
        private graphicsContext: D3.Selection;
        private labelContext: D3.Selection;
        private cardFormatSettings: CardWithStatesBySQLBIFormatSettings;
        private target: number;

        //Capabilities
        public static capabilities: VisualCapabilities = {
            dataRoles: [
                {
                    name: 'Values',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Value'
                }, {
                    name: 'TargetValue',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'State Value',
                }, {
                    name: 'State1Min',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'State 1 Min',
                }, {
                    name: 'State1Max',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'State 1 Max',
                }, {
                    name: 'State2Min',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'State 2 Min',
                }, {
                    name: 'State2Max',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'State 2 Max',
                }, {
                    name: 'State3Min',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'State 3 Min',
                }, {
                    name: 'State3Max',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'State 3 Max',
                }
            ],
            objects: {
                general: {
                    properties: {
                        formatString: {
                            type: { formatting: { formatString: true } },
                        },
                    },
                },
                labels: {
                    displayName: 'Data label',
                    properties: {
                        color: {
                            displayName: 'Color',
                            type: { fill: { solid: { color: true } } }
                        },
                        labelDisplayUnits: {
                            displayName: 'Display units',
                            type: { formatting: { labelDisplayUnits: true } }
                        },
                        labelPrecision: {
                            displayName: 'Decimal points',
                            type: { numeric: true }
                        },
                        fontSize: {
                            displayName: 'Text size',
                            type: { formatting: { fontSize: true } }
                        },

                    },
                },
                dataState1: {
                    displayName: 'State 1',
                    properties: {
                        color: {
                            displayName: 'Color',
                            type: { fill: { solid: { color: true } } }
                        },
                        dataMin: {
                            displayName: 'From value',
                            type: { numeric: true }
                        },
                        dataMax: {
                            displayName: 'To value',
                            type: { numeric: true }
                        },
                        showLabel: {
                            displayName: 'Label',
                            type: { bool: true }
                        },
                        label: {
                            displayName: 'Label text',
                            type: { text: true }
                        },
                    },
                },
                dataState2: {
                    displayName: 'State 2',
                    properties: {
                        color: {
                            displayName: 'Color',
                            type: { fill: { solid: { color: true } } }
                        },
                        dataMin: {
                            displayName: 'From value',
                            type: { numeric: true }
                        },
                        dataMax: {
                            displayName: 'To value',
                            type: { numeric: true }
                        },
                        showLabel: {
                            displayName: 'Label',
                            type: { bool: true }
                        },
                        label: {
                            displayName: 'Label text',
                            type: { text: true }
                        },
                    },
                },
                dataState3: {
                    displayName: 'State 3',
                    properties: {
                        color: {
                            displayName: 'Color',
                            type: { fill: { solid: { color: true } } }
                        },
                        dataMin: {
                            displayName: 'From value',
                            type: { numeric: true }
                        },
                        dataMax: {
                            displayName: 'To value',
                            type: { numeric: true }
                        },
                        showLabel: {
                            displayName: 'Label',
                            type: { bool: true }
                        },
                        label: {
                            displayName: 'Label text',
                            type: { text: true }
                        },
                    },
                },
                cardTitle: {
                    displayName: 'Category label',
                    properties: {
                        color: {
                            displayName: 'Color',
                            type: { fill: { solid: { color: true } } }
                        },
                        text: {
                            displayName: 'Text', 
                            type: { text: true }
                        },
                        show: {
                            displayName: 'Show',
                            type: { bool: true }
                        },
                        wordWrap: {
                            displayName: 'Word wrap',
                            type: { bool: true }
                        },
                        fontSize: {
                            displayName: 'Text size',
                            type: { formatting: { fontSize: true } }
                        },
                        topMargin: {
                            displayName: 'Margin top',
                            type: { numeric: true }
                        },
                    },
                }
            },
            dataViewMappings: [{
                conditions: [
                    { 'Values': { max: 1 }, 'TargetValue': { max: 1 }, 'State1Min': { max: 1 }, 'State1Max': { max: 1 }, 'State2Min': { max: 1 }, 'State2Max': { max: 1 }, 'State3Min': { max: 1 }, 'State3Max': { max: 1 } }
                ],
                single: { role: "Values" },
                categorical: {
                    values: {
                        select: [
                            { bind: { to: 'Values' } },
                            { bind: { to: 'TargetValue' } },
                            { bind: { to: 'State1Min' } },
                            { bind: { to: 'State1Max' } },
                            { bind: { to: 'State2Min' } },
                            { bind: { to: 'State2Max' } },
                            { bind: { to: 'State3Min' } },
                            { bind: { to: 'State3Max' } },
                        ]
                    },
                },
            }],
            suppressDefaultTitle: true,
        };

        public constructor(options?: CardWithStatesBySQLBIConstructorOptions) {
            super(CardWithStatesBySQLBI.cardClassName);
            this.displayUnitSystemType = DisplayUnitSystemType.WholeUnits;

            if (options) {
                if (options.animator)
                    this.animator = options.animator;
                if (options.displayUnitSystemType != null)
                    this.displayUnitSystemType = options.displayUnitSystemType;
            }
        }

        public init(options: VisualInitOptions) {
            this.animationOptions = options.animation;
            var element = options.element;

            var svg = this.svg = d3.select(element.get(0)).append('svg');
            this.graphicsContext = svg.append('g');
            this.currentViewport = options.viewport;
            this.hostServices = options.host;
            this.style = options.style;

            this.updateViewportProperties();
            
            svg.attr('class', CardWithStatesBySQLBI.cardClassName);
            this.labelContext = svg.append('g');
        }

       
        public update(options: VisualUpdateOptions): void {
			this.updateViewport(options.viewport);
	  
            //Default settings for reset to default
            this.cardFormatSettings = this.getDefaultFormatSettings();

            var dataView = options.dataViews[0];
            var value: any;
            var target: any;
            var valueCol;
            
            if (dataView && dataView.categorical && dataView.categorical.values && dataView.metadata && dataView.metadata.columns) {

                if (dataView.metadata) {
                    var objects: DataViewObjects = dataView.metadata.objects;
                    if (objects) {
                        var labelSettings = this.cardFormatSettings.labelSettings;

                        labelSettings.labelColor = DataViewObjects.getFillColor(objects, cardWithStatesBySQLBIProps.labels.color, labelSettings.labelColor);
                        labelSettings.precision = DataViewObjects.getValue(objects, cardWithStatesBySQLBIProps.labels.labelPrecision, labelSettings.precision);

                        // The precision can't go below 0
                        if (labelSettings.precision != null) {
                            labelSettings.precision = (labelSettings.precision >= 0) ? labelSettings.precision : 0;
                        }

                        labelSettings.displayUnits = DataViewObjects.getValue(objects, cardWithStatesBySQLBIProps.labels.labelDisplayUnits, labelSettings.displayUnits);

                        labelSettings.fontSize = DataViewObjects.getValue(objects, cardWithStatesBySQLBIProps.labels.fontSize, labelSettings.fontSize);

                        var titleSettings = this.cardFormatSettings.titleSettings;
                        titleSettings.show = DataViewObjects.getValue(objects, cardWithStatesBySQLBIProps.cardTitle.show, titleSettings.show);
                        titleSettings.color = DataViewObjects.getFillColor(objects, cardWithStatesBySQLBIProps.cardTitle.color, titleSettings.color);
                        titleSettings.text = DataViewObjects.getValue(objects, cardWithStatesBySQLBIProps.cardTitle.text, titleSettings.text);
                        titleSettings.fontSize = DataViewObjects.getValue(objects, cardWithStatesBySQLBIProps.cardTitle.fontSize, titleSettings.fontSize);
                        titleSettings.wordWrap = DataViewObjects.getValue(objects, cardWithStatesBySQLBIProps.cardTitle.wordWrap, titleSettings.wordWrap);
                        titleSettings.topMargin = DataViewObjects.getValue(objects, cardWithStatesBySQLBIProps.cardTitle.topMargin, titleSettings.topMargin);

                        var dataState1 = this.cardFormatSettings.dataState1;
                        dataState1.color = DataViewObjects.getFillColor(objects, cardWithStatesBySQLBIProps.dataState1.color, dataState1.color);
                        dataState1.dataMin = DataViewObjects.getValue(objects, cardWithStatesBySQLBIProps.dataState1.dataMin, dataState1.dataMin);
                        dataState1.dataMax = DataViewObjects.getValue(objects, cardWithStatesBySQLBIProps.dataState1.dataMax, dataState1.dataMax);
                        dataState1.label = DataViewObjects.getValue(objects, cardWithStatesBySQLBIProps.dataState1.label, dataState1.label);
                        dataState1.showLabel = DataViewObjects.getValue(objects, cardWithStatesBySQLBIProps.dataState1.showLabel, dataState1.showLabel);

                        var dataState2 = this.cardFormatSettings.dataState2;
                        dataState2.color = DataViewObjects.getFillColor(objects, cardWithStatesBySQLBIProps.dataState2.color, dataState2.color);
                        dataState2.dataMin = DataViewObjects.getValue(objects, cardWithStatesBySQLBIProps.dataState2.dataMin, dataState2.dataMin);
                        dataState2.dataMax = DataViewObjects.getValue(objects, cardWithStatesBySQLBIProps.dataState2.dataMax, dataState2.dataMax);
                        dataState2.label = DataViewObjects.getValue(objects, cardWithStatesBySQLBIProps.dataState2.label, dataState2.label);
                        dataState2.showLabel = DataViewObjects.getValue(objects, cardWithStatesBySQLBIProps.dataState2.showLabel, dataState2.showLabel);

                        var dataState3 = this.cardFormatSettings.dataState3;
                        dataState3.color = DataViewObjects.getFillColor(objects, cardWithStatesBySQLBIProps.dataState3.color, dataState3.color);
                        dataState3.dataMin = DataViewObjects.getValue(objects, cardWithStatesBySQLBIProps.dataState3.dataMin, dataState3.dataMin);
                        dataState3.dataMax = DataViewObjects.getValue(objects, cardWithStatesBySQLBIProps.dataState3.dataMax, dataState3.dataMax);
                        dataState3.label = DataViewObjects.getValue(objects, cardWithStatesBySQLBIProps.dataState3.label, dataState3.label);
                        dataState3.showLabel = DataViewObjects.getValue(objects, cardWithStatesBySQLBIProps.dataState3.showLabel, dataState3.showLabel);
                    }

                    var values = dataView.categorical.values;
                    for (var i = 0; i < values.length; i++) {

                        var col = dataView.metadata.columns[i];
                        var v = values[i].values[0] || 0;
                        if (col && col.roles) {
                            if (col.roles['Values']) {
                                value = v;
                                valueCol = col;
                                if (typeof(this.cardFormatSettings.titleSettings.text) === 'undefined')
                                    this.cardFormatSettings.titleSettings.text = col.displayName;
                            }

                            if (col.roles['TargetValue']) {
                                target = v;
                            }
                            if (col.roles['State1Min']) {
                                this.cardFormatSettings.dataState1.dataMin = v;
                                this.cardFormatSettings.dataState1.inBinding = true;
                            }
                            if (col.roles['State1Max']) {
                                this.cardFormatSettings.dataState1.dataMax = v;
                                this.cardFormatSettings.dataState1.inBinding = true;
                            }
                            if (col.roles['State2Min']) {
                                this.cardFormatSettings.dataState2.dataMin = v;
                                this.cardFormatSettings.dataState2.inBinding = true;
                            }
                            if (col.roles['State2Max']) {
                                this.cardFormatSettings.dataState2.dataMax = v;
                                this.cardFormatSettings.dataState2.inBinding = true;
                            }
                            if (col.roles['State3Min']) {
                                this.cardFormatSettings.dataState3.dataMin = v;
                                this.cardFormatSettings.dataState3.inBinding = true;
                            }
                            if (col.roles['State3Max']) {
                                this.cardFormatSettings.dataState3.dataMax = v;
                                this.cardFormatSettings.dataState3.inBinding = true;
                            }
                        }
                    }
                }
            }

            var start = this.value;
            if (value === undefined) {
                if (start !== undefined)
                    this.clear();
                return;
            }

            var labelSettings = this.cardFormatSettings.labelSettings;
            var isDefaultDisplayUnit = (labelSettings.displayUnits === 0);
            var formatter = valueFormatter.create({
                format: this.getFormatString(valueCol),
                value: isDefaultDisplayUnit ? value : labelSettings.displayUnits,
                precision: labelSettings.precision,
                displayUnitSystemType: isDefaultDisplayUnit && labelSettings.precision === 0 ? this.displayUnitSystemType : DisplayUnitSystemType.WholeUnits, 
                formatSingleValues: isDefaultDisplayUnit ? true : false,
                allowFormatBeautification: true,
                columnType: valueCol ? valueCol.type : undefined
            });
            ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Decimal);

            var labelStyles = CardWithStatesBySQLBI.DefaultStyle.label;
            var labelFontSize = parseInt(jsCommon.PixelConverter.fromPoint(this.cardFormatSettings.titleSettings.fontSize));
            var valueStyles = CardWithStatesBySQLBI.DefaultStyle.value;
            var valueFontSize = parseInt(jsCommon.PixelConverter.fromPoint(labelSettings.fontSize));

            if (start !== value)
                value = formatter.format(value);

            var performanceLabel = '';

            var valueColor = labelSettings.labelColor;
            if (target <= this.cardFormatSettings.dataState1.dataMax && target >= this.cardFormatSettings.dataState1.dataMin) {
                valueColor = this.cardFormatSettings.dataState1.color;
                if (this.cardFormatSettings.dataState1.showLabel)
                    performanceLabel = this.cardFormatSettings.dataState1.label;

            } else if (target <= this.cardFormatSettings.dataState2.dataMax && target >= this.cardFormatSettings.dataState2.dataMin) {
                valueColor = this.cardFormatSettings.dataState2.color;
                if (this.cardFormatSettings.dataState2.showLabel)
                    performanceLabel = this.cardFormatSettings.dataState2.label;

            } else if (target <= this.cardFormatSettings.dataState3.dataMax && target >= this.cardFormatSettings.dataState3.dataMin) {
                valueColor = this.cardFormatSettings.dataState3.color;
                if (this.cardFormatSettings.dataState3.showLabel)
                    performanceLabel = this.cardFormatSettings.dataState3.label;
            }

            var translateX = this.getTranslateX(this.currentViewport.width);
            var translateY = (this.currentViewport.height - labelFontSize - valueFontSize) / 2;

            var valueElement = this.graphicsContext
                .attr('transform', SVGUtil.translate(translateX, this.getTranslateY(valueFontSize + translateY)))
                .selectAll('text')
                .data([value]);

            valueElement
                .enter()
                .append('text')
                .attr('class', CardWithStatesBySQLBI.Value.class);

            valueElement
                .text((d: any) => d)
                .style({
                    'font-size': valueFontSize + 'px',
                    'fill': valueColor,
                    'font-family': valueStyles.fontFamily,
                    'text-anchor': this.getTextAnchor()
                });

            valueElement.call(AxisHelper.LabelLayoutStrategy.clip,
                this.currentViewport.width,
                TextMeasurementService.svgEllipsis);

            valueElement.exit().remove();

            translateY = this.getTranslateY(valueFontSize + labelFontSize + translateY + this.cardFormatSettings.titleSettings.topMargin);

            this.labelContext.selectAll('.unit').remove();
            if (this.cardFormatSettings.titleSettings.show) {

                var labelElement = this.labelContext
                    .append('text')
                    .classed('unit', true)
                    .attr('transform', 'translate(' + translateX + ',' + translateY + ')')
                    .text(this.cardFormatSettings.titleSettings.text)
                    .style({
                        'font-size': labelFontSize + 'px',
                        'fill': this.cardFormatSettings.titleSettings.color,
                        'text-anchor': this.getTextAnchor()
                    });

                if (this.cardFormatSettings.titleSettings.wordWrap) {
                    var labelElementNode = <SVGTextElement>labelElement.node();
                    TextMeasurementService.wordBreak(labelElementNode, this.currentViewport.width, this.currentViewport.height - translateY);

                    translateY += (labelElementNode.childNodes.length * (labelFontSize + 2)) + 10;

                } else {
                    labelElement.call(AxisHelper.LabelLayoutStrategy.clip, this.currentViewport.width, TextMeasurementService.svgEllipsis);

                    translateY += labelFontSize + 10;
                }
            }

            this.labelContext.selectAll('.perf').remove();
            this.labelContext.selectAll('circle').remove();
            if (performanceLabel !== '') {

                var radius = 2;
                var margin = 10;
                translateX += (radius + (margin / 2));

                var performanceStatus = performanceLabel.toUpperCase();

                var performanceElement = this.labelContext
                    .append('text')
                    .classed('perf', true)
                    .attr('transform', 'translate(' + translateX + ',' + translateY + ')')
                    .text(performanceStatus)
                    .style({
                        'font-size': (labelFontSize - 4) + 'px',
                        'fill': '#a6a6a6',
                        'text-anchor': this.getTextAnchor()
                    });

                performanceElement.call(AxisHelper.LabelLayoutStrategy.clip, this.currentViewport.width, TextMeasurementService.svgEllipsis);

                
                var labelWidth = TextMeasurementService.measureSvgTextWidth({
                    fontFamily: valueStyles.fontFamily, fontSize: (labelFontSize - 4) + 'px', text: performanceStatus
                 });

                this.labelContext
                    .append('circle')
                    .attr('cx', translateX - (labelWidth / 2) - margin)
                    .attr('cy', translateY - radius - 2)
                    .attr('r', radius * 2)
                    .attr('fill', valueColor);
            }

            if (!this.toolTip) this.toolTip = this.graphicsContext.append("svg:title");
            this.toolTip.text(value);

            this.value = value;
            this.target = target;
        }

        public updateViewport(viewport: IViewport): void {
            this.currentViewport = viewport;
            this.updateViewportProperties();
        }

        private updateViewportProperties() {
            var viewport = this.currentViewport;
            this.svg.attr('width', viewport.width)
                .attr('height', viewport.height);
        }

        public getAdjustedFontHeight(availableWidth: number, textToMeasure: string, seedFontHeight: number) {
            var adjustedFontHeight = super.getAdjustedFontHeight(availableWidth, textToMeasure, seedFontHeight);

            return Math.min(adjustedFontHeight, CardWithStatesBySQLBI.DefaultStyle.card.maxFontSize);
        }

        public clear(valueOnly: boolean = false) {
            this.svg.select(CardWithStatesBySQLBI.Value.selector).text('');
            this.labelContext.selectAll('.perf').remove();
            this.labelContext.selectAll('circle').remove();

            if (!valueOnly)
                this.svg.select(CardWithStatesBySQLBI.Label.selector).text('');

            super.clear();
        }

        private getDefaultFormatSettings(): CardWithStatesBySQLBIFormatSettings {
            return {
                titleSettings: {
                    show: true,
                    color: CardWithStatesBySQLBI.DefaultStyle.label.color,
                    text: undefined,
                    fontSize: CardWithStatesBySQLBI.DefaultStyle.label.fontSize,
                    wordWrap: false,
                    topMargin: 0
                },
                labelSettings: dataLabelUtils.getDefaultCardLabelSettings(CardWithStatesBySQLBI.DefaultStyle.value.color, CardWithStatesBySQLBI.DefaultStyle.label.color, CardWithStatesBySQLBI.DefaultStyle.value.fontSize),
                dataState1: {
                    color: '#FD625E', //Red
                    dataMin: -Infinity,
                    dataMax: 0,
                    showLabel: false,
                    label: 'Fail',
                    inBinding: false
                },
                dataState2: {
                    color: '#F2C811', //Yellow
                    dataMin: 0,
                    dataMax: 1,
                    showLabel: false,
                    label: 'Moderate',
                    inBinding: false
                },
                dataState3: {
                    color: '#7DC172', //Green
                    dataMin: 1,
                    dataMax: Infinity,
                    showLabel: false,
                    label: 'Great',
                    inBinding: false
                },
            };
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
            if (!this.cardFormatSettings)
                this.cardFormatSettings = this.getDefaultFormatSettings();

            switch (options.objectName) {
                case 'labels':
                    return [{
                        objectName: 'labels',
                        selector: null,
                        properties: {
                            color: this.cardFormatSettings.labelSettings.labelColor,
                            labelDisplayUnits: this.cardFormatSettings.labelSettings.displayUnits,
                            labelPrecision: this.cardFormatSettings.labelSettings.precision,
                            fontSize: this.cardFormatSettings.labelSettings.fontSize
                        },
                    }];

                case 'cardTitle':
                    return [{
                        objectName: 'cardTitle',
                        selector: null,
                        properties: {
                            show: this.cardFormatSettings.titleSettings.show,
                            text: this.cardFormatSettings.titleSettings.text,
                            wordWrap: this.cardFormatSettings.titleSettings.wordWrap,
                            color: this.cardFormatSettings.titleSettings.color,
                            fontSize: this.cardFormatSettings.titleSettings.fontSize,
                            topMargin: this.cardFormatSettings.titleSettings.topMargin,
                        },
                    }];
                case 'dataState1':
                    return [{
                        objectName: 'dataState1',
                        selector: null,
                        properties: {
                            dataMin: this.cardFormatSettings.dataState1.dataMin + (this.cardFormatSettings.dataState1.inBinding ? ' (bound)' : ''),
                            dataMax: this.cardFormatSettings.dataState1.dataMax + (this.cardFormatSettings.dataState1.inBinding ? ' (bound)' : ''),
                            color: this.cardFormatSettings.dataState1.color,
                            showLabel: this.cardFormatSettings.dataState1.showLabel,
                            label: this.cardFormatSettings.dataState1.label
                        },
                    }];
                case 'dataState2':
                    return [{
                        objectName: 'dataState2',
                        selector: null,
                        properties: {
                            dataMin: this.cardFormatSettings.dataState2.dataMin + (this.cardFormatSettings.dataState2.inBinding ? ' (bound)' : ''),
                            dataMax: this.cardFormatSettings.dataState2.dataMax + (this.cardFormatSettings.dataState2.inBinding ? ' (bound)' : ''),
                            color: this.cardFormatSettings.dataState2.color,
                            showLabel: this.cardFormatSettings.dataState2.showLabel,
                            label: this.cardFormatSettings.dataState2.label
                        },
                    }];
                case 'dataState3':
                    return [{
                        objectName: 'dataState3',
                        selector: null,
                        properties: {
                            dataMin: this.cardFormatSettings.dataState3.dataMin + (this.cardFormatSettings.dataState3.inBinding ? ' (bound)' : ''),
                            dataMax: this.cardFormatSettings.dataState3.dataMax + (this.cardFormatSettings.dataState3.inBinding ? ' (bound)' : ''),
                            color: this.cardFormatSettings.dataState3.color,
                            showLabel: this.cardFormatSettings.dataState3.showLabel,
                            label: this.cardFormatSettings.dataState3.label
                        },
                    }];
            }
        }

    }
}
