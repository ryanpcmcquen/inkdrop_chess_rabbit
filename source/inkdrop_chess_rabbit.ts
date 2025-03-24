"use babel";
import { Inkdrop, LichessPasteResponse } from "./types";
// import { Auth } from "./auth";

declare const inkdrop: Inkdrop;

module.exports = {
    config: {
        ApiKey: {
            title: "API Key",
            type: "string",
            description:
                "Generate an API Key for Chess Rabbit by clicking the link in the README below (you must be signed in).",
            default: "",
        },
    },

    activate() {
        console.log("The Chess Rabbit is ready to run ...");
        // console.log(
        //     `Your API Key is set to: ${inkdrop.config.get(
        //         "chess_rabbit.ApiKey"
        //     )}`
        // );

        if (inkdrop.isEditorActive()) {
            const mde = inkdrop.getActiveEditor();
            inkdrop.commands.add(mde.wrapper.wrapper, {
                "editor:insert-images": (event) => {
                    const { detail } = event;
                    const [possiblePgnFile] = detail.files;
                    const fileType = possiblePgnFile.type;
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
        const apiKey = inkdrop.config.get("chess_rabbit.ApiKey");
        // const apiKey = "";

        // const myHeaders = new Headers();
        // myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        const headers: HeadersInit = {
            "Content-Type": "application/x-www-form-urlencoded",
        };

        if (apiKey) {
            // myHeaders.append("Authorization", `Bearer ${apiKey}`);
            headers.Authorization = `Bearer ${apiKey}`;
        }

        const lichessPasteResponse = await fetch(
            "https://lichess.org/api/import",
            {
                method: "POST",
                headers: headers,
                body: new URLSearchParams({ pgn: pgnContents }),
            }
        );

        console.log(lichessPasteResponse);

        if (lichessPasteResponse.ok) {
            let lichessPastedGame;

            if (/api\/import/.test(lichessPasteResponse.url)) {
                // If the url contains import, then this was an authorized call:
                lichessPastedGame =
                    (await lichessPasteResponse.json()) as unknown as LichessPasteResponse;
            } else {
                // If the url does note contain import then we parse out the game id.
                lichessPastedGame = lichessPasteResponse;
                lichessPastedGame.id = lichessPastedGame.url.split("/").pop();
            }
            console.log("lichessPastedGame:", lichessPastedGame);
            // console.log(`Your API Key is set to: ${apiKey}`);
            const gameId = lichessPastedGame.id;
            console.log(`The Lichess game ID is: ${gameId}`);

            // const isGameIdValid = await fetch(
            // `https://lichess.org/api/stream/game/${gameId}`
            // );
            // console.log(isGameIdValid);
            // if (isGameIdValid.ok) {

            // If the gameId is 'import', that means we did not receive the proper URL in the response.
            // if (gameId === "import") {
            //     console.log("Import of Lichess game failed.");
            //     return false;
            // }
            const cursorPosition = codeMirrorInstance.getCursor();
            codeMirrorInstance.replaceSelection(
                [
                    lichessPastedGame.url,
                    // "```pgn",
                    // pgnContents,
                    // "```",
                    // The iframe loads successfully, but
                    // some interactions are broken.
                    `<iframe src="https://lichess.org/embed/game/${gameId}?theme=auto&bg=auto" width=600 height=397 frameborder=0></iframe>`,
                    // `![${gameId} gif](https://lichess1.org/game/export/gif/${gameId}.gif)`,
                ].join("\n\n")
            );
        }
    },
};
