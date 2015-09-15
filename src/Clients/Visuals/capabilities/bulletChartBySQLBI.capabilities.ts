/*
 *  Bullet Chart by SQLBI - Capabilities 
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
    export var bulletChartBySQLBICapabilities: VisualCapabilities = {
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
                    fill: {
                        type: { fill: { solid: { color: true } } },
                        displayName: 'Main Color'
                    },
                    fill2: {
                        type: { fill: { solid: { color: true } } },
                        displayName: 'Comparison Color'
                    },
                },
            },

            label: {
                displayName: "Label",
                properties: {
                    show: {
                        displayName: data.createDisplayNameGetter('Visual_Show'),
                        type: { bool: true }
                    },
                    text: {
                        type: { text: true },
                        displayName: 'Text'
                    },
                    text2: {
                        type: { text: true },
                        displayName: 'Description'
                    },
                },
            },
            /*legend: {
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
            },*/
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
    };
} 
