import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { Uri, ExtensionContext, commands } from "vscode";
import JsonToTS from "json-to-ts";
import {
  handleError,
  getClipboardText,
  parseJson,
  pasteToMarker,
  getSelectedText,
  getViewColumn,
  validateLength,
} from "./lib";

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("jsonToTs.fromSelection", transformFromSelection)
  );
  context.subscriptions.push(
    commands.registerCommand("jsonToTs.fromClipboard", transformFromClipboard)
  );
}

function transformFromSelection() {
  const tmpFilePath = path.join(os.tmpdir(), "json-to-ts.ts");
  const tmpFileUri = Uri.file(tmpFilePath);

  getSelectedText()
    .then(validateLength)
    .then(parseJson)
    .then(json => {
      return JsonToTS(json).reduce((a, b) => `${a}\n\n${b}`);
    })
    .then(interfaces => {
      fs.writeFileSync(tmpFilePath, interfaces);
    })
    .then(() => {
      commands.executeCommand("vscode.open", tmpFileUri, getViewColumn());
    })
    .catch(handleError);
}

function transformFromClipboard() {
  getClipboardText()
    .then(validateLength)
    .then(parseJson)
    .then(json => {
      return JsonToTS(json).reduce((a, b) => `${a}\n\n${b}`);
    })
    .then(interfaces => {
      pasteToMarker(interfaces);
    })
    .catch(handleError);
}
