"use strict";

// import { iframe } from "electron";
// import { markdownRenderer } from "inkdrop";

// inkdrop.onEditorLoad(() => {
//     const mde = inkdrop.getActiveEditor();
//     inkdrop.commands.add(mde.wrapper.wrapper, {
//         "editor:insert-images": (e) => {
//             const { files } = e;
//             console.log("files dropped:", e);

//             e.stopPropagation();
//         },
//     });
// });

module.exports = {
  activate() {
    console.log("Chess Rabbit ready to run ...");
    if (inkdrop.isEditorActive()) {
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
    const mde = inkdrop.getActiveEditor();
    inkdrop.commands.add(mde.wrapper.wrapper, {
      "editor:insert-images": event => {
        const {
          detail
        } = event;
        const [possiblePgnFile] = detail.files;
        if (!/image/.test(possiblePgnFile.type)) {
          event.stopPropagation();
        }
        // debugger;
      }
    });
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
    const cursorPosition = codeMirrorInstance.getCursor();

    // HACK: When the editor is opened in a separate window, delete inserted URL.
    // cm.replaceSelection("");

    // inkdrop.commands.dispatch(document.body, "editor:insert-images", {
    //     pos: {
    //         line: cursorPosition.line,
    //         ch: cursorPosition.ch,
    //     },
    //     files: [pgnContents],
    // });
  },
  async importPgn(pgnFile, pgnContents, codeMirrorInstance) {
    const lichessPastedGame = await fetch("https://lichess.org/api/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        pgn: pgnContents
      })
    });
    codeMirrorInstance.replaceSelection(lichessPastedGame.url);
    inkdrop.commands.dispatch(document.body, "editor:insert-images", {
      pos: {
        line: cursorPosition.line,
        ch: cursorPosition.ch
      },
      files: [pgnFile]
    });
  }
};
//# sourceMappingURL=inkdrop_chess_rabbit.js.map