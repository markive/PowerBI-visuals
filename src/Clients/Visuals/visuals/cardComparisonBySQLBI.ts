/*
 *  Card Comparison By SQLBI
 *  v0.1.0
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

//Remove the first three chars from the line below to make it working with local playground
//-/// <reference path="../_references.ts"/>

module powerbi.visuals {
    import ClassAndSelector = jsCommon.CssConstants.ClassAndSelector;
    
    export interface CardComparisonBySQLBIConstructorOptions {
        displayUnitSystemType?: DisplayUnitSystemType;
        animator?: IGenericAnimator;
    }

    export interface CardComparisonBySQLBIDataState {
        dataMax: number;
        image: string;
    }

    export interface CardComparisonBySQLBIFormatSettings {
        labelSettings: VisualDataLabelsSettings;
        dataState1: CardComparisonBySQLBIDataState;
        dataState2: CardComparisonBySQLBIDataState;
        dataState3: CardComparisonBySQLBIDataState;
        dataState4: CardComparisonBySQLBIDataState;
        dataState5: CardComparisonBySQLBIDataState;
    }

    export var cardComparisonBySQLBIProps = {
        labels: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'show' },
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'color' },
            labelPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelPrecision' },
            labelDisplayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelDisplayUnits' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'fontSize' },
        },
        dataStates: {
            dataMax1: <DataViewObjectPropertyIdentifier>{ objectName: 'dataStates', propertyName: 'dataMax1' },
            image1: <DataViewObjectPropertyIdentifier>{ objectName: 'dataStates', propertyName: 'image1' },
            dataMax2: <DataViewObjectPropertyIdentifier>{ objectName: 'dataStates', propertyName: 'dataMax2' },
            image2: <DataViewObjectPropertyIdentifier>{ objectName: 'dataStates', propertyName: 'image2' },
            dataMax3: <DataViewObjectPropertyIdentifier>{ objectName: 'dataStates', propertyName: 'dataMax3' },
            image3: <DataViewObjectPropertyIdentifier>{ objectName: 'dataStates', propertyName: 'image3' },
            dataMax4: <DataViewObjectPropertyIdentifier>{ objectName: 'dataStates', propertyName: 'dataMax4' },
            image4: <DataViewObjectPropertyIdentifier>{ objectName: 'dataStates', propertyName: 'image4' },
            dataMax5: <DataViewObjectPropertyIdentifier>{ objectName: 'dataStates', propertyName: 'dataMax5' },
            image5: <DataViewObjectPropertyIdentifier>{ objectName: 'dataStates', propertyName: 'image5' },
        },
      
    };

    export class CardComparisonBySQLBI extends AnimatedText implements IVisual {
        private static cardClassName: string = 'cardComparison';
        private static Label: ClassAndSelector = {
            class: 'label',
            selector: '.label'
        };
        private static Value: ClassAndSelector = {
            class: 'value',
            selector: '.value'
        };

        private toolTip: D3.Selection;
        private animationOptions: AnimationOptions;
        private displayUnitSystemType: DisplayUnitSystemType;
        private graphicsContext: D3.Selection;
        private labelContext: D3.Selection;
        private element: JQuery;
        private cardFormatSettings: CardComparisonBySQLBIFormatSettings;

        //Capabilities
        public static capabilities: VisualCapabilities = {
            dataRoles: [
                {
                    name: 'Value',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Value'
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
                    displayName: 'Value label',
                    properties: {
                        show: {
                            displayName: 'Show',
                            type: { bool: true }
                        },
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
                            displayName: 'Font size',
                            type: { formatting: { fontSize: true } }
                        },
                    },
                },
                dataStates: {
                    displayName: 'Value images',
                    properties: {
                        dataMax1: {
                            displayName: 'From 0 to',
                            type: { numeric: true }
                        },
                        image1: {
                            displayName: 'Image URL',
                            type: { text: true }
                        },
                        dataMax2: {
                            displayName: 'Up to',
                            type: { numeric: true }
                        },
                        image2: {
                            displayName: 'Image URL',
                            type: { text: true }
                        },
                        dataMax3: {
                            displayName: 'Up to',
                            type: { numeric: true }
                        },
                        image3: {
                            displayName: 'Image URL',
                            type: { text: true }
                        },
                        dataMax4: {
                            displayName: 'Up to',
                            type: { numeric: true }
                        },
                        image4: {
                            displayName: 'Image URL',
                            type: { text: true }
                        },
                        dataMax5: {
                            displayName: 'Up to',
                            type: { numeric: true }
                        },
                        image5: {
                            displayName: 'Image URL',
                            type: { text: true }
                        },
                    },
                },
            },
            dataViewMappings: [{
                conditions: [
                    { 'Value': { max: 1 } }
                ],
                single: { role: "Value" },
                categorical: {
                    values: {
                        select: [
                            { bind: { to: 'Value' } }
                        ]
                    },
                },
            }],
            suppressDefaultTitle: true,
        };

        public constructor(options?: CardComparisonBySQLBIConstructorOptions) {
            super(CardComparisonBySQLBI.cardClassName);
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
            
            svg.attr('class', CardComparisonBySQLBI.cardClassName);
            this.labelContext = svg.append('g');
            this.element = element;
        }

       
        public update(options: VisualUpdateOptions): void {
            this.updateViewport(options.viewport);
	  
            //Default settings for reset to default
            this.cardFormatSettings = this.getDefaultFormatSettings();

            var dataView = options.dataViews[0];
            var value: any;
            var valueCol: any;
            var v: number;

            if (dataView && dataView.categorical && dataView.categorical.values && dataView.metadata && dataView.metadata.columns) {

                if (dataView.metadata) {
                    var objects: DataViewObjects = dataView.metadata.objects;
                    if (objects) {
                        var labelSettings = this.cardFormatSettings.labelSettings;
                        labelSettings.show = DataViewObjects.getValue(objects, cardComparisonBySQLBIProps.labels.show, labelSettings.show);
                        labelSettings.labelColor = DataViewObjects.getFillColor(objects, cardComparisonBySQLBIProps.labels.color, labelSettings.labelColor);
                        labelSettings.precision = DataViewObjects.getValue(objects, cardComparisonBySQLBIProps.labels.labelPrecision, labelSettings.precision);
       
                        // The precision can't go below 0
                        if (labelSettings.precision != null) {
                            labelSettings.precision = (labelSettings.precision >= 0) ? labelSettings.precision : 0;
                        }

                        labelSettings.displayUnits = DataViewObjects.getValue(objects, cardComparisonBySQLBIProps.labels.labelDisplayUnits, labelSettings.displayUnits);

                        labelSettings.fontSize = DataViewObjects.getValue(objects, cardComparisonBySQLBIProps.labels.fontSize, labelSettings.fontSize);


                        var dataState1 = this.cardFormatSettings.dataState1;
                        dataState1.dataMax = DataViewObjects.getValue(objects, cardComparisonBySQLBIProps.dataStates.dataMax1, dataState1.dataMax);
                        dataState1.image = DataViewObjects.getValue(objects, cardComparisonBySQLBIProps.dataStates.image1, dataState1.image);

                        var dataState2 = this.cardFormatSettings.dataState2;
                        dataState2.dataMax = DataViewObjects.getValue(objects, cardComparisonBySQLBIProps.dataStates.dataMax2, dataState2.dataMax);
                        dataState2.image = DataViewObjects.getValue(objects, cardComparisonBySQLBIProps.dataStates.image2, dataState2.image);

                        var dataState3 = this.cardFormatSettings.dataState3;
                        dataState3.dataMax = DataViewObjects.getValue(objects, cardComparisonBySQLBIProps.dataStates.dataMax3, dataState3.dataMax);
                        dataState3.image = DataViewObjects.getValue(objects, cardComparisonBySQLBIProps.dataStates.image3, dataState3.image);

                        var dataState4 = this.cardFormatSettings.dataState4;
                        dataState4.dataMax = DataViewObjects.getValue(objects, cardComparisonBySQLBIProps.dataStates.dataMax4, dataState4.dataMax);
                        dataState4.image = DataViewObjects.getValue(objects, cardComparisonBySQLBIProps.dataStates.image4, dataState4.image);

                        var dataState5 = this.cardFormatSettings.dataState5;
                        dataState5.dataMax = DataViewObjects.getValue(objects, cardComparisonBySQLBIProps.dataStates.dataMax5, dataState5.dataMax);
                        dataState5.image = DataViewObjects.getValue(objects, cardComparisonBySQLBIProps.dataStates.image5, dataState5.image);

                    }

                    var values = dataView.categorical.values;
                    for (var i = 0; i < values.length; i++) {

                        var col = dataView.metadata.columns[i];
                        v = values[i].values[0] || 0;
                        if (col && col.roles) {
                            if (col.roles['Value']) {
                                value = v;
                                valueCol = col;
                            }
                        }
                    }
                }

            }

            var start = this.value;

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

            var fontSize: number = parseInt(jsCommon.PixelConverter.fromPoint(labelSettings.fontSize));

            if (start !== value)
                value = formatter.format(value);

            this.labelContext.selectAll('.unit, .value').remove();

            if (this.cardFormatSettings.labelSettings.show) {
                var valueWidth = TextMeasurementService.measureSvgTextWidth({
                    fontFamily: 'wf_segoe-ui_Semibold', fontSize: fontSize + 'px', text: value
                });
                var translateX = 80 + (valueWidth/2); //this.getTranslateX(this.currentViewport.width);
                var translateY = (this.currentViewport.height - fontSize) / 2;

                

                var valueElement = this.graphicsContext
                    .attr('transform', SVGUtil.translate(translateX, this.getTranslateY(fontSize + translateY)))
                    .selectAll('text')
                    .data([value]);

                valueElement
                    .enter()
                    .append('text')
                    .attr('class', CardComparisonBySQLBI.Value.class);

                valueElement
                    .text((d: any) => d)
                    .style({
                        'font-size': fontSize + 'px',
                        'fill': labelSettings.labelColor,
                        'font-family': 'wf_segoe-ui_Semibold',
                        'text-anchor': this.getTextAnchor()
                    });

                valueElement.call(AxisHelper.LabelLayoutStrategy.clip,
                    this.currentViewport.width,
                    TextMeasurementService.svgEllipsis);

                valueElement.exit().remove();

                var labelElement = this.labelContext
                    .append('text')
                    .classed('unit', true)
                    .attr('transform', 'translate(' + translateX + ',' + translateY + ')')
                    .text('or')
                    .style({
                        'font-size': '11px',
                        'fill': this.cardFormatSettings.labelSettings.labelColor,
                        'text-anchor': this.getTextAnchor()
                    });

                labelElement.call(AxisHelper.LabelLayoutStrategy.clip, this.currentViewport.width, TextMeasurementService.svgEllipsis);
            }


            var src = '';
            if (v < this.cardFormatSettings.dataState1.dataMax) {
                src = this.cardFormatSettings.dataState1.image;
            } else if (v < this.cardFormatSettings.dataState2.dataMax) {
                src = this.cardFormatSettings.dataState2.image;
            } else if (v < this.cardFormatSettings.dataState3.dataMax) {
                src = this.cardFormatSettings.dataState3.image;
            } else if (v < this.cardFormatSettings.dataState4.dataMax) {
                src = this.cardFormatSettings.dataState4.image;
            } else if (v < this.cardFormatSettings.dataState5.dataMax) {
                src = this.cardFormatSettings.dataState5.image;
            }

            if (src !== '') {
                this.element.css('background', 'url(' + src + ') no-repeat 5px center');
                this.element.css('background-size', '70px auto');
            } else {
                this.element.css('background', '');
            }
            
            if (!this.toolTip) this.toolTip = this.graphicsContext.append("svg:title");
            this.toolTip.text(value);

            this.value = value;
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

        private getDefaultFormatSettings(): CardComparisonBySQLBIFormatSettings {
            return {
                
                labelSettings: dataLabelUtils.getDefaultCardLabelSettings('#333333', '#999999', 37),
                dataState1: {
                    dataMax: undefined,
                    image: "",
                },
                dataState2: {
                    dataMax: undefined,
                    image: "",
                },
                dataState3: {
                    dataMax: undefined,
                    image: "",
                },
                dataState4: {
                    dataMax: undefined,
                    image: "",
                },
                dataState5: {
                    dataMax: undefined,
                    image: "",
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
                            show: this.cardFormatSettings.labelSettings.show,
                            color: this.cardFormatSettings.labelSettings.labelColor,
                            labelDisplayUnits: this.cardFormatSettings.labelSettings.displayUnits,
                            labelPrecision: this.cardFormatSettings.labelSettings.precision,
                            fontSize: this.cardFormatSettings.labelSettings.fontSize
                        },
                    }];

                case 'dataStates':
                    return [{
                        objectName: 'dataStates',
                        selector: null,
                        properties: {
                            dataMax1: this.cardFormatSettings.dataState1.dataMax,
                            image1: this.cardFormatSettings.dataState1.image,
                            dataMax2: this.cardFormatSettings.dataState2.dataMax,
                            image2: this.cardFormatSettings.dataState2.image,
                            dataMax3: this.cardFormatSettings.dataState3.dataMax,
                            image3: this.cardFormatSettings.dataState3.image,
                            dataMax4: this.cardFormatSettings.dataState4.dataMax,
                            image4: this.cardFormatSettings.dataState4.image,
                            dataMax5: this.cardFormatSettings.dataState5.dataMax,
                            image5: this.cardFormatSettings.dataState5.image,
                        },
                    }];
            }
        }

    }
}
