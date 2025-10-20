/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs';
import * as path from 'path';

/**
 * Merge extracted translations into main translation files
 *
 * Usage: npx ts-node scripts/merge-translations.ts
 */

interface MergeOptions {
  overwrite?: boolean;
  backup?: boolean;
}

class TranslationMerger {
  private options: MergeOptions;

  constructor(options: MergeOptions = {}) {
    this.options = {
      overwrite: false,
      backup: true,
      ...options,
    };
  }

  /**
   * Deep merge two objects
   */
  private deepMerge(target: any, source: any, overwrite: boolean = false): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] instanceof Object && !Array.isArray(source[key])) {
        // Recursive merge for nested objects
        if (result[key] instanceof Object && !Array.isArray(result[key])) {
          result[key] = this.deepMerge(result[key], source[key], overwrite);
        } else {
          result[key] = source[key];
        }
      } else {

        result[key] = source[key];

      }
    }

    return result;
  }

  /**
   * Read JSON file safely
   */
  private readJSON(filePath: string): any {
    const fullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️  File not found: ${filePath}`);
      return {};
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Write JSON file with backup
   */
  private writeJSON(filePath: string, data: any): void {
    const fullPath = path.join(process.cwd(), filePath);

    // Create backup if file exists
    if (this.options.backup && fs.existsSync(fullPath)) {
      const backupPath = fullPath.replace('.json', '.backup.json');
      fs.copyFileSync(fullPath, backupPath);
      console.info(`📦 Backup created: ${backupPath}`);
    }

    // Ensure directory exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Count translations in object
   */
  private countTranslations(obj: any): number {
    let count = 0;
    for (const value of Object.values(obj)) {
      if (typeof value === 'string') {
        count++;
      } else if (typeof value === 'object' && value !== null) {
        count += this.countTranslations(value);
      }
    }
    return count;
  }

  /**
   * Merge extracted files into main files
   */
  merge(): void {
    console.info('🔄 Starting merge process...\n');

    // Merge English
    console.info('📖 Merging English translations...');
    const currentEn = this.readJSON('./messages/en.json');
    const extractedEn = this.readJSON('./messages/extracted-en.json');

    const beforeCountEn = this.countTranslations(currentEn);
    const extractedCountEn = this.countTranslations(extractedEn);

    const mergedEn = this.deepMerge(currentEn, extractedEn, this.options.overwrite);
    const afterCountEn = this.countTranslations(mergedEn);
    const newKeysEn = afterCountEn - beforeCountEn;

    this.writeJSON('./messages/en.json', mergedEn);

    console.info(`  ✅ Before: ${beforeCountEn} translations`);
    console.info(`  ✅ Extracted: ${extractedCountEn} translations`);
    console.info(`  ✅ After: ${afterCountEn} translations`);
    console.info(`  ✅ New keys added: ${newKeysEn}\n`);

    // Merge Swahili
    console.info('📖 Merging Swahili translations...');
    const currentSw = this.readJSON('./messages/sw.json');
    const extractedSw = this.readJSON('./messages/extracted-sw.json');

    const beforeCountSw = this.countTranslations(currentSw);
    const extractedCountSw = this.countTranslations(extractedSw);

    const mergedSw = this.deepMerge(currentSw, extractedSw, this.options.overwrite);
    const afterCountSw = this.countTranslations(mergedSw);
    const newKeysSw = afterCountSw - beforeCountSw;

    this.writeJSON('./messages/sw.json', mergedSw);

    console.info(`  ✅ Before: ${beforeCountSw} translations`);
    console.info(`  ✅ Extracted: ${extractedCountSw} translations`);
    console.info(`  ✅ After: ${afterCountSw} translations`);
    console.info(`  ✅ New keys added: ${newKeysSw}\n`);

    console.info('✅ Merge complete!\n');

    // Cleanup extracted files
    console.info('🧹 Cleaning up extracted files...');
    const extractedFiles = [
      './messages/extracted-en.json',
      './messages/extracted-sw.json',
    ];

    for (const file of extractedFiles) {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.info(`  🗑️  Deleted: ${file}`);
      }
    }

    console.info('\n✅ All done! Your translations are ready to use.\n');
  }
}

// Main execution
async function main() {
  console.info(`
╔════════════════════════════════════════════════════════╗
║        TRANSLATION MERGE TOOL                          ║
║        Merges extracted translations into main files   ║
╚════════════════════════════════════════════════════════╝
  `);

  try {
    const merger = new TranslationMerger({
      overwrite: false, // Don't overwrite existing translations
      backup: true,     // Create backup before merge
    });

    merger.merge();

    console.info('🎯 Next steps:\n');
    console.info('1. Test your app: npm run dev');
    console.info('2. Check translations in UI');
    console.info('3. Review and adjust as needed\n');
  } catch (error) {
    console.error({ message: '❌ Merge failed:', error });
    process.exit(1);
  }
}

main();
