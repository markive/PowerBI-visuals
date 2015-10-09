/*
 *  Card With States By SQLBI
 *
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

/// <reference path="../_references.ts"/>

module powerbi.visuals {
    export interface CardWithStatesBySQLBIStyle {
        card: {
            maxFontSize: number;
        };
        label: {
            fontSize: number;
            color: string;
            height: number;
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
    }

    export interface CardWithStatesBySQLBITitle {
        color: string;
        text: string;
        show: boolean;
    }

    export interface CardWithStatesBySQLBIFormatSetting {
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
        },
        labels: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'color' },
            labelPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelPrecision' },
            labelDisplayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelDisplayUnits' },
        },
        dataState1: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState1', propertyName: 'color' },
            dataMin: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState1', propertyName: 'dataMin' },
            dataMax: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState1', propertyName: 'dataMax' },
        },
        dataState2: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState2', propertyName: 'color' },
            dataMin: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState2', propertyName: 'dataMin' },
            dataMax: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState2', propertyName: 'dataMax' },
        },
        dataState3: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState3', propertyName: 'color' },
            dataMin: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState3', propertyName: 'dataMin' },
            dataMax: <DataViewObjectPropertyIdentifier>{ objectName: 'dataState3', propertyName: 'dataMax' },
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
                fontSize: 16,
                color: '#a6a6a6',
                height: 26
            },
            value: {
                fontSize: 37,
                color: '#333333',
                fontFamily: 'wf_segoe-ui_Semibold'
            }
        };

        private toolTip: D3.Selection;
        private animationOptions: AnimationOptions;
        private displayUnitSystemType: DisplayUnitSystemType;
        private graphicsContext: D3.Selection;
        private labelContext: D3.Selection;
        private cardFormatSetting: CardWithStatesBySQLBIFormatSetting;
        private target: number;

        //Capabilities
        public static capabilities: VisualCapabilities = {
            dataRoles: [
                {
                    name: 'Values',
                    kind: VisualDataRoleKind.Measure,
                    displayName: data.createDisplayNameGetter('Role_DisplayName_Value')
                }, {
                    name: 'TargetValue',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'State Value',
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
                    displayName: data.createDisplayNameGetter('Visual_DataPointLabel'),
                    properties: {
                        color: {
                            displayName: 'Base Color',
                            type: { fill: { solid: { color: true } } }
                        },
                        labelDisplayUnits: {
                            displayName: data.createDisplayNameGetter('Visual_DisplayUnits'),
                            type: { formatting: { labelDisplayUnits: true } }
                        },
                        labelPrecision: {
                            displayName: data.createDisplayNameGetter('Visual_Precision'),
                            type: { numeric: true }
                        },
                    },
                },
                dataState1: {
                    displayName: 'State 1',
                    properties: {
                        color: {
                            displayName: data.createDisplayNameGetter('Visual_LabelsFill'),
                            type: { fill: { solid: { color: true } } }
                        },
                        dataMin: {
                            displayName: 'From Value',
                            type: { numeric: true }
                        },
                        dataMax: {
                            displayName: 'To Value',
                            type: { numeric: true }
                        },
                    },
                },
                dataState2: {
                    displayName: 'State 2',
                    properties: {
                        color: {
                            displayName: data.createDisplayNameGetter('Visual_LabelsFill'),
                            type: { fill: { solid: { color: true } } }
                        },
                        dataMin: {
                            displayName: 'From Value',
                            type: { numeric: true }
                        },
                        dataMax: {
                            displayName: 'To Value',
                            type: { numeric: true }
                        },
                    },
                },
                dataState3: {
                    displayName: 'State 3',
                    properties: {
                        color: {
                            displayName: data.createDisplayNameGetter('Visual_LabelsFill'),
                            type: { fill: { solid: { color: true } } }
                        },
                        dataMin: {
                            displayName: 'From Value',
                            type: { numeric: true }
                        },
                        dataMax: {
                            displayName: 'To Value',
                            type: { numeric: true }
                        },
                    },
                },
                cardTitle: {
                    displayName: 'Description Label',
                    properties: {
                        color: {
                            displayName: data.createDisplayNameGetter('Visual_LabelsFill'),
                            type: { fill: { solid: { color: true } } }
                        },
                        text: {
                            displayName: 'Text',
                            type: { text: true }
                        },
                        show: {
                            displayName: data.createDisplayNameGetter('Visual_Show'),
                            type: { bool: true }
                        },
                    },
                }
            },
            dataViewMappings: [{
                conditions: [
                    { 'Values': { max: 1 }, 'TargetValue': { max: 1 } }
                ],
                single: { role: "Values" },
                categorical: {
                    values: {
                        select: [
                            { bind: { to: 'Values' } },
                            { bind: { to: 'TargetValue' } },
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

       
        public onDataChanged(options: VisualDataChangedOptions): void {
      
            //Default settings for reset to default
            this.cardFormatSetting = this.getDefaultFormatSettings();

            var dataView = options.dataViews[0];
            var value: any;
            if (dataView && dataView.categorical && dataView.categorical.values && dataView.metadata && dataView.metadata.columns) {
                var values = dataView.categorical.values;
                var metadataColumns = dataView.metadata.columns;
                for (var i = 0; i < values.length; i++) {

                    var col = metadataColumns[i];
                    var v = values[i].values[0] || 0;
                    if (col && col.roles) {
                        if (col.roles['Values'] || col.roles['Y']) {
                            value = v;
                            this.metaDataColumn = col;
                        } else if (col.roles['TargetValue']) {
                            this.target = v;             
                        }
                    }
                }

                if (dataView.metadata) {
                    var objects: DataViewObjects = dataView.metadata.objects;
                    if (objects) {
                        var labelSettings = this.cardFormatSetting.labelSettings;

                        labelSettings.labelColor = DataViewObjects.getFillColor(dataView.metadata.objects, cardWithStatesBySQLBIProps.labels.color, labelSettings.labelColor);
                        labelSettings.precision = DataViewObjects.getValue(dataView.metadata.objects, cardWithStatesBySQLBIProps.labels.labelPrecision, labelSettings.precision);

                        // The precision can't go below 0
                        if (labelSettings.precision != null) {
                            labelSettings.precision = (labelSettings.precision >= 0) ? labelSettings.precision : 0;
                        }

                        labelSettings.displayUnits = DataViewObjects.getValue(dataView.metadata.objects, cardWithStatesBySQLBIProps.labels.labelDisplayUnits, labelSettings.displayUnits);

                        var titleSettings = this.cardFormatSetting.titleSettings;
                        titleSettings.show = DataViewObjects.getValue(dataView.metadata.objects, cardWithStatesBySQLBIProps.cardTitle.show, titleSettings.show);
                        titleSettings.color = DataViewObjects.getFillColor(dataView.metadata.objects, cardWithStatesBySQLBIProps.cardTitle.color, titleSettings.color);
                        titleSettings.text = DataViewObjects.getValue(dataView.metadata.objects, cardWithStatesBySQLBIProps.cardTitle.text, titleSettings.text);

                        var dataState1 = this.cardFormatSetting.dataState1;
                        dataState1.color = DataViewObjects.getFillColor(dataView.metadata.objects, cardWithStatesBySQLBIProps.dataState1.color, dataState1.color);
                        dataState1.dataMin = DataViewObjects.getValue(dataView.metadata.objects, cardWithStatesBySQLBIProps.dataState1.dataMin, dataState1.dataMin);
                        dataState1.dataMax = DataViewObjects.getValue(dataView.metadata.objects, cardWithStatesBySQLBIProps.dataState1.dataMax, dataState1.dataMax);

                        var dataState2 = this.cardFormatSetting.dataState2;
                        dataState2.color = DataViewObjects.getFillColor(dataView.metadata.objects, cardWithStatesBySQLBIProps.dataState2.color, dataState2.color);
                        dataState2.dataMin = DataViewObjects.getValue(dataView.metadata.objects, cardWithStatesBySQLBIProps.dataState2.dataMin, dataState2.dataMin);
                        dataState2.dataMax = DataViewObjects.getValue(dataView.metadata.objects, cardWithStatesBySQLBIProps.dataState2.dataMax, dataState2.dataMax);

                        var dataState3 = this.cardFormatSetting.dataState3;
                        dataState3.color = DataViewObjects.getFillColor(dataView.metadata.objects, cardWithStatesBySQLBIProps.dataState3.color, dataState3.color);
                        dataState3.dataMin = DataViewObjects.getValue(dataView.metadata.objects, cardWithStatesBySQLBIProps.dataState3.dataMin, dataState3.dataMin);
                        dataState3.dataMax = DataViewObjects.getValue(dataView.metadata.objects, cardWithStatesBySQLBIProps.dataState3.dataMax, dataState3.dataMax);
                    }
                }

            }

            this.updateInternal(value, true /* suppressAnimations */, true /* forceUpdate */);
        }

        public onResizing(viewport: IViewport): void {
            this.currentViewport = viewport;
            this.updateViewportProperties();
            this.updateInternal(this.value, true /* suppressAnimations */, true /* forceUpdate */);
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

            if (!valueOnly)
                this.svg.select(CardWithStatesBySQLBI.Label.selector).text('');

            super.clear();
        }

        private updateInternal(passedValue: any, suppressAnimations: boolean, forceUpdate: boolean = false) {
            var start = this.value;
   
            if (passedValue === undefined) {
                if (start !== undefined)
                    this.clear();
                return;
            }

            var metaDataColumn = this.metaDataColumn;
            var labelSettings = this.cardFormatSetting.labelSettings;
            var isDefaultDisplayUnit = labelSettings.displayUnits === 0;
            var formatter = valueFormatter.create({
                format: this.getFormatString(metaDataColumn),
                value: isDefaultDisplayUnit ? passedValue : labelSettings.displayUnits,
                precision: labelSettings.precision,
                displayUnitSystemType: isDefaultDisplayUnit && labelSettings.precision === 0 ? this.displayUnitSystemType : DisplayUnitSystemType.WholeUnits, // keeps this.displayUnitSystemType as the displayUnitSystemType unless the user changed the displayUnits or the precision
                formatSingleValues: isDefaultDisplayUnit ? true : false,
                allowFormatBeautification: true,
                columnType: metaDataColumn ? metaDataColumn.type : undefined 
            });
            ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Decimal);

            if (!forceUpdate && start === passedValue)
                return;

            var label: string;
            var labelStyles = CardWithStatesBySQLBI.DefaultStyle.label;
            var valueStyles = CardWithStatesBySQLBI.DefaultStyle.value;
            var titleSettings = this.cardFormatSetting.titleSettings;

            if (start !== passedValue) {
                passedValue = formatter.format(passedValue);
            }

            var valueColor = labelSettings.labelColor;
            if (this.target <= this.cardFormatSetting.dataState1.dataMax && this.target >= this.cardFormatSetting.dataState1.dataMin) {
                valueColor = this.cardFormatSetting.dataState1.color;
            } else if (this.target <= this.cardFormatSetting.dataState2.dataMax && this.target >= this.cardFormatSetting.dataState2.dataMin) {
                valueColor = this.cardFormatSetting.dataState2.color;
            } else if (this.target <= this.cardFormatSetting.dataState3.dataMax && this.target >= this.cardFormatSetting.dataState3.dataMin) {
                valueColor = this.cardFormatSetting.dataState3.color;
            }

            if (titleSettings.text !== '')
                label = titleSettings.text;
            else if (metaDataColumn)
                label = metaDataColumn.displayName;

            var translateX = this.getTranslateX(this.currentViewport.width);
            var translateY = (this.currentViewport.height - labelStyles.height - valueStyles.fontSize) / 2;

            var valueElement = this.graphicsContext
                .attr('transform', SVGUtil.translate(translateX, this.getTranslateY(valueStyles.fontSize + translateY)))
                .selectAll('text')
                .data([passedValue]);

            valueElement
                .enter()
                .append('text')
                .attr('class', CardWithStatesBySQLBI.Value.class);

            valueElement
                .text((d: any) => d)
                .style({
                    'font-size': valueStyles.fontSize + 'px',
                    'fill': valueColor,
                    'font-family': valueStyles.fontFamily,
                    'text-anchor': this.getTextAnchor()
                });

            valueElement.call(AxisHelper.LabelLayoutStrategy.clip,
                this.currentViewport.width,
                TextMeasurementService.svgEllipsis);

            valueElement.exit().remove();

            var labelData = titleSettings.show
                ? [label]
                : [];

            var labelElement = this.labelContext
                .attr('transform', SVGUtil.translate(translateX, this.getTranslateY(valueStyles.fontSize + labelStyles.height + translateY)))
                .selectAll('text')
                .data(labelData);

            labelElement
                .enter()
                .append('text')
                .attr('class', CardWithStatesBySQLBI.Label.class);

            labelElement
                .text((d: string) => d)
                .style({
                    'font-size': labelStyles.fontSize + 'px',
                    'fill': titleSettings.color,
                    'text-anchor': this.getTextAnchor()
                });

            labelElement.call(AxisHelper.LabelLayoutStrategy.clip,
                this.currentViewport.width,
                TextMeasurementService.svgEllipsis);

            labelElement.exit().remove();
 
            this.updateTooltip(passedValue);
            this.value = passedValue;
        }

        private updateTooltip(passedValue: number) {
            if (!this.toolTip)
                this.toolTip = this.graphicsContext.append("svg:title");
            this.toolTip.text(passedValue);
        }

        private getDefaultFormatSettings(): CardWithStatesBySQLBIFormatSetting {
            return {
                titleSettings: {
                    show: true,
                    color: CardWithStatesBySQLBI.DefaultStyle.label.color,
                    text: ''
                },
                labelSettings: dataLabelUtils.getDefaultLabelSettings(true, CardWithStatesBySQLBI.DefaultStyle.value.color, 0),
                dataState1: {
                    color: '#FD625E', //Red
                    dataMin: -Infinity,
                    dataMax: 0
                },
                dataState2: {
                    color: '#F2C811', //Yellow
                    dataMin: 0,
                    dataMax: 1
                },
                dataState3: {
                    color: '#7DC172', //Green
                    dataMin: 1,
                    dataMax: Infinity
                },
            };
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
            if (!this.cardFormatSetting)
                this.cardFormatSetting = this.getDefaultFormatSettings();

            var formatSettings = this.cardFormatSetting;

            switch (options.objectName) {
                case 'cardTitle':
                    return [{
                        objectName: 'cardTitle',
                        selector: null,
                        properties: {
                            show: formatSettings.titleSettings.show,
                            text: formatSettings.titleSettings.text,
                            color: formatSettings.titleSettings.color
                        },
                    }];
                //case 'labels':
                //    return dataLabelUtils.enumerateDataLabels(formatSettings.labelSettings, /*withPosition:*/ false, /*withPrecision:*/ true, /*withDisplayUnit:*/ true);
                case 'dataState1':
                    return [{
                        objectName: 'dataState1',
                        selector: null,
                        properties: {
                            dataMin: formatSettings.dataState1.dataMin,
                            dataMax: formatSettings.dataState1.dataMax,
                            color: formatSettings.dataState1.color,
                        },
                    }];
                case 'dataState2':
                    return [{
                        objectName: 'dataState2',
                        selector: null,
                        properties: {
                            dataMin: formatSettings.dataState2.dataMin,
                            dataMax: formatSettings.dataState2.dataMax,
                            color: formatSettings.dataState2.color,
                        },
                    }];
                case 'dataState3':
                    return [{
                        objectName: 'dataState3',
                        selector: null,
                        properties: {
                            dataMin: formatSettings.dataState3.dataMin,
                            dataMax: formatSettings.dataState3.dataMax,
                            color: formatSettings.dataState3.color,
                        },
                    }];
            }
        }

    }
}