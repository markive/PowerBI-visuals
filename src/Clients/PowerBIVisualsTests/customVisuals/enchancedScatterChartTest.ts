﻿/*
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

module powerbitests.customVisuals {
    import VisualClass = powerbi.visuals.samples.EnhancedScatterChart;
    import DataView = powerbi.DataView;

    describe("EnchancedScatterChart", () => {
        describe('capabilities', () => {
            it("registered capabilities", () => expect(VisualClass.capabilities).toBeDefined());
        });

        describe("DOM tests", () => {
            let visualBuilder: EnchancedScatterChartBuilder;
            let dataViews: DataView[];

            beforeEach(() => {
                visualBuilder = new EnchancedScatterChartBuilder();
                dataViews = [new customVisuals.sampleDataViews.SalesByCountryData().getDataView()];
            });

            it("svg element created", () => expect(visualBuilder.mainElement[0]).toBeInDOM());

            it("update", (done) => {
                visualBuilder.update(dataViews);
                setTimeout(() => {
                    let countOfDot = visualBuilder.mainElement
                        .children("svg.svgScrollable")
                        .children("g.axisGraphicsContext")
                        .children("g.mainGraphicsContext")
                        .children("svg")
                        .children("path.dot").length;

                    expect(countOfDot).toBe(dataViews[0].categorical.categories[0].values.length);

                    done();
                }, powerbitests.DefaultWaitForRender);
            });
        });
    });

    class EnchancedScatterChartBuilder extends VisualBuilderBase<VisualClass> {
        constructor(height: number = 400, width: number = 400, isMinervaVisualPlugin: boolean = false) {
            super(height, width, isMinervaVisualPlugin);
            this.build();
            this.init();
        }

        public get mainElement() {
            return this.element.children("svg").children("g.axisGraphicsContext").parent();
        }

        private build(): void {
            this.visual = new VisualClass();
        }
    }
}