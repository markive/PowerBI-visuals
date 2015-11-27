/*
 *  Synoptic Panel by SQLBI
 *  Draw custom areas over a bitmap image and get all the necessary coordinates with our free tool at https://synoptic.design
 *  Known issue: you can't change datapoint colors when you don't have a match between areas name and legend, but details
 *  v0.4.0
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
        imageData?: string;
        areasData?: string;
        showAllAreas?: boolean;
        showAreasLabels?: boolean;
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
            showAreasLabels: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'showAreasLabels' },
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
        dataMin: number;
        dataMax: number;
        color?: string;
        inBinding: boolean;
    }

    export interface SynopticPanelImage {
        type: string; //bitmap or svg
        width: number;
        height: number;
        layers?: SynopticPanelShape[];
    }

    export interface SynopticPanelShape {
        id: string;
        style: SynopticPanelShapeStyle;
    }

    export interface SynopticPanelShapeStyle {
        fill?: string;
        fillopacity?: string;
        stroke?: string;
        strokewidth?: string;
        strokeopacity?: string;
    }

    //Visual
    export class SynopticPanelBySQLBI implements IVisual {

        //Constants
        private static ClassName = 'synopticPanel';
        private static GalleryURL = 'https://synoptic.design/api/get_posts/';
        private static DesignerURL = 'https://synoptic.design/';
        private static BaseOpacity = 0.8;

        //Variables
        private svg: D3.Selection;
        private legend: ILegend;
        private element: JQuery;
        private toolbar: JQuery;
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
        private initialImage: SynopticPanelImage;
        private parsedAreas: any;
        private inEditingMode: boolean;

        private galleryRetreiving: boolean;
        private galleryInterval: any;
        private galleryHTML: any;
        private gallerySubmissions: any;

        public static getDefaultData(): SynopticPanelBySQLBIData {
            return {
                dataPoints: [],
                legendData: { title: '', dataPoints: [] },
                hasHighlights: false,
                dataLabelsSettings: dataLabelUtils.getDefaultLabelSettings(),
                showAllAreas: false,
                showAreasLabels: false,
                showAllDataPoints: false,
                dataState1: {
                    color: '#FD625E', //Red
                    dataMin: -Infinity,
                    dataMax: 0,
                    inBinding: false
                },
                dataState2: {
                    color: '#F2C811', //Yellow
                    dataMin: 0,
                    dataMax: 1,
                    inBinding: false
                },
                dataState3: {
                    color: '#7DC172', //Green
                    dataMin: 1,
                    dataMax: Infinity,
                    inBinding: false
                },
                saturationState: {
                    dataMin: 0,
                    dataMax: 0,
                    inBinding: false
                },
            };
        }

        //Capabilities
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
                }, {
                    name: 'State1Min',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'State 1 From',
                }, {
                    name: 'State1Max',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'State 1 To',
                }, {
                    name: 'State2Min',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'State 2 From',
                }, {
                    name: 'State2Max',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'State 2 To',
                }, {
                    name: 'State3Min',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'State 3 From',
                }, {
                    name: 'State3Max',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'State 3 To',
                }, {
                    name: 'SaturationMin',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Saturation Min',
                }, {
                    name: 'SaturationMax',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Saturation Max',
                }
            ],
            objects: {
                general: {
                    displayName: 'Areas',
                    properties: {
                        formatString: {
                            type: { formatting: { formatString: true } },
                        },
                        imageData: {
                            displayName: 'Map Image',
                            type: { text: true }
                        },
                        areasData: {
                            displayName: 'Areas',
                            type: { text: true }
                        },
                        showAllAreas: {
                            displayName: 'All Areas',
                            type: { bool: true }
                        },
                        showAreasLabels: {
                            displayName: 'Areas Names',
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
                            displayName: 'Multiple Colors',
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
                            displayName: 'From',
                            type: { numeric: true }
                        },
                        dataMax: {
                            displayName: 'To',
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
                            displayName: 'From',
                            type: { numeric: true }
                        },
                        dataMax: {
                            displayName: 'To',
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
                            displayName: 'From',
                            type: { numeric: true }
                        },
                        dataMax: {
                            displayName: 'To',
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
                    { 'Category': { max: 1 }, 'Series': { max: 1 }, 'Y': { max: 1 }, 'State': { max: 1 }, 'State1Min': { max: 1 }, 'State1Max': { max: 1 }, 'State2Min': { max: 1 }, 'State2Max': { max: 1 }, 'State3Min': { max: 1 }, 'State3Max': { max: 1 }, 'Saturation': { max: 0 }, 'SaturationMin': { max: 0 }, 'SaturationMax': { max: 0 } },
                    { 'Category': { max: 1 }, 'Series': { max: 1 }, 'Y': { max: 1 }, 'State': { max: 0 }, 'State1Min': { max: 0 }, 'State1Max': { max: 0 }, 'State2Min': { max: 0 }, 'State2Max': { max:0 }, 'State3Min': { max: 0 }, 'State3Max': { max: 0 }, 'Saturation': { max: 1 }, 'SaturationMin': { max: 1 }, 'SaturationMax': { max: 1 } },
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
                                { bind: { to: 'State1Min' } },
                                { bind: { to: 'State1Max' } },
                                { bind: { to: 'State2Min' } },
                                { bind: { to: 'State2Max' } },
                                { bind: { to: 'State3Min' } },
                                { bind: { to: 'State3Max' } },
                                { bind: { to: 'SaturationMin' } },
                                { bind: { to: 'SaturationMax' } },
                            ],
                            dataReductionAlgorithm: { top: {} }
                        }
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
            this.galleryRetreiving = false;
            this.gallerySubmissions = {};

            this.data = {
                dataPoints: [],
                legendData: { title: '', dataPoints: [] },
                hasHighlights: false,
                dataLabelsSettings: dataLabelUtils.getDefaultLabelSettings(),
            };

            this.clearMap();
        }

        public setToolbar(showToolbar) {

            var self = this;
            var isOnline: boolean = (document.location.href.indexOf("http") > -1);
            var toolbar: JQuery;
            var loader: string = '<div class="powerbi-spinner"><div class="modernCirleSpinner ng-scope"><i class="glyphicon pbi-spinner ng-scope"></i></div></div>';

            var toggleGallery = function (showGallery) {
                if (showGallery) {
                    toolbar.find('.gallery').addClass('active');
                    toolbar.animate({ height: 300 }, 300, function () {

                        var gallery = toolbar.find('.gallery-list');
                        gallery.show();

                        if (!self.galleryHTML) {

                            if (!self.galleryRetreiving) {
                                self.galleryRetreiving = true;
                                gallery.html(loader);

                                $.getJSON(SynopticPanelBySQLBI.GalleryURL, function (d) {
                                    if (self.galleryRetreiving) {
                                        if (d.status === 'ok') {
                                            self.gallerySubmissions = {};
                                            var html = '<ul>';
                                            for (var i = 0; i < d.posts.length; i++) {
                                                var post = d.posts[i];
                                                if (post.attachments.length > 0) {
                                                    var title = post.title_plain;
                                                    var thumb_url = post.attachments[0].url.replace('http:', 'https:');
                                                    var author_email = post.custom_fields.gallery_author_email[0];
                                                    var author_name = post.custom_fields.gallery_author_name[0];
                                                    var is_verified = post.custom_fields.gallery_verified[0];
                                                    var author = (is_verified ? author_name + ' (' + author_email + ')' : (author_name === '' ? 'Anonymous' : author_name + ' (not verified)'));
                                                    var content = $("<div/>").html(post.content).text();
                                                    var alt = title + ' \n' + content + ' \nby ' + author;

                                                    html += '<li><a href="#" id="s_' + post.id + '" title="' + alt + '"><div class="thumbnail_container"><div class="thumbnail" style="background:#fff url(' + thumb_url + ') no-repeat center; background-size:contain"></div></div><div class="ellipsis">' + title + '</div></a></li>';   
                                                                   
                                                    self.gallerySubmissions['s_' + post.id] = {
                                                        map: post.custom_fields.gallery_map[0].replace('http:', 'https:'),
                                                        areas: post.custom_fields.gallery_areas[0]
					                                };
                                                }
                                            }
                                            html += '</ul>';
                                            gallery.html(html);
                                            self.galleryHTML = html;
                                        }
                                        self.galleryRetreiving = false;
                                    }
                                });
                            }

                        } else {
                            gallery.html(self.galleryHTML);
                        }

                    });

                    self.galleryInterval = setInterval(function () {
                        if (!toolbar.is(':visible'))
                            toggleGallery(false);
                    }, 1000);
                } else {
                    toolbar.find('.gallery-list').css('opacity', 1).hide();
                    toolbar.css('height', 'auto');
                    toolbar.find('.gallery').removeClass('active');
                    clearInterval(self.galleryInterval);
                }
            };

            if (this.toolbar) this.toolbar.remove();

            if (showToolbar) {

                var mapButton = '<span><button class="fileChoose mapChoose" title="Choose a local map image"><svg viewBox="0 0 15 12" width="20" height="16"><g><path fill="#ffffff" d="M4.51,3c-0.222,0 -0.394,0.069 -0.543,0.217c-0.148,0.148 -0.217,0.321 -0.217,0.544c0,0.208 0.069,0.374 0.217,0.521c0.287,0.288 0.759,0.308 1.066,0c0.149,-0.147 0.217,-0.313 0.217,-0.521c0,-0.223 -0.068,-0.396 -0.217,-0.543c-0.148,-0.149 -0.315,-0.218 -0.523,-0.218M4.51,5.25c-0.422,0 -0.783,-0.147 -1.073,-0.437c-0.289,-0.289 -0.437,-0.643 -0.437,-1.052c0,-0.423 0.148,-0.785 0.438,-1.075c0.568,-0.569 1.534,-0.589 2.125,0c0.29,0.291 0.437,0.652 0.437,1.075c0,0.408 -0.147,0.762 -0.437,1.052c-0.29,0.29 -0.644,0.437 -1.053,0.437M3.75,9l7.5,0l0,-2.084l-2.323,-2.221l-2.351,3.296l-1.283,-0.985l-1.543,1.853l0,0.141ZM12,9.75l-9,0l0,-1.163l2.177,-2.615l1.239,0.951l2.402,-3.368l3.182,3.041l0,3.154ZM0.75,11.25l13.5,0l0,-10.5l-13.5,0l0,10.5ZM15,12l-15,0l0,-12l15,0l0,12Z"/></g></svg> Select Map</button><input type="file" class="file image" accept="image/*"></span> ';

                var areaButton = '<span><button class="fileChoose areaChoose" title="Choose a local areas JSON file"><svg width="22" height="16"><path Fill="#ffffff" d="M22,4.6L12.9,0L0,6.5l4.8,2.4L0,11.4L9.1,16L22,9.4L17.2,7L22,4.6z M12.9,0.9l7.2,3.7l-11,5.6 L1.9, 6.5L12.9, 0.9z"/></svg> Select Areas</button><input type="file" class="file json" accept=".txt,.json"></span> ';

                var galleryButton = '<span><button class="gallery" title="Choose an existing public map/areas"><svg viewBox="0 0 15 12" width="20" height="16"><g><path fill="#ffffff" d="M4.51,5.25c-0.222,0 -0.394,0.069 -0.543,0.217c-0.148,0.148 -0.217,0.321 -0.217,0.543c0,0.209 0.069,0.375 0.217,0.523c0.288,0.287 0.759,0.307 1.066,0c0.149,-0.148 0.217,-0.314 0.217,-0.523c0,-0.222 -0.068,-0.395 -0.217,-0.542c-0.148,-0.149 -0.315,-0.218 -0.523,-0.218M4.51,7.5c-0.422,0 -0.783,-0.147 -1.073,-0.437c-0.289,-0.289 -0.437,-0.643 -0.437,-1.053c0,-0.422 0.148,-0.784 0.438,-1.074c0.568,-0.569 1.534,-0.589 2.125,0c0.29,0.291 0.437,0.652 0.437,1.074c0,0.409 -0.147,0.763 -0.437,1.053c-0.29,0.29 -0.644,0.437 -1.053,0.437M6.701,9l4.549,0l0,-1.353l-1.574,-1.774l-1.681,2.678l-0.788,-0.594l-0.145,0.501l-0.361,0.542ZM12,9.75l-6.701,0l1.102,-1.653l0.347,-1.426l1.047,0.789l1.776,-2.833l2.429,2.735l0,2.388ZM0.75,11.25l13.5,0l0,-7.5l-13.5,0l0,7.5ZM15,12l-15,0l0,-9l15,0l0,9Z"/><rect x="1.5" y="1.5" width="12" height="0.75" fill="#ffffff"/><rect x="3.75" y="0" width="7.5" height="0.75" fill="#ffffff"/></g></svg> Gallery</button></span> ';

                var designerButton = '<span><button class="designer" title="Go to ' + SynopticPanelBySQLBI.DesignerURL+ '"><svg width="16" height="16" viewBox="0 0 16 16"><g><path fill="#ffffff" d="M1.134,12.144l-1.134,3.856l3.856,-1.135l10.124,-10.124l-2.722,-2.722l-10.124,10.125ZM3.348,14.012l-1.007,0.296c-0.059,-0.164 -0.153,-0.319 -0.285,-0.451c-0.105,-0.105 -0.225,-0.186 -0.353,-0.244l0.283,-0.962l9.271,-9.271l1.361,1.362l-9.27,9.27Z"/><path fill="#ffffff" d="M15.625,1.282l-0.907,-0.907c-0.242,-0.242 -0.565,-0.375 -0.907,-0.375c-0.343,0 -0.665,0.133 -0.907,0.375l-0.879,0.879l0.68,0.68l0.879,-0.879c0.125,-0.125 0.329,-0.125 0.454,0l0.907,0.907c0.06,0.06 0.094,0.141 0.094,0.227c0,0.086 -0.033,0.166 -0.094,0.227l-0.879,0.879l0.68,0.68l0.878,-0.878c0.242,-0.242 0.376,-0.565 0.376,-0.907c0,-0.342 -0.133,-0.666 -0.375,-0.908Z"/></g></svg> Design</button></span> ';

                toolbar = $('<div class="synopticToolbar unselectable toolbar ql-toolbar">' + mapButton + areaButton + ' &nbsp; ' + galleryButton + (isOnline ? designerButton : '') + '<div class="gallery-list"></div></div>');

                toolbar.find('.fileChoose').on('click', function (e) {
                    e.preventDefault();
                    toggleGallery(false);
                    $(this).parent().find('.file').trigger('click');
                });
                toolbar.find('.file').on('click', function () {
                    this.value = null;
                });
                toolbar.find('.file').on('change', function() {
                    if (this.files && this.files[0]) {
                        var file = this.files[0];
                        var fr = new FileReader();
                        var isImage = $(this).hasClass('image');
                        var importAsData = true;
                        var isSVG = false;

                        if (isImage) {
                            if (file.type.indexOf('image/svg') >= 0) {
                                if (confirm('You selected an SVG image, do you want to automatically create an area for each named shape?\n\nIf you click Cancel the image will be imported, but you will have to select a separate areas definition file.')) {
                                    importAsData = false;
                                    isSVG = true;
                                }
                            }
                        } else {
                            importAsData = false;
                        }

                        if (importAsData)
                            fr.readAsDataURL(file);
                        else
                            fr.readAsText(file);

                        fr.onload = function () {
                            if (isImage) {
                                self.initialImage = null;
                                self.data.imageData = fr.result;

                                if (isSVG) {
                                    self.parsedAreas = null;
                                    self.data.areasData = '1'; 
                                }

                            } else {
                                self.parsedAreas = null;
                                self.data.areasData = fr.result;
                            }
                            self.persistData();
                            self.renderMap();

                            self.updateToolbarCabilitites();
                        };
                    }
                });
                toolbar.find('.designer').on('click', function (e) {
                    e.preventDefault();
                    toggleGallery(false);
                    window.open(SynopticPanelBySQLBI.DesignerURL + '?utm_source=powerbi&amp;utm_medium=online&amp;utm_campaign=' + SynopticPanelBySQLBI.ClassName);
                });

                toolbar.find('.gallery').on('click', function (e) {
                    e.preventDefault();
                    toggleGallery(!$(this).hasClass('active'));
                });

                toolbar.find('.gallery-list').on('click', 'a', function (e) {
                    e.preventDefault();

                    if ((!self.data.imageData && !self.data.areasData) || confirm('The current map and areas definition will be changed. \nAre you sure to continue?')) {

                        var submission = self.gallerySubmissions[$(this).attr('id')];
        
                        self.initialImage = null;
                        self.data.imageData = submission.map;

                        self.parsedAreas = null;
                        self.data.areasData = null;

                        if (submission.areas && submission.areas !== '') {
                            toolbar.find('.gallery-list').css('opacity', 0.3).append(loader);
                            self.data.areasData = submission.areas;
                        }
                        /*$.getJSON(areaURL, function (d) {
                            self.data.areasData = JSON.stringify(d);
                            self.persistData();

                            self.renderMap();
                            toggleGallery(false);
                        });*/
                        
                        self.persistData();
                        self.renderMap();
                        toggleGallery(false);
                        
                    }

                });

                this.toolbar = toolbar;
                this.updateToolbarCabilitites();

                this.host.setToolbar(toolbar);

            } else {

                this.host.setToolbar(null);
            }
        }

        private updateToolbarCabilitites() {
            if (this.initialImage && this.initialImage.type === 'svg')
                this.toolbar.find('.areaChoose').addClass('disabled').attr('disabled', 'disabled');
            else
                this.toolbar.find('.areaChoose').removeClass('disabled').removeAttr('disabled');
        }

        //Convert the dataview into its view model
        public static converter(dataView: DataView, colors: IDataColorPalette, viewport?: IViewport): SynopticPanelBySQLBIData {

            var data: SynopticPanelBySQLBIData = SynopticPanelBySQLBI.getDefaultData();

            if (dataView.categorical) {

                var defaultDataPointColor = undefined;

                var dataViewMetadata = dataView.metadata;
                if (dataViewMetadata) {
                    var objects: DataViewObjects = dataViewMetadata.objects;

                    if (objects) {

                        data.defaultDataPointColor = DataViewObjects.getFillColor(objects, synopticPanelProps.dataPoint.defaultColor, colors.getColorByIndex(0).value);
 
                        data.showAllDataPoints = DataViewObjects.getValue<boolean>(objects, synopticPanelProps.dataPoint.showAllDataPoints, data.showAllDataPoints);

                        if (!data.showAllDataPoints)
                            defaultDataPointColor = data.defaultDataPointColor;

                        data.dataState1.color = DataViewObjects.getFillColor(objects, synopticPanelProps.dataState1.color, data.dataState1.color);
                        data.dataState1.dataMin = DataViewObjects.getValue<number>(objects, synopticPanelProps.dataState1.dataMin, data.dataState1.dataMin);
                        data.dataState1.dataMax = DataViewObjects.getValue<number>(objects, synopticPanelProps.dataState1.dataMax, data.dataState1.dataMax);

                        data.dataState2.color = DataViewObjects.getFillColor(objects, synopticPanelProps.dataState2.color, data.dataState2.color);
                        data.dataState2.dataMin = DataViewObjects.getValue<number>(objects, synopticPanelProps.dataState2.dataMin, data.dataState2.dataMin);
                        data.dataState2.dataMax = DataViewObjects.getValue<number>(objects, synopticPanelProps.dataState2.dataMax, data.dataState2.dataMax);

                        data.dataState3.color = DataViewObjects.getFillColor(objects, synopticPanelProps.dataState3.color, data.dataState3.color);
                        data.dataState3.dataMin = DataViewObjects.getValue<number>(objects, synopticPanelProps.dataState3.dataMin, data.dataState3.dataMin);
                        data.dataState3.dataMax = DataViewObjects.getValue<number>(objects, synopticPanelProps.dataState3.dataMax, data.dataState3.dataMax);

                        data.saturationState.dataMin = DataViewObjects.getValue<number>(objects, synopticPanelProps.saturationState.dataMin, data.saturationState.dataMin);
                        data.saturationState.dataMax = DataViewObjects.getValue<number>(objects, synopticPanelProps.saturationState.dataMax, data.saturationState.dataMax);
         
                        data.imageData = DataViewObjects.getValue<string>(objects, synopticPanelProps.general.imageData);
    
                        data.areasData = DataViewObjects.getValue<string>(objects, synopticPanelProps.general.areasData);

                        data.showAllAreas = DataViewObjects.getValue<boolean>(objects, synopticPanelProps.general.showAllAreas, data.showAllAreas);
                        data.showAreasLabels = DataViewObjects.getValue<boolean>(objects, synopticPanelProps.general.showAreasLabels, data.showAreasLabels);
                    }
                }

                var converter = new SynopticPanelConversion.SynopticPanelConverter(dataView, colors, defaultDataPointColor);
                converter.convert();

                data.dataPoints = converter.dataPoints;
                data.legendData = converter.legendData;
                data.legendObjectProperties = converter.legendObjectProperties;
                data.dataLabelsSettings = converter.dataLabelsSettings;
                data.maxValue = converter.maxValue;
                data.hasHighlights = converter.hasHighlights;

                if (converter.dataState1Min || converter.dataState1Max) {
                    data.dataState1.dataMin = converter.dataState1Min;
                    data.dataState1.dataMax = converter.dataState1Max;
                    data.dataState1.inBinding = true;
                }
                if (converter.dataState2Min || converter.dataState2Max) {
                    data.dataState2.dataMin = converter.dataState2Min;
                    data.dataState2.dataMax = converter.dataState2Max;
                    data.dataState2.inBinding = true;
                }
                if (converter.dataState3Min || converter.dataState3Max) {
                    data.dataState3.dataMin = converter.dataState3Min;
                    data.dataState3.dataMax = converter.dataState3Max;
                    data.dataState3.inBinding = true;
                }
                if (converter.saturationStateMin || converter.saturationStateMax) {
                    data.saturationState.dataMin = converter.saturationStateMin;
                    data.saturationState.dataMax = converter.saturationStateMax;
                    data.saturationState.inBinding = true;
                }
            } 

            return data;
        }

        public onViewModeChanged(viewMode: ViewMode): void {
            this.inEditingMode = (viewMode === ViewMode.Edit);
            this.setToolbar(this.inEditingMode);
        }

        //Drawing the visual
        public update(options: VisualUpdateOptions) {
            if (!options.dataViews || !options.dataViews[0]) return;

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

            this.renderMap();
            this.setToolbar(this.inEditingMode);
        }

        private renderMap() {
            var self = this;
            var imageData = this.data.imageData;
            if (imageData) {

                if (!this.initialImage) {

                    if (imageData.indexOf('<svg ') >= 0) {
                        //SVG
                        var $temp = $('<div>').append(imageData);
                        var $tempsvg = $temp.find('svg');

                        var w = parseInt($tempsvg.attr('width'), 10);
                        var h = parseInt($tempsvg.attr('height'), 10);
                        if (isNaN(w) || isNaN(h)) {
                            var viewbox = $tempsvg[0].viewBox.baseVal;
                            w = viewbox.width;
                            h = viewbox.height;
                        }
                        this.initialImage = {
                            type: 'svg',
                            width: w,
                            height: h,
                            layers: []
                        };

                        this.clearMap($tempsvg[0]);

                        //Extract areas from SVG
                        var areas = [];
                        this.svg.selectAll('[id]').each(function (d, i) {
                               
                            var el = d3.select(this);
                            if (this.tagName.toLowerCase() === 'g') {
                                if (el.selectAll("[id]")[0].length > 0)
                                    return;
                            }
                            if (el.classed('excluded')) return;

                            var name = self.getSVGName(this);
                            if (name === '') return;

                            self.initialImage.layers.push({
                                id: this.id,
                                style: {
                                    fill: el.style('fill'),
                                    fillopacity: el.style('fill-opacity'),
                                    stroke: el.style('stroke'),
                                    strokeopacity: el.style('stroke-opacity'),
                                    strokewidth: el.style('stroke-width')
                                }
                            });

                            areas.push({
                                'name': name,
                                'elementId': this.id
                            });
                        });

                        this.parsedAreas = areas;
                        this.renderAreas();

                    } else {
                        //Bitmap
                        this.clearMap();

                        $('<img/>').attr('src', imageData).load(function () {
                            self.initialImage = {
                                type: 'bitmap',
                                width: this.width,
                                height: this.height
                            };

                            $(this).remove();

                            self.svg.style('background', 'url(' + imageData + ') no-repeat left top').style('background-size', 'contain');
                            self.renderAreas();
                        });
                    }

                } else {

                    this.renderAreas();
                }

            }
        }

        private getSVGName(dom) {
            var name = '';
            var title = dom.getAttribute('title');
            if (title && title !== '') {
                name = title;
            } else {
                var isText = (dom.tagName.toLowerCase() === 'text');
                var isAutoId = (dom.id.indexOf('XMLID_') === 0);
                if (isAutoId) {
                    if (isText)
                        name = dom.textContent;
                } else {
                    name = dom.id;
                }
            }
            return name.replace(/_/g, ' ');
        }

        private clearMap(append?) {

            if (this.svg)
                this.svg.remove();

            this.svg = d3.select(this.element.get(0))
                .append((append ? function () { return append; } : 'svg'))
                 .classed(SynopticPanelBySQLBI.ClassName, true)
                 .attr({
                    'height': this.currentViewport.height,
                    'width': this.currentViewport.width
                });

            //this.clearCatcher = appendClearCatcher(this.svg);
            this.clearCatcher = this.svg.insert('rect', ':first-child').classed('clearCatcher', true).attr({ width: '100%', height: '100%' });
        }

        private resetAreas() {

            if (this.initialImage.type === 'svg') {

                for (var i = 0; i < this.initialImage.layers.length; i++) {
                    var layer = this.initialImage.layers[i];
                    var el = this.svg.select('#' + layer.id);
                    if (layer && el) {
                        el.style('fill', layer.style.fill);
                        el.style('fill-opacity', layer.style.fillopacity);
                        el.style('stroke', layer.style.stroke);
                        el.style('stroke-opacity', layer.style.strokeopacity);
                        el.style('stroke-width', layer.style.strokewidth);
                    }
                } 
                this.svg.selectAll('.label').remove();
            } else {
                this.svg.selectAll('g.poly').remove();
            }
        }

        private renderAreas() {

            var selectionManager = this.selectionManager;
            var areasData = this.data.areasData;
            if (areasData) {

                this.resetAreas();

                if (!this.parsedAreas) {
                    var json = JSON.parse(areasData);
                    this.parsedAreas = json.areas;
                }
                var areas = this.parsedAreas;

                //Resize points
                var m = Math.min(this.currentViewport.width / this.initialImage.width, this.currentViewport.height / this.initialImage.height);
                var measureFormattersCache = dataLabelUtils.createColumnFormatterCacheManager();
                var minSaturation: number, maxSaturation: number;

                for (var a = 0; a < areas.length; a++) {
                    var area = areas[a];
                    var opacity = SynopticPanelBySQLBI.BaseOpacity;
                    var color = this.data.defaultDataPointColor || this.colors.getColorByIndex(0).value;

                    var found: boolean = false;
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

                                opacity = Math.min(SynopticPanelBySQLBI.BaseOpacity, ((dataPoint.saturationMeasure - minSaturation) / ((maxSaturation - minSaturation) / SynopticPanelBySQLBI.BaseOpacity)));

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

                        var polyRect: SVGRect;

                        var g;
                        if (area.elementId) {

                            g = this.svg.select('#' + area.elementId);

                            g
                                .data([(found ? dataPoint : area.name)])
                                .classed('poly', true)
                                .style('opacity', ColumnUtil.getFillOpacity(dataPoint.selected, dataPoint.highlightRatio > 0, false, this.data.hasHighlights))
                                .style('fill', color)
                                .style('fill-opacity', opacity)
                                .style('stroke', color)
                                .style('stroke-width', (g[0][0].tagName.toLowerCase() === 'text' ? '0' : '2'))
                                .style('stroke-opacity', opacity);

                            polyRect = g[0][0].getBBox();

                        } else {

                            var convertedCoords = $.map(area.coords, function (v, i) {
                                return [[v[0] * m, v[1] * m]];
                            });
                            var points = convertedCoords.join(',');

                            var minX: number = <number>d3.min(convertedCoords, function (d) { return d[0]; });
                            var maxX: number = <number>d3.max(convertedCoords, function (d) { return d[0]; });
                            var minY: number = <number>d3.min(convertedCoords, function (d) { return d[1]; });
                            var maxY: number = <number>d3.max(convertedCoords, function (d) { return d[1]; });

                            polyRect = { width: (maxX - minX), height: (maxY - minY), x: minX, y: minY };

                            g = this.svg
                                .append('g')
                                .data([(found ? dataPoint : area.name)])
                                .classed('poly', true);

                            //Highlight
                            g.style('opacity', ColumnUtil.getFillOpacity(dataPoint.selected, dataPoint.highlightRatio > 0, false, this.data.hasHighlights));

                            g
                                .append('polygon')
                                .attr('points', points)
                                .style('fill', color)
                                .style('fill-opacity', opacity)
                                .style('stroke', color)
                                .style('stroke-width', '2')
                                .style('stroke-opacity', opacity);
                        }

                        if (found)
                            TooltipManager.addTooltip(g, (tooltipEvent: TooltipEvent) =>  tooltipEvent.data.tooltipInfo);
                        else
                            TooltipManager.addTooltip(g, (tooltipEvent: TooltipEvent) => [{ displayName: 'Area', value: tooltipEvent.data }]);

                        if (this.data.showAreasLabels || (found && (this.data.dataLabelsSettings.show || this.data.dataLabelsSettings.showCategory))) {

                            var padding: number = 6;
      
                            var labelText;
                            var labelItalic = false;
                            var wrap = false;

                            if (this.data.showAreasLabels) {

                                labelText = area.name; //dataLabelUtils.getLabelFormattedText(area.name, polyWidth - (padding * 2));
                                labelItalic = true;
                                wrap = true;
                            }

                            if (found && (this.data.dataLabelsSettings.show || this.data.dataLabelsSettings.showCategory)) {
                                labelItalic = false;

                                if (this.data.dataLabelsSettings.show) {
                                    var alternativeScale: number = (this.data.dataLabelsSettings.displayUnits === 0 ?
                                        <number>d3.max(this.data.dataPoints, d => Math.abs(d.measure)) : null);

                                    var measureFormatter = measureFormattersCache.getOrCreate(dataPoint.labelFormatString, this.data.dataLabelsSettings, alternativeScale);

                                    labelText = dataLabelUtils.getLabelFormattedText(dataPoint.measure, polyRect.width - (padding * 2), dataPoint.labelFormatString, measureFormatter);

                                } else {
                                    labelText = dataPoint.label; //dataLabelUtils.getLabelFormattedText(dataPoint.label, polyWidth - (padding * 2));
                                    wrap = true;

                                }
                            }

                            var fontSize = 11;
                            var lines = (wrap ?
                                            this.wrapText(labelText, polyRect.width - (padding * 2), polyRect.height) :
                                            [[labelText, TextMeasurementService.measureSvgTextWidth({ fontFamily: dataLabelUtils.LabelTextProperties.fontFamily, fontSize: fontSize + 'px', text: labelText })]]);
                            
                            if (g[0][0].tagName.toLowerCase() !== 'g')
                                g = this.svg;

                            var l = g
                                .append('text')
                                .attr('fill', this.autoTextColor(color))
                                .attr('y', polyRect.y + ((polyRect.height - (lines.length * (fontSize + 2)) - 2) / 2) - 2)
                                .attr('x', polyRect.x + (polyRect.width / 2))
                                .classed('label', true);

                            if (labelItalic)
                                l.style('font-style', 'italic');

                            for (var i = 0; i < lines.length; i++) {
                                l.append('tspan')
                                    .attr('x', polyRect.x + ((polyRect.width - lines[i][1]) / 2))
                                    .attr('dy', fontSize + 2)
                                    .text(lines[i][0]);
                            }
                        }
                    }
                        
                }

                if (this.isInteractive) {
                    var self = this;
                    this.svg.selectAll('.poly')
                        .on('click', function (d) {

                            selectionManager.select(d.identity).then((ids) => {
                                if (ids.length > 0) {
                                    self.svg.selectAll('.poly').style('opacity', 0.4);
                                    d3.select(this).style('opacity', 1);
                                } else {
                                    self.svg.selectAll('.poly').style('opacity', 1);
                                }

                            });

                            d3.event.stopPropagation();
                        });
                } else if (this.interactivityService) {

                    var behaviorOptions: SynopticPanelBySQLBIBehaviorOptions = {
                        polygons: this.svg.selectAll('.poly'),
                        clearCatcher: this.clearCatcher,
                        hasHighlights: this.data.hasHighlights,
                    };

                    this.interactivityService.bind(this.data.dataPoints, this.behavior, behaviorOptions);
                }

                this.renderLegend();
            }
        }

        private autoTextColor(backColor): string {

            return this.shadeBlend(-0.6, backColor, null);

            // NOTE: Consider jsCommon.Color.parseColorString()
            /*var hexToRGB = function (hex) {
                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            };

            var rgbColor = hexToRGB(backColor);
            var o = Math.round(((rgbColor.r * 299) + (rgbColor.g * 587) + (rgbColor.b * 114)) / 1000);
            return (o > 125 ? 'black' : 'white');*/
        }

       //Version 2 Universal - http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
       private shadeBlend(p, c0, c1) {
           var n = p < 0 ? p * -1 : p, u = Math.round, w = parseInt;
           if (c0.length > 7) {
                var f = c0.split(","), t = (c1 ? c1 : p < 0 ? "rgb(0,0,0)" : "rgb(255,255,255)").split(","), R = w(f[0].slice(4)), G = w(f[1]), B = w(f[2]);
                return "rgb(" + (u((w(t[0].slice(4)) - R) * n) + R) + "," + (u((w(t[1]) - G) * n) + G) + "," + (u((w(t[2]) - B) * n) + B) + ")";
            } else {
                var f1 = w(c0.slice(1), 16), t1 = w((c1 ? c1 : p < 0 ? "#000000" : "#FFFFFF").slice(1), 16), R1 = f1 >> 16, G1 = f1 >> 8 & 0x00FF, B1 = f1 & 0x0000FF;
                return "#" + (0x1000000 + (u(((t1 >> 16) - R1) * n) + R1) * 0x10000 + (u(((t1 >> 8 & 0x00FF) - G1) * n) + G1) * 0x100 + (u(((t1 & 0x0000FF) - B1) * n) + B1)).toString(16).slice(1);
            }
        }

        private wrapText(text, width, height): any {

            var fontSize = 11;
            var lines = [];
            var words = text.split(' ');
            
            var lastLine = ["", 0];
            for (var n = 0; n < words.length; n++) {
                var word = words[n] + " ";
                var wordWidth = TextMeasurementService.measureSvgTextWidth({ fontFamily: dataLabelUtils.LabelTextProperties.fontFamily, fontSize: fontSize + 'px', text: word });

                var testLine = lastLine[0] + word;
                var testWidth = parseInt(lastLine[1], 10) + wordWidth;
                if (testWidth > width) {
                    lines.push(lastLine);
                    lastLine = [word, wordWidth];
                } else {
                    lastLine = [testLine, testWidth];
                }
            }

            if (lastLine[1] > width) {
                lastLine[0] = dataLabelUtils.getLabelFormattedText(lastLine[0], width);
                lastLine[1] = width;
            }
            lines.push(lastLine);

            if ((lines.length * (fontSize + 2) - 2) > height)
                lines = [[dataLabelUtils.getLabelFormattedText(text, width), width]];
   
            return lines;
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

        private persistData(): void {
            var properties: any = {};
            if (this.data.imageData != null)
                properties.imageData = powerbi.data.SQExprBuilder.text(this.data.imageData);

            if (this.data.areasData != null)
                properties.areasData = powerbi.data.SQExprBuilder.text(this.data.areasData);
            else
                properties.areasData = '';

            this.host.persistProperties({
				merge: [{
	                objectName: 'general',
	                selector: null,
	                properties: properties,
	            }]
			});
        }

        //Make visual properties available in the property pane in Power BI
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var enumeration = new ObjectEnumerationBuilder();
            
            if (!this.data)
                this.data = SynopticPanelBySQLBI.getDefaultData();

            switch (options.objectName) {
                case 'general':
                    enumeration.pushInstance({
                        objectName: 'general',
                        selector: null,
                        properties: {
                            showAllAreas: this.data.showAllAreas,
                            showAreasLabels: (this.data.showAllAreas ?  this.data.showAreasLabels : false)
                        },
                    });

                    /*for (var i = 0; i < this.data.dataPoints.length; i++) {
                        var dataPoint = this.data.dataPoints[i];
                        enumeration.pushInstance({
                            objectName: 'general',
                            displayName: dataPoint.label,
                            selector: ColorHelper.normalizeSelector(dataPoint.identity.getSelector()),
                            properties: {
                                fill: { solid: { color: dataPoint.color } }
                            },
                        });
                    }*/

                    break;

                case 'legend':
                    var legendObjectProperties: DataViewObjects = { legend: this.data.legendObjectProperties };
                        
                    var show = DataViewObjects.getValue(legendObjectProperties, synopticPanelProps.legend.show, this.legend.isVisible());
                    var showTitle = DataViewObjects.getValue(legendObjectProperties, synopticPanelProps.legend.showTitle, true);
                    var titleText = DataViewObjects.getValue(legendObjectProperties, synopticPanelProps.legend.titleText, this.data.legendData.title);

                    enumeration.pushInstance({
                        selector: null,
                        objectName: 'legend',
                        properties: {
                            show: show,
                            position: LegendPosition[this.legend.getOrientation()],
                            showTitle: showTitle,
                            titleText: titleText
                        }
                    });
                    break;

                case 'dataPoint':
                    enumeration.pushInstance({
                        objectName: 'dataPoint',
                        selector: null,
                        properties: {
                            defaultColor: { solid: { color: this.data.defaultDataPointColor || this.colors.getColorByIndex(0).value } }
                        },
                    });

                    enumeration.pushInstance({
                        objectName: 'dataPoint',
                        selector: null,
                        properties: {
                            showAllDataPoints: this.data.showAllDataPoints
                        },
                    });

                    for (var i = 0; i < this.data.dataPoints.length; i++) {
                        var dataPoint = this.data.dataPoints[i];
                        enumeration.pushInstance({
                            objectName: 'dataPoint',
                            displayName: dataPoint.label,
                            selector: ColorHelper.normalizeSelector(dataPoint.identity.getSelector()),
                            properties: {
                                fill: { solid: { color: dataPoint.color } }
                            },
                        });
                    }
                    break;

                case 'dataLabels':
                    var labelSettingsOptions = {
                        enumeration: enumeration,
                        dataLabelsSettings: this.data.dataLabelsSettings,
                        show: true,
                        displayUnits: true,
                        precision: true,
                        position: false,
                    };
                    dataLabelUtils.enumerateDataLabels(labelSettingsOptions);
                    break;

                case 'categoryLabels':
                    dataLabelUtils.enumerateCategoryLabels(enumeration, this.data.dataLabelsSettings, false, true);
                    break;

                case 'dataState1':
                    enumeration.pushInstance({
                        objectName: 'dataState1',
                        selector: null,
                        properties: {
                            dataMin: this.data.dataState1.dataMin + (this.data.dataState1.inBinding ? ' (bound)' : ''),
                            dataMax: this.data.dataState1.dataMax + (this.data.dataState1.inBinding ? ' (bound)' : ''),
                            color: this.data.dataState1.color,
                        },
                    });
                    break;

                case 'dataState2':
                    enumeration.pushInstance({
                        objectName: 'dataState2',
                        selector: null,
                        properties: {
                            dataMin: this.data.dataState2.dataMin + (this.data.dataState2.inBinding ? ' (bound)' : ''),
                            dataMax: this.data.dataState2.dataMax + (this.data.dataState2.inBinding ? ' (bound)' : ''),
                            color: this.data.dataState2.color,
                        },
                    });
                    break;

                case 'dataState3':
                    enumeration.pushInstance({
                        objectName: 'dataState3',
                        selector: null,
                        properties: {
                            dataMin: this.data.dataState3.dataMin + (this.data.dataState3.inBinding ? ' (bound)' : ''),
                            dataMax: this.data.dataState3.dataMax + (this.data.dataState3.inBinding ? ' (bound)' : ''),
                            color: this.data.dataState3.color,
                        },
                    });
                    break;

                case 'saturationState':
                    enumeration.pushInstance({
                        objectName: 'saturationState',
                        selector: null,
                        properties: {
                            dataMin: this.data.saturationState.dataMin + (this.data.saturationState.inBinding ? ' (bound)' : ''),
                            dataMax: this.data.saturationState.dataMax + (this.data.saturationState.inBinding ? ' (bound)' : ''),
                        },
                    });
                    break;
            }

            return enumeration.complete();
        }

        //Free up resources
        public destroy(): void {
            this.svg = null;
            this.setToolbar(false);
        }
    }

    //Converter
    module SynopticPanelConversion {

        interface ConvertedDataPoint {
            identity?: SelectionId;
            measureFormat?: string;
            measureValue?: MeasureAndValue;
            highlightMeasureValue?: MeasureAndValue;
            index?: number;
            label?: any;
            categoryLabel?: string;
            color?: string;
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
            private forcedColor: string;
            private categoryFormatString: string;

            public hasHighlights: boolean;
            public dataPoints: SynopticPanelDataPoint[];
            public legendData: LegendData;
            public dataLabelsSettings: VisualDataLabelsSettings;
            public legendObjectProperties: DataViewObject;
            public maxValue: number;

            public dataState1Min: number;
            public dataState1Max: number;
            public dataState2Min: number;
            public dataState2Max: number;
            public dataState3Min: number;
            public dataState3Max: number;
            public saturationStateMin: number;
            public saturationStateMax: number;

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

                if (defaultDataPointColor)
                    this.forcedColor = defaultDataPointColor;
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
                    var color = (this.forcedColor ? this.forcedColor : this.colorHelper.getColorForSeriesValue(thisCategoryObjects, this.categoryColumnRef, categoryValue));
                    var categoryLabel = valueFormatter.format(categoryValue, this.categoryFormatString);

                    var dataPoint: ConvertedDataPoint = {};

                    for (var seriesIndex = 0; seriesIndex < this.seriesCount; seriesIndex++) {
                        var seriesData = dataViewCategorical.values[seriesIndex];

                        if (seriesData.values[categoryIndex]) {

                            if (!seriesData.source.roles || seriesData.source.roles['Y']) {

                                if (dataPoint && dataPoint.identity) {
                                    dataPoints.push(dataPoint);
                                    dataPoint = {};
                                }

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

                                dataPoint.identity = identity;
                                dataPoint.measureFormat = valueFormatter.getFormatString(seriesData.source, formatStringProp, true);
                                dataPoint.measureValue = <MeasureAndValue> {
                                    measure: nonHighlight,
                                    value: Math.abs(nonHighlight),
                                };
                                dataPoint.highlightMeasureValue = <MeasureAndValue> {
                                    measure: highlight,
                                    value: Math.abs(highlight),
                                };
                                dataPoint.index = categoryIndex;
                                dataPoint.label = label;
                                dataPoint.categoryLabel = categoryLabel;
                                dataPoint.color = color;
                                dataPoint.seriesIndex = seriesIndex;
                            }

                            //Check if same serie has more roles
                            if (seriesData.source.roles['State']) {
                                dataPoint.stateMeasure = seriesData.values[categoryIndex];
                            } else if (seriesData.source.roles['Saturation']) {
                                dataPoint.saturationMeasure = seriesData.values[categoryIndex];
                            }

                            if (seriesData.source.roles['State1Min']) {
                                this.dataState1Min = seriesData.values[categoryIndex];
                            } else if (seriesData.source.roles['State1Max']) {
                                this.dataState1Max = seriesData.values[categoryIndex];

                            } else if (seriesData.source.roles['State2Min']) {
                                this.dataState2Min = seriesData.values[categoryIndex];
                            } else if (seriesData.source.roles['State2Max']) {
                                this.dataState2Max = seriesData.values[categoryIndex];

                            } else if (seriesData.source.roles['State3Min']) {
                                this.dataState3Min = seriesData.values[categoryIndex];
                            } else if (seriesData.source.roles['State3Max']) {
                                this.dataState3Max = seriesData.values[categoryIndex];

                            } else if (seriesData.source.roles['SaturationMin']) {
                                this.saturationStateMin = seriesData.values[categoryIndex];
                            } else if (seriesData.source.roles['SaturationMax']) {
                                this.saturationStateMax = seriesData.values[categoryIndex];
                            }
                        
                        }

                    }

                    if (dataPoint && dataPoint.identity) dataPoints.push(dataPoint);

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
