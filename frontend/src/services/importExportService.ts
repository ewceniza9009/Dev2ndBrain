import { db } from './db';
import 'dexie-export-import';
import { searchService } from './searchService';

export const importExportService = {
  /**
   * Exports the entire Dexie database to a Blob.
   */
  async exportDatabase(): Promise<Blob> {
    try {
      const blob = await db.export({
        prettyJson: true, // Makes the JSON file human-readable
        filter: (table, _value, _key) => {
          // We don't need to export the settings table (e.g., auth tokens)
          return table !== 'settings';
        },
      });
      return blob;
    } catch (error) {
      console.error('Error exporting database:', error);
      throw error;
    }
  },

  /**
   * Imports data from a Blob into the Dexie database, overwriting existing data.
   * @param dataBlob The Blob object containing the exported JSON data.
   */
  async importDatabase(dataBlob: Blob): Promise<void> {
    try {
      console.log('Starting database import...');
      await db.import(dataBlob, {
        overwriteValues: true,
        clearTablesBeforeImport: true,
        acceptVersionDiff: true, // VITAL FIX: Allows importing from older db versions
      });
      
      console.log('Database imported successfully. Re-initializing search index...');
      
      // After importing, re-initialize the search index with the new data
      await searchService.initialize();
      
      console.log('Reloading application to reflect changes...');
      // A full reload is the most reliable way to ensure all stores and components
      // are updated with the newly imported data.
      window.location.reload();

    } catch (error) {
      console.error('Error importing database:', error);
      throw error;
    }
  },
};