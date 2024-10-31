import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DataStore {
  constructor(filename) {
    this.filename = filename.replace(/\s+/g, '_');
    this.dirpath = path.join(__dirname, '..', 'data');
    this.filepath = path.join(this.dirpath, this.filename);
  }

  async ensureDirectoryExists() {
    try {
      await fs.mkdir(this.dirpath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        console.error('Error creating directory:', error);
      }
    }
  }

  async save(data) {
    try {
      await this.ensureDirectoryExists();
      await fs.writeFile(this.filepath, JSON.stringify(data, null, 2));
      console.log('Data saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  async load() {
    try {
      await this.ensureDirectoryExists();
      const data = await fs.readFile(this.filepath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('No existing data found, starting fresh');
        return [];
      }
      console.error('Error loading data:', error);
      return [];
    }
  }

  async mergeAndSave(newData) {
    const existingData = await this.load();
    
    const mergedData = [...existingData, ...newData];
    
    // Remove duplicates based on product URL, keeping the most recent
    const uniqueData = mergedData.reduce((acc, current) => {
      const x = acc.find(item => item.productUrl === current.productUrl);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc.map(item => 
          item.productUrl === current.productUrl && new Date(item.scrapedAt) < new Date(current.scrapedAt) 
            ? current 
            : item
        );
      }
    }, []);

    await this.save(uniqueData);
    return uniqueData;
  }
}

export default DataStore;