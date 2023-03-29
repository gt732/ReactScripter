import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import { spawn } from "child_process";
import bodyParser from "body-parser";

const app = express();
const port = 5015;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "client", "build");

app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(root));

// A helper function that recursively scans the directory for script files
function getScriptFiles(dir, id) {
  let files = readdirSync(dir);
  let children = [];
  // Loop through all files in the directory
  files.forEach((file) => {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);
    const fileId = id + "/" + file;

    // If the file is a directory, recursively call the function
    if (stat.isDirectory()) {
      const child = {
        id: fileId,
        name: file,
        isDir: true,
        files: getScriptFiles(fullPath, fileId),
      };
      children.push(child);

      // If the file is a py script file, add it to the list of children
    } else if (file.endsWith(".py")) {
      const child = {
        id: fileId,
        name: file,
        isDir: false,
        color: "blue",
        thumbnailUrl:
          "https://cdn.iconscout.com/icon/free/png-256/python-3629591-3032289.png",
      };
      children.push(child);
      // If the file is a sh script file, add it to the list of children
    } else if (file.endsWith(".sh")) {
      const child = {
        id: fileId,
        name: file,
        isDir: false,
        color: "green",
        thumbnailUrl:
          "https://camo.githubusercontent.com/c5958aac2c6cd8b680061594f9924e2db27abf2acc4717c207c2687bc693de65/68747470733a2f2f63646e2d696d616765732d312e6d656469756d2e636f6d2f6d61782f3235362f312a46454539386957696e6c5a42596b78424147384d76412e706e67",
      };
      children.push(child);
    }
  });

  return children;
}

// Define a new route that returns the data in the desired format
app.get("/scripts", (req, res) => {
  const scriptsFolder = join(__dirname, "scripts");
  const data = [
    {
      id: "0",
      name: "Scripts",
      isDir: true,
      files: getScriptFiles(scriptsFolder, "0"),
    },
  ];
  res.json({ data });
});

// Define a new route that triggers a Python script and sends its output to the client
app.post("/run-script", (req, res) => {
  const { argumentObj, scriptName } = req.body;
  const scriptsFolder = join(__dirname, "scripts");
  let scriptPath = null;

  // Search for the file with the given name in the scripts folder and its subfolders
  const files = readdirSync(scriptsFolder, { withFileTypes: true });
  for (const file of files) {
    const fullPath = join(scriptsFolder, file.name);
    if (file.isDirectory()) {
      const subFiles = readdirSync(fullPath, { withFileTypes: true });
      for (const subFile of subFiles) {
        if (subFile.isFile() && subFile.name === scriptName) {
          scriptPath = join(fullPath, subFile.name);
          break;
        }
      }
    } else if (file.isFile() && file.name === scriptName) {
      scriptPath = fullPath;
      break;
    }
  }

  if (!scriptPath) {
    res.status(404).text({ error: `Script ${scriptName} not found` });
    return;
  }

  // Define variables
  let argumentAdd = [];
  let output = "";
  let language = "";

  // Determine the language of the script
  if (scriptName.endsWith(".py")) {
    language = "python";
  } else if (scriptName.endsWith(".sh")) {
    language = "bash";
  }

  // If the script has arguments, add them to the command
  if (argumentObj) {
    Object.entries(argumentObj).forEach(([key, value]) => {
      argumentAdd.push(key, value);
    });
    const process = spawn(language, [scriptPath, ...argumentAdd]);

    // Listen for output from the script
    process.stdout.on("data", (data) => {
      console.log(data.toString());
      output += data.toString(); // Add output to the variable
    });

    // If the script errors out, log the error and store it in the variable
    process.stderr.on("data", (data) => {
      console.error(data.toString());
      output = data.toString(); // Overwrite the existing output with the error message
    });

    // When the script is done, send the output to the client
    process.on("close", (code) => {
      console.log(`Child process exited with code ${code}`);
      if (code !== 0) {
        res.status(500).send(output);
      } else if (output) {
        res.send(output);
      } else {
        res.status(500).json({ error: "No output received from script." });
      }
      res.end();
    });
    // If the script has no arguments, just run it
  } else {
    const process = spawn(language, [scriptPath]);

    // Listen for output from the script
    process.stdout.on("data", (data) => {
      console.log(data.toString());
      output += data.toString(); // Add output to the variable
    });

    // If the script errors out, log the error and store it in the variable
    process.stderr.on("data", (data) => {
      console.error(data.toString());
      output = data.toString(); // Overwrite the existing output with the error message
    });

    // When the script is done, send the output to the client
    process.on("close", (code) => {
      console.log(`Child process exited with code ${code}`);
      if (code !== 0) {
        res.status(500).send(output);
      } else if (output) {
        res.send(output);
      } else {
        res.status(500).json({ error: "No output received from script." });
      }
      res.end();
    });
  }
});

// Home route
app.use("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
