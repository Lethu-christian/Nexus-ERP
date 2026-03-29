const fs = require('fs');
const path = require('path');

const filesToProcess = [
    path.join(__dirname, 'src', 'App.jsx'),
    path.join(__dirname, 'src', 'components', 'Auth.jsx'),
    path.join(__dirname, 'src', 'components', 'Account.jsx'),
    path.join(__dirname, 'src', 'index.css')
];

const replacements = [
    { search: /bg-slate-950/g, replace: 'bg-white' },
    { search: /bg-slate-900/g, replace: 'bg-slate-50' },
    { search: /bg-\[\#020617\]/g, replace: 'bg-slate-50' },
    { search: /text-white/g, replace: 'text-slate-950' },
    { search: /text-slate-400/g, replace: 'text-slate-600' },
    { search: /text-slate-300/g, replace: 'text-slate-700' },
    { search: /text-slate-500/g, replace: 'text-slate-500' },
    { search: /border-white\/10/g, replace: 'border-slate-200' },
    { search: /border-white\/20/g, replace: 'border-slate-300' },
    { search: /border-white\/5/g, replace: 'border-slate-100' },
    { search: /bg-white\/5/g, replace: 'bg-slate-100' },
    { search: /bg-white\/10/g, replace: 'bg-slate-200' },
    { search: /bg-white\/20/g, replace: 'bg-slate-300' },
    { search: /hover:bg-white\/10/g, replace: 'hover:bg-slate-200' },
    { search: /hover:bg-white\/20/g, replace: 'hover:bg-slate-300' },
];

filesToProcess.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let originalContent = content;
        replacements.forEach(({ search, replace }) => {
            content = content.replace(search, replace);
        });

        // Some specific fixes for contrast:
        // If background is white, changing buttons to bg-slate-950 text-white looks good
        // But since text-white was already replaced with text-slate-950 globally, we might need a manual pass.
        // Let's just do a generic swap first.

        fs.writeFileSync(file, content, 'utf8');
        console.log(`Processed: ${file}`);
    } else {
        console.log(`Not found: ${file}`);
    }
});
