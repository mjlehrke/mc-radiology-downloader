// Account username
const username = "";
// Account password
const password = "";
// Folder where images should be saved
// Note: The script will overwrite any images already in the folder
const folderName = "images";
// Login URLs seem unique per device, so browse to it first and enter the URL here
const loginPageUrl = "";
// URL for radiology results
// I could hardcode it but I don't want it in the repo
const radiologyUrl = "";
// Name of the data set you want to download
// This is listed in the table on the radiology images page
// e.g. "MR BRAIN WITHOUT AND WITH IV CONTRAST"
const dataSetName = "";

const { existsSync, mkdirSync, writeFileSync, mkdir } = require("fs");
const { resolve } = require("path");
const puppeteer = require("puppeteer");

// Return error if variables are not defined
if (
  username.length === 0 ||
  password.length === 0 ||
  folderName.length === 0 ||
  loginPageUrl.length === 0 ||
  radiologyUrl.length === 0 ||
  dataSetName.length === 0
) {
  throw new Error("Please provide required settings");
}

// Create directory if it does not exist
const directory = resolve(__dirname, folderName);
if (!existsSync(directory)) {
  mkdirSync(directory);
}

// Simple index for file names
let index = 0;

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1200 });

  // Log into the page with Puppeteer and go to the radiology page
  await page.goto(loginPageUrl);
  await page.type("#signInName", username);
  await page.type("#password", password);
  await page.click("#next");
  await page.waitForNavigation();
  await page.goto(radiologyUrl);

  // Bring up the results for the desired data set
  const xpath = `//a[contains(., '${dataSetName}')]`;
  await page.waitForXPath(xpath);
  const [dataSetLink] = await page.$x(xpath);
  dataSetLink.click();

  // Recursively get the images and save them
  // The function will click the next arrow and run again if needed
  await page.waitForSelector(".responsive-img");
  await downloadImage(page);

  await browser.close();
})();

// Function to download images
const downloadImage = async (page) => {
  index++;
  // Fetch the base64 image source
  const imageSrc = await page.evaluate((sel) => {
    return document
      .querySelector(sel)
      .getAttribute("src")
      .replace("data:image/png;base64,", "");
  }, ".responsive-img");
  // Create a buffer with the image src
  const buffer = Buffer.from(imageSrc, "base64");
  console.log(`Downloading images-${index}`);
  // Save image file with buffer
  writeFileSync(`${__dirname}/${folderName}/image-${index}.png`, buffer);

  // Determine if there is an active next button, if there is click it
  const nextImageXPath =
    "//div[@class='controls']//button[@class='btn-lg'][not(@disabled)]";
  await page.waitForXPath(nextImageXPath);
  const nextImageButton = await page.$x(nextImageXPath);
  // Determine what button to click (changes based on what image you are on)
  if (nextImageButton.length === 1 && index === 1) {
    // If the first image, the next button is the only active one
    await nextImageButton[0].click();
    await page.waitForSelector(".responsive-img");
    await downloadImage(page);
  } else if (nextImageButton.length > 1) {
    // If not the first image, the next button is the second active one
    await nextImageButton[1].click();
    await page.waitForSelector(".responsive-img");
    await downloadImage(page);
  } else {
    return;
  }
};
