import BaseScraper from './baseScraper.js';

class AsosScraper extends BaseScraper {
  constructor(apiKey, baseUrl, options = {}) {
    super(apiKey, baseUrl, {
      website: 'asos',
      country: options.country || 'IE',
      currency: options.currency || 'EUR',
      language: options.language || 'en-IE',
      minimizeRequests: options.minimizeRequests || false
    });
  }

  constructUrl(query, page) {
    return `${this.baseUrl}/search/?q=${encodeURIComponent(query)}&page=${page}`;
  }

  async fetchPage(url, options = {}) {
    return super.fetchPage(url, {
      ...options,
      interceptRequests: this.options.minimizeRequests ? this.interceptRequests.bind(this) : null,
      contentSelector: '.productTile_U0clN'
    });
  }


 
  interceptRequests(req) {
    const resourceType = req.resourceType();
    const url = req.url().toLowerCase();
    
    if (resourceType === 'document' && url.includes('/search/?q=')) {
      console.log('Continue Request document', url);
      req.continue();
    } else if (resourceType === 'xhr' && url.includes('/api/product/')) {
      console.log('Continue Request xhr', url);
      req.continue();
    } else if (resourceType === 'xhr' && url.includes('/api/web/countrymetadata/v1/countryselector/')) {
      console.log('Continue Request country selector', url);
      req.continue();
    } else if (resourceType === 'fetch' && url.includes('/api/web/countrymetadata/v1/countryselector/')) {
      console.log('Continue Request country selector (fetch)', url);
      req.continue();
    } else {
      req.abort();
    }
  }

  async extractProducts($) {
    const products = [];
    $('article.productTile_U0clN').each((index, element) => {
      const $element = $(element);
      const productId = $element.attr('id')?.replace('product-', '');
      const productUrl = $element.find('a.productLink_KM4PI').attr('href');
      const imageUrl = $element.find('img').attr('src');
      const description = $element.find('p.productDescription_sryaw').text().trim();
      
      let price = '';
      const salePrice = $element.find('span.saleAmount_C4AGB').text().trim();
      const originalPrice = $element.find('span.price__B9LP').text().trim();
      price = salePrice || originalPrice;
      
      const badge = $element.find('div.badge_juy1n').text().trim();
      const deal = $element.find('div.productDeal_RiYVs').text().trim();
  
      products.push({
        productId,
        productUrl: this.normalizeUrl(productUrl),
        imageUrl,
        description,
        price,
        badge,
        deal,
        scrapedAt: new Date().toISOString()
      });
    });
    return products;
  }

  hasNextPage($) {
    return $('a[data-auto-id="loadMoreProducts"]').length > 0;
  }

  getCookies() {
    return [
      { name: 'geocountry', value: this.options.country, domain: '.asos.com' },
      { name: 'currency', value: this.options.currency, domain: '.asos.com' },
      { name: 'browseCountry', value: this.options.country, domain: '.asos.com' }
    ];
  }
}

export default AsosScraper;