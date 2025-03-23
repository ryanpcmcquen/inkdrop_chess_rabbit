module.exports = {
    activate() {
        console.log("Chess Rabbit ready to run ...");
        if (inkdrop.isEditorActive()) {
            const mde = inkdrop.getActiveEditor();
            inkdrop.commands.add(mde.wrapper.wrapper, {
                "editor:insert-images": (event) => {
                    const { detail } = event;
                    const [possiblePgnFile] = detail.files;
                    const fileType = possiblePgnFile.type;
                    console.log(`File type guess: ${fileType}`);
                    if (!/image/.test(fileType)) {
                        event.preventDefault();
                        event.stopPropagation();
                        return false;
                    }
                },
            });

            this.handleEvent.bind(this)(inkdrop.getActiveEditor());
        } else {
            global.inkdrop.onEditorLoad(this.handleEvent.bind(this));
        }
    },

    deactivate() {
        inkdrop.getActiveEditor().cm.off("drop", this.functionOnDrop);
    },

    handleEvent(editor) {
        const codeMirrorInstance = editor.cm;
        this.functionOnDrop = this.insertPgn.bind(this);

        codeMirrorInstance.on("drop", this.functionOnDrop);
    },

    async insertPgn(codeMirrorInstance, event) {
        const [pgnFile] = event.dataTransfer.files;
        console.log(pgnFile);
        const fileReader = new FileReader();

        fileReader.addEventListener(
            "load",
            async () => {
                await this.importPgn(
                    pgnFile,
                    fileReader.result,
                    codeMirrorInstance
                );
            },
            false
        );

        fileReader.readAsText(pgnFile);
    },

    async importPgn(pgnFile, pgnContents, codeMirrorInstance) {
        const lichessPastedGame = await fetch(
            "https://lichess.org/api/import",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({ pgn: pgnContents }),
            }
        );
        if (lichessPastedGame.ok) {
            const cursorPosition = codeMirrorInstance.getCursor();
            const gameId = lichessPastedGame.url.split("/").pop();
            console.log(`The Lichess game ID is: ${gameId}`);
            codeMirrorInstance.replaceSelection(
                [
                    lichessPastedGame.url,
                    "```pgn",
                    pgnContents,
                    "```",
                    // `<iframe src="https://lichess.org/embed/game/${gameId}?theme=auto&bg=auto" width=600 height=397 frameborder=0></iframe>`,
                    `![${gameId} gif](https://lichess1.org/game/export/gif/${gameId}.gif)`,
                ].join("\n\n")
            );
        }
    },
};
