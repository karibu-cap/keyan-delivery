import * as fs from 'fs';
import { glob } from 'glob';
import * as path from 'path';

interface ExtractedTranslation {
    key: string;
    defaultMessage: string;
    file: string;
    line: number;
    context?: string;
}

class TranslationExtractor {
    private translations: Map<string, ExtractedTranslation> = new Map();

    // Patterns to match t('...') calls
    private patterns = [
        // t('simple text') or useT() calls, handling escaped quotes and special chars
        /(?:useT|useInlineTranslation)\(\)[;\s]*(?:const|let|var)?\s*\w*\s*=?\s*(?:\w+\.)?t\(['"](.*?)(?<!\\)['"]\)/g,

        // Direct t('text'), including special chars and escaped quotes
        /\bt\(['"](.*?)(?<!\\)['"](?:,\s*{[^}]*})?\)/g,

        // t('text with {var}', { var }), handling special chars
        /\bt\(['"](.*?)(?<!\\)['"],\s*{[^}]+}\)/g,

        // t.rich('text'), handling special chars
        /\bt\.rich\(['"](.*?)(?<!\\)['"]/g,

        // t.plural('text', count), handling special chars
        /\bt\.plural\(['"](.*?)(?<!\\)['"]/g,
    ];

    /**
     * Generate consistent key from text
     */
    private generateKey(text: string): string {
        return text
            .toLowerCase()
            .replace(/[{}\[\]<>]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 100);
    }

    /**
     * Extract translations from a file
     */
    async extractFromFile(filePath: string): Promise<void> {
        const content = fs.readFileSync(filePath, 'utf-8');

        for (const pattern of this.patterns) {
            const regex = new RegExp(pattern.source, pattern.flags);
            let match;

            while ((match = regex.exec(content)) !== null) {
                const text = match[1]?.trim();

                if (text && text.length > 0) {
                    const key = this.generateKey(text);
                    const lineNumber = content.substring(0, match.index).split('\n').length;

                    if (!this.translations.has(key)) {
                        this.translations.set(key, {
                            key,
                            defaultMessage: text,
                            file: filePath.replace(process.cwd(), ''),
                            line: lineNumber,
                        });
                    }
                }
            }
        }
    }

    /**
     * Smart grouping: Organize translations by common patterns
     */
    private organizeTranslations(): Record<string, string> {
        const organized: Record<string, string> = {};

        for (const [key, data] of this.translations.entries()) {
            const text = data.defaultMessage;

            organized[key] = text;
        }

        return organized;
    }

    /**
     * Extract from all component files
     */
    async extractAll(pattern: string = '**/*.{ts,tsx}'): Promise<void> {
        console.log('🔍 Scanning for inline translations...\n');

        const files = await glob(pattern, {
            ignore: [
                '**/node_modules/**',
                '**/dist/**',
                '**/.next/**',
                '**/scripts/**',
            ],
        });

        console.log(`📁 Found ${files.length} files to scan\n`);

        let processedFiles = 0;
        for (const file of files) {
            await this.extractFromFile(file);
            processedFiles++;

            // Progress indicator
            if (processedFiles % 10 === 0) {
                process.stdout.write(`\r⏳ Processed ${processedFiles}/${files.length} files...`);
            }
        }

        console.log(`\n\n✅ Extracted ${this.translations.size} unique translations\n`);
    }

    /**
     * Generate organized JSON file
     */
    generateJSON(outputPath: string = './messages/extracted-en.json'): void {
        const organized = this.organizeTranslations();

        // Ensure directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Write file
        fs.writeFileSync(
            outputPath,
            JSON.stringify(organized, null, 2),
            'utf-8'
        );

        console.log(`💾 Generated: ${outputPath}`);
    }

    /**
     * Generate CSV for easy review/translation
     */
    generateCSV(outputPath: string = './messages/translations.csv'): void {
        const lines = ['Category,Key,English,Swahili,File,Line'];

        const organized = this.organizeTranslations();

        for (const [key, text] of Object.entries(organized)) {
            const data = this.translations.get(key);
            if (data) {
                lines.push(
                    `"${key}","${text.replace(/"/g, '""')}","","${data.file}",${data.line}`
                );
            }
        }

        fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');
        console.log(`📊 Generated CSV: ${outputPath}`);
    }

    /**
     * Generate detailed report
     */
    printReport(): void {
        console.log('\n' + '='.repeat(60));
        console.log('📋 EXTRACTION REPORT');
        console.log('='.repeat(60) + '\n');

        const organized = this.organizeTranslations();

        console.log('Translations by key:\n');
        for (const [key, translations] of Object.entries(organized)) {
            console.log(` ${key.padEnd(15)} ${translations}`);
        }

        console.log('\n' + '='.repeat(60));
        console.log(`TOTAL: ${this.translations.size} unique translations`);
        console.log('='.repeat(60) + '\n');
    }
}

// Main execution
async function main() {
    console.log(`
╔════════════════════════════════════════════════════════╗
║        INLINE TRANSLATION EXTRACTION TOOL              ║
║        Extracts t('...') calls from your code          ║
╚════════════════════════════════════════════════════════╝
  `);

    try {
        const extractor = new TranslationExtractor();

        // Extract from all files
        await extractor.extractAll('**/*.{ts,tsx}');

        // Generate outputs
        extractor.generateJSON('./messages/extracted-en.json');
        extractor.generateCSV('./messages/translations.csv');

        // Print report
        extractor.printReport();

        console.log('✅ NEXT STEPS:\n');
        console.log('1. Review: messages/extracted-en.json');
        console.log('2. Run: npm run translate');
        console.log('3. Review: messages/sw.json');
        console.log('4. Run: npm run merge\n');
    } catch (error) {
        console.error('❌ Extraction failed:', error);
        process.exit(1);
    }
}

main();