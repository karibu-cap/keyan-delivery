// scripts/translate-optimized.js
import translate from '@iamtraction/google-translate';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * OPTIMIZED PARALLEL TRANSLATOR
 * Translates 250 keys in ~2 minutes instead of 10+ minutes
 * 
 * Key optimizations:
 * 1. Parallel batch processing (10 at a time)
 * 2. Smart retry with exponential backoff
 * 3. Progress caching (resume on failure)
 * 4. Only translate missing keys
 */

class OptimizedTranslator {
    constructor(sourceFile, targetFile, sourceLang = 'en', targetLang = 'sw') {
        this.sourceFile = sourceFile;
        this.targetFile = targetFile;
        this.sourceLang = sourceLang;
        this.targetLang = targetLang;
        this.translatedCount = 0;
        this.totalCount = 0;
        this.errors = [];
        this.existingTargetData = null;

        // Performance settings
        this.BATCH_SIZE = 10;
        this.DELAY_BETWEEN_BATCHES = 1000;
        this.CACHE_FILE = 'messages/.translation-cache.json';
    }

    readJSON(filePath) {
        const fullPath = join(process.cwd(), filePath);
        try {
            return JSON.parse(readFileSync(fullPath, 'utf-8'));
        } catch (error) {
            return {};
        }
    }

    writeJSON(filePath, data) {
        const fullPath = join(process.cwd(), filePath);
        writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf-8');
    }

    loadCache() {
        try {
            const cache = this.readJSON(this.CACHE_FILE);
            if (cache && Object.keys(cache).length > 0) {
                console.log(`📦 Found cache with ${Object.keys(cache).length} translations`);
            }
            return cache || {};
        } catch {
            return {};
        }
    }

    saveCache(cache) {
        try {
            this.writeJSON(this.CACHE_FILE, cache);
        } catch (error) {
            console.warn('⚠️  Could not save cache:', error.message);
        }
    }

    loadExistingTarget() {
        try {
            this.existingTargetData = this.readJSON('messages/' + this.targetLang + '.json');
            console.log(`📂 Loaded existing target with ${this.countStrings(this.existingTargetData)} translations`);
            return this.existingTargetData;
        } catch {
            console.log(`📂 No existing target found, will create new file`);
            this.existingTargetData = {};
            return this.existingTargetData;
        }
    }

    flattenObject(obj, prefix = '') {
        const flattened = {};

        for (const [key, value] of Object.entries(obj)) {
            const newKey = prefix ? `${prefix}.${key}` : key;

            if (typeof value === 'string') {
                flattened[newKey] = value;
            } else if (typeof value === 'object' && value !== null) {
                Object.assign(flattened, this.flattenObject(value, newKey));
            }
        }

        return flattened;
    }

    unflattenObject(flattened) {
        const result = {};

        for (const [key, value] of Object.entries(flattened)) {
            const parts = key.split('.');
            let current = result;

            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) {
                    current[parts[i]] = {};
                }
                current = current[parts[i]];
            }

            current[parts[parts.length - 1]] = value;
        }

        return result;
    }

    getMissingKeys(sourceFlat, targetFlat, cache) {
        const missing = [];

        for (const [key, value] of Object.entries(sourceFlat)) {
            // Skip if already in target or cache
            if (!targetFlat[key] && !cache[key]) {
                missing.push({ key, value });
            }
        }

        return missing;
    }

    async translateText(text, retries = 3) {
        // Skip non-text
        if (!text || !/[a-zA-Z]/.test(text)) return text;

        for (let i = 0; i < retries; i++) {
            try {
                const result = await translate(text, {
                    from: this.sourceLang,
                    to: this.targetLang
                });
                return result.text;
            } catch (error) {
                if (i === retries - 1) {
                    this.errors.push({ text: text.substring(0, 50), error: error.message });
                    return text; // Fallback to original
                }
                // Exponential backoff
                await this.sleep(500 * Math.pow(2, i));
            }
        }
        return text;
    }

    async translateBatch(batch) {
        // Process batch in parallel
        const promises = batch.map(async ({ key, value }) => {
            const translated = await this.translateText(value);
            this.translatedCount++;

            // Update progress
            const progress = ((this.translatedCount / this.totalCount) * 100).toFixed(1);
            const eta = this.calculateETA();
            process.stdout.write(
                `\r⏳ [${progress}%] ${this.translatedCount}/${this.totalCount} | ETA: ${eta}s | ${key.substring(0, 30)}...`
            );

            return { key, translated };
        });

        return await Promise.all(promises);
    }

    calculateETA() {
        if (this.translatedCount === 0) return '?';

        const elapsed = (Date.now() - this.startTime) / 1000;
        const rate = this.translatedCount / elapsed;
        const remaining = this.totalCount - this.translatedCount;
        const eta = Math.ceil(remaining / rate);

        return eta;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    countStrings(obj) {
        let count = 0;
        for (const value of Object.values(obj)) {
            if (typeof value === 'string') count++;
            else if (typeof value === 'object' && value !== null) {
                count += this.countStrings(value);
            }
        }
        return count;
    }

    async translate() {
        console.log('🚀 OPTIMIZED PARALLEL TRANSLATOR\n');
        console.log('⚡ Speed: ~2 minutes for 250 keys');
        console.log(`📦 Batch size: ${this.BATCH_SIZE} parallel translations\n`);

        try {
            this.startTime = Date.now();

            // Load all data
            const sourceData = this.readJSON(this.sourceFile);
            const existingTarget = this.loadExistingTarget();
            const cache = this.loadCache();

            // Flatten for easier processing
            const sourceFlat = this.flattenObject(sourceData);
            const targetFlat = this.flattenObject(existingTarget);

            // Get missing keys
            const missingKeys = this.getMissingKeys(sourceFlat, targetFlat, cache);
            this.totalCount = missingKeys.length;

            if (this.totalCount === 0) {
                console.log('✨ All keys already translated! Nothing to do.\n');
                return;
            }

            console.log(`🔢 Found ${this.totalCount} new strings to translate`);
            console.log(`📈 ${Object.keys(targetFlat).length} existing + ${Object.keys(cache).length} cached\n`);

            // Process in batches
            const batches = [];
            for (let i = 0; i < missingKeys.length; i += this.BATCH_SIZE) {
                batches.push(missingKeys.slice(i, i + this.BATCH_SIZE));
            }

            console.log(`📦 Processing ${batches.length} batches...\n`);

            const allTranslations = { ...cache };

            // Process each batch
            for (let i = 0; i < batches.length; i++) {
                const batchResults = await this.translateBatch(batches[i]);

                // Save to cache immediately
                for (const { key, translated } of batchResults) {
                    allTranslations[key] = translated;
                }

                // Save cache after each batch (for resume capability)
                this.saveCache(allTranslations);

                // Delay between batches to avoid rate limiting
                if (i < batches.length - 1) {
                    await this.sleep(this.DELAY_BETWEEN_BATCHES);
                }
            }

            console.log('\n\n💾 Writing final file...');

            // Merge: existing + cache + new translations
            const mergedFlat = { ...targetFlat, ...allTranslations };
            const finalData = this.unflattenObject(mergedFlat);

            this.writeJSON(this.targetFile, finalData);

            const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);

            console.log(`\n✅ COMPLETE!`);
            console.log(`⏱️  Time: ${elapsed}s (${(this.totalCount / elapsed).toFixed(1)} translations/sec)`);
            console.log(`✅ Success: ${this.translatedCount - this.errors.length}/${this.translatedCount}`);
            console.log(`📊 Total: ${this.countStrings(finalData)} translations in final file`);

            if (this.errors.length > 0) {
                console.log(`\n⚠️  ${this.errors.length} errors (kept original text):`);
                this.errors.slice(0, 3).forEach(err => {
                    console.log(`   - "${err.text}..."`);
                });
                if (this.errors.length > 3) {
                    console.log(`   ... and ${this.errors.length - 3} more`);
                }
            }

            // Clean up cache on success
            if (this.errors.length === 0) {
                try {
                    const fs = await import('fs');
                    fs.unlinkSync(join(process.cwd(), this.CACHE_FILE));
                    console.log('\n🧹 Cleaned up cache file');
                } catch { }
            }

        } catch (error) {
            console.error('\n❌ Translation failed:', error.message);
            console.log('\n💡 TIP: Cache saved! Run again to resume from where it stopped.');
            throw error;
        }
    }
}

// Run translator
new OptimizedTranslator(
    'messages/extracted-en.json',
    'messages/extracted-sw.json'
).translate().catch(console.error);