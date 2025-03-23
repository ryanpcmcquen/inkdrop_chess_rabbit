"use babel";

import React, { useEffect, useCallback } from "react";
import { logger, useModal } from "inkdrop";

const InkdropChessRabbitMessageDialog = (props) => {
    const modal = useModal();
    const { Dialog } = inkdrop.components.classes;

    const toggle = useCallback(() => {
        modal.show();
        logger.debug("InkdropChessRabbit was toggled!");
    }, []);

    useEffect(() => {
        const sub = inkdrop.commands.add(document.body, {
            "inkdrop_chess_rabbit:toggle": toggle,
        });
        return () => sub.dispose();
    }, [toggle]);

    return (
        <Dialog {...modal.state} onBackdropClick={modal.close}>
            <Dialog.Title>InkdropChessRabbit</Dialog.Title>
            <Dialog.Content>InkdropChessRabbit was toggled!</Dialog.Content>
            <Dialog.Actions>
                <button className="ui button" onClick={modal.close}>
                    Close
                </button>
            </Dialog.Actions>
        </Dialog>
    );
};

export default InkdropChessRabbitMessageDialog;
