# ReactScripter


This is a simple web application built with React and Node.js that allows users to browse and run script files in a web browser. The app uses the Chonky UI library to display a file browser interface in the browser, and the Node.js Express framework to serve the content and run the scripts.

Chonky UI - https://chonky.io/

Shoutout to filebrowserjjin for boilerplate code - https://codesandbox.io/s/filebrowserjjin-qv95vv

## Installation

To run ReactScripter, simply follow the steps below:

## Docker
The image comes with netmiko pre-installed, if you need your own libraries clone the repo and build your own image with the requirements.

Create a scripts folder to hold the script files
```
mkdir scripts
```


Run the docker command to download the image and simply browse to the container.
```
docker run \
    -v "$(pwd)/scripts:/usr/app/server/scripts" \
    -p 5015:5015 \
    gt732/reactscripter
```

## Demo
Scripts folder directory
![alt text](https://i.imgur.com/A65AYW4.png)

Running a bash script
![alt text](https://i.imgur.com/FXai9gW.png)

Python Netmiko script with arguments
![alt test](https://i.imgur.com/dr2Ogu6.png)
