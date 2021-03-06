﻿/*
 *  Synoptic Panel by SQLBI
 *  v1.2.7
 *  The Synoptic Panel connects areas in a picture with attributes in the data model, coloring each area with a state (red/yellow green) or with a saturation of a color related to the value of a measure. Starting from any image, you draw custom areas using https://synoptic.design, which generates a SVG file you import in the Synoptic Panel. You can visualize data over a map, a planimetry, a diagram, a flow chart.
 * 
 *  Contact info@sqlbi.com
 *  Support URL http://www.sqlbi.com/tv/synoptic-panel-for-power-bi/
 *  Github URL https://github.com/danieleperilli/PowerBI-visuals/blob/master/src/Clients/Visuals/visuals/synopticPanelBySQLBI.ts
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
        mapMeasure?: string;
    }

    export interface SynopticPanelBySQLBIData {
        dataPoints: SynopticPanelDataPoint[];
        legendData: LegendData;
        legendObjectProperties?: DataViewObject;
        maxValue?: number;
        hasHighlights: boolean;
        dataLabelsSettings: VisualDataLabelsSettings;
        boundMaps: any[];
        imageData?: string;

        matched?: SynopticPanelBySQLBIAreas;
        unmatched?: SynopticPanelBySQLBIAreas;

        dataState1?: SynopticPanelBySQLBIState;
        dataState2?: SynopticPanelBySQLBIState;
        dataState3?: SynopticPanelBySQLBIState;
        saturationState?: SynopticPanelBySQLBIState;
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
                if (typeof d === 'object')
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
        },
        dataAreas: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'dataAreas', propertyName: 'show' },
            colorize: <DataViewObjectPropertyIdentifier>{ objectName: 'dataAreas', propertyName: 'colorize' },
            fill: <DataViewObjectPropertyIdentifier>{ objectName: 'dataAreas', propertyName: 'fill' },
        },
        dataPoint: {
            colorize: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'colorize' },
            defaultColor: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'defaultColor' },
            fill: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'fill' },
            showAllDataPoints: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'showAllDataPoints' },
        },
        legend: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'show' },
            position: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'position' },
            showTitle: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'showTitle' },
            titleText: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'titleText' },
            labelColor: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'labelColor' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'fontSize' },
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

    export interface SynopticPanelBySQLBIAreas {
        show: boolean;
        colorize: boolean;
        color?: string;
        showMultipleColors?: boolean;
    }

    export interface SynopticPanelImage {
        width: number;
        height: number;
        matched?: SynopticPanelShape[];
        unmatched?: SynopticPanelShape[];
    }

    export interface SynopticPanelShape {
        sel: D3.Selection;
        id?: string;
        style: SynopticPanelShapeStyle;
    }

    export interface SynopticPanelShapeStyle {
        fill?: string;
        fillopacity?: string;
        stroke?: string;
        strokewidth?: string;
        strokeopacity?: string;
        classname?: string;
    }

    //Visual
    export class SynopticPanelBySQLBI implements IVisual {

        //Constants
        private static ClassName = 'synopticPanel';
        private static GalleryURL = 'https://synoptic.design/api/get_posts/';
        private static GalleryFolders = 'https://synoptic.design/gallery-folders/';
        private static DesignerURL = 'https://synoptic.design/';
        private static BaseOpacity = 0.8;

        //Variables
        private svg: D3.Selection;
        private legend: ILegend;
        private element: JQuery;
        private toolbar: JQuery;
        private gallery: JQuery;
        private boundMapsCombo: JQuery;
        private selectedBoundMapIndex: number;
        private lastBoundMap: string;
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
                legendData: { title: '', dataPoints: [], fontSize: SVGLegend.DefaultFontSizeInPt },
                hasHighlights: false,
                dataLabelsSettings: dataLabelUtils.getDefaultLabelSettings(),
                unmatched: { show: true, colorize: false },
                matched: { show: true, colorize: true, showMultipleColors: false, },
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
                boundMaps: []
            };
        }

        public static isValidURL(str): boolean {
            if (typeof str === 'undefined' || !str) return false;

            var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
                '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
                '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
            return pattern.test(str);
        }

        //Capabilities
        public static capabilities: VisualCapabilities = {
            dataRoles: [
                {
                    name: 'Category',
                    kind: VisualDataRoleKind.Grouping,
                    displayName: 'Legend',
                }, {
                    name: 'Series',
                    kind: VisualDataRoleKind.Grouping,
                    displayName: 'Details',
                }, {
                    name: 'Y',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Values',
                }, {
                    name: 'MapSeries',
                    kind: VisualDataRoleKind.Grouping,
                    displayName: 'Maps',
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
                    displayName: 'General',
                    properties: {
                        formatString: {
                            type: { formatting: { formatString: true } },
                        },
                        imageData: {
                            displayName: 'Map data',
                            type: { text: true }
                        },
                    },
                },
                dataAreas: {
                    displayName: 'Unmatched areas',
                    properties: {
                        show: {
                            displayName: 'Show',
                            type: { bool: true }
                        },
                        colorize: {
                            displayName: 'Colorize',
                            type: { bool: true }
                        },
                        fill: {
                            displayName: 'Color',
                            type: { fill: { solid: { color: true } } }
                        },
                    },
                },
                dataPoint: {
                    displayName: 'Matched areas',
                    properties: {
                        colorize: {
                            displayName: 'Colorize',
                            type: { bool: true }
                        },
                        defaultColor: {
                            displayName: 'Single color',
                            type: { fill: { solid: { color: true } } }
                        },
                        showAllDataPoints: {
                            displayName: 'Multiple colors',
                            type: { bool: true }
                        },
                        fill: {
                            displayName: 'Color',
                            type: { fill: { solid: { color: true } } }
                        },
                    }
                },
                saturationState: {
                    displayName: 'Saturation state',
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
                            displayName: 'Color',
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
                            displayName: 'Color',
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
                            displayName: 'Color',
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
                    displayName: 'Labels',
                    properties: {
                        show: {
                            displayName: 'Show',
                            type: { bool: true }
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
                        labelStyle: {
                            displayName: 'Style',
                            type: { enumeration: labelStyle.type }
                        },
                    },
                },
                legend: {
                    displayName: 'Legend',
                    properties: {
                        show: {
                            displayName: 'Show',
                            type: { bool: true }
                        },
                        position: {
                            displayName: 'Position',
                            type: { enumeration: legendPosition.type }
                        },
                        showTitle: {
                            displayName: 'Title',
                            type: { bool: true }
                        },
                        titleText: {
                            displayName: 'Legend name',
                            type: { text: true }
                        },
                        labelColor: {
                            displayName: 'Color',
                            type: { fill: { solid: { color: true } } }
                        },
                        fontSize: {
                            displayName: 'Text size',
                            type: { formatting: { fontSize: true } }
                        }
                    }
                },
            },

            dataViewMappings: [{
                conditions: [
                    { 'Category': { max: 1 }, 'Series': { max: 1 }, 'Y': { max: 1 }, 'MapSeries': { max: 1 }, 'State': { max: 1 }, 'State1Min': { max: 1 }, 'State1Max': { max: 1 }, 'State2Min': { max: 1 }, 'State2Max': { max: 1 }, 'State3Min': { max: 1 }, 'State3Max': { max: 1 }, 'Saturation': { max: 1 }, 'SaturationMin': { max: 1 }, 'SaturationMax': { max: 1 } },
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
                                { bind: { to: 'MapSeries' } },
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
            this.inEditingMode = (this.host.getViewMode() === 1);
            this.interactivityService = createInteractivityService(this.host);
            this.legend = createLegend(this.element, this.isInteractive, this.interactivityService, true);
            this.galleryRetreiving = false;
            this.gallerySubmissions = {};

            var self = this;
            this.element.on('mouseout', function () {
                if (self.toolbar && !self.toolbar.is('.huge')) {
                    if (self.gallery && !self.gallery.is(':visible'))
                        self.toolbar.hide();
                }
            });
            this.element.on('mouseover', function () {
                if (self.toolbar)
                    self.toolbar.show();
            });

            this.data = {
                dataPoints: [],
                legendData: { title: '', dataPoints: [], fontSize: SVGLegend.DefaultFontSizeInPt },
                hasHighlights: false,
                dataLabelsSettings: dataLabelUtils.getDefaultLabelSettings(),
                boundMaps: []
            };

            this.clearMap();
            this.unboundMap();
        }

        public setToolbar(showToolbar) {

            var self = this;
            //var isOnline: boolean = (document.location.href.indexOf("http") > -1);
            var toolbar: JQuery;
            var gallery: JQuery;
            var loader: string = '<div class="powerbi-spinner"><div class="modernCirleSpinner ng-scope"><i class="glyphicon pbi-spinner ng-scope"></i></div></div>';

            var toggleGallery = function (showGallery) {
                if (showGallery) {
                    toolbar.find('.gallery').addClass('active');

                    self.gallery.height(self.element.height());

                    if (!self.galleryHTML) {

                        self.gallery.show();

                        if (!self.galleryRetreiving) {
                            self.galleryRetreiving = true;
                            self.gallery.html(loader);

                            $.getJSON(SynopticPanelBySQLBI.GalleryFolders, function (d) {
                                if (self.galleryRetreiving) {

                                    var html = '';

                                    html += '<div class="folders">';
                                    for (var i = 0; i < d.folders.length; i++) {
                                        var folder = d.folders[i];
                                        html += '<a href="#" data-folder="' + folder.id + '"' + (i == 0 ? ' class="active"' : '') + '>' + folder.name + '</a> &nbsp; ';
                                    }
                                    html += '</div>';

                                    $.getJSON(SynopticPanelBySQLBI.GalleryURL, function (d) {
                                        if (self.galleryRetreiving) {
                                            if (d.status === 'ok') {
                                                self.gallerySubmissions = {};
                                                html += '<ul style="height:' + (self.gallery.height() - 60) + 'px">';
                                                for (var i = 0; i < d.posts.length; i++) {
                                                    var post = d.posts[i];
                                                    if (post.attachments.length > 0) {
                                                        var title = post.title_plain;
                                                        var thumb_url = post.attachments[0].url.replace('http:', 'https:');
                                                        var folder = post.custom_fields.gallery_folder[0];
                                                        var author_email = post.custom_fields.gallery_author_email[0];
                                                        var author_name = post.custom_fields.gallery_author_name[0];
                                                        var is_verified = post.custom_fields.gallery_verified[0];
                                                        var author = (is_verified ? author_name + ' (' + author_email + ')' : (author_name === '' ? 'Anonymous' : author_name + ' (not verified)'));
                                                        var content = $("<div/>").html(post.content).text();
                                                        var alt = title + ' \n' + content + ' \nby ' + author;

                                                        html += '<li class="folder' + folder + '"';
                                                        if (folder != 0) html += ' style="display:none"';
                                                        html += '><a href="#" id= "s_' + post.id + '" title= "' + alt + '"><div class="thumbnail_container"><div class="thumbnail" style= "background:#fff url(' + thumb_url + ') no-repeat center; background-size:contain"></div></div> <div class="ellipsis">' + title + '</div></a></li>';

                                                        self.gallerySubmissions['s_' + post.id] = {
                                                            map: post.custom_fields.gallery_map[0].replace('http:', 'https:')
                                                        };
                                                    }
                                                }
                                                html += '</ul>';
                                                self.gallery.html(html);
                                                self.galleryHTML = html;
                                            }
                                            self.galleryRetreiving = false;
                                        }
                                    });
                                }
                            });
                        }

                    } else {
                        self.gallery.html(self.galleryHTML);
                        self.gallery.find('ul').height(self.gallery.height() - 60);
                        self.gallery.show();
                    }

                } else {
                    self.gallery.css('opacity', 1).hide();
                    toolbar.find('.gallery').removeClass('active');
                }
            };

            if (this.toolbar) this.toolbar.remove();
            if (this.gallery) this.gallery.remove();

            if (showToolbar) {
                if (this.data.boundMaps.length > 0) {
                    showToolbar = false;
                }
            }

            if (showToolbar) {

                var mapButton = '<span><button class="fileChoose mapChoose" title="Choose a local map file"><svg viewBox="0 0 15 12" width="25" height="20"><g><path fill="#000000" d="M4.51,3c-0.222,0 -0.394,0.069 -0.543,0.217c-0.148,0.148 -0.217,0.321 -0.217,0.544c0,0.208 0.069,0.374 0.217,0.521c0.287,0.288 0.759,0.308 1.066,0c0.149,-0.147 0.217,-0.313 0.217,-0.521c0,-0.223 -0.068,-0.396 -0.217,-0.543c-0.148,-0.149 -0.315,-0.218 -0.523,-0.218M4.51,5.25c-0.422,0 -0.783,-0.147 -1.073,-0.437c-0.289,-0.289 -0.437,-0.643 -0.437,-1.052c0,-0.423 0.148,-0.785 0.438,-1.075c0.568,-0.569 1.534,-0.589 2.125,0c0.29,0.291 0.437,0.652 0.437,1.075c0,0.408 -0.147,0.762 -0.437,1.052c-0.29,0.29 -0.644,0.437 -1.053,0.437M3.75,9l7.5,0l0,-2.084l-2.323,-2.221l-2.351,3.296l-1.283,-0.985l-1.543,1.853l0,0.141ZM12,9.75l-9,0l0,-1.163l2.177,-2.615l1.239,0.951l2.402,-3.368l3.182,3.041l0,3.154ZM0.75,11.25l13.5,0l0,-10.5l-13.5,0l0,10.5ZM15,12l-15,0l0,-12l15,0l0,12Z"/></g></svg> SELECT MAP</button><input type="file" class="file" accept="image/*"></span> ';

                var smallMapButton = '<span><button class="fileChoose mapChoose" title="Select Map"><svg viewBox="0 0 15 12" width="20" height="16"><g><path fill="#797979" d="M4.51,3c-0.222,0 -0.394,0.069 -0.543,0.217c-0.148,0.148 -0.217,0.321 -0.217,0.544c0,0.208 0.069,0.374 0.217,0.521c0.287,0.288 0.759,0.308 1.066,0c0.149,-0.147 0.217,-0.313 0.217,-0.521c0,-0.223 -0.068,-0.396 -0.217,-0.543c-0.148,-0.149 -0.315,-0.218 -0.523,-0.218M4.51,5.25c-0.422,0 -0.783,-0.147 -1.073,-0.437c-0.289,-0.289 -0.437,-0.643 -0.437,-1.052c0,-0.423 0.148,-0.785 0.438,-1.075c0.568,-0.569 1.534,-0.589 2.125,0c0.29,0.291 0.437,0.652 0.437,1.075c0,0.408 -0.147,0.762 -0.437,1.052c-0.29,0.29 -0.644,0.437 -1.053,0.437M3.75,9l7.5,0l0,-2.084l-2.323,-2.221l-2.351,3.296l-1.283,-0.985l-1.543,1.853l0,0.141ZM12,9.75l-9,0l0,-1.163l2.177,-2.615l1.239,0.951l2.402,-3.368l3.182,3.041l0,3.154ZM0.75,11.25l13.5,0l0,-10.5l-13.5,0l0,10.5ZM15,12l-15,0l0,-12l15,0l0,12Z"/></g></svg></button><input type="file" class="file" accept="image/*"></span>';

                var galleryButton = '<span><button class="gallery" title="Choose an existing public map/areas"><svg viewBox="0 0 15 12" width="25" height="20"><g><path fill="#000000" d="M4.51,5.25c-0.222,0 -0.394,0.069 -0.543,0.217c-0.148,0.148 -0.217,0.321 -0.217,0.543c0,0.209 0.069,0.375 0.217,0.523c0.288,0.287 0.759,0.307 1.066,0c0.149,-0.148 0.217,-0.314 0.217,-0.523c0,-0.222 -0.068,-0.395 -0.217,-0.542c-0.148,-0.149 -0.315,-0.218 -0.523,-0.218M4.51,7.5c-0.422,0 -0.783,-0.147 -1.073,-0.437c-0.289,-0.289 -0.437,-0.643 -0.437,-1.053c0,-0.422 0.148,-0.784 0.438,-1.074c0.568,-0.569 1.534,-0.589 2.125,0c0.29,0.291 0.437,0.652 0.437,1.074c0,0.409 -0.147,0.763 -0.437,1.053c-0.29,0.29 -0.644,0.437 -1.053,0.437M6.701,9l4.549,0l0,-1.353l-1.574,-1.774l-1.681,2.678l-0.788,-0.594l-0.145,0.501l-0.361,0.542ZM12,9.75l-6.701,0l1.102,-1.653l0.347,-1.426l1.047,0.789l1.776,-2.833l2.429,2.735l0,2.388ZM0.75,11.25l13.5,0l0,-7.5l-13.5,0l0,7.5ZM15,12l-15,0l0,-9l15,0l0,9Z"/><rect x="1.5" y="1.5" width="12" height="0.75" fill="#000000"/><rect x="3.75" y="0" width="7.5" height="0.75" fill="#000000"/></g></svg> GALLERY</button></span> ';

                var smallGalleryButton = '<span><button class="gallery" title="Gallery"><svg viewBox="0 0 15 12" width="20" height="16"><g><path fill="#797979" d="M4.51,5.25c-0.222,0 -0.394,0.069 -0.543,0.217c-0.148,0.148 -0.217,0.321 -0.217,0.543c0,0.209 0.069,0.375 0.217,0.523c0.288,0.287 0.759,0.307 1.066,0c0.149,-0.148 0.217,-0.314 0.217,-0.523c0,-0.222 -0.068,-0.395 -0.217,-0.542c-0.148,-0.149 -0.315,-0.218 -0.523,-0.218M4.51,7.5c-0.422,0 -0.783,-0.147 -1.073,-0.437c-0.289,-0.289 -0.437,-0.643 -0.437,-1.053c0,-0.422 0.148,-0.784 0.438,-1.074c0.568,-0.569 1.534,-0.589 2.125,0c0.29,0.291 0.437,0.652 0.437,1.074c0,0.409 -0.147,0.763 -0.437,1.053c-0.29,0.29 -0.644,0.437 -1.053,0.437M6.701,9l4.549,0l0,-1.353l-1.574,-1.774l-1.681,2.678l-0.788,-0.594l-0.145,0.501l-0.361,0.542ZM12,9.75l-6.701,0l1.102,-1.653l0.347,-1.426l1.047,0.789l1.776,-2.833l2.429,2.735l0,2.388ZM0.75,11.25l13.5,0l0,-7.5l-13.5,0l0,7.5ZM15,12l-15,0l0,-9l15,0l0,9Z"/><rect x="1.5" y="1.5" width="12" height="0.75" fill="#797979"/><rect x="3.75" y="0" width="7.5" height="0.75" fill="#797979"/></g></svg></button></span>';


                if (this.data.imageData) {
                    //Small buttons
                    toolbar = $('<div class="synopticToolbar unselectable" style="display:none">' + smallMapButton + smallGalleryButton + '</div>');
                } else {
                    //Large buttons
                    toolbar = $('<div class="synopticToolbar huge unselectable">' + mapButton + '<br>' + galleryButton + '<br><div class="designer">Design your maps at<br><a href="' + SynopticPanelBySQLBI.DesignerURL + '?utm_source=powerbi&amp;utm_medium=online&amp;utm_campaign=' + SynopticPanelBySQLBI.ClassName + '">' + SynopticPanelBySQLBI.DesignerURL + '</a></div></div>');
                }

                toolbar.find('.fileChoose').on('click', function (e) {
                    e.preventDefault();
                    toggleGallery(false);
                    $(this).parent().find('.file').trigger('click');
                });
                toolbar.find('.file').on('click', function () {
                    this.value = null;
                });
                toolbar.find('.file').on('change', function () {
                    if (this.files && this.files[0]) {
                        var file = this.files[0];
                        var fr = new FileReader();
                        if (file.type.indexOf('image/svg') == -1) {
                            alert('The Synoptic Panel doesn\'t support bitmap images anymore, but SVG files.\n\nYou can create an SVG from your bitmaps using Synoptic Designer at https://synoptic.design.');
                            return;
                        }

                        fr.readAsText(file);
                        fr.onload = function () {
                            self.unboundMap();

                            self.initialImage = null;
                            self.parsedAreas = null;
                            self.data.imageData = fr.result;

                            self.persistData();
                            self.renderMap();
                        };
                    }
                });
                /*toolbar.find('.designer').on('click', function (e) {
                    e.preventDefault();
                    toggleGallery(false);
                    window.open(SynopticPanelBySQLBI.DesignerURL + '?utm_source=powerbi&amp;utm_medium=online&amp;utm_campaign=' + SynopticPanelBySQLBI.ClassName);
                });*/

                toolbar.find('.gallery').on('click', function (e) {
                    e.preventDefault();
                    toggleGallery(!$(this).hasClass('active'));
                });

                this.toolbar = toolbar;
                this.element.append(toolbar);

                gallery = $('<div class="gallery-list"></div>');
                if (!this.data.imageData) gallery.addClass('huge');

                gallery.on('click', '.folders a', function (e) {
                    e.preventDefault();

                    var folder = $(this).data('folder');
                    gallery.find('li').not('.folder' + folder).hide();
                    gallery.find('li.folder' + folder).show();
                    gallery.find('.folders a').not(this).removeClass('active');
                    $(this).addClass('active');

                });

                gallery.on('click', 'ul a', function (e) {
                    e.preventDefault();

                    if ((!self.data.imageData) || confirm('The current map will be changed. \nAre you sure to continue?')) {

                        var submission = self.gallerySubmissions[$(this).attr('id')];

                        self.initialImage = null;
                        self.parsedAreas = null;
                        self.data.imageData = submission.map;
                        self.unboundMap();

                        self.persistData();
                        self.renderMap();
                        toggleGallery(false);

                    }

                });

                this.gallery = gallery;
                this.element.append(gallery);

                //this.host.setToolbar(toolbar);

            } else {
                
                //this.host.setToolbar(null);
            }

            this.setBoundMapsCombo();
        }

        private setBoundMapsCombo() {
            var self = this;
            if (this.boundMapsCombo) this.boundMapsCombo.remove();

            if (this.data.boundMaps.length > 1) {
                var comboHTML = '<div class="synopticCombo" drag-resize-disabled="true"><select>';
                for (var ma = 0; ma < this.data.boundMaps.length; ma++) {
                    var map = this.data.boundMaps[ma];
                    var name = map.split(/[\\/.]/).slice(-2, -1);
                    var mapName = name[0].replace('_', ' ');
                    comboHTML += '<option value="' + ma + '"';
                    if (this.selectedBoundMapIndex === ma) comboHTML += ' selected';
                    comboHTML += '>' + mapName + '</option>';
                }
                comboHTML += '</select></div>';
                this.boundMapsCombo = $(comboHTML).appendTo(this.element);
                this.boundMapsCombo.find('select').on('change', function () {

                    var mapIndex = parseInt($(this).val(), 10);
                    self.renderBoundMap(mapIndex);
                });
            }
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

                        data.matched.colorize = DataViewObjects.getValue<boolean>(objects, synopticPanelProps.dataPoint.colorize, data.matched.colorize);

                        data.matched.color = DataViewObjects.getFillColor(objects, synopticPanelProps.dataPoint.defaultColor, data.matched.color || colors.getColorByIndex(0).value);

                        data.matched.showMultipleColors = DataViewObjects.getValue<boolean>(objects, synopticPanelProps.dataPoint.showAllDataPoints, data.matched.showMultipleColors);

                        if (!data.matched.showMultipleColors)
                            defaultDataPointColor = data.matched.color;

                        data.unmatched.show = DataViewObjects.getValue<boolean>(objects, synopticPanelProps.dataAreas.show, data.unmatched.show);

                        data.unmatched.colorize = DataViewObjects.getValue<boolean>(objects, synopticPanelProps.dataAreas.colorize, data.unmatched.colorize);

                        data.unmatched.color = DataViewObjects.getFillColor(objects, synopticPanelProps.dataAreas.fill, data.unmatched.color || colors.getColorByIndex(0).value);

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
                    }
                }

                var converter = new SynopticPanelConversion.SynopticPanelConverter(dataView, colors, defaultDataPointColor);
                converter.convert();

                data.boundMaps = converter.boundMaps;
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
            this.inEditingMode = (viewMode === 1);
            this.setToolbar(this.inEditingMode);
        }

        //Drawing the visual
        public update(options: VisualUpdateOptions) {
            if (!options.dataViews || !options.dataViews[0]) return;

            this.inEditingMode = (this.host.getViewMode() === 1);

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

            if (this.data.boundMaps.length > 0) {
                if (this.selectedBoundMapIndex >= this.data.boundMaps.length)
                    this.selectedBoundMapIndex = -1;

                var lastMap = '';
                var changed = false;
                if (this.selectedBoundMapIndex === -1) {
                    lastMap = this.data.boundMaps[0];
                    changed = true;
                } else {
                    lastMap = this.data.boundMaps[this.selectedBoundMapIndex];
                    changed = (this.lastBoundMap !== lastMap);
                }

                if (changed) {
                    this.lastBoundMap = lastMap;
                    this.renderBoundMap();
                    this.setToolbar(this.inEditingMode);
                    return;
                }
            } else {
                if (this.lastBoundMap !== '') {
                    this.clearBoundMap();
                    this.setToolbar(this.inEditingMode);
                    return;
                }
            }

            this.renderMap();
            this.setToolbar(this.inEditingMode);
        }

        private unboundMap() {
            this.selectedBoundMapIndex = -1;
            this.lastBoundMap = '';
        }

        private clearBoundMap() {
            this.unboundMap();
            this.renderBoundMap(-1);
            this.clearMap();
        }

        private renderBoundMap(index?: number) {

            var mapIndex;
            if (typeof index !== 'undefined') {
                mapIndex = index;
            } else {
                mapIndex = 0;
                if (this.data.imageData) {
                    for (var i = 0; i < this.data.boundMaps.length; i++) {
                        if (this.data.imageData === this.data.boundMaps[i]) {
                            mapIndex = i;
                            break;
                        }
                    }
                }
            }
            this.selectedBoundMapIndex = mapIndex;

            this.initialImage = null;
            this.parsedAreas = null;
            if (mapIndex === -1) {
                this.data.imageData = null;
            } else {
                var selectedMap = this.data.boundMaps[mapIndex];
                this.data.imageData = selectedMap;
            }
            this.persistData();
            this.renderMap();
        }

        private renderMap() {
            var self = this;
            var imageData = this.data.imageData;
            if (imageData) {

                if (!this.initialImage) {
                    var parseSVG = function (xmlData) {

                        var $temp = $('<div>').append(xmlData);
                        var $tempsvg = $temp.find('svg');
                        var generatedByOurDesigner = $tempsvg.is('.gen-by-synoptic-designer');

                        var w = parseInt($tempsvg.attr('width'), 10);
                        var h = parseInt($tempsvg.attr('height'), 10);
                        if (isNaN(w) || isNaN(h)) {
                            var viewbox = $tempsvg[0].viewBox.baseVal;
                            w = viewbox.width;
                            h = viewbox.height;
                        }
                        self.initialImage = {
                            width: w,
                            height: h,
                            matched: [],
                            unmatched: []
                        };

                        self.clearMap($tempsvg[0]);

                        //Extract areas from SVG
                        var areas = [];
                        self.svg.selectAll('[id]').each(function (d, i) {

                            var el = d3.select(this);
                            if (!self.isRecognizedSVGShape(this.tagName))
                                return;

                            /*if (this.tagName.toLowerCase() === 'g') {
                                if (el.selectAll("[id]")[0].length > 0)
                                    return;
                            }*/
                            if (el.classed('excluded')) return;
                            var title = this.getAttribute('title');
                            var name = self.getSVGName(this);
                            if (name === '' && (!title || title === '')) return;

                            self.initialImage.matched.push({
                                sel: el,
                                id: this.id,
                                style: {
                                    fill: el.style('fill'),
                                    fillopacity: el.style('fill-opacity'),
                                    stroke: el.style('stroke'),
                                    strokeopacity: el.style('stroke-opacity'),
                                    strokewidth: el.style('stroke-width'),
                                    classname: el.attr('class')
                                }
                            });

                            areas.push({
                                'name': name,
                                'title': title,
                                'elementId': this.id
                            });
                        });

                        self.svg.selectAll(':not([id]), .excluded').each(function (d, i) {

                            if (this.tagName.toLowerCase() === 'image') return;

                            var parent = this.parentNode;
                            if (parent.tagName.toLowerCase() !== 'svg') {
                                if (parent.id !== '') return;
                            }

                            var children = this.children;
                            if (!children || children.length == 0) {
                                var el = d3.select(this);
                                if (el.classed('ignored') || el.classed('clearCatcher')) return;

                                self.initialImage.unmatched.push({
                                    sel: el,
                                    style: {
                                        fill: el.style('fill'),
                                        fillopacity: el.style('fill-opacity'),
                                        stroke: el.style('stroke'),
                                        strokeopacity: el.style('stroke-opacity'),
                                        strokewidth: el.style('stroke-width'),
                                        classname: el.attr('class')
                                    }
                                });
                            }
                        });

                        self.parsedAreas = areas;
                        self.renderAreas();
                    };

                    if (this.isSVGFile(imageData)) {
                        $.get(imageData, function (d) {
                            parseSVG(d);
                        }, 'text');

                    } else {
                        parseSVG(imageData);
                    }

                } else {

                    this.renderAreas();
                }

            }
        }

        private isSVGFile(filename) {
            var len = filename.length;
            if (len > 2083) return false;
            return (filename.lastIndexOf('.svg') === (len - 4));
        }

        private isRecognizedSVGShape(tag) {
            var shapes = ['g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline', 'text'];
            return (shapes.indexOf(tag.toLowerCase()) >= 0);
        }

        private getSVGName(dom) {
            var name = '';
            var isText = (dom.tagName.toLowerCase() === 'text');
            var isAutoId = (dom.id.indexOf('XMLID_') === 0);
            if (isAutoId) {
                if (isText)
                    name = dom.textContent;
            } else {
                name = dom.id;
            }
            return name.replace(/_/g, ' ').trim();
        }

        private getLegalId(str) {
            var returnStr = str.replace(/([^A-Za-z0-9[\]{}_.:-])\s?/g, '_');
            if (!isNaN(parseInt(returnStr, 10)))
                returnStr = '_' + returnStr;

            return returnStr;
        }

        private isLegalId(str) {
            var legalStr = this.getLegalId(str);
            return (legalStr === str);
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

            var x = 0;
            var y = 0;
            var viewbox = this.svg[0][0].viewBox.baseVal;
            if (viewbox) {
                x = viewbox.x;
                y = viewbox.y;
            }
            this.clearCatcher = this.svg.insert('rect', ':first-child').classed('clearCatcher', true).attr({ x:x, y:y, width: '100%', height: '100%' });
        }

        private resetAreas() {
            var ar = this.initialImage.matched.concat(this.initialImage.unmatched);
            for (var i = 0; i < ar.length; i++) {
                var shape = ar[i];
                var el = shape.sel;
                if (!el.empty() && !el.classed('ignored')) {
                    el.style('fill', shape.style.fill)
                        .style('fill-opacity', shape.style.fillopacity)
                        .style('stroke', shape.style.stroke)
                        .style('stroke-opacity', shape.style.strokeopacity)
                        .style('stroke-width', shape.style.strokewidth)
                        .attr('class', shape.style.classname)
                        .style('display', '');
                }
            }

            this.svg.selectAll('.label').remove();

        }

        private renderAreas() {

            var self = this;
            var selectionManager = this.selectionManager;

            this.resetAreas();

            var areas = this.parsedAreas;
            if (areas) {

                //Resize points
                var m = Math.min(this.currentViewport.width / this.initialImage.width, this.currentViewport.height / this.initialImage.height);
                var measureFormattersCache = dataLabelUtils.createColumnFormatterCacheManager();
                var minSaturation: number, maxSaturation: number;
                var labelSettings = this.data.dataLabelsSettings;
                var dataPoints = this.data.dataPoints;
                var dataPoint: SynopticPanelDataPoint;

                for (var a = 0; a < areas.length; a++) {
                    var area = areas[a];
                    var opacity = SynopticPanelBySQLBI.BaseOpacity;
                    var color = this.data.unmatched.color;
                    var colorize = this.data.unmatched.colorize;
                    var match: boolean = false;

                    for (var i = 0; i < dataPoints.length; i++) {
                        dataPoint = dataPoints[i];

                        if (this.getLegalId(dataPoint.label.toLowerCase()) === this.getLegalId(area.elementId.toLowerCase()) || this.getLegalId(dataPoint.categoryLabel.toLowerCase()) === this.getLegalId(area.elementId.toLowerCase())) {
                            match = true;
                            color = dataPoint.color;
                            colorize = this.data.matched.colorize;
                            opacity = SynopticPanelBySQLBI.BaseOpacity;

                            if (dataPoint.saturationMeasure) {

                                //Saturation
                                if (!minSaturation || !maxSaturation) {
                                    minSaturation = this.data.saturationState.dataMin;
                                    maxSaturation = this.data.saturationState.dataMax;
                                    if (minSaturation === maxSaturation) {
                                        //Automatic
                                        minSaturation = <number>d3.min(dataPoints, function (d) { return d.saturationMeasure; });
                                        maxSaturation = <number>d3.max(dataPoints, function (d) { return d.saturationMeasure; });
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
                                } /*else {
                                    color = this.data.matched.color;
                                }*/
                            }

                            break;
                        }
                    }


                    if (match || this.data.unmatched.show) {

                        if (!this.isLegalId(area.elementId)) continue;

                        var dynamicOpacity = ColumnUtil.getFillOpacity(dataPoint.selected, dataPoint.highlightRatio > 0, false, this.data.hasHighlights);

                        this.svg.selectAll('#' + area.elementId).each(function (dd, ii) {

                            var g = d3.select(this);
                            var isTextShape = (this.tagName.toLowerCase() === 'text');
                            var isG = (this.tagName.toLowerCase() === 'g');

                            g
                                .data([(match ? dataPoint : area.name)])
                                .classed('poly', true);

                            if (colorize) {
                                g
                                    .style('fill', color)
                                    .style('fill-opacity', opacity)
                                    .style('stroke', color)
                                    .style('stroke-width', (isTextShape ? '0' : '2'))
                                    .style('stroke-opacity', opacity);

                                if (isG) {
                                    g.selectAll('.excluded').each(function (d, i) {
                                        var el = d3.select(this);
                                        el.style('fill', null)
                                            .style('fill-opacity', null)
                                            .style('stroke', null)
                                            .style('stroke-width', null)
                                            .style('stroke-opacity', null);

                                        el.classed('ignored', true); //Remove other classes
                                    });
                                }
                            }

                            if (match)
                                g.style('opacity', dynamicOpacity);

                            var polyRect: SVGRect = this.getBBox();

                            if (match)
                                TooltipManager.addTooltip(g, (tooltipEvent: TooltipEvent) => tooltipEvent.data.tooltipInfo);
                            else
                                TooltipManager.addTooltip(g, (tooltipEvent: TooltipEvent) => [{ displayName: 'Area', value: tooltipEvent.data }]);

                            if (!isTextShape && colorize && labelSettings.show && (match || labelSettings.labelStyle !== labelStyle.data)) {

                                var labelText;
                                var labelItalic;
                                var wrap;

                                if (!match) {

                                    labelText = (area.title ? area.title : area.name);
                                    labelItalic = true;
                                    wrap = true;

                                } else {

                                    labelItalic = false;

                                    if (labelSettings.labelStyle === labelStyle.data || labelSettings.labelStyle === labelStyle.both) {

                                        var alternativeScale: number = (labelSettings.displayUnits === 0 ?
                                            <number>d3.max(dataPoints, d => Math.abs(d.measure)) : null);

                                        var measureFormatter = measureFormattersCache.getOrCreate(dataPoint.labelFormatString, labelSettings, alternativeScale);

                                        if (labelSettings.labelStyle === labelStyle.both) {

                                            labelText = (area.title ? area.title : dataPoint.label) + ' (' + measureFormatter.format(dataPoint.measure) + ')';
                                            wrap = true;

                                        } else {
                                            if (ii > 0) return; //Don't show Data label when multiple areas share same id

                                            labelText = measureFormatter.format(dataPoint.measure);
                                            wrap = false;
                                        }

                                    } else {

                                        labelText = (area.title ? area.title : dataPoint.label);
                                        wrap = true;
                                    }

                                }
                         
                                var fontSize = parseInt(jsCommon.PixelConverter.fromPoint(labelSettings.fontSize));
                                var lines = (wrap ?
                                    self.wrapText(labelText, fontSize, polyRect.width - 10, polyRect.height) : 
                                    [[labelText, TextMeasurementService.measureSvgTextWidth({ fontFamily: dataLabelUtils.LabelTextProperties.fontFamily, fontSize: fontSize + 'px', text: labelText })]]);

                                var l = self.svg
                                    .append('text')
                                    .attr('fill', self.autoTextColor(color))
                                    .attr('y', polyRect.y + ((polyRect.height - (lines.length * (fontSize + 2)) - 2) / 2) - 2)
                                    .attr('x', polyRect.x + ((polyRect.width - 10) / 2))
                                    .style('font-size', fontSize + 'px')
                                    .classed('label', true);

                                if (labelItalic)
                                    l.style('font-style', 'italic');

                                for (var i = 0; i < lines.length; i++) {
                                    l.append('tspan')
                                        .attr('x', polyRect.x + ((polyRect.width - lines[i][1]) / 2))
                                        .attr('dy', fontSize + 2)
                                        .text(lines[i][0]);
                                }
    
                                //TODO Try the function
                                //var lNode = <SVGTextElement>l.node();
                                //TextMeasurementService.wordBreak(lNode, polyRect.width - 12, polyRect.height);
                                
                            }
                        });

                    } else {

                        //Hide unmatched areas
                        if (area.elementId && this.isLegalId(area.elementId)) {
                            this.svg.selectAll('#' + area.elementId).style('display', 'none');
                        }

                    }

                }

                if (!this.data.unmatched.show) {
                    for (var i = 0; i < this.initialImage.unmatched.length; i++) {
                        var shape = this.initialImage.unmatched[i];
                        var el = shape.sel;
                        if (!el.empty())
                            el.style('display', 'none');
                    }
                } else if (this.data.unmatched.colorize) {
                    for (var i = 0; i < this.initialImage.unmatched.length; i++) {
                        var shape = this.initialImage.unmatched[i];
                        var el = shape.sel;
                        if (!el.empty()) {
                            el.style('fill', this.data.unmatched.color)
                                .style('fill-opacity', null)
                                .style('stroke', null)
                                .style('stroke-width', null)
                                .style('stroke-opacity', null)
                                .attr('class', null);
                        }
                    }
                }

                if (this.isInteractive) {
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

                    this.interactivityService.bind(dataPoints, this.behavior, behaviorOptions);
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

        private wrapText(text, fontSize, width, height): any {

            var lines = [];
            var words = text.split(' ');

            var lastLine = ["", 0];
            for (var n = 0; n < words.length; n++) {
                var word = words[n] + " ";
                var wordWidth = TextMeasurementService.measureSvgTextWidth({ fontFamily: dataLabelUtils.LabelTextProperties.fontFamily, fontSize: fontSize + 'px', text: word });

                var testLine = lastLine[0] + word;
                var testWidth = parseInt(lastLine[1]) + wordWidth;
                if (testWidth > width) {
                    lines.push(lastLine);
                    lastLine = [word, wordWidth];
                } else {
                    lastLine = [testLine, testWidth];
                }
            }

            if (lastLine[1] > width) {
                lastLine[0] = dataLabelUtils.getLabelFormattedText({ label: lastLine[0], maxWidth: width });
                lastLine[1] = width;
            }
            lines.push(lastLine);

            if ((lines.length * (fontSize + 2) - 2) > height)
                lines = [[dataLabelUtils.getLabelFormattedText({ label: text, maxWidth: width }), width]];

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
                    this.legend.changeOrientation(LegendPosition.Bottom);
                    this.legend.drawLegend({ dataPoints: [] }, this.currentViewport);
                }

            }
        }

        private persistData(): void {
            var properties: any = {};
            properties.imageData = (this.data.imageData ? String(this.data.imageData) : '');

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
                case 'dataAreas':

                    enumeration.pushInstance({
                        objectName: 'dataAreas',
                        selector: null,
                        properties: {
                            show: this.data.unmatched.show,
                            fill: { solid: { color: this.data.unmatched.color || this.colors.getColorByIndex(0).value } },
                            colorize: this.data.unmatched.colorize
                        },
                    });

                    break;

                case 'dataPoint':

                    enumeration.pushInstance({
                        objectName: 'dataPoint',
                        selector: null,
                        properties: {
                            colorize: this.data.matched.colorize,
                            defaultColor: { solid: { color: this.data.matched.color || this.colors.getColorByIndex(0).value } },
                            showAllDataPoints: this.data.matched.showMultipleColors
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
                        fontSize: true,
                        labelStyle: true,
                    };
                    dataLabelUtils.enumerateDataLabels(labelSettingsOptions);
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

                case 'legend':
                    var legendObjectProperties: DataViewObjects = { legend: this.data.legendObjectProperties };

                    var show = DataViewObjects.getValue(legendObjectProperties, synopticPanelProps.legend.show, this.legend.isVisible());
                    var showTitle = DataViewObjects.getValue(legendObjectProperties, synopticPanelProps.legend.showTitle, true);
                    var titleText = DataViewObjects.getValue(legendObjectProperties, synopticPanelProps.legend.titleText, this.data.legendData.title);
                    var labelColor = DataViewObject.getValue(legendObjectProperties, synopticPanelProps.legend.labelColor, this.data.legendData.labelColor);
                    var labelFontSize = DataViewObject.getValue(legendObjectProperties, synopticPanelProps.legend.fontSize, this.data.legendData.fontSize);

                    enumeration.pushInstance({
                        selector: null,
                        objectName: 'legend',
                        properties: {
                            show: show,
                            position: LegendPosition[this.legend.getOrientation()],
                            showTitle: showTitle,
                            titleText: titleText,
                            labelColor: labelColor,
                            fontSize: labelFontSize
                        }
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
            mapMeasure?: string;
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
            private mapSeries: DataViewCategoryColumn;
            private category: DataViewCategoryColumn;
            private categoryFormatString: string;
            private legendDataPoints: LegendDataPoint[];
            private colorHelper: ColorHelper;
            private forcedColor: string;

            public hasHighlights: boolean;
            public dataPoints: SynopticPanelDataPoint[];
            public boundMaps: any[];
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

                    for (var cat = 0; cat < dataViewCategorical.categories.length; cat++) {

                        var category = dataViewCategorical.categories[cat];
                        if (category.source.roles['Category']) {
                            this.category = category;
                            this.categoryFormatString = valueFormatter.getFormatString(this.category.source, synopticPanelProps.general.formatString);

                        } else if (category.source.roles['MapSeries']) {
                            this.mapSeries = category;
                        }
                    }
                }

                this.boundMaps = [];
                if (this.mapSeries) {
                    for (var ma = 0; ma < this.mapSeries.values.length; ma++) {
                        var map = this.mapSeries.values[ma];
                        if (map && this.boundMaps.indexOf(map) == -1 && SynopticPanelBySQLBI.isValidURL(map))
                            this.boundMaps.push(map);
                    }
                }

                var grouped = this.grouped = dataViewCategorical && dataViewCategorical.values ? dataViewCategorical.values.grouped() : undefined;
                this.isMultiMeasure = grouped && grouped.length > 0 && grouped[0].values && grouped[0].values.length > 1;
                this.isSingleMeasure = grouped && grouped.length === 1 && grouped[0].values && grouped[0].values.length === 1;

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
                    if (this.category && this.category.values) {
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
                        labelFormatString: valuesMetadata.format,
                        mapMeasure: point.mapMeasure,
                    });
                }

                this.legendData = {
                    title: this.getLegendTitle(),
                    dataPoints: this.legendDataPoints,
                    labelColor: LegendData.DefaultLegendLabelFillColor,
                    fontSize: SVGLegend.DefaultFontSizeInPt,
                };
            }

            private getLegendTitle(): string {
                if (this.total !== 0) {
                    // If category exists, we render title using category source. If not, we render title
                    // using measure.
                    if (this.category && this.category.values)
                        return (this.category ? this.category.source.displayName : "");
                    else
                        return (this.dataViewCategorical.values && this.dataViewCategorical.values.source ? this.dataViewCategorical.values.source.displayName : "");
                }

                return "";
            }

            private convertCategorical(): ConvertedDataPoint[] {
                var dataViewCategorical = this.dataViewCategorical;
                var formatStringProp = synopticPanelProps.general.formatString;
                var dataPoints: ConvertedDataPoint[] = [];

                for (var categoryIndex = 0, categoryCount = this.category.values.length; categoryIndex < categoryCount; categoryIndex++) {
                    var categoryValue = this.category.values[categoryIndex];
                    var mapValue = (this.mapSeries ? this.mapSeries.values[categoryIndex] : undefined);

                    var thisCategoryObjects = (this.category.objects ? this.category.objects[categoryIndex] : undefined);
                    var legendIdentity = SelectionId.createWithId(this.category.identity[categoryIndex]);
                    var color = (this.forcedColor ? this.forcedColor : this.colorHelper.getColorForSeriesValue(thisCategoryObjects, this.category.identityFields, categoryValue));
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
                                    .withCategory(this.category, categoryIndex)
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
                                dataPoint.mapMeasure = mapValue;
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
                dataLabelsSettings.labelStyle = labelStyle.data;

                if (dataViewMetadata) {
                    var objects: DataViewObjects = dataViewMetadata.objects;
                    if (objects) {
                        // Handle lables settings
                        var labelsObj = <DataLabelObject>objects['dataLabels'];
                        if (labelsObj) {
                            dataLabelUtils.updateLabelSettingsFromLabelsObject(labelsObj, dataLabelsSettings);
                        }
                    }
                }

                return dataLabelsSettings;
            }
        }
    }
}