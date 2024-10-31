import dotenv from 'dotenv';
import ScraperFactory from './scraperFactory.js';
import DataStore from './datastore.js';
import { performPriceAnalysis, displayPriceAnalysis } from './priceAnalysis.js';

dotenv.config();

const apiKey = process.env.SCRAPEOPS_API_KEY;
const asosBaseUrl = process.env.ASOS_BASE_URL;
const defaultSearchQuery = process.env.DEFAULT_SEARCH_QUERY;

console.log('Starting scraper with the following configuration:');
console.log('API Key:', apiKey ? '**********' : 'Not set');
console.log('Base URL:', asosBaseUrl);
console.log('Default Search Query:', defaultSearchQuery);

async function main(website = 'asos', searchQuery = defaultSearchQuery) {
  const scraper = ScraperFactory.createScraper(website, apiKey, asosBaseUrl, {
    minimizeRequests: true,
    country: 'IE', 
    currency: 'EUR'
  });
    const dataStore = new DataStore(`${website}_products.json`);

  try {
    console.log(`Scraping ${website} product information for search query: "${searchQuery}"...`);
    const newProducts = await scraper.scrapeProducts(searchQuery);
    console.log(`Scraped ${newProducts.length} product records`);

    if (newProducts.length === 0) {
      console.log('No products found. Exiting.');
      return;
    }

    console.log('Saving and merging product data...');
    const uniqueProducts = await dataStore.mergeAndSave(newProducts);
    console.log(`Saved ${uniqueProducts.length} unique product records`);

    console.log('\nSample of product data:');
    console.log(JSON.stringify(uniqueProducts.slice(0, 2), null, 2));

    console.log('\nPerforming price analysis...');
    const priceAnalysis = performPriceAnalysis(uniqueProducts);
    displayPriceAnalysis(priceAnalysis);
  } catch (error) {
    console.error('An error occurred during scraping:', error);
  }
}

const website = process.argv[2] || 'asos';
const customSearchQuery = process.argv[3];
main(website, customSearchQuery).catch(console.error);