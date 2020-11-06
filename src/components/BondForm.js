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

import React, { useState, useEffect } from 'react';
import {
    Button,
    Checkbox,
    Form,
    FormGroup,
    FormSelect,
    FormSelectOption,
    Modal,
    ModalVariant,
    TextInput
} from '@patternfly/react-core';
import cockpit from 'cockpit';
import { useNetworkDispatch, useNetworkState, addConnection, updateConnection } from '../context/network';
import interfaceType from '../lib/model/interfaceType';
import bondingModes from '../lib/model/bondingMode';

const _ = cockpit.gettext;

const modeOptions = bondingModes.values.map(mode => {
    return { value: mode, label: bondingModes.label(mode) };
});

const BondForm = ({ isOpen, onClose, connection }) => {
    const { bond } = connection || {};
    const isEditing = !!connection;
    const [name, setName] = useState(connection?.name || "");
    const [mode, setMode] = useState(bond?.mode || bondingModes.ACTIVE_BACKUP);
    const [options, setOptions] = useState(bond?.options || "");
    const [selectedInterfaces, setSelectedInterfaces] = useState(bond?.interfaces || []);
    const [candidateInterfaces, setCandidateInterfaces] = useState([]);
    const { interfaces } = useNetworkState();
    const dispatch = useNetworkDispatch();

    useEffect(() => {
        if (isEditing) {
            setCandidateInterfaces(Object.values(interfaces).filter(i => i.id !== connection.id));
        } else {
            setCandidateInterfaces(Object.values(interfaces));
        }
    }, [connection, isEditing, interfaces]);

    const addOrUpdateConnection = () => {
        const bondingAttrs = {
            name,
            bond: {
                mode,
                interfaces: selectedInterfaces,
                options
            }
        };

        if (isEditing) {
            updateConnection(dispatch, connection, bondingAttrs);
        } else {
            addConnection(dispatch, { ...bondingAttrs, type: interfaceType.BONDING });
        }
        onClose();
    };

    const handleSelectedInterfaces = (name) => (value) => {
        if (value) {
            setSelectedInterfaces([...selectedInterfaces, name]);
        } else {
            setSelectedInterfaces(selectedInterfaces.filter(i => i !== name));
        }
    };

    const isIncomplete = () => {
        return (name === "" || selectedInterfaces.length === 0);
    };

    return (
        <Modal
            variant={ModalVariant.small}
            title={isEditing ? _("Edit Bond") : _("Add Bond")}
            isOpen={isOpen}
            onClose={onClose}
            actions={[
                <Button key="confirm" variant="primary" onClick={addOrUpdateConnection} isDisabled={isIncomplete()}>
                    {isEditing ? _("Change") : _("Add")}
                </Button>,
                <Button key="cancel" variant="link" onClick={onClose}>
                    {_("Cancel")}
                </Button>
            ]}
        >
            <Form>
                <FormGroup
                    label={_("Name")}
                    isRequired
                    fieldId="interface-name"
                    helperText={_("Please, provide the interface name (e.g., bond0)")}
                >
                    <TextInput
                        isRequired
                        id="interface-name"
                        value={name}
                        onChange={setName}
                    />
                </FormGroup>

                <FormGroup
                    label={_("Interfaces")}
                    isRequired
                >
                    {candidateInterfaces.map(({ name }) => (
                        <Checkbox
                            label={name}
                            key={name}
                            isChecked={selectedInterfaces.includes(name)}
                            onChange={handleSelectedInterfaces(name)}
                        />
                    ))}
                </FormGroup>

                <FormGroup
                    label={_("Mode")}
                    isRequired
                    fieldId="bonding-mode"
                >
                    <FormSelect value={mode} onChange={setMode} id="bonding-mode">
                        {modeOptions.map((option, index) => (
                            <FormSelectOption key={index} {...option} />
                        ))}
                    </FormSelect>
                </FormGroup>

                <FormGroup
                    label={_("Options")}
                    fieldId="bond-options"
                    helperText={_("Use this field to provide more options using the key=value format")}
                >
                    <TextInput
                        isRequired
                        id="bond-options"
                        value={options}
                        onChange={setOptions}
                    />
                </FormGroup>
            </Form>
        </Modal>
    );
};

export default BondForm;
