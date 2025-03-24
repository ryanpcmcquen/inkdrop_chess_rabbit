"use strict";
"use babel";

// import { Auth } from "./auth";

module.exports = {
  config: {
    ApiKey: {
      title: "API Key",
      type: "string",
      description: "Generate an API Key for Chess Rabbit by clicking the link in the README below (you must be signed in).",
      default: ""
    }
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
        "editor:insert-images": event => {
          const {
            detail
          } = event;
          const [possiblePgnFile] = detail.files;
          const fileType = possiblePgnFile.type;
          if (!/image/.test(fileType)) {
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
        }
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
    fileReader.addEventListener("load", async () => {
      await this.importPgn(pgnFile, fileReader.result, codeMirrorInstance);
    }, false);
    fileReader.readAsText(pgnFile);
  },
  async importPgn(pgnFile, pgnContents, codeMirrorInstance) {
    const apiKey = inkdrop.config.get("chess_rabbit.ApiKey");
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    if (apiKey) {
      myHeaders.append("Authorization", `Bearer ${apiKey}`);
    }
    const lichessPastedGame = await fetch("https://lichess.org/api/import", {
      method: "POST",
      headers: myHeaders,
      body: new URLSearchParams({
        pgn: pgnContents
      })
    });
    if (lichessPastedGame.ok) {
      // console.log(
      //     `Your API Key is set to: ${inkdrop.config.get(
      //         "chess_rabbit.ApiKey"
      //     )}`
      // );
      const cursorPosition = codeMirrorInstance.getCursor();
      const gameId = lichessPastedGame.url.split("/").pop();
      console.log(`The Lichess game ID is: ${gameId}`);
      codeMirrorInstance.replaceSelection([lichessPastedGame.url,
      // "```pgn",
      // pgnContents,
      // "```",
      // The iframe loads successfully, but
      // some interactions are broken.
      `<iframe src="https://lichess.org/embed/game/${gameId}?theme=auto&bg=auto" width=600 height=397 frameborder=0></iframe>`
      // `![${gameId} gif](https://lichess1.org/game/export/gif/${gameId}.gif)`,
      ].join("\n\n"));
    }
  }
};
//# sourceMappingURL=inkdrop_chess_rabbit.js.map