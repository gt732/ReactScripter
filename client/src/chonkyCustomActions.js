import { defineFileAction } from "chonky";


const runFileAction = defineFileAction({
  id: "runscript",
  requiresSelection: true,
  fileFilter: (file) => file && !file.isDir,
  button: {
    name: "Start Script 🏃",
    toolbar: true,
    contextMenu: true,
  }
});

export const customActions = [
  runFileAction,
];
