const puppeteer = require('puppeteer');

(async () => {
    console.log("🚀 Browser start ho raha hai (Ultimate Iframe Bypass Mode)...");
    
    const browser = await puppeteer.launch({ 
        headless: true, 
        defaultViewport: { width: 1280, height: 720 },
        args: [
            '--no-sandbox',              
            '--disable-setuid-sandbox',  
            '--mute-audio',
            '--autoplay-policy=no-user-gesture-required',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            // 👇 YEH 2 NAYE FLAGS HAIN JO IFRAME BLOCKING KO TORENGE 👇
            '--disable-site-isolation-trials', 
            '--ignore-certificate-errors'
        ] 
    });
    
    const page = await browser.newPage();

    // 🕵️‍♂️ 1. Asli Windows PC banne ka natak (Taake server ko lage hum bot nahi hain)
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // 🛡️ 2. Content Security Policy (CSP) ko zabardasti bypass karna
    await page.setBypassCSP(true);

    page.on('requestfailed', request => {
        if(request.url().includes('player') || request.url().includes('php')) {
            console.error(`⚠️ REQUEST FAILED: ${request.url()} - Reason: ${request.failure()?.errorText}`);
        }
    });

    // 💡 Asal M3U8 Pakadne ka Logic
    page.on('request', (request) => {
        const url = request.url();
        if (url.includes('.m3u8')) {
            console.log("\n" + "=".repeat(50));
            console.log("🎉 BINGO! M3U8 Link Pakra Gaya!");
            console.log("🔗 URL:", url);
            const headers = request.headers();
            console.log("🛡️ Referer:", headers['referer'] || "Nahi mila");
            console.log("=".repeat(50) + "\n");
        }
    });

    console.log("🌐 Iframe URL load kar raha hoon...");
    
    try {
        // networkidle2 ki jagah domcontentloaded lagaya hai taake fuzool ads ka wait na kare
        await page.goto('https://dadocric.st/player.php?id=willowextra', { 
            waitUntil: 'domcontentloaded',
            timeout: 60000 
        });
    } catch (e) {
        console.log("🚨 Goto Error:", e.message);
    }

    console.log("⏳ 20 second wait kar raha hoon taake background mein player load ho...");
    await new Promise(r => setTimeout(r, 20000));

    console.log("🛑 Browser band kar raha hoon.");
    await browser.close();
})();
