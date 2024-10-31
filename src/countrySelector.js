class CountrySelector {
  constructor(website) {
    this.website = website;
  }

  async selectCountry(page, country) {
    const selector = this.getSelector();
    if (selector) {
      await selector(page, country);
    } else {
      console.warn(`Country selection not implemented for ${this.website}`);
    }
  }

  getSelector() {
    const selectors = {
      asos: this.asosSelector,
     
    };
    return selectors[this.website];
  }

  async asosSelector(page, country) {
    const timeout = 10000; 
  
    try {
      console.log('Starting country selection process...');
  
      // Debug step 1: Check if the country selector button exists
      const selectorBtnExists = await page.evaluate(() => {
        const btn = document.querySelector('[data-testid="country-selector-btn"]');
        return btn ? true : false;
      });
      console.log(`Country selector button exists: ${selectorBtnExists}`);
  
      if (!selectorBtnExists) {
        console.log('Country selector button not found. Page content:');
        console.log(await page.content());
        throw new Error('Country selector button not found');
      }
  
      // Wait for the country selector button to be available
      await page.waitForSelector('[data-testid="country-selector-btn"]', { timeout });
      console.log('Country selector button found');
  
      // Debug step 2: Check if the button is visible and clickable
      const isBtnClickable = await page.evaluate(() => {
        const btn = document.querySelector('[data-testid="country-selector-btn"]');
        const rect = btn.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && btn.offsetParent !== null;
      });
      console.log(`Country selector button is clickable: ${isBtnClickable}`);
  
      if (!isBtnClickable) {
        console.log('Country selector button is not clickable. Button details:');
        console.log(await page.evaluate(() => {
          const btn = document.querySelector('[data-testid="country-selector-btn"]');
          return {
            innerText: btn.innerText,
            isVisible: btn.offsetParent !== null,
            dimensions: btn.getBoundingClientRect()
          };
        }));
        throw new Error('Country selector button is not clickable');
      }
  
      // Click the country selector button
      await page.click('[data-testid="country-selector-btn"]');
      console.log('Clicked country selector button');
      
      // Debug step 3: Check if the country selection modal appears
      const modalAppears = await page.evaluate(() => {
        return new Promise((resolve) => {
          const checkModal = () => {
            const modal = document.querySelector('[data-testid="country-selector-form"]');
            if (modal) {
              resolve(true);
            } else {
              setTimeout(checkModal, 100);
            }
          };
          checkModal();
          setTimeout(() => resolve(false), 5000);
        });
      });
      console.log(`Country selection modal appears: ${modalAppears}`);
      await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });


      if (!modalAppears) {
        console.log('Country selection modal did not appear. Page content after click:');
        console.log(await page.content());
        throw new Error('Country selection modal did not appear');
      }
  
      // Wait for the country selection modal to appear
      await page.waitForSelector('[data-testid="country-selector-form"]', { timeout });
      console.log('Country selection modal found');
  
      // Select the desired country
      await page.select('#country', country);
      console.log(`Selected country: ${country}`);
  
      // Click the "Update Preferences" button
      await page.click('[data-testid="save-country-button"]');
      console.log('Clicked Update Preferences button');
  
      // Wait for the page to reload after country selection
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout });
      console.log('Page reloaded after country selection');
  
      console.log(`Successfully changed country to ${country} for ASOS`);
    } catch (error) {
      console.error(`Error during ASOS country selection: ${error.message}`);
      console.log('Current page URL:', await page.url());
      console.log('Page title:', await page.title());
      throw error;
    }
  }
}

export default CountrySelector;