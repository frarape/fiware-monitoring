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
 * Module that defines a parser for `check_procs` Nagios plugin.
 *
 * Context attributes to be calculated:
 *
 * - procs = number of processes running
 *
 * @module check_procs
 * @see https://www.nagios-plugins.org/doc/man/check_procs.html
 * @see https://github.com/nagios-plugins/nagios-plugins/blob/maint/plugins/check_procs.c
 */


'use strict';
/* jshint -W101, unused: false */


var nagios = require('./common/nagios');


/**
 * Parser for `check_procs` Nagios probe.
 * @augments nagios
 */
var parser = Object.create(nagios.parser);


/**
 * Parses `check_procs` raw data to extract an object whose members are NGSI context attributes.
 *
 * @function getContextAttrs
 * @memberof parser
 * @param {EntityData} data                 Object holding raw entity data.
 * @returns {Object} Context attributes.
 *
 * <code>
 * Sample data: "PROCS OK: 136 processes"
 *                 ^        ^
 *     Metric -----+        |       (list of metrics: PROCS,VSZ,RSS,CPU,ELAPSED)
 *     # of procs ----------+
 * </code>
 */
parser.getContextAttrs = function(probeEntityData) {
    var data = probeEntityData.data.split('\n')[0];     // only consider first line of probe data, discard perfData
    var attrs = { procs: NaN };

    var items = data.split(':');
    if (items[1]) {
        attrs.procs = parseFloat(items[1].trim().split(' ')[0]);
    }

    if (isNaN(attrs.procs)) {
        throw new Error('No valid procs data found');
    }

    return attrs;
};


/**
 * Parser for `check_procs`.
 */
exports.parser = parser;
