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
    export var cardWithStatesBySQLBICapabilities: VisualCapabilities = {
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

} 
