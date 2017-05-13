'use strict';

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const promisify = require('es6-promisify');

async function getDetailPageInfo(link) {
  const url = `https://www.coloradononprofits.org${link}`;
  const req = await fetch(url);
  const html = await req.text();
  const $ = cheerio.load(html);
  const data = {
    ['colorado nonprofit url']: url,
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

function range(n) {
  return Array.from(new Array(n).keys());
}

async function getMultiplePagesOfOrgInfo(numOfPages) {
  const pageIndexes = range(numOfPages);
  let pagesDownloaded = 0;
  let allOrgData = [];
  const operationPromises = [];

  pageIndexes.forEach(async idx => {
    const dataPromise = getPageOfOrgsInfo(idx);
    operationPromises.push(dataPromise);

    const pageOfOrgsInfo = await dataPromise;
    allOrgData = allOrgData.concat(pageOfOrgsInfo);
    pagesDownloaded += 1;
    console.log(`Downloaded ${pagesDownloaded} pages of ${numOfPages}`);
  });

  await Promise.all(operationPromises);
  return allOrgData;
}

const writeFile = promisify(fs.writeFile);

async function writePagesOfDataToAFile(numOfPagesToDownload) {
  const allOrgData = await getMultiplePagesOfOrgInfo(numOfPagesToDownload);

  const fileContent = JSON.stringify(allOrgData);
  const filePath = path.join(__dirname, 'data/nonprofits.json');
  try {
    await writeFile(filePath, fileContent);
    console.log(`Successfully wrote ${filePath}`)
  } catch (err) {
    console.error(`Failed to write file ${filePath}`);
    console.error(err);
  }
}

writePagesOfDataToAFile(2);


