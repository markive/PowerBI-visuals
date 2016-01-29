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

/// <reference path="_references.ts"/>

module powerbi {
    import IStringResourceProvider = jsCommon.IStringResourceProvider;

    export interface ServiceError {
        statusCode: number;

        /**
         * This error code corresponds with a PowerBIServiceException that happened on the server.
         */
        errorCode?: string;
        
        /**
         * Message and stack trace should only be sent in non-production environments.
         */
        message?: string;
        stackTrace?: string;
        errorDetails?: PowerBIErrorDetail[];
        parameters?: ErrorParameter[];
    }

    export interface PowerBIErrorDetail {
        code: string;
        detail: PowerBIErrorDetailValue;
    }

    export interface ErrorParameter {
        Key: string;
        Value: string;
    }

    export interface PowerBIErrorDetailValue {
        type: PowerBIErrorResourceType;
        value: string;
    }

    export enum PowerBIErrorResourceType {
        ResourceCodeReference = 0,
        EmbeddedString = 1,
    }

    export const enum ServiceErrorStatusCode {
        GeneralError = 0,
        CsdlFetching = 1,
        CsdlConvertXmlToConceptualSchema = 2,
        CsdlCreateClientSchema = 3,
        ExecuteSemanticQueryError = 4,
        ExecuteSemanticQueryInvalidStreamFormat = 5,
        ExecuteSemanticQueryTransformError = 6,
    }

    export class ServiceErrorToClientError implements IClientError {
        private m_serviceError: ServiceError;
        private httpRequestId: string;
        private static codeName = 'ServiceErrorToClientError';

        public get code(): string {
            return ServiceErrorToClientError.codeName;
        }

        public get ignorable(): boolean {
            return false;
        }

        public get requestId(): string {
            return this.httpRequestId;
        }

        public set requestId(value: string) {
            this.httpRequestId = value;
        }

        constructor(serviceError: ServiceError) {
            this.m_serviceError = serviceError;
        }

        public getDetails(resourceProvider: IStringResourceProvider): ErrorDetails {
            let errorDetails: ErrorDetails;
            if (this.m_serviceError.statusCode === ServiceErrorStatusCode.ExecuteSemanticQueryTransformError) {
                errorDetails = PowerBIErrorDetailHelper.GetDetailsFromTransformError(resourceProvider, this.m_serviceError);
            }
            else {
                errorDetails = PowerBIErrorDetailHelper.GetDetailsFromServerErrorStatusCode(resourceProvider, this.m_serviceError.statusCode);
            }

            PowerBIErrorDetailHelper.addAdditionalInfo(errorDetails, this.m_serviceError.errorDetails, resourceProvider);
            PowerBIErrorDetailHelper.addMessageAndStackTrace(errorDetails, this.m_serviceError.message || null, this.m_serviceError.stackTrace || null, resourceProvider);

            return errorDetails;
        }
    }

    export class PowerBIErrorDetailHelper {
        private static serverErrorPrefix = "ServerError_";
        public static addAdditionalInfo(errorDetails: ErrorDetails, pbiErrorDetails: PowerBIErrorDetail[], localize: IStringResourceProvider): ErrorDetails {
            if (pbiErrorDetails) {
                for (let i = 0; i < pbiErrorDetails.length; i++) {
                    let element = pbiErrorDetails[i];
                    let localizedCode = localize.get(PowerBIErrorDetailHelper.serverErrorPrefix + element.code);
                    let additionErrorInfoKeyValuePair = {
                        errorInfoKey: localizedCode ? localizedCode : element.code,
                        errorInfoValue: element.detail.type === PowerBIErrorResourceType.ResourceCodeReference ? localize.get(PowerBIErrorDetailHelper.serverErrorPrefix + element.detail.value) : element.detail.value
                    };

                    errorDetails.additionalErrorInfo.push(additionErrorInfoKeyValuePair);
                }
            }
            return errorDetails;
        }

        public static addMessageAndStackTrace(errorDetails: ErrorDetails, message: string, stackTrace: string, localize: IStringResourceProvider): ErrorDetails {
            if (message) {
                let additionErrorInfoKeyValuePair = {
                    errorInfoKey: localize.get("AdditionalErrorInfo_ErrorDetailsText"),
                    errorInfoValue: message
                };
                errorDetails.additionalErrorInfo.push(additionErrorInfoKeyValuePair);
            }
            if (stackTrace) {
                let additionErrorInfoKeyValuePair = {
                    errorInfoKey: localize.get("AdditionalErrorInfo_StackTraceText"),
                    errorInfoValue: stackTrace
                };
                errorDetails.additionalErrorInfo.push(additionErrorInfoKeyValuePair);
            }
            return errorDetails;
        }

        public static GetDetailsFromTransformError(localize: IStringResourceProvider, serviceError: ServiceError): ErrorDetails {
            let message = localize.get('ServiceError_CannotLoadVisual');
            let key = localize.get('ServiceError_CannotLoadVisual');
            let val = serviceError.message;

            let additionalInfo: ErrorInfoKeyValuePair[] = [];
            additionalInfo.push({ errorInfoKey: key, errorInfoValue: val, });

            let errorDetails: ErrorDetails = {
                message: message,
                additionalErrorInfo: additionalInfo,
            };

            return errorDetails;
        }

        public static GetDetailsFromServerErrorStatusCode(localize: IStringResourceProvider, statusCode: number): ErrorDetails {
            // TODO: Localize
            let message: string = "";
            let key: string = "";
            let val: string = "";

            switch (statusCode) {
                case ServiceErrorStatusCode.CsdlConvertXmlToConceptualSchema:
                    message = localize.get('ServiceError_ModelCannotLoad');
                    key = localize.get('ServiceError_ModelConvertFailureKey');
                    val = localize.get('ServiceError_ModelConvertFailureValue');
                    break;
                case ServiceErrorStatusCode.CsdlCreateClientSchema:
                    message = localize.get('ServiceError_ModelCannotLoad');
                    key = localize.get('ServiceError_ModelCreationFailureKey');
                    val = localize.get('ServiceError_ModelCreationFailureValue');
                    break;
                case ServiceErrorStatusCode.CsdlFetching:
                    message = localize.get('ServiceError_ModelCannotLoad');
                    key = localize.get('ServiceError_ModelFetchingFailureKey');
                    val = localize.get('ServiceError_ModelFetchingFailureValue');
                    break;
                case ServiceErrorStatusCode.ExecuteSemanticQueryError:
                    message = localize.get('ServiceError_CannotLoadVisual');
                    key = localize.get('ServiceError_ExecuteSemanticQueryErrorKey');
                    val = localize.get('ServiceError_ExecuteSemanticQueryErrorValue');
                    break;
                case ServiceErrorStatusCode.ExecuteSemanticQueryInvalidStreamFormat:
                    message = localize.get('ServiceError_CannotLoadVisual');
                    key = localize.get('ServiceError_ExecuteSemanticQueryInvalidStreamFormatKey');
                    val = localize.get('ServiceError_ExecuteSemanticQueryInvalidStreamFormatValue');
                    break;
                case ServiceErrorStatusCode.GeneralError:
                default:
                    message = localize.get('ServiceError_GeneralError');
                    key = localize.get('ServiceError_GeneralErrorKey');
                    val = localize.get('ServiceError_GeneralErrorValue');
                    break;
            }

            let additionalInfo: ErrorInfoKeyValuePair[] = [];
            additionalInfo.push({ errorInfoKey: key, errorInfoValue: val, });

            let errorDetails: ErrorDetails = {
                message: message,
                additionalErrorInfo: additionalInfo,
            };

            return errorDetails;
        }
    }
} 