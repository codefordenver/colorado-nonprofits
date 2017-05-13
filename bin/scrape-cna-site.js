'use strict';

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const promisify = require('es6-promisify');

// utility helpers
function range(n) {
  return Array.from(new Array(n).keys());
}

function partitionAll(arr, size) {
  const partitions = [];
  for (let i = 0; i < arr.length; i += size) {
    partitions.push(arr.slice(i, i + size));
  }
  return partitions;
}

async function getDetailPageInfo(link) {
  const url = `https://www.coloradononprofits.org${link}`;
  const req = await fetch(url);
  const html = await req.text();
  const $ = cheerio.load(html);
  const data = {
    ['colorado nonprofit url']: url,
    name: $('#page-title').text(),
  };
  $('.view-content .field-content').each((i, v) => {
    const key = $(v).parent().attr('class').split(/\s/)[1].slice('views-field-'.length);
    const val = $(v).text();
    data[key] = val;
  });
  return data;
}

async function getIndexPageLinks(url) {
  const req = await fetch(url);
  const html = await req.text();
  const $ = cheerio.load(html);
  return $('.view-content a.member-type-1').map((i, a) => $(a).attr('href')).toArray();
}

async function getPageOfOrgsInfo(page) {
  const url = `https://www.coloradononprofits.org/membership/nonprofit-member-directory?page=${page}`;
  const links = await getIndexPageLinks(url);
  return Promise.all(links.map(link => getDetailPageInfo(link)));
}

async function getMultiplePagesOfOrgInfo(numOfPages, batchSize = 5) {
  const batchIndexes = partitionAll(range(numOfPages), batchSize);
  let pagesDownloaded = 0;
  let allOrgData = [];

  for (let pageIndexes of batchIndexes) {
    const batchPromises = [];
    pageIndexes.forEach(async idx => {
      const dataPromise = getPageOfOrgsInfo(idx);
      batchPromises.push(dataPromise);

      const pageOfOrgsInfo = await dataPromise;
      allOrgData = allOrgData.concat(pageOfOrgsInfo);
      pagesDownloaded += 1;
      console.log(`Downloaded ${pagesDownloaded} pages of ${numOfPages}`);
    });

    await Promise.all(batchPromises); // only send batch size of requests in parallel at a time
  }

  return allOrgData;
}

const writeFile = promisify(fs.writeFile);

async function writePagesOfDataToAFile(numOfPagesToDownload) {
  const allOrgData = await getMultiplePagesOfOrgInfo(numOfPagesToDownload);

  const fileContent = JSON.stringify(allOrgData, null, 2);
  const filePath = path.join(__dirname, '../public/data/nonprofits.json');
  try {
    await writeFile(filePath, fileContent);
    console.log(`Successfully wrote ${filePath}`)
  } catch (err) {
    console.error(`Failed to write file ${filePath}`);
    console.error(err);
  }
}

const pagesOfOrgsToScrape = 78;
writePagesOfDataToAFile(pagesOfOrgsToScrape);


