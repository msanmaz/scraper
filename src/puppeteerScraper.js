import puppeteer from 'puppeteer';
import CountrySelector from './countrySelector.js';

class PuppeteerScraper {
  constructor(proxyConfig, website) {
    this.proxyConfig = proxyConfig;
    this.countrySelector = new CountrySelector(website);
  }

  async initializeBrowser() {
    this.browser = await puppeteer.launch({
      headless: true,
      ignoreHTTPSErrors: true,
      args: [
        '--ignore-certificate-errors',
        `--proxy-server=http://${this.proxyConfig.server}:${this.proxyConfig.port}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  }

  async fetchPage(url, options = {}) {
    if (!this.browser) {
      await this.initializeBrowser();
    }

    const page = await this.browser.newPage();
    await page.authenticate({
      username: this.proxyConfig.username,
      password: this.proxyConfig.password,
    });

    await page.setJavaScriptEnabled(true);

    if (options.interceptRequests) {
      await page.setRequestInterception(true);
      page.on('request', (req) => options.interceptRequests(req));
    }

    if (options.cookies) {
      await page.setCookie(...options.cookies);
    }

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept-Language': options.language || 'en-GB,en-US;q=0.9,en;q=0.8',
      ...options.headers
    };
    await page.setExtraHTTPHeaders(headers);

    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
      // await this.countrySelector.selectCountry(page, options.country);

      if (options.contentSelector) {
        await page.waitForSelector(options.contentSelector, { timeout: 10000 });
      }

      const content = await page.content();
      return content;
    } catch (error) {
      console.error('Error fetching page:', error);
      return null;
    } finally {
      await page.close();
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

export default PuppeteerScraper;