import fs from 'fs';

try {
    const content = fs.readFileSync('models.json', 'utf16le');
    const data = JSON.parse(content);
    const models = data.models.map(m => m.name);
    console.log('--- MODELS ---');
    models.forEach(m => console.log(m));
} catch (e) {
    try {
        const content = fs.readFileSync('models.json', 'utf8');
        const data = JSON.parse(content);
        const models = data.models.map(m => m.name);
        console.log('--- MODELS (UTF8) ---');
        models.forEach(m => console.log(m));
    } catch (e2) {
        console.error('Failed to parse models.json:', e2.message);
    }
}
