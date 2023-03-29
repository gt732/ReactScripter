import "./styles.css";
import { setChonkyDefaults } from "chonky";
import { ChonkyIconFA } from "chonky-icon-fontawesome";
import { FullFileBrowser, ChonkyActions } from "chonky";
import { useEffect, useState } from "react";
import folderSearch from "./folderSearch";
import handleAction from "./chonkyActionHandler";
import { customActions } from "./chonkyCustomActions";
import Startscript from "./Startscript";

export default function App() {
  setChonkyDefaults({ iconComponent: ChonkyIconFA });

  const [currentFolder, setCurrentFolder] = useState("0");
  const [files, setFiles] = useState(null);
  const [folderChain, setFolderChain] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const fileActions = [...customActions];

  const handleActionWrapper = (fileData) => {
    setSelectedFile(fileData);
    handleAction(fileData, setCurrentFolder);
  };

  useEffect(() => {
    fetch("/scripts")
      .then((response) => response.json())
      .then((data) => {
        setFileData(data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    let folderChainTemp = [];
    let filesTemp = [];

    const [found, filesTemp1, folderChainTemp1] = folderSearch(
      fileData,
      folderChainTemp,
      currentFolder
    );
    if (found) {
      filesTemp = filesTemp1;
      folderChainTemp = folderChainTemp1;
    }

    setFolderChain(folderChainTemp);
    setFiles(filesTemp);
  }, [currentFolder, fileData]);

  return (
    <div>
      <div className="App">
        <FullFileBrowser
          files={files}
          folderChain={folderChain}
          defaultFileViewActionId={ChonkyActions.EnableListView.id}
          fileActions={fileActions}
          onFileAction={handleActionWrapper}
          disableDefaultFileActions={true}
          enableDragAndDrop={false}
        />
      </div>
      <div>{selectedFile && <Startscript fileObject={selectedFile} />}</div>
    </div>
  );
}
