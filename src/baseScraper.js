import * as cheerio from 'cheerio';
import PuppeteerScraper from './puppeteerScraper.js';

class BaseScraper {
  constructor(apiKey, baseUrl, options = {}) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.options = options;
    this.puppeteerScraper = new PuppeteerScraper({
      username: 'scrapeops.headless_browser_mode=true',
      password: this.apiKey,
      server: 'proxy.scrapeops.io',
      port: '5353'
    }, this.options.website);
    this.requestCount = 0;
  }

  async fetchPage(url, options = {}) {
    this.requestCount++;
    const html = await this.puppeteerScraper.fetchPage(url, {
      cookies: this.getCookies(),
      headers: this.getHeaders(),
      country: this.options.country,
      language: this.options.language,
      interceptRequests: options.interceptRequests,
      contentSelector: options.contentSelector
    });
    return html;
  }

  getHeaders() {
    return {
      'Accept-Language': `${this.options.language || 'en-GB'},en-US;q=0.9,en;q=0.8`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };
  }

  getCookies() {
    return [];
  }

  async scrapeProducts(query) {
    let allProducts = [];
    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const url = this.constructUrl(query, currentPage);
      const html = await this.fetchPage(url);

      if (!html) {
        console.log(`Failed to fetch page ${currentPage}. Stopping.`);
        break;
      }

      const $ = cheerio.load(html);
      const products = await this.extractProducts($);

      if (products.length === 0) {
        console.log(`No products found on page ${currentPage}. Stopping.`);
        break;
      }

      allProducts = allProducts.concat(products);
      console.log(`Scraped ${products.length} products from page ${currentPage}. Total: ${allProducts.length}`);

      hasNextPage = this.hasNextPage($);
      currentPage++;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Total requests made: ${this.requestCount}`);
    return allProducts;
  }

  constructUrl(query, page) {
    throw new Error('constructUrl method must be implemented by subclasses');
  }

  async extractProducts($) {
    throw new Error('extractProducts method must be implemented by subclasses');
  }

  hasNextPage($) {
    throw new Error('hasNextPage method must be implemented by subclasses');
  }

  normalizeUrl(url) {
    if (url && !url.startsWith('http')) {
      return `${this.baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return url;
  }
}

export default BaseScraper;