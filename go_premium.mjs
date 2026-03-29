import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToProcess = [
    path.join(__dirname, 'src', 'App.jsx'),
    path.join(__dirname, 'src', 'components', 'Auth.jsx'),
    path.join(__dirname, 'src', 'components', 'Account.jsx'),
    path.join(__dirname, 'src', 'components', 'Admin.jsx')
];

const replacements = [
    // Brighten up the absolute blacks to Navy and Silver-Grey
    { search: /\bbg-slate-950\b/g, replace: 'bg-slate-900' }, // Navy base
    { search: /\bbg-\[\#020617\]\b/g, replace: 'bg-slate-800' }, // Lighter navy/grey

    // Adjust borders for premium grey/silver feel
    { search: /\bborder-white\/5\b/g, replace: 'border-slate-700' },
    { search: /\bborder-white\/10\b/g, replace: 'border-slate-600' },
    { search: /\bborder-white\/20\b/g, replace: 'border-slate-500' },

    // Adjust hover states for silver
    { search: /\bhover:bg-white\/5\b/g, replace: 'hover:bg-slate-700' },
    { search: /\bhover:bg-white\/10\b/g, replace: 'hover:bg-slate-600' },

    // Adjust text to white/silver
    { search: /\btext-slate-500\b/g, replace: 'text-slate-400' },
];

filesToProcess.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let originalContent = content;

        replacements.forEach(({ search, replace }) => {
            content = content.replace(search, replace);
        });

        fs.writeFileSync(file, content, 'utf8');
        console.log(`Processed: ${file} (changed: ${content !== originalContent})`);
    } else {
        console.log(`Not found: ${file}`);
    }
});
