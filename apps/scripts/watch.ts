import { exec } from 'child_process';
import chokidar from 'chokidar';
import * as path from 'path';

/**
 * Watch mode for automatic translation extraction
 * 
 * Usage: npm run watch
 * 
 * Watches for file changes and automatically:
 * 1. Extracts new translations
 * 2. Translates to Swahili
 * 3. Merges into main files
 */

let isProcessing = false;
const pendingChanges: Set<string> = new Set();

function runCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}

async function processChanges() {
    if (isProcessing || pendingChanges.size === 0) {
        return;
    }

    isProcessing = true;
    const files = Array.from(pendingChanges);
    pendingChanges.clear();

    console.info('\n' + '='.repeat(60));
    console.info(`🔄 Processing ${files.length} changed file(s)`);
    console.info('='.repeat(60) + '\n');

    try {
        // Step 1: Extract
        console.info('📖 Extracting translations...');
        await runCommand('npm run extract --silent');
        console.info('✅ Extraction complete\n');

        // Step 2: Translate
        console.info('🌍 Translating to Swahili...');
        await runCommand('npm run translate --silent');
        console.info('✅ Translation complete\n');

        // Step 3: Merge
        console.info('🔄 Merging translations...');
        await runCommand('npm run merge --silent');
        console.info('✅ Merge complete\n');

        console.info('✅ All done! Your translations are up to date.\n');
    } catch (error) {
        console.error({ message: '❌ Error during processing:', error });
    } finally {
        isProcessing = false;

        // Process any changes that occurred during processing
        if (pendingChanges.size > 0) {
            setTimeout(processChanges, 1000);
        }
    }
}

function startWatching() {
    console.info(`
╔════════════════════════════════════════════════════════╗
║        TRANSLATION WATCH MODE                          ║
║        Auto-extracts translations on file save         ║
╚════════════════════════════════════════════════════════╝

👀 Watching for changes in apps/**/*.{ts,tsx}
💡 Edit files, save, and translations update automatically!
🛑 Press Ctrl+C to stop

  `);

    const watcher = chokidar.watch('**/*.{ts,tsx}', {
        ignored: [
            '**/node_modules/**',
            '**/.next/**',
            '**/dist/**',
        ],
        persistent: true,
        ignoreInitial: true,
    });

    let debounceTimer: NodeJS.Timeout;

    watcher
        .on('change', (filePath) => {
            const relativePath = path.relative(process.cwd(), filePath);
            console.info(`📝 File changed: ${relativePath}`);

            pendingChanges.add(filePath);

            // Debounce: wait 2 seconds after last change
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                processChanges();
            }, 2000);
        })
        .on('error', (error) => {
            console.error({ message: '❌ Watcher error:', error });
        });

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.info('\n\n🛑 Stopping watch mode...');
        watcher.close();
        process.exit(0);
    });
}

startWatching();