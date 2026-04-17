const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Screenshots save karne ke liye directory set karein
const screenshotDir = path.join(__dirname, 'screenshots');

// Agar folder nahi hai toh naya bana lein
if (!fs.existsSync(screenshotDir)){
    fs.mkdirSync(screenshotDir);
}

(async () => {
    console.log("🚀 Browser start ho raha hai (Screenshot Mode)...");
    
    const browser = await puppeteer.launch({ 
        headless: true, 
        defaultViewport: { width: 1280, height: 720 }, // Ek standard screenshot size set karein
        args: [
            '--no-sandbox',              
            '--disable-setuid-sandbox',  
            '--mute-audio'
        ] 
    });
    
    const page = await browser.newPage();

    // 💡 Network Tab ko code se sunna
    page.on('request', (request) => {
        const url = request.url();
        
        if (url.includes('.m3u8')) {
            console.log("\n" + "=".repeat(50));
            console.log("🎉 BINGO! M3U8 Link Pakra Gaya!");
            console.log("🔗 URL:", url);
            
            const headers = request.headers();
            console.log("🛡️ Referer:", headers['referer'] || "Nahi mila");
            console.log("🍪 Cookie:", headers['cookie'] || "Nahi mili");
            console.log("=".repeat(50) + "\n");
        }
    });

    console.log("🌐 Iframe URL load kar raha hoon...");
    
    await page.goto('https://dadocric.st/player.php?id=willowextra', { 
        waitUntil: 'networkidle2',
        timeout: 60000 
    });

    // Screenshots capture karne wala function
    async function takeScreenshots() {
        console.log("⏳ screenshots capture karna shuru kar raha hoon...");
        for (let i = 1; i <= 3; i++) { // Misal ke tor par 3 screenshots
            const timestamp = new Date().toISOString().replace(/:/g, '-');
            const fileName = `screenshot-${i}-${timestamp}.png`;
            const filePath = path.join(screenshotDir, fileName);
            
            try {
                await page.screenshot({ path: filePath, fullPage: true });
                console.log(`📸 Screenshot save hua: ${fileName}`);
            } catch (error) {
                console.error(`❌ Screenshot lene mein error:`, error.message);
            }
            
            // Har screenshot ke beech mein thoda wait karein (misal ke tor par 5 seconds)
            if (i < 3) await new Promise(r => setTimeout(r, 5000));
        }
    }

    // Capture process shuru karein jab tak wait chal raha hai
    await takeScreenshots();

    console.log("🛑 Extraction mukammal. Browser band kar raha hoon.");
    await browser.close();
})();
