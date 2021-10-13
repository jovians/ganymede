"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpCode = exports.httpRest = exports.httpGetPost = exports.HttpMethod = void 0;
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
var HttpMethod;
(function (HttpMethod) {
    HttpMethod["NONE"] = "NONE";
    HttpMethod["MULTI"] = "MULTI";
    HttpMethod["GET"] = "GET";
    HttpMethod["POST"] = "POST";
    HttpMethod["PUT"] = "PUT";
    HttpMethod["PATCH"] = "PATCH";
    HttpMethod["DELETE"] = "DELETE";
    HttpMethod["OPTIONS"] = "OPTIONS";
})(HttpMethod = exports.HttpMethod || (exports.HttpMethod = {}));
exports.httpGetPost = [HttpMethod.GET, HttpMethod.POST];
exports.httpRest = [HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH, HttpMethod.DELETE];
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
var HttpCode;
(function (HttpCode) {
    // Information responses
    HttpCode[HttpCode["CONTINUE"] = 100] = "CONTINUE";
    HttpCode[HttpCode["SWITCHING_PROTOCOL"] = 101] = "SWITCHING_PROTOCOL";
    HttpCode[HttpCode["PROCESSING"] = 102] = "PROCESSING";
    HttpCode[HttpCode["EARLY_HINTS"] = 103] = "EARLY_HINTS";
    // Successful responses
    HttpCode[HttpCode["OK"] = 200] = "OK";
    HttpCode[HttpCode["CREATED"] = 201] = "CREATED";
    HttpCode[HttpCode["ACCEPTED"] = 202] = "ACCEPTED";
    HttpCode[HttpCode["NON_AUTHORITIVE_INFO"] = 203] = "NON_AUTHORITIVE_INFO";
    HttpCode[HttpCode["NO_CONTENT"] = 204] = "NO_CONTENT";
    HttpCode[HttpCode["RESET_CONTENT"] = 205] = "RESET_CONTENT";
    HttpCode[HttpCode["PARTIAL_CONTENT"] = 206] = "PARTIAL_CONTENT";
    HttpCode[HttpCode["MULTI_STATUS"] = 207] = "MULTI_STATUS";
    HttpCode[HttpCode["ALREADY_REPORTED"] = 208] = "ALREADY_REPORTED";
    HttpCode[HttpCode["IM_USED"] = 226] = "IM_USED";
    // Redirection messages
    HttpCode[HttpCode["MULTIPLE_CHOICE"] = 300] = "MULTIPLE_CHOICE";
    HttpCode[HttpCode["MOVED_PERMANENTLY"] = 301] = "MOVED_PERMANENTLY";
    HttpCode[HttpCode["FOUND"] = 302] = "FOUND";
    HttpCode[HttpCode["SEE_OTHER"] = 303] = "SEE_OTHER";
    HttpCode[HttpCode["NOT_MODIFIED"] = 304] = "NOT_MODIFIED";
    HttpCode[HttpCode["USE_PROXY"] = 305] = "USE_PROXY";
    HttpCode[HttpCode["TEMPORARILY_REDIRECTED"] = 307] = "TEMPORARILY_REDIRECTED";
    HttpCode[HttpCode["PERMANENTLY_REDIRECTED"] = 308] = "PERMANENTLY_REDIRECTED";
    // Client error responses
    HttpCode[HttpCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpCode[HttpCode["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpCode[HttpCode["PAYMENT_REQUIRED"] = 402] = "PAYMENT_REQUIRED";
    HttpCode[HttpCode["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpCode[HttpCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpCode[HttpCode["METHOD_NOT_ALLOWED"] = 405] = "METHOD_NOT_ALLOWED";
    HttpCode[HttpCode["NOT_ACCEPTABLE"] = 406] = "NOT_ACCEPTABLE";
    HttpCode[HttpCode["PROXY_AUTH_REQUIRED"] = 407] = "PROXY_AUTH_REQUIRED";
    HttpCode[HttpCode["REQUEST_TIMEOUT"] = 408] = "REQUEST_TIMEOUT";
    HttpCode[HttpCode["CONFLICT"] = 409] = "CONFLICT";
    HttpCode[HttpCode["GONE"] = 410] = "GONE";
    HttpCode[HttpCode["LENGTH_REQUIRED"] = 411] = "LENGTH_REQUIRED";
    HttpCode[HttpCode["PRECONDITION_FAILED"] = 412] = "PRECONDITION_FAILED";
    HttpCode[HttpCode["PAYLOAD_TOO_LARGE"] = 413] = "PAYLOAD_TOO_LARGE";
    HttpCode[HttpCode["URI_TOO_LONG"] = 414] = "URI_TOO_LONG";
    HttpCode[HttpCode["UNSUPPORTED_MEDIA_TYPE"] = 415] = "UNSUPPORTED_MEDIA_TYPE";
    HttpCode[HttpCode["RANGE_NOT_SATISFIABLE"] = 416] = "RANGE_NOT_SATISFIABLE";
    HttpCode[HttpCode["EXPECTATION_FAILED"] = 417] = "EXPECTATION_FAILED";
    HttpCode[HttpCode["I_AM_A_TEAPOT"] = 418] = "I_AM_A_TEAPOT";
    HttpCode[HttpCode["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    HttpCode[HttpCode["LOCKED"] = 423] = "LOCKED";
    HttpCode[HttpCode["FAILED_DEPENDENCY"] = 424] = "FAILED_DEPENDENCY";
    HttpCode[HttpCode["TOO_EARLY"] = 425] = "TOO_EARLY";
    HttpCode[HttpCode["UPGRADE_REQUIRED"] = 426] = "UPGRADE_REQUIRED";
    HttpCode[HttpCode["PRECONDITION_REQUIRED"] = 428] = "PRECONDITION_REQUIRED";
    HttpCode[HttpCode["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
    HttpCode[HttpCode["REQUEST_HEADER_FIELD_TOO_LARGE"] = 431] = "REQUEST_HEADER_FIELD_TOO_LARGE";
    HttpCode[HttpCode["UNAVAILABLE_FOR_LEGAL_REASONS"] = 451] = "UNAVAILABLE_FOR_LEGAL_REASONS";
    // Server error responses
    HttpCode[HttpCode["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    HttpCode[HttpCode["NOT_IMPLEMENTED"] = 501] = "NOT_IMPLEMENTED";
    HttpCode[HttpCode["BAD_GATEWAY"] = 502] = "BAD_GATEWAY";
    HttpCode[HttpCode["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
    HttpCode[HttpCode["GATEWAY_TIMEOUT"] = 504] = "GATEWAY_TIMEOUT";
    HttpCode[HttpCode["HTTP_VERSION_NOT_SUPPORTED"] = 505] = "HTTP_VERSION_NOT_SUPPORTED";
    HttpCode[HttpCode["VARIANT_ALSO_NEGOTIATES"] = 506] = "VARIANT_ALSO_NEGOTIATES";
    HttpCode[HttpCode["INSUFFICIENT_STORAGE"] = 507] = "INSUFFICIENT_STORAGE";
    HttpCode[HttpCode["LOOP_DETECTED"] = 508] = "LOOP_DETECTED";
    HttpCode[HttpCode["NOT_EXTENDED"] = 510] = "NOT_EXTENDED";
    HttpCode[HttpCode["NETWORK_AUTH_REQUIRED"] = 511] = "NETWORK_AUTH_REQUIRED";
})(HttpCode = exports.HttpCode || (exports.HttpCode = {}));
