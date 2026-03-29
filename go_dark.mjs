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
    // Backgrounds
    { search: /\bbg-white\b/g, replace: 'bg-slate-950' },
    { search: /\bbg-slate-50\b/g, replace: 'bg-[#020617]' },
    { search: /\bbg-slate-100\b/g, replace: 'bg-slate-900' },
    { search: /\bbg-slate-200\b/g, replace: 'bg-slate-800' },

    // Text colors
    { search: /\btext-slate-900\b/g, replace: 'text-white' },
    { search: /\btext-slate-950\b/g, replace: 'text-white' },
    { search: /\btext-slate-700\b/g, replace: 'text-slate-300' },
    { search: /\btext-slate-600\b/g, replace: 'text-slate-400' },
    { search: /\btext-slate-500\b/g, replace: 'text-slate-500' }, // keep 500

    // Borders
    { search: /\bborder-slate-200\b/g, replace: 'border-white/10' },
    { search: /\bborder-slate-100\b/g, replace: 'border-white/5' },
    { search: /\bborder-slate-300\b/g, replace: 'border-white/20' },

    // Hover / specific bg mods
    { search: /\bhover:bg-slate-50\b/g, replace: 'hover:bg-white/5' },
    { search: /\bhover:bg-slate-100\b/g, replace: 'hover:bg-white/10' },
    { search: /\bhover:bg-slate-200\b/g, replace: 'hover:bg-white/20' },
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
