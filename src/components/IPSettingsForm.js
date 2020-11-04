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
import cockpit from 'cockpit';
import { isValidIP } from '../lib/utils';
import bootProtocol from '../lib/model/bootProtocol';
import { createAddressConfig } from '../lib/model';

import {
    Alert,
    Button,
    Form,
    FormGroup,
    Modal,
    ModalVariant
} from '@patternfly/react-core';

import { useNetworkDispatch, updateConnection } from '../NetworkContext';
import BootProtoSelector from "./BootProtoSelector";
import AddressesDataList from "./AddressesDataList";

const { gettext: _, format } = cockpit;

/**
 * Cleans up given collection of addresses
 *
 * Basically, removing duplicated entries and those without IP
 *
 * @param {Array<module:model~AddressConfig>} addresses - addresses collection to sanitize
 * @return {Array<module:model~AddressConfig>}
 */
const sanitize = (addresses) => {
    return addresses.filter((addr, idx, collection) => {
        // Reject addresses without IP
        if (addr.local === undefined || addr.local.trim() === "") return false;

        // If duplicated (same address, same label), keep only one
        const firstIdx = collection.findIndex((item) => item.local === addr.local && item.label === addr.label);
        return idx === firstIdx;
    });
};

/**
 * Checks if there is an invalid IP in given addresses collection
 *
 * @param {Array<module:model~AddressConfig>} addresses - addresses collection to check
 * @return {boolean} true if an invalid IP is found; false otherwise
 */
const findInvalidIP = addresses => addresses.find((addr) => !isValidIP(addr.local));

/**
 * Checks if there is a repeated label in given addresses collection
 *
 * @param {Array<module:model~AddressConfig>} addresses - addresses collection to check
 * @return {boolean} true if a label is used more than once; false otherwise
 */
const findRepeatedLabel = (addresses) => {
    return addresses.find((addr, idx, collection) => {
        const firstIdx = collection.findIndex((item) => item.label === addr.label);
        return idx !== firstIdx;
    });
};

/**
 * Form to configure the IP settings
 *
 * @param {Object} props - form props
 * @param {object} props.connection - the connection object
 * @param {string} [props.ipVersion=ipv4] - the IP version
 * @param {boolean} [props.isOpen=false] - whether the form is displayed or not
 * @param {function} [props.onClose] - callback function to be called when the form is closed
 */
const IPSettingsForm = ({ connection, ipVersion = 'ipv4', isOpen, onClose }) => {
    const dispatch = useNetworkDispatch();
    const settings = connection[ipVersion];
    const [bootProto, setBootProto] = useState(settings.bootProto);
    const [addresses, setAddresses] = useState(settings.addresses);
    const [addressRequired, setAddressRequired] = useState(settings.bootProto === bootProtocol.STATIC);
    const [errorMessages, setErrorMessages] = useState([]);
    const [isApplying, setIsApplying] = useState(false);

    /**
     * Performs an update of the internal addresses state
     *
     * When the "Static" boot protocol is currently selected, it ensures that there is at least one
     * {@link module:/model~AddressConfig} in the collection, which helps displaying needed fields
     * in the UI.
     *
     * @param {Array<module:model~AddressConfig>} [nextAddresses] - Addresses be used for the
     *   update. When not given, current addresses will be used.
     */
    const forceAddressesUpdate = (nextAddresses) => {
        nextAddresses ||= addresses;

        if (bootProto === bootProtocol.STATIC && nextAddresses.length === 0) {
            nextAddresses = [createAddressConfig()];
        }

        setAddresses(nextAddresses);
    };

    /**
     * Performs validations using given addresses
     *
     * @param {Array<module:model~AddressConfig>} sanitizedAddresses - a collection of sanitize
     *   addresses. See {@link sanitize}
     * @return {boolean} true when all validations success; false otherwise
     */
    const validate = (sanitizedAddresses) => {
        /**
         * TODO: improve validations
         * TODO: highlight addresses with errors?
         */
        let result = true;
        const errors = [];

        // Clean previous error messages
        setErrorMessages([]);

        if (bootProto === bootProtocol.STATIC && sanitizedAddresses.length === 0) {
            result = false;
            errors.push(
                format(
                    _('At least one address must be provided when using the "$bootProto" boot protocol'),
                    { bootProto: bootProtocol.label(bootProtocol.STATIC) }
                )
            );
        }

        if (findInvalidIP(sanitizedAddresses)) {
            result = false;
            errors.push(_("There are invalid IPs"));
        }

        if (findRepeatedLabel(sanitizedAddresses)) {
            result = false;
            errors.push(_("There are repeated labels"));
        }

        setErrorMessages(errors);

        return result;
    };

    /**
     * Handles the form submit, performing a connection update when proceed
     *
     * @see {@link validate}
     * @see {@link module/NetworkContext~updateConnection}
     */
    const handleSubmit = () => {
        setIsApplying(true);

        const sanitizedAddresses = sanitize(addresses);

        // Do not proceed if errors were found
        if (!validate(sanitizedAddresses)) {
            forceAddressesUpdate(sanitizedAddresses);
            setIsApplying(false);
            return;
        }

        // If everything looks good, try to apply requested changes
        const promise = updateConnection(
            dispatch,
            connection,
            { [ipVersion]: { bootProto, addresses: sanitizedAddresses } }
        );

        promise
                .then(() => {
                    setIsApplying(false);
                    onClose();
                })
                .catch((error) => {
                    console.error(error);
                    setErrorMessages([_("Something went wrong. Please, try it again.")]);
                    setIsApplying(false);
                });
    };

    /**
     * Updates the UI according to the bootProtocol selected
     *
     * Basically, setting the internal form state in order to ensure that the AddressDataList
     * component displays the fields for at least one {@link module/model~AddressConfig} item.
     */
    useEffect(() => {
        forceAddressesUpdate();
        setAddressRequired(bootProto === bootProtocol.STATIC);
    }, [bootProto]);

    /**
     * Renders error messages in an Patternfly/Alert component, if any
     */
    const renderErrors = () => {
        if (errorMessages.length === 0) return null;

        return (
            <Alert
              isInline
              variant="danger"
              aria-live="polite"
              title={_("Data is not valid, please check it")}
            >
                {errorMessages.map(error => <p>{error}</p>)}
            </Alert>
        );
    };

    return (
        <Modal
            variant={ModalVariant.medium}
            title={_(`${ipVersion.toUpperCase()} Settings`)}
            isOpen={isOpen}
            onClose={onClose}
            actions={[
                <Button
                  spinnerAriaValueText={isApplying ? _("Applying changes") : undefined}
                  isLoading={isApplying}
                  isDisabled={isApplying}
                  key="confirm" variant="primary"
                  onClick={handleSubmit}
                >
                    {isApplying ? _("Applying changes") : _("Apply")}
                </Button>,
                <Button key="cancel" variant="link" onClick={onClose}>
                    {_("Cancel")}
                </Button>
            ]}
        >
            <Form>
                {renderErrors()}

                <FormGroup label={_("Boot Protocol")} isRequired>
                    <BootProtoSelector value={bootProto} onChange={setBootProto} />
                </FormGroup>

                <FormGroup label={_("Addresses")}>
                    <AddressesDataList
                      addresses={addresses}
                      updateAddresses={setAddresses}
                      allowEmpty={!addressRequired}
                    />
                </FormGroup>
            </Form>
        </Modal>
    );
};

export default IPSettingsForm;
