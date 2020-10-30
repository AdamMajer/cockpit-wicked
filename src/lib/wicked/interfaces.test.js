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

import { createInterface } from './interfaces';

describe('#createInterface', () => {
    const wickedInterface = {
        interface: { name: 'eth0' },
        ethtool: {
            driver_info: { driver: 'virtio_net' }
        },
        ethernet: {
            address: '52:54:00:11:22:33'
        }
    };

    it('returns an interface', () => {
        const iface = createInterface(wickedInterface);
        expect(iface)
                .toEqual(expect.objectContaining({
                    name: 'eth0',
                    driver: 'virtio_net',
                    mac: '52:54:00:11:22:33',
                    description: '',
                    type: 'eth',
                    virtual: false,
                }));
    });
});
