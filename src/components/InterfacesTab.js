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

import React, { useEffect, useState } from 'react';
import InterfacesList from './InterfacesList';
import { NetworkClient } from '../lib/network';

const client = new NetworkClient();

const InterfacesTab = () => {
    const [interfaces, setInterfaces] = useState(null);
    const [connections, setConnections] = useState(null);

    useEffect(() => {
        client.getInterfaces()
                .then(setInterfaces)
                .catch(console.error);
    }, []);

    useEffect(() => {
        client.getConnections()
                .then(setConnections)
                .catch(console.error);
    }, []);

    if (!interfaces || !connections) {
        return <div>Loading...</div>;
    }

    return (
        <InterfacesList interfaces={interfaces} connections={connections} />
    );
};

export default InterfacesTab;
