/*
 * Copyright 2013 Telefónica I+D
 * All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */


/**
 * Module that defines a base parser object.
 *
 * @module base
 */


'use strict';
/* jshint unused: false, laxbreak: true */


var url = require('url');


/**
 * Base parser object (to be extended by probe-specific parsers).
 */
var baseParser = Object.create(null);


/**
 * Name of the timestamp attribute added automatically to the resulting entity context attributes.
 *
 * @constant {String}
 * @memberof baseParser
 */
baseParser.timestampAttrName = '_timestamp';


/**
 * Gets the content type for Context Broker requests.
 *
 * @function getContentType
 * @memberof baseParser
 * @returns {String} The content type (the format) for Context Broker requests.
 */
baseParser.getContentType = function() {
    return 'application/xml';
};


/**
 * Gets the updateContext() request body.
 *
 * @function updateContextRequest
 * @memberof baseParser
 * @this baseParser
 * @param {http.IncomingMessage} request    The HTTP request to this server.
 * @returns {String} The request body, either in XML or JSON format.
 */
baseParser.updateContextRequest = function(request) {
    var query = url.parse(request.url, true).query;
    var entityId = query.id;
    var entityType = query.type;
    var entityData = this.parseRequest(request);
    var entityAttrs = this.getContextAttrs(entityData);
    if (Object.keys(entityAttrs).length === 0) {
        throw new Error('Missing entity context attributes');
    }
    // feature #4: automatically add request timestamp to entity attributes
    entityAttrs[this.timestampAttrName] = request.timestamp;
    return (this.getContentType() === 'application/xml') ?
        this.getUpdateContextXML(entityId, entityType, entityAttrs) :
        this.getUpdateContextJSON(entityId, entityType, entityAttrs);
};


/**
 * Parses the request to extract raw probe data.
 *
 * @abstract
 * @function parseRequest
 * @memberof baseParser
 * @param {http.IncomingMessage} request    The HTTP request to this server.
 * @returns {EntityData} An object holding entity data taken from request body.
 */
baseParser.parseRequest = function(request) {
    throw new Error('Must implement');
};


/**
 * Parses raw probe data to extract an object whose members are NGSI context attributes.
 *
 * @abstract
 * @function getContextAttrs
 * @memberof baseParser
 * @param {EntityData} data                 Object holding raw entity data.
 * @returns {Object} Context attributes.
 */
baseParser.getContextAttrs = function(data) {
    throw new Error('Must implement');
};


/**
 * Generates a JSON updateContext() request body.
 *
 * @function getUpdateContextJSON
 * @memberof baseParser
 * @param {String} id                       The entity identifier.
 * @param {String} type                     The entity type.
 * @param {Object} attrs                    The entity context attributes.
 * @returns {String} The request body in JSON format.
 */
baseParser.getUpdateContextJSON = function(id, type, attrs) {
    throw new Error('TO-DO');
};


/**
 * Generates a XML updateContext() request body.
 *
 * @function getUpdateContextXML
 * @memberof baseParser
 * @param {String} id                       The entity identifier.
 * @param {String} type                     The entity type.
 * @param {Object} attrs                    The entity context attributes.
 * @returns {String} The request body in XML format.
 */
baseParser.getUpdateContextXML = function(id, type, attrs) {
    var result = '';
    result += '<?xml version="1.0" encoding="UTF-8"?>\n';
    result += '<updateContextRequest>\n';
    result += '    <contextElementList>\n';
    result += '        <contextElement>\n';
    result += '            <entityId type="' + type + '" isPattern="false">\n';
    result += '                <id>' + id + '</id>\n';
    result += '            </entityId>\n';
    result += '            <contextAttributeList>\n';
    for (var name in attrs) {
    result += '                <contextAttribute>\n';
    result += '                    <name>' + name + '</name>\n';
    result += '                    <type>string</type>\n';
    result += '                    <contextValue>' + attrs[name] + '</contextValue>\n';
    result += '                </contextAttribute>\n';
    }
    result += '            </contextAttributeList>\n';
    result += '        </contextElement>\n';
    result += '    </contextElementList>\n';
    result += '    <updateAction>APPEND</updateAction>\n';
    result += '</updateContextRequest>\n';
    return result;
};


/**
 * Base parser to be extended.
 */
exports.parser = baseParser;
