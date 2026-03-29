import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('BROWSER ERROR:', msg.text());
        }
    });

    page.on('pageerror', error => {
        console.log('PAGE ERROR:', error.message);
    });

    try {
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 10000 });
        console.log('Page loaded successfully without uncaught exceptions.');
    } catch (e) {
        console.log('Navigation failed:', e.message);
    }

    await browser.close();
    process.exit(0);
})();
