/*
 *  Synoptic Panel by SQLBI - Capabilities 
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
    export var synopticPanelBySQLBICapabilities: VisualCapabilities = {
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
                    imageURL: {
                        displayName: 'Image URL',
                        type: { text: true }
                    },
                    areasURL: {
                        displayName: 'Areas File URL',
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

} 
