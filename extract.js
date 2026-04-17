const puppeteer = require('puppeteer');

(async () => {
    console.log("🚀 Browser start ho raha hai (GitHub Actions Mode)...");
    
    const browser = await puppeteer.launch({ 
        headless: true, 
        defaultViewport: null,
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

    // 👇 Yahan screen click wale block ko comment kar diya gaya hai 👇
    /*
    console.log("🖱️ Screen par click kar raha hoon taake stream play ho...");
    try {
        await page.click('body');
    } catch (e) {
        // Click fail hua toh koi masla nahi
    }
    */

    console.log("⏳ 15 second wait kar raha hoon taake stream load ho jaye...");
    await new Promise(r => setTimeout(r, 15000));

    console.log("🛑 Extraction mukammal. Browser band kar raha hoon.");
    await browser.close();
})();
