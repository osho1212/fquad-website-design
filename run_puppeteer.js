const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('response', response => {
        if (!response.ok()) {
            console.log('FAILED REQUEST:', response.url(), response.status());
        }
    });

    const fileUrl = 'file://' + path.resolve('design/F.QUAD Website.dc.html');
    console.log("Navigating to", fileUrl);
    
    try {
        await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 10000 });
        console.log("Navigation complete.");
    } catch (e) {
        console.log("Nav error:", e.message);
    }
    
    await new Promise(r => setTimeout(r, 2000));
    await browser.close();
})();
