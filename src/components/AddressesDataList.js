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

import React, { useState } from 'react';
import cockpit from 'cockpit';
import { createAddressConfig } from '../lib/model';

import {
    Button,
    DataList,
    DataListItem,
    DataListItemRow,
    DataListItemCells,
    DataListCell,
    DataListAction,
    Divider,
    TextInput,
    Title,
    Stack,
    StackItem,
    Split,
    SplitItem,
} from '@patternfly/react-core';

import PlusIcon from '@patternfly/react-icons/dist/js/icons/plus-icon';
import MinusIcon from '@patternfly/react-icons/dist/js/icons/minus-icon';
import IPInput from './IPInput';

const _ = cockpit.gettext;

const FIELDS = {
    address: { component: IPInput, props: { placeholder: _("Address"), "aria-label": _("Address") } },
    label: { component: IPInput, props: { placeholder: _("Label"), "aria-label": _("Label") } }
};

const AddressesDataList = ({ addresses, updateAddresses }) => {
    const addAddress = () => {
        const address = createAddressConfig();
        updateAddresses({ ...addresses, [address.id]: address });
    };

    const updateAddress = (id, field, value) => {
        const address = { ...addresses[id] };
        address[field] = value;
        // TODO: check if this do not generate not needed re-renders
        updateAddresses({ ...addresses, [id]: address });
    };

    const deleteAddress = (id) => {
        const nextAddress = Object.fromEntries(
            Object.entries(addresses).filter(([key, address]) => key != id)
        );

        updateAddresses(nextAddress);
    };

    const renderAddress = ({ id, ...address }) => {
        const cells = Object.keys(address).map((fieldKey) => {
            const field = FIELDS[fieldKey];

            if (!field) return null;

            const FieldComponent = field.component;

            return (
                <DataListCell key={`address-${id}-${fieldKey}`}>
                    <FieldComponent
                      defaultValue={address[fieldKey]}
                      onChange={(value) => updateAddress(id, fieldKey, value)}
                      onError={(value) => console.log("Invalid value", value, "for", fieldKey, "on address", id)}
                      {...field.props}
                    />
                </DataListCell>
            );
        });

        return (
            <DataListItem key={`address-${id}`}>
                <DataListItemRow>
                    <DataListItemCells dataListCells={cells} />
                    <DataListAction>
                        <Button variant="secondory" className="btn-sm" onClick={() => deleteAddress(id)}>
                            <MinusIcon />
                        </Button>
                    </DataListAction>
                </DataListItemRow>
            </DataListItem>
        );
    };

    return (
        <Stack className="data-list-form" hasGutter>
            <StackItem>
                <Split hasGutter>
                    <SplitItem isFilled>
                        <Title headingLevel="h2">{_("Addresses")}</Title>
                    </SplitItem>
                    <SplitItem>
                        <Button variant="primary" className="btn-sm" onClick={() => addAddress() }>
                            <PlusIcon />
                        </Button>
                    </SplitItem>
                </Split>
            </StackItem>
            <StackItem>
                <DataList isCompact aria-label={_("Addresses data list")}>
                    {Object.values(addresses).map((address) => renderAddress(address))}
                </DataList>
            </StackItem>
        </Stack>
    );
};

export default AddressesDataList;
