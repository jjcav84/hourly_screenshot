import * as functions from 'firebase-functions';

import * as puppeteer from 'puppeteer';

import * as admin from 'firebase-admin';

export const firebaseConfig = {
  apiKey: "AIzaSyCSjJF8ggpo6rv4ADugXs7mfRDmPxcD2S4",
  authDomain: "puppet-fire-jcav.firebaseapp.com",
  databaseURL: "https://puppet-fire-jcav.firebaseio.com",
  projectId: "puppet-fire-jcav",
  storageBucket: "puppet-fire-jcav.appspot.com",
  messagingSenderId: "1002502486111",
  appId: "1:1002502486111:web:fa990b26632b8131"
};

// Initialize Firebase
admin.initializeApp(firebaseConfig);

const runtimeOpts = {
  timeoutSeconds: 150,
  memory: <const>'2GB'
};

export const takeScreenshot =
  functions.runWith(runtimeOpts)
    .https.onRequest(takeScreenShotOnRequest);

async function takeScreenShotOnRequest(request, response) {
  try {
    const imageBuffer: string = await generateScreenShot();
    await saveScreenShot(imageBuffer);
  } catch (err) {
    console.error(err);
  }
}
function generateScreenShot(): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    try {
      const browser =
        await puppeteer.launch({ args: ['--no-sandbox'] });

      const page = await browser.newPage();

      // Screenshot size
      await page.setViewport({ width: 1600, height: 1600 });

      // Go to your website
      await page.goto('https://gatsby-github-stats.netlify.com/');

      // Disable service workers
      await (page as any)._client
        .send('ServiceWorker.enable');
      await (page as any)._client
        .send('ServiceWorker.stopAllWorkers');

      // Wait for a particular components to be loaded
      // await page
      //  .waitForFunction('document.querySelector("deckgo-deck  > *")');

      // Take the screenshot
      const imageBuffer: string = await page.screenshot();

      await browser.close();

      resolve(imageBuffer);
    } catch (err) {
      reject(err);
    }
  });
}

function saveScreenShot(imageBuffer: string): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    if (!imageBuffer || imageBuffer === '') {
      reject('No screenshot');
      return;
    }

    try {
      // We get the instance of our default bucket
      const bucket = admin.storage().bucket();

      // create date variable
      const date = Date.now();

      // Create a file object
      const file = bucket.file(`/screenshots/gatsby-stats` + date + `.png`);

      // Save the image
      await file.save(imageBuffer);

      resolve();
    } catch (err) {
      reject(err);
    }
  });
}