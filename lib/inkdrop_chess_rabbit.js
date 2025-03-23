"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _inkdrop = require("inkdrop");
// import { iframe } from "electron";

inkdrop.onEditorLoad(() => {
  const cm = editor.cm;
  const mde = inkdrop.getActiveEditor();
  console.log(mde);
});
var _default = exports.default = {
  activate() {
    // global.inkdrop.onEditorLoad(() => {
    //     const mde = inkdrop.getActiveEditor();
    //     inkdrop.commands.add(mde.wrapper.wrapper, {
    //         "editor:insert-images": (e) => {
    //             const { files } = e;
    //             console.log("files dropped:", e);

    //             e.stopPropagation();
    //         },
    //     });
    // });
    console.log("Chess Rabbit ready to run ...");
    const mde = inkdrop.getActiveEditor();
    console.log(mde);
    if (inkdrop.isEditorActive()) {
      this.handleEvent.bind(this)(inkdrop.getActiveEditor());
    } else {
      global.inkdrop.onEditorLoad(this.handleEvent.bind(this));
    }
    if (_inkdrop.markdownRenderer) {
      _inkdrop.markdownRenderer.remarkCodeComponents.pgn = pgn;
      debugger;
    }
  },
  deactivate() {
    inkdrop.getActiveEditor().cm.off("drop", this.functionOnDrop);
    if (_inkdrop.markdownRenderer) {
      _inkdrop.markdownRenderer.remarkCodeComponents.pgn = null;
    }
  },
  handleEvent(editor) {
    const cm = editor.cm;
    const mde = inkdrop.getActiveEditor();
    console.log(mde);
    debugger;
    inkdrop.commands.add(mde.wrapper.wrapper, {
      "editor:insert-images": e => {
        const {
          files
        } = e;
        console.log("files dropped:", e);
        e.stopPropagation();
        this.functionOnDrop = this.insertPgn.bind(this);
        cm.on("drop", this.functionOnDrop);
      }
    });
  },
  async insertPgn(cm, e) {
    const pgnContents = e.dataTransfer.getData();
    console.log(pgnContents);
    debugger;
    if (!pgnContents) {
      return false;
    }
    await this.importPgn(pgnContents);
    // function (imageArrayBuffer) {
    //    const imageBuffer = Buffer.from(imageArrayBuffer);
    //    const imageNativeImage = nativeImage.createFromBuffer(imageBuffer);

    //    if (imageNativeImage.isEmpty()) {
    //        return false;
    //    }

    const cursorPosition = cm.getCursor();

    // HACK: When the editor is opened in a separate window, delete inserted URL.
    cm.replaceSelection("");

    //             inkdrop.commands.dispatch(document.body, "editor:insert-images", {
    //                 pos: {
    //                     line: cursorPosition.line,
    //                     ch: cursorPosition.ch,
    //                 },
    //                 files: [imageNativeImage],
    //             });
    // }
  },
  async importPgn(pgnContents) {
    // const xhr = new XMLHttpRequest();
    // xhr.onreadystatechange = function () {
    //     if (xhr.readyState == 4) {
    //         callback(this.response);
    //     }
    // };
    // xhr.responseType = "arraybuffer";
    // xhr.open("POST", "https://lichess.org/api/import", {
    //     pgn: pgnContents,
    // });
    // xhr.send();

    await fetch("https://lichess.org/api/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        pgn: pgnContents
      })
    });
  }
};
//# sourceMappingURL=inkdrop_chess_rabbit.js.map