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

import React from 'react';
import cockpit from 'cockpit';

import {
    ActionGroup,
    Button,
    Modal,
    ModalVariant,
    Text,
    TextVariants,
    Title
} from '@patternfly/react-core';

const _ = cockpit.gettext;

/**
 * General component for loading and displaying a confirm dialog in a PF4/Modal
 *
 * @see {@link https://www.patternfly.org/v4/components/modal}
 *
 * @param {object} props - component props
 * @param {string} [props.caption] - a caption to be shown before the modal title
 * @param {string} [props.title] - the dialog title
 * @param {boolean} [props.isOpen=false] - whether the dialog is open and form visible
 * @param {function} props.onConfirm - callback to be triggered when the user "sent" the form
 * @param {string} [props.onConfirmLabel="Confirm"] - text for the "submit" button
 * @param {function} props.onCancel - callback to be triggered when the user "dismiss" the form
 * @param {string} [props.onCancelLabel="Cancel"] - text for the "Cancel" button
 * @param {string} [props.variant=ModalVariant.small] - Size of the modal. See PF4/ModalVariant
 * @param {JSX.Element} props.children - content for the form
 */
const ModalConfirm = ({
    caption,
    title,
    isOpen = false,
    onConfirm,
    onConfirmDisable = false,
    onConfirmLabel = _("Confirm"),
    onCancel,
    onCancelLabel = _("Cancel"),
    variant = ModalVariant.small,
    children
}) => {
    if (!isOpen) return;

    return (
        <Modal
            aria-label={title}
            variant={variant}
            isOpen={isOpen}
            showClose={false}
            header={
                <>
                    <Text component={TextVariants.small} className='modal-form-caption'>
                        {caption}
                    </Text>
                    <Title headingLevel="h1">
                        {title}
                    </Title>
                </>
            }
            footer={
                <ActionGroup>
                    <Button key="confirm" variant="danger" onClick={onConfirm}>
                        {onConfirmLabel}
                    </Button>

                    <Button key="cancel" variant="link" onClick={onCancel}>
                        {onCancelLabel}
                    </Button>
                </ActionGroup>
            }
        >
            {children}
        </Modal>
    );
};

export default ModalConfirm;
