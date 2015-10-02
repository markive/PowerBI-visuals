/*
 *  Synoptic Panel by SQLBI
 *  Draw custom areas over a bitmap image and get all the necessary coordinates with our free tool at http://synoptic.design
 *
 *  Known issues: 
 *  - Map image and Areas json file are not saved between sessions 
 *  - Sometimes the property panel for the visual is empty. To solve you have to switch visual to Pie Chart, active the legend and switch back to Synoptic Panel 
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
    import SelectionManager = utility.SelectionManager;

    //Model
    export interface SynopticPanelDataPoint extends SelectableDataPoint, TooltipEnabledDataPoint, LabelEnabledDataPoint {
        measure: number;
        measureFormat?: string;
        percentage: number;
        highlightRatio: number;
        label: string;
        categoryLabel?: string;
        index: number;
        color: string;
        saturationMeasure?: number;
        stateMeasure?: number;
    }

    export interface SynopticPanelBySQLBIData {
        dataPoints: SynopticPanelDataPoint[];
        legendData: LegendData;
        hasHighlights: boolean;
        dataLabelsSettings: VisualDataLabelsSettings;
        defaultDataPointColor?: string;
        showAllDataPoints?: boolean;
        legendObjectProperties?: DataViewObject;
        maxValue?: number;
        dataState1?: SynopticPanelBySQLBIState;
        dataState2?: SynopticPanelBySQLBIState;
        dataState3?: SynopticPanelBySQLBIState;
        saturationState?: SynopticPanelBySQLBIState;
        imageData?: any;
        areasData?: any;
        showAllAreas?: boolean;
    }

    export interface SynopticPanelBySQLBIBehaviorOptions {
        polygons: D3.Selection;
        clearCatcher: D3.Selection;
        hasHighlights: boolean;
    }

    export class SynopticPanelBySQLBIBehavior implements IInteractiveBehavior {

        private polygons: D3.Selection;
        private hasHighlights: boolean;

        public bindEvents(options: SynopticPanelBySQLBIBehaviorOptions, selectionHandler: ISelectionHandler): void {
            
            var clearCatcher = options.clearCatcher;
            this.hasHighlights = options.hasHighlights;
            this.polygons = options.polygons;

            var clickHandler = (d: SynopticPanelDataPoint) => {
                selectionHandler.handleSelection(d, d3.event.ctrlKey);
            };

            this.polygons.on('click', clickHandler);

            clearCatcher.on('click', () => {
                selectionHandler.handleClearSelection();
            });
        }

        public renderSelection(hasSelection: boolean): void {
            var hasHighlights = this.hasHighlights;
            this.polygons.style("opacity", (d: SynopticPanelDataPoint) => ColumnUtil.getFillOpacity(d.selected, d.highlightRatio > 0, hasSelection, hasHighlights && !d.selected));
        }
    }

    //Properties
    export var synopticPanelProps = {
        general: {
            formatString: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'formatString' },
            imageData: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'imageData' },
            areasData: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'areasData' },
            showAllAreas: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'showAllAreas' },
        },
        dataPoint: {
            defaultColor: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'defaultColor' },
            fill: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'fill' },
            showAllDataPoints: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'showAllDataPoints' },
        },
        legend: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'show' },
            position: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'position' },
            showTitle: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'showTitle' },
            titleText: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'titleText' },
        },
        saturationState: {
            dataMin: <DataViewObjectPropertyIdentifier>{ objectName: 'saturationState', propertyName: 'dataMin' },
            dataMax: <DataViewObjectPropertyIdentifier>{ objectName: 'saturationState', propertyName: 'dataMax' },
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
    
    export interface SynopticPanelBySQLBIState {
        color?: string;
        dataMin: number;
        dataMax: number;
    }

    export interface SynopticPanelSize {
        width: number;
        height: number;
    }

    //Visual
    export class SynopticPanelBySQLBI implements IVisual {

        //Constants
        private static ClassName = 'synopticPanel';
        private static BaseOpacity = 0.8;

        //Variables
        private svg: D3.Selection;
        private svgAreas: D3.Selection;
        private legend: ILegend;
        private element: JQuery;
        private loader: JQuery;
        private host: IVisualHostServices;
        private selectionManager: SelectionManager;
        private style: IVisualStyle;
        private data: SynopticPanelBySQLBIData;
        private dataView: DataView;
        private currentViewport: IViewport;
        private colors: IDataColorPalette;
        private options: VisualInitOptions;
        private behavior: SynopticPanelBySQLBIBehavior;
        private clearCatcher: D3.Selection;
        private interactivity: InteractivityOptions;
        private interactivityService: IInteractivityService;
        private isInteractive: boolean;
        private initialImageSize: SynopticPanelSize;
        private imageData: any;
        private areasData: any;
        private parsedAreas: any;
        private inEditingMode: boolean;

        //Capabilities - moved to SynopticPanelBySQLBI.capabilities.ts - left here only for online Developer Tool
        public static capabilities: VisualCapabilities = {
             dataRoles: [
                {
                    name: 'Category',
                    kind: VisualDataRoleKind.Grouping,
                    displayName: data.createDisplayNameGetter('Role_DisplayName_Legend'),
                }, {
                    name: 'Series',
                    kind: VisualDataRoleKind.Grouping,
                    displayName: data.createDisplayNameGetter('Role_DisplayName_Details'),
                }, {
                    name: 'Y',
                    kind: VisualDataRoleKind.Measure,
                    displayName: data.createDisplayNameGetter('Role_DisplayName_Values'),
                }, {
                    name: 'State',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'State Values',
                }, {
                    name: 'Saturation',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Saturation Values',
                }
            ],
            objects: {
                general: {
                    displayName: data.createDisplayNameGetter('Visual_General'),
                    properties: {
                        formatString: {
                            type: { formatting: { formatString: true } },
                        },
                        imageData: {
                            displayName: 'Image Data',
                            type: { text: true }
                        },
                        areasData: {
                            displayName: 'Areas Data',
                            type: { text: true }
                        },
                        showAllAreas: {
                            displayName: 'Show All Areas',
                            type: { bool: true }
                        },
                    },
                },
                dataPoint: {
                    displayName: data.createDisplayNameGetter('Visual_DataPoint'),
                    properties: {
                        defaultColor: {
                            displayName: data.createDisplayNameGetter('Visual_DefaultColor'),
                            type: { fill: { solid: { color: true } } }
                        },
                        showAllDataPoints: {
                            displayName: data.createDisplayNameGetter('Visual_DataPoint_Show_All'),
                            type: { bool: true }
                        },
                        fill: {
                            displayName: data.createDisplayNameGetter('Visual_Fill'),
                            type: { fill: { solid: { color: true } } }
                        },
                    }
                },
                saturationState: {
                    displayName: 'Saturation State',
                    properties: {
                        dataMin: {
                            displayName: 'Minimum',
                            type: { numeric: true }
                        },
                        dataMax: {
                            displayName: 'Maximum',
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
                dataLabels: {
                    displayName: data.createDisplayNameGetter('Visual_DataPointsLabels'),
                    properties: {
                        show: {
                            displayName: data.createDisplayNameGetter('Visual_Show'),
                            type: { bool: true }
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
                categoryLabels: {
                    displayName: data.createDisplayNameGetter('Visual_CategoryLabels'),
                    properties: {
                        show: {
                            displayName: data.createDisplayNameGetter('Visual_Show'),
                            type: { bool: true }
                        },
                    },
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
                    { 'Category': { max: 1 }, 'Series': { max: 1 }, 'Y': { max: 1 }, 'State': { max: 1 }, 'Saturation': { max: 0 } },
                    { 'Category': { max: 1 }, 'Series': { max: 1 }, 'Y': { max: 1 }, 'State': { max: 0 }, 'Saturation': { max: 1 } },
                ],
                categorical: {
                    categories: {
                        for: { in: 'Category' },
                        dataReductionAlgorithm: { top: {} }
                    },
                    values: {
                        group: {
                            by: 'Series',
                            select: [
                                { bind: { to: 'Y' } },
                                { bind: { to: 'State' } },
                                { bind: { to: 'Saturation' } },
                            ],
                            dataReductionAlgorithm: { top: {} }
                        },
                    },
                    rowCount: { preferred: { min: 2 } }
                }
            }],
            supportsHighlight: true,
            /*drilldown: {
                roles: ['Category']
            },*/
        };

        //One time setup
        public init(options: VisualInitOptions): void {

            this.options = options;
            this.element = options.element;
            this.currentViewport = options.viewport;
            this.style = options.style;
            this.host = options.host;
            this.behavior = new SynopticPanelBySQLBIBehavior();
            this.selectionManager = new SelectionManager({ hostServices: options.host });
            this.colors = this.style.colorPalette.dataColors;
            this.interactivity = options.interactivity;
            this.isInteractive = options.interactivity && options.interactivity.isInteractiveLegend;
            this.inEditingMode = (this.host.getViewMode() === ViewMode.Edit);
            this.interactivityService = createInteractivityService(this.host);
            this.legend = createLegend(this.element, this.isInteractive, this.interactivityService, true);

            this.data = {
                dataPoints: [],
                legendData: { title: '', dataPoints: [] },
                hasHighlights: false,
                dataLabelsSettings: dataLabelUtils.getDefaultLabelSettings(),
            };

            this.svg = d3.select(this.element.get(0))
                .append('svg')
                .classed(SynopticPanelBySQLBI.ClassName, true);

            this.clearCatcher = appendClearCatcher(this.svg);

            this.svgAreas = this.svg.append('g');

            this.loader = $('<div class="synopticLoader"><span><input type="file" class="file image" accept="image/*"><button class="fileChoose"><svg width="20" height="16"><g><path fill="#595959" d="M20,16.1H0V-0.1h20V16.1z M1,15.1h18V0.9H1V15.1z M16.3,12.8H3.7v-1.7l3-3.9l1.7,1.4l3.4-5.1l4.4,4.6V12.8z M4.7,11.8h10.6V8.6L12,5.2l-3.3,5L6.9,8.7l-2.2,2.8V11.8z M5.7,7.1c-0.6,0-1-0.2-1.4-0.6C3.9,6.1,3.7,5.6,3.7,5.1 c0-0.5,0.2-1,0.6-1.4c0.7-0.7,2-0.8,2.8,0c0.4,0.4,0.6,0.8,0.6,1.4c0,0.5-0.2,1-0.6,1.4C6.7,6.9,6.2,7.1,5.7,7.1z M5.7,4.1 C5.4,4.1,5.2,4.2,5,4.4C4.8,4.6,4.7,4.8,4.7,5.1c0,0.3,0.1,0.5,0.3,0.7c0.4,0.4,1,0.4,1.4,0c0.2-0.2,0.3-0.4,0.3-0.7 c0-0.3-0.1-0.5-0.3-0.7C6.2,4.2,5.9,4.1,5.7,4.1z"/></g></svg> Select Map</button></span><span><input type="file" class="file json" accept=".txt,.json"><button class="fileChoose"><svg width="22" height="16"><path Fill="#595959" d="M22,4.6L12.9,0L0,6.5l4.8,2.4L0,11.4L9.1,16L22,9.4L17.2,7L22,4.6z M12.9,0.9l7.2,3.7l-11,5.6 L1.9, 6.5L12.9, 0.9z"/></svg> Select Areas</button></span></div>').appendTo(this.element);

            var self = this;
            $('.fileChoose').on('click', function (e) {
                e.preventDefault();
                $(this).prev('.file').trigger('click');
            });
            $('.file').on('change', function () {
                if (this.files && this.files[0]) {
                    var file = this.files[0];
                    var fr = new FileReader();
                    var isImage = $(this).hasClass('image');
                    if (isImage) {
                        fr.readAsDataURL(file);
                    } else {
                        fr.readAsText(file);
                    }
                    fr.onload = function () {
                        if (isImage) {
                            self.initialImageSize = null;
                            self.imageData = fr.result;
                            self.persistExternalData('imageData');
                        } else {
                            self.parsedAreas = null;
                            self.areasData = fr.result;
                            self.persistExternalData('areasData');
                        }
                        self.renderMap();
                    };
                }
            });
        }

        //Convert the dataview into its view model

        public static converter(dataView: DataView, colors: IDataColorPalette, viewport?: IViewport): SynopticPanelBySQLBIData {
 
            if (dataView.categorical) {

                var defaultDataPointColor = undefined;
                var showAllDataPoints = undefined;
                var dataState1: SynopticPanelBySQLBIState;
                var dataState2: SynopticPanelBySQLBIState;
                var dataState3: SynopticPanelBySQLBIState;
                var saturationState: SynopticPanelBySQLBIState;
                var imageData;
                var areasData;
                var showAllAreas: boolean = true;

                var dataViewMetadata = dataView.metadata;
                if (dataViewMetadata) {
                    var objects: DataViewObjects = dataViewMetadata.objects;

                    if (objects) {

                        defaultDataPointColor = DataViewObjects.getFillColor(objects, synopticPanelProps.dataPoint.defaultColor);
                        showAllDataPoints = DataViewObjects.getValue<boolean>(objects, synopticPanelProps.dataPoint.showAllDataPoints);

                        dataState1 = {
                            color: DataViewObjects.getFillColor(objects, synopticPanelProps.dataState1.color, '#FD625E'),
                            dataMin: DataViewObjects.getValue<number>(objects, synopticPanelProps.dataState1.dataMin, -Infinity),
                            dataMax: DataViewObjects.getValue<number>(objects, synopticPanelProps.dataState1.dataMax, 0),
                        };
                        dataState2 = {
                            color: DataViewObjects.getFillColor(objects, synopticPanelProps.dataState2.color, '#F2C811'),
                            dataMin: DataViewObjects.getValue<number>(objects, synopticPanelProps.dataState2.dataMin, 0),
                            dataMax: DataViewObjects.getValue<number>(objects, synopticPanelProps.dataState2.dataMax, 1),
                        };
                        dataState3 = {
                            color: DataViewObjects.getFillColor(objects, synopticPanelProps.dataState3.color, '#7DC172'),
                            dataMin: DataViewObjects.getValue<number>(objects, synopticPanelProps.dataState3.dataMin, 1),
                            dataMax: DataViewObjects.getValue<number>(objects, synopticPanelProps.dataState3.dataMax, Infinity),
                        };
                        saturationState = {
                            dataMin: DataViewObjects.getValue<number>(objects, synopticPanelProps.saturationState.dataMin, 0),
                            dataMax: DataViewObjects.getValue<number>(objects, synopticPanelProps.saturationState.dataMax, 0),
                        };
                        imageData = DataViewObjects.getValue(objects, synopticPanelProps.general.imageData);
                        areasData = DataViewObjects.getValue(objects, synopticPanelProps.general.areasData);

                        showAllAreas = DataViewObjects.getValue<boolean>(objects, synopticPanelProps.general.showAllAreas, true);
                    }
                }

                var converter = new SynopticPanelConversion.SynopticPanelConverter(dataView, colors, defaultDataPointColor);
                converter.convert();

                return {
                    dataPoints: converter.dataPoints,
                    legendData: converter.legendData,
                    dataLabelsSettings: converter.dataLabelsSettings,
                    maxValue: converter.maxValue,
                    legendObjectProperties: converter.legendObjectProperties,
                    hasHighlights: converter.hasHighlights,
                    showAllDataPoints: showAllDataPoints,
                    defaultDataPointColor: defaultDataPointColor,
                    dataState1: dataState1,
                    dataState2: dataState2,
                    dataState3: dataState3,
                    saturationState: saturationState,
                    imageData: imageData,
                    areasData: areasData,
                    showAllAreas: showAllAreas
                };

            } else {
                return {
                    dataPoints: [],
                    legendData: { title: '', dataPoints: [] },
                    hasHighlights: false,
                    dataLabelsSettings: dataLabelUtils.getDefaultLabelSettings(),
                    showAllAreas: true
                };
            }

        }

        public onViewModeChanged(viewMode: ViewMode): void {
            this.inEditingMode = (viewMode === ViewMode.Edit);
        }

        //Drawing the visual
        public update(options: VisualUpdateOptions) {
            if (!options.dataViews && !options.dataViews[0]) return;

            this.inEditingMode = (this.host.getViewMode() === ViewMode.Edit);

            var dataView = this.dataView = options.dataViews[0];
            var currentViewport = this.currentViewport = options.viewport;

            this.data = SynopticPanelBySQLBI.converter(dataView, this.colors, currentViewport);

            if (this.interactivityService)
                this.interactivityService.applySelectionStateToData(this.data.dataPoints);

            this.svg
                .attr({
                    'height': currentViewport.height,
                    'width': currentViewport.width
                });
            
            if (!this.imageData) this.imageData = this.data.imageData;
            if (!this.areasData) this.areasData = this.data.areasData;

            if (this.imageData && this.areasData)
                this.renderMap();

            this.loader.toggle(this.inEditingMode);
        }

        private renderMap() {
            var self = this;
            if (this.imageData) {

                if (!this.initialImageSize) {
                    $('<img/>').attr('src', this.imageData).load(function () {
                        self.initialImageSize = { width: this.width, height: this.height };

                        $(this).remove();
                        self.svg.style('background', 'url(' + self.imageData + ') no-repeat left top').style('background-size', 'contain');
                        self.renderAreas();
                    });

                } else {
                    this.renderAreas();
                }

            }
        }

        private renderAreas() {

            var selectionManager = this.selectionManager;

            if (this.areasData) {

                if (!this.parsedAreas) {
                    var json = JSON.parse(this.areasData);
                    this.parsedAreas = json.areas;
                }
                var areas = this.parsedAreas;

                //Resize points
                var m = Math.min(this.currentViewport.width / this.initialImageSize.width, this.currentViewport.height / this.initialImageSize.height);

                var measureFormattersCache = dataLabelUtils.createColumnFormatterCacheManager();

                this.svgAreas.selectAll('g.poly').remove();

                var minSaturation: number, maxSaturation: number;

                for (var a = 0; a < areas.length; a++) {
                    var area = areas[a];
                    var convertedCoords = $.map(area.coords, function (v, i) {
                        return [[v[0] * m, v[1] * m]];
                    });
                    var points = convertedCoords.join(',');

                    var opacity = SynopticPanelBySQLBI.BaseOpacity;
                    var color = this.data.defaultDataPointColor || this.colors.getColorByIndex(0).value;

                    var found = false;
                    var dataPoint: SynopticPanelDataPoint;

                    for (var i = 0; i < this.data.dataPoints.length; i++) {
                        dataPoint = this.data.dataPoints[i];

                        if (dataPoint.label.toLowerCase() === area.name.toLowerCase() || dataPoint.categoryLabel.toLowerCase() === area.name.toLowerCase()) {
                            found = true;
                            color = dataPoint.color;
                            opacity = SynopticPanelBySQLBI.BaseOpacity;
  
                            if (dataPoint.saturationMeasure) {

                                //Saturation
                                if (!minSaturation || !maxSaturation) {
                                    minSaturation = this.data.saturationState.dataMin;
                                    maxSaturation = this.data.saturationState.dataMax;
                                    if (minSaturation === maxSaturation) {
                                        //Automatic
                                        minSaturation = <number>d3.min(this.data.dataPoints, function (d) { return d.saturationMeasure; });
                                        maxSaturation = <number>d3.max(this.data.dataPoints, function (d) { return d.saturationMeasure; });
                                    }
                                }

                                opacity = Math.min(SynopticPanelBySQLBI.BaseOpacity, (dataPoint.saturationMeasure / ((maxSaturation - minSaturation) / 100) / 100) * SynopticPanelBySQLBI.BaseOpacity);

                            } else if (dataPoint.stateMeasure) {

                                //States
                                if (dataPoint.stateMeasure <= this.data.dataState1.dataMax && dataPoint.stateMeasure >= this.data.dataState1.dataMin) {
                                    color = this.data.dataState1.color;
                                } else if (dataPoint.stateMeasure <= this.data.dataState2.dataMax && dataPoint.stateMeasure >= this.data.dataState2.dataMin) {
                                    color = this.data.dataState2.color;
                                } else if (dataPoint.stateMeasure <= this.data.dataState3.dataMax && dataPoint.stateMeasure >= this.data.dataState3.dataMin) {
                                    color = this.data.dataState3.color;
                                } else {
                                    color = this.data.defaultDataPointColor;
                                }
                            }

                            break;
                        }
                    }

                    if (this.data.showAllAreas || found) {

                        var g = this.svgAreas
                            .append('g')
                            .data([dataPoint])
                            .classed('poly', true);

                        //Highlight
                        g.style('opacity', ColumnUtil.getFillOpacity(dataPoint.selected, dataPoint.highlightRatio > 0, false, this.data.hasHighlights));

                        g
                            .append('polygon')
                            .attr('points', points)
                            .attr('fill', color)
                            .attr('fill-opacity', opacity)
                            .attr('stroke', color)
                            .attr('stroke-width', '2')
                            .attr('stroke-opacity', opacity);
                                
                        if (found) {

                            TooltipManager.addTooltip(g, (tooltipEvent: TooltipEvent) => tooltipEvent.data.tooltipInfo);

                            if (this.data.dataLabelsSettings.show || this.data.dataLabelsSettings.showCategory) {

                                var minX: number = <number>d3.min(convertedCoords, function (d) { return d[0]; });
                                var maxX: number = <number>d3.max(convertedCoords, function (d) { return d[0]; });
                                var minY: number = <number>d3.min(convertedCoords, function (d) { return d[1]; });
                                var maxY: number = <number>d3.max(convertedCoords, function (d) { return d[1]; });
                                var polyWidth: number = (maxX - minX);
                                var polyHeight: number = (maxY - minY);

                                var rotateText = this.data.dataLabelsSettings.showCategory && (polyHeight > polyWidth && polyWidth < 40);
                                var labelText;
                                if (this.data.dataLabelsSettings.show) {
                                    var alternativeScale: number = (this.data.dataLabelsSettings.displayUnits === 0 ?
                                        <number>d3.max(this.data.dataPoints, d => Math.abs(d.measure)) : null);

                                    var measureFormatter = measureFormattersCache.getOrCreate(dataPoint.labelFormatString, this.data.dataLabelsSettings, alternativeScale);

                                    labelText = dataLabelUtils.getLabelFormattedText(dataPoint.measure, (rotateText ? polyHeight : polyWidth), dataPoint.labelFormatString, measureFormatter);

                                } else {

                                    labelText = dataLabelUtils.getLabelFormattedText(dataPoint.label, (rotateText ? polyHeight : polyWidth) - 10, dataPoint.labelFormatString);

                                }

                                var labelWidth = TextMeasurementService.measureSvgTextWidth({ fontFamily: dataLabelUtils.LabelTextProperties.fontFamily, fontSize: '11px', text: labelText });

                                var l = g.append('text')
                                    .attr('x', minX + (rotateText ? (polyWidth / 2) : ((polyWidth - labelWidth) / 2)))
                                    .attr('y', minY + (rotateText ? ((polyHeight - labelWidth) / 2) : (polyHeight / 2) + 5))
                                    .attr('fill', this.autoTextColor(color))
                                    .classed('label', true)
                                    .text(labelText);

                                if (rotateText)
                                    l.style('writing-mode', 'tb');
                            }
                        }
                    }
                        
                }

                if (this.isInteractive) {
                    d3.selectAll('g.poly')
                        .on('click', function (d) {

                            selectionManager.select(d.identity).then((ids) => {
                                if (ids.length > 0) {
                                    d3.selectAll('g.poly').style('opacity', 0.4);
                                    d3.select(this).style('opacity', 1);
                                } else {
                                    d3.selectAll('g.poly').style('opacity', 1);
                                }

                            });

                            d3.event.stopPropagation();
                        });
                } else if (this.interactivityService) {

                    var behaviorOptions: SynopticPanelBySQLBIBehaviorOptions = {
                        polygons: d3.selectAll('g.poly'),
                        clearCatcher: this.clearCatcher,
                        hasHighlights: this.data.hasHighlights,
                    };

                    this.interactivityService.bind(this.data.dataPoints, this.behavior, behaviorOptions);
                }

                this.renderLegend();
            }
        }

        private autoTextColor(backColor) {

            var hexToRGB = function (hex) {
                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            };

            var rgbColor = hexToRGB(backColor);
            var o = Math.round(((rgbColor.r * 299) + (rgbColor.g * 587) + (rgbColor.b * 114)) / 1000);
            return (o > 125 ? 'black' : 'white');
        }

        private renderLegend(): void {
            if (!this.isInteractive) {
                var legendObjectProperties = this.data.legendObjectProperties;
                if (legendObjectProperties) {
                    var legendData = this.data.legendData;
                    LegendData.update(legendData, legendObjectProperties);
                    var position = <string>legendObjectProperties[legendProps.position];
                    if (position)
                        this.legend.changeOrientation(LegendPosition[position]);

                    this.legend.drawLegend(legendData, this.currentViewport);
                } else {
                    this.legend.changeOrientation(LegendPosition.Top);
                    this.legend.drawLegend({ dataPoints: [] }, this.currentViewport);
                }

            }
        }

        private persistExternalData(propertyName: string): void {

            switch (propertyName) {
                case 'imageData':
                    this.host.persistProperties({
                        objectName: 'general',
                        selector: null,
                        properties: {
                            imageData: this.imageData,
                        },
                    });
                    break;

                case 'areasData':
                    this.host.persistProperties({
                        objectName: 'general',
                        selector: null,
                        properties: {
                            areasData: this.areasData,
                        },
                    });
                    break;
            }
        }

        //Make visual properties available in the property pane in Power BI
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[]{

            var instances: VisualObjectInstance[] = [];
            switch (options.objectName) {
                case 'general':
                    if (this.data) {
                        instances.push({
                            objectName: 'general',
                            selector: null,
                            properties: {
                                imageData: this.imageData,
                                areasData: this.areasData,
                                showAllAreas: this.data.showAllAreas
                            },
                        });
                    }
                    break;

                case 'legend':
                    if (this.data) {
                        var legendObjectProperties: DataViewObjects = { legend: this.data.legendObjectProperties };
                        
                        var  show = DataViewObjects.getValue(legendObjectProperties, synopticPanelProps.legend.show, this.legend.isVisible());
                        var showTitle = DataViewObjects.getValue(legendObjectProperties, synopticPanelProps.legend.showTitle, true);
                        var titleText = DataViewObjects.getValue(legendObjectProperties, synopticPanelProps.legend.titleText, this.data.legendData.title);

                        instances.push({
                            selector: null,
                            objectName: 'legend',
                            properties: {
                                show: show,
                                position: LegendPosition[this.legend.getOrientation()],
                                showTitle: showTitle,
                                titleText: titleText
                            }
                        });

                    }
                    break;

                case 'dataPoint':
                    if (this.data) {
                        instances.push({
                            objectName: 'dataPoint',
                            selector: null,
                            properties: {
                                defaultColor: { solid: { color: this.data.defaultDataPointColor || this.colors.getColorByIndex(0).value } }
                            },
                        });

                        instances.push({
                            objectName: 'dataPoint',
                            selector: null,
                            properties: {
                                showAllDataPoints: !!this.data.showAllDataPoints
                            },
                        });

                        for (var i = 0; i < this.data.dataPoints.length; i++) {
                            var dataPoint = this.data.dataPoints[i];
                            instances.push({
                                objectName: 'dataPoint',
                                displayName: dataPoint.label,
                                selector: ColorHelper.normalizeSelector(dataPoint.identity.getSelector()),
                                properties: {
                                    fill: { solid: { color: dataPoint.color } }
                                },
                            });
                        }
                    }
                    break;

                case 'dataLabels':

                    //TODO Uncomment in online Developer Tool - Our local repo is not updated?
                    //var dl = dataLabelUtils.enumerateDataLabels((this.data ? this.data.dataLabelsSettings : dataLabelUtils.getDefaultLabelSettings()), false, true, true);
                    //instances.push(dl[0]);
                    //END TODO

                    //TODO Remove in online Developer Tool 
                    var enumeration = new ObjectEnumerationBuilder();
                    dataLabelUtils.enumerateDataLabels(enumeration, (this.data ? this.data.dataLabelsSettings : dataLabelUtils.getDefaultLabelSettings()), false, true, true);
                    instances.push(enumeration.complete().instances[0]);
                    //END TODO

                    break;

                case 'categoryLabels':
                    //TODO Uncomment in online Developer Tool - Our local repo is not updated?
                    //var cl =  dataLabelUtils.enumerateCategoryLabels((this.data ? this.data.dataLabelsSettings: null), false, true);
                    //instances.push(cl[0]);
                    //END TODO

                    //TODO Remove in online Developer Tool
                    var enumeration = new ObjectEnumerationBuilder();
                    dataLabelUtils.enumerateCategoryLabels(enumeration, (this.data ? this.data.dataLabelsSettings : null), false, true);
                    instances.push(enumeration.complete().instances[0]);
                    //END TODO

                    break;

                case 'dataState1':
                    if (this.data) {
                        instances.push({
                            objectName: 'dataState1',
                            selector: null,
                            properties: {
                                dataMin: this.data.dataState1.dataMin,
                                dataMax: this.data.dataState1.dataMax,
                                color: this.data.dataState1.color,
                            },
                        });
                    }
                    break;

                case 'dataState2':
                    if (this.data) {
                        instances.push({
                            objectName: 'dataState2',
                            selector: null,
                            properties: {
                                dataMin: this.data.dataState2.dataMin,
                                dataMax: this.data.dataState2.dataMax,
                                color: this.data.dataState2.color,
                            },
                        });
                    }
                    break;

                case 'dataState3':
                    if (this.data) {
                        instances.push({
                            objectName: 'dataState3',
                            selector: null,
                            properties: {
                                dataMin: this.data.dataState3.dataMin,
                                dataMax: this.data.dataState3.dataMax,
                                color: this.data.dataState3.color,
                            },
                        });
                    }
                    break;

                case 'saturationState':
                    if (this.data) {
                        instances.push({
                            objectName: 'saturationState',
                            selector: null,
                            properties: {
                                dataMin: this.data.saturationState.dataMin,
                                dataMax: this.data.saturationState.dataMax,
                            },
                        });
                    }
                    break;
            }

            return instances;
        }

        //Free up resources
        public destroy(): void {
            this.svg = null;

        }

    }

    //Converter
    module SynopticPanelConversion {

        interface ConvertedDataPoint {
            identity: SelectionId;
            measureFormat: string;
            measureValue: MeasureAndValue;
            highlightMeasureValue: MeasureAndValue;
            index: number;
            label: any;
            categoryLabel: string;
            color: string;
            seriesIndex?: number;
            stateMeasure?: number;
            saturationMeasure?: number;
        };

        interface MeasureAndValue {
            measure: number;
            value: number;
        }

        export class SynopticPanelConverter {
            private dataViewCategorical: DataViewCategorical;
            private dataViewMetadata: DataViewMetadata;
            private highlightsOverflow: boolean;
            private total: number;
            private highlightTotal: number;
            private grouped: DataViewValueColumnGroup[];
            private isMultiMeasure: boolean;
            private isSingleMeasure: boolean;
            private seriesCount: number;
            private categoryIdentities: DataViewScopeIdentity[];
            private categoryValues: any[];
            private allCategoryObjects: DataViewObjects[];
            private categoryColumnRef: data.SQExpr[];
            private legendDataPoints: LegendDataPoint[];
            private colorHelper: ColorHelper;
            private categoryFormatString: string;

            public hasHighlights: boolean;
            public dataPoints: SynopticPanelDataPoint[];
            public legendData: LegendData;
            public dataLabelsSettings: VisualDataLabelsSettings;
            public legendObjectProperties: DataViewObject;
            public maxValue: number;

            public constructor(dataView: DataView, colors: IDataColorPalette, defaultDataPointColor?: string) {
                var dataViewCategorical = dataView.categorical;
                this.dataViewCategorical = dataViewCategorical;
                this.dataViewMetadata = dataView.metadata;

                this.seriesCount = dataViewCategorical.values ? dataViewCategorical.values.length : 0; 
                this.colorHelper = new ColorHelper(colors, synopticPanelProps.dataPoint.fill, defaultDataPointColor);
                this.maxValue = 0;

                if (dataViewCategorical.categories && dataViewCategorical.categories.length > 0) {
                    var category = dataViewCategorical.categories[0];
                    this.categoryIdentities = category.identity;
                    this.categoryValues = category.values;
                    this.allCategoryObjects = category.objects;
                    this.categoryColumnRef = category.identityFields;
                    this.categoryFormatString = valueFormatter.getFormatString(category.source, synopticPanelProps.general.formatString);
                }

                var grouped = this.grouped = dataViewCategorical && dataViewCategorical.values ? dataViewCategorical.values.grouped() : undefined;
                this.isMultiMeasure = grouped && grouped.length > 0 && grouped[0].values && grouped[0].values.length > 1;
                this.isSingleMeasure = grouped && grouped.length === 1&& grouped[0].values && grouped[0].values.length === 1;

                this.hasHighlights = this.seriesCount > 0 && !!dataViewCategorical.values[0].highlights;
                this.highlightsOverflow = false;
                this.total = 0;
                this.highlightTotal = 0;
                this.dataPoints = [];
                this.legendDataPoints = [];
                this.dataLabelsSettings = null;

                for (var seriesIndex = 0; seriesIndex < this.seriesCount; seriesIndex++) {
                    var seriesData = dataViewCategorical.values[seriesIndex];
                    if (!seriesData.source.roles || seriesData.source.roles['Y']) {
                        for (var measureIndex = 0; measureIndex < seriesData.values.length; measureIndex++) {
                            this.total += Math.abs(seriesData.values[measureIndex]);
                            this.highlightTotal += this.hasHighlights ? Math.abs(seriesData.highlights[measureIndex]) : 0;
                        }
                    }
                }
                this.total = AxisHelper.normalizeNonFiniteNumber(this.total);
                this.highlightTotal = AxisHelper.normalizeNonFiniteNumber(this.highlightTotal);
            }

            private static normalizedMeasureAndValue(measureAndValue: MeasureAndValue): MeasureAndValue {
                var normalized: MeasureAndValue = $.extend(true, {}, measureAndValue);
                normalized.measure = AxisHelper.normalizeNonFiniteNumber(normalized.measure);
                normalized.value = AxisHelper.normalizeNonFiniteNumber(normalized.value);

                return normalized;
            }

            public convert(): void {
                var convertedData: ConvertedDataPoint[];
                if (this.total !== 0) {
                    // If category exists, we render labels using category values. If not, we render labels
                    // using measure labels.
                    if (this.categoryValues) {
                        convertedData = this.convertCategorical();
                    }
                    else {
                        if (this.isSingleMeasure || this.isMultiMeasure) {
                            // Either single- or multi-measure (no category or series)
                            convertedData = this.convertMeasures();
                        }
                        else {
                            // Series but no category.
                            convertedData = this.convertSeries();
                        }
                    }
                }
                else {
                    convertedData = [];
                }

                // Check if any of the highlight values are > non-highlight values
                var highlightsOverflow = false;
                for (var i = 0, dataPointCount = convertedData.length; i < dataPointCount && !highlightsOverflow; i++) {
                    var point = convertedData[i];
                    if (Math.abs(point.highlightMeasureValue.measure) > Math.abs(point.measureValue.measure)) {
                        highlightsOverflow = true;
                    }
                }

                // Create data labels settings
                this.dataLabelsSettings = this.convertDataLabelSettings();

                var dataViewMetadata = this.dataViewMetadata;
                if (dataViewMetadata) {
                    var objects: DataViewObjects = dataViewMetadata.objects;
                    if (objects) {
                        this.legendObjectProperties = objects['legend'];
                    }
                }

                this.dataPoints = [];
                var formatStringProp = synopticPanelProps.general.formatString;

                for (var i = 0, dataPointCount = convertedData.length; i < dataPointCount; i++) {
                    var point = convertedData[i];

                    // Normalize the values here and then handle tooltip value as infinity
                    var normalizedHighlight = SynopticPanelConverter.normalizedMeasureAndValue(point.highlightMeasureValue);
                    var normalizedNonHighlight = SynopticPanelConverter.normalizedMeasureAndValue(point.measureValue);

                    var measure = normalizedNonHighlight.measure;
                    var percentage = (this.total > 0) ? normalizedNonHighlight.value / this.total : 0.0;
                    var highlightRatio = 0;
                    if (normalizedNonHighlight.value > this.maxValue)
                        this.maxValue = normalizedNonHighlight.value;
                    if (normalizedHighlight.value > this.maxValue)
                        this.maxValue = normalizedHighlight.value;

                    if (this.hasHighlights) {
                        // When any highlight value is greater than the corresponding non-highlight value
                        // we just render all of the highlight values and discard the non-highlight values.
                        if (highlightsOverflow) {
                            measure = normalizedHighlight.measure;

                            percentage = (this.highlightTotal > 0) ? normalizedHighlight.value / this.highlightTotal : 0.0;
                            highlightRatio = 1;
                        }
                        else {
                            highlightRatio = normalizedHighlight.value / normalizedNonHighlight.value;
                        }
                    }

                    var categoryValue = point.categoryLabel;
                    var categorical = this.dataViewCategorical;
                    var valueIndex: number = categorical.categories ? null : i;
                    valueIndex = point.seriesIndex !== undefined ? point.seriesIndex : valueIndex;
                    var valuesMetadata = categorical.values[valueIndex].source;
                    var value: number = point.measureValue.measure;
                    var highlightedValue: number = this.hasHighlights && point.highlightMeasureValue.value !== 0 ? point.highlightMeasureValue.measure : undefined;
                    var tooltipInfo: TooltipDataItem[] = TooltipBuilder.createTooltipInfo(formatStringProp, categorical, categoryValue, value, null, null, valueIndex, i, highlightedValue);

                    this.dataPoints.push({
                        identity: point.identity,
                        measure: measure,
                        measureFormat: point.measureFormat,
                        saturationMeasure: point.saturationMeasure,
                        stateMeasure: point.stateMeasure,
                        percentage: percentage,
                        index: point.index,
                        label: point.label,
                        categoryLabel: point.categoryLabel,
                        highlightRatio: highlightRatio,
                        selected: false,
                        tooltipInfo: tooltipInfo,
                        color: point.color,
                        labelFormatString: valuesMetadata.format
                    });
                }

                this.legendData = { title: this.getLegendTitle(), dataPoints: this.legendDataPoints };
            }

            private getLegendTitle(): string {
                if (this.total !== 0) {
                    // If category exists, we render title using category source. If not, we render title
                    // using measure.
                    var dvValuesSourceName = this.dataViewCategorical.values && this.dataViewCategorical.values.source
                        ? this.dataViewCategorical.values.source.displayName : "";
                    var dvCategorySourceName = this.dataViewCategorical.categories && this.dataViewCategorical.categories.length > 0 && this.dataViewCategorical.categories[0].source
                        ? this.dataViewCategorical.categories[0].source.displayName : "";
                    if (this.categoryValues) {
                        return dvCategorySourceName;
                    }
                    else {
                        return dvValuesSourceName;
                    }
                }
                else {
                    return "";
                }
            }
         
            private convertCategorical(): ConvertedDataPoint[] {
                var dataViewCategorical = this.dataViewCategorical;
                var formatStringProp = synopticPanelProps.general.formatString;
                var dataPoints: ConvertedDataPoint[] = [];
 
                for (var categoryIndex = 0, categoryCount = this.categoryValues.length; categoryIndex < categoryCount; categoryIndex++) {
                    var categoryValue = this.categoryValues[categoryIndex];
                    var thisCategoryObjects = this.allCategoryObjects ? this.allCategoryObjects[categoryIndex] : undefined;

                    var legendIdentity = SelectionId.createWithId(this.categoryIdentities[categoryIndex]);
                    var color = this.colorHelper.getColorForSeriesValue(thisCategoryObjects, this.categoryColumnRef, categoryValue);
                    var categoryLabel = valueFormatter.format(categoryValue, this.categoryFormatString);

                    for (var seriesIndex = 0; seriesIndex < this.seriesCount; seriesIndex++) {
                        var seriesData = dataViewCategorical.values[seriesIndex];

                        if (seriesData.values[categoryIndex]) {

                            if (!seriesData.source.roles || seriesData.source.roles['Y']) {

                                var label = this.isSingleMeasure
                                    ? categoryLabel
                                    : converterHelper.getFormattedLegendLabel(seriesData.source, dataViewCategorical.values, formatStringProp);

                                var nonHighlight = seriesData.values[categoryIndex] || 0;
                                var highlight = this.hasHighlights ? seriesData.highlights[categoryIndex] || 0 : 0;

                                var measure: string;
                                var seriesGroup: any;

                                if (this.isMultiMeasure)
                                    measure = seriesData.source.queryName;
                                else if (seriesData.identity)
                                    seriesGroup = seriesData;

                                var identity: SelectionId = SelectionIdBuilder.builder()
                                    .withCategory(dataViewCategorical.categories[0], categoryIndex)
                                    .withSeries(seriesGroup, seriesGroup)
                                    .withMeasure(measure)
                                    .createSelectionId();

                                var dataPoint: ConvertedDataPoint = {
                                    identity: identity,
                                    measureFormat: valueFormatter.getFormatString(seriesData.source, formatStringProp, true),
                                    measureValue: <MeasureAndValue> {
                                        measure: nonHighlight,
                                        value: Math.abs(nonHighlight),
                                    },
                                    highlightMeasureValue: <MeasureAndValue> {
                                        measure: highlight,
                                        value: Math.abs(highlight),
                                    },
                                    index: categoryIndex,
                                    label: label,
                                    categoryLabel: categoryLabel,
                                    color: color,
                                    seriesIndex: seriesIndex
                                };

                                if (seriesData.source.roles) {

                                    //Check if same serie has more roles
                                    if (seriesData.source.roles['State']) {
                                        dataPoint.stateMeasure = seriesData.values[categoryIndex];
                                    } else if (seriesData.source.roles['Saturation']) {
                                        dataPoint.saturationMeasure = seriesData.values[categoryIndex];
                                    } else {
                                        //Check if the next serie has differente roles
                                        if (seriesIndex < this.seriesCount - 1) {
                                            var nextSeriesData = dataViewCategorical.values[seriesIndex + 1];

                                            if (nextSeriesData.source.roles['State']) {
                                                dataPoint.stateMeasure = nextSeriesData.values[categoryIndex];
                                                seriesIndex++;

                                            } else if (nextSeriesData.source.roles['Saturation']) {
                                                dataPoint.saturationMeasure = nextSeriesData.values[categoryIndex];
                                                seriesIndex++;
                                            }
                                        }
                                    }
                                }

                                dataPoints.push(dataPoint);
                            }
                        }
 
                    }

                    this.legendDataPoints.push({
                        label: categoryLabel,
                        color: color,
                        icon: LegendIcon.Box,
                        identity: legendIdentity,
                        selected: false
                    });
                }

                return dataPoints;
            }

            private convertMeasures(): ConvertedDataPoint[] {
                var dataViewCategorical = this.dataViewCategorical;
                var dataPoints: ConvertedDataPoint[] = [];
                var formatStringProp = synopticPanelProps.general.formatString;

                for (var measureIndex = 0; measureIndex < this.seriesCount; measureIndex++) {
                    var measureData = dataViewCategorical.values[measureIndex];
                    var measureFormat = valueFormatter.getFormatString(measureData.source, formatStringProp, true);
                    var measureLabel = measureData.source.displayName;
                    var identity = SelectionId.createWithMeasure(measureData.source.queryName);

                    var nonHighlight = measureData.values[0] || 0;
                    var highlight = this.hasHighlights ? measureData.highlights[0] || 0 : 0;

                    var color = this.colorHelper.getColorForMeasure(measureData.source.objects, measureData.source.queryName);

                    var dataPoint: ConvertedDataPoint = {
                        identity: identity,
                        measureFormat: measureFormat,
                        measureValue: <MeasureAndValue> {
                            measure: nonHighlight,
                            value: Math.abs(nonHighlight),
                        },
                        highlightMeasureValue: <MeasureAndValue> {
                            measure: highlight,
                            value: Math.abs(highlight),
                        },
                        index: measureIndex,
                        label: measureLabel,
                        categoryLabel: measureLabel,
                        color: color
                    };
                    dataPoints.push(dataPoint);

                    this.legendDataPoints.push({
                        label: dataPoint.label,
                        color: dataPoint.color,
                        icon: LegendIcon.Box,
                        identity: dataPoint.identity,
                        selected: false
                    });
                }

                return dataPoints;
            }

            private convertSeries(): ConvertedDataPoint[] {
                var dataViewCategorical = this.dataViewCategorical;
                var dataPoints: ConvertedDataPoint[] = [];
                var formatStringProp = synopticPanelProps.general.formatString;

                for (var seriesIndex = 0; seriesIndex < this.seriesCount; seriesIndex++) {
                    var seriesData = dataViewCategorical.values[seriesIndex];
                    var seriesFormat = valueFormatter.getFormatString(seriesData.source, formatStringProp, true);
                    var label = converterHelper.getFormattedLegendLabel(seriesData.source, dataViewCategorical.values, formatStringProp);
                    var identity = SelectionId.createWithId(seriesData.identity);
                    var seriesName = converterHelper.getSeriesName(seriesData.source);
                    var seriesObjects = seriesData.objects && seriesData.objects[0];

                  
                    var nonHighlight = seriesData.values[0] || 0;
                    var highlight = this.hasHighlights ? seriesData.highlights[0] || 0 : 0;

                    var color = this.colorHelper.getColorForSeriesValue(seriesObjects, dataViewCategorical.values.identityFields, seriesName);

                    var dataPoint: ConvertedDataPoint = {
                        identity: identity,
                        measureFormat: seriesFormat,
                        measureValue: <MeasureAndValue> {
                            measure: nonHighlight,
                            value: Math.abs(nonHighlight),
                        },
                        highlightMeasureValue: <MeasureAndValue> {
                            measure: highlight,
                            value: Math.abs(highlight),
                        },
                        index: seriesIndex,
                        label: label,
                        categoryLabel: label,
                        color: color,
                        seriesIndex: seriesIndex
                    };
                    dataPoints.push(dataPoint);

                    this.legendDataPoints.push({
                        label: dataPoint.label,
                        color: dataPoint.color,
                        icon: LegendIcon.Box,
                        identity: dataPoint.identity,
                        selected: false
                    });
                }

                return dataPoints;
            }

            private convertDataLabelSettings(): VisualDataLabelsSettings {
                var dataViewMetadata = this.dataViewMetadata;
                var dataLabelsSettings = dataLabelUtils.getDefaultLabelSettings();

                if (dataViewMetadata) {
                    var objects: DataViewObjects = dataViewMetadata.objects;
                    if (objects) {
                        // Handle lables settings
                        var labelsObj = <DataLabelObject>objects['dataLabels'];
                        if (labelsObj) {
                            if (labelsObj.show !== undefined)
                                dataLabelsSettings.show = labelsObj.show;
                            if (labelsObj.labelDisplayUnits !== undefined) {
                                dataLabelsSettings.displayUnits = labelsObj.labelDisplayUnits;
                            }
                            if (labelsObj.labelPrecision !== undefined) {
                                dataLabelsSettings.precision = (labelsObj.labelPrecision >= 0) ? labelsObj.labelPrecision : 0;
                            }
                        }

                        var categoryLabelsObject = objects['categoryLabels'];
                        if (categoryLabelsObject) {
                            // Update category label visibility
                            var category = <boolean>categoryLabelsObject['show'];
                            if (category !== undefined)
                                dataLabelsSettings.showCategory = (dataLabelsSettings.show ? false : category);
                        }

                    }
                }

                return dataLabelsSettings;
            }
        }
    }
}