## Download radiology images from MC

### Install:

1. Install NodeJS from here: https://nodejs.org/en/
2. Download repo

```bash
git clone git@github.com:mjlehrke/mc-radiology-downloader.git
```

3. Enter repo

```bash
cd mc-radiology-downloader
```

4. Install packages

```bash
npm i
```

5. Set configuration: open `index.js` in text editor and add variables required at the top.

- `username` is your MC username
- `password` is your MC password
- `folderName` is the folder name for the images. Note that the script will overwrite existing files
- `loginPageUrl` is found by browsing to the login page and copying the URL
- `radiologyUrl` is found by browsing to the radiology page and copying the URL
- `dataSetName` is for the image set you want to download. This is listed under the radiology images page in the table. e.g. MR BRAIN WITHOUT AND WITH IV CONTRAST

6. Start script

```bash
node index.js
```
