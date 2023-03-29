import { ChonkyActions } from "chonky";
import { findFile } from "./folderSearch";

const handleAction = (data, setCurrentFolder) => {
  fetch("/scripts")
    .then((response) => response.json())
    .then((responeData) => {
      const apiData = responeData.data;
      if (data.id === ChonkyActions.OpenFiles.id) {
        const file = findFile(apiData, data.payload.files[0].id);
        if (file?.isDir) {
          setCurrentFolder(file.id);
        }
      }
    })
    .catch((error) => console.log(error));
};

export default handleAction;
