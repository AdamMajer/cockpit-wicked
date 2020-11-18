/*
 * Copyright (c) [2020] SUSE LLC
 *
 * All Rights Reserved.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of version 2 of the GNU General Public License as published
 * by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, contact SUSE LLC.
 *
 * To contact SUSE LLC about this file by physical or electronic mail, you may
 * find current contact information at www.suse.com.
 */

import { isValid, parseCIDR } from "ipaddr.js";

/**
 *
 * Check if an IP is valid
 *
 * Sadly, the ipaddr.js library do not validate IPs with "192.168.1.1/32"
 * notation.
 *
 *    * https://github.com/whitequark/ipaddr.js/issues/13
 *    * https://github.com/whitequark/ipaddr.js/issues/25
 *
 * @param {string} value - An IP Address
 * @return {boolean} true if given IP is valid; false otherwise.
 */
const isValidIP = (value) => {
    const [ip, cidr] = value.split("/");

    if (!cidr) return isValid(ip);

    try {
        parseCIDR(value);
        return true;
    } catch {
        return false;
    }
};

const isValidDomain = (value) => {
    const rexp = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;

    return !!value.match(rexp);
};

export {
    isValidIP,
    isValidDomain
};
