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

import cockpit from "cockpit";
import React, { useState } from 'react';
import StartMode from './StartMode';
import BridgeDetails from './BridgeDetails';

const _ = cockpit.gettext;

const startMode = (connection) => {
    return (
        <>
            <dt>{_("Start")}</dt>
            <dd><StartMode connection={connection} /></dd>
        </>
    );
};

const macAddress = (iface) => {
    return (
        <>
            <dt>{_("MAC")}</dt>
            <dd>{iface.mac}</dd>
        </>
    );
};

const bridgeDetails = (bridge) => {
    return (
        <>
              <dt>{_("Bridge")}</dt>
              <dd><BridgeDetails bridge={bridge} /></dd>
        </>
    );
};

const InterfaceDetails = ({ iface, connection }) => (
    <dl className="details-list">
        <dt>{_("Type")}</dt>
        <dd>{iface.type}</dd>
        { iface.mac && macAddress(iface) }
        { connection && startMode(connection) }
        { iface.type === "br" && bridgeDetails(connection) }
    </dl>
);

export default InterfaceDetails;
