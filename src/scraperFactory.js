import AsosScraper from './asosScraper.js';

class ScraperFactory {
  static createScraper(website, apiKey, baseUrl, options = {}) {
    switch (website.toLowerCase()) {
      case 'asos':
        return new AsosScraper(apiKey, baseUrl, {
          minimizeRequests: options.minimizeRequests || false,
          country: options.country,
          currency: options.currency
        });
      default:
        throw new Error(`Unsupported website: ${website}`);
    }
  }
}

export default ScraperFactory;