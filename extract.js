const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const fs = require('fs');
const path = require('path');

const videoDir = path.join(__dirname, 'videos');
if (!fs.existsSync(videoDir)){
    fs.mkdirSync(videoDir);
}

// 🛡️ Aapki Direct Proxy Details
const proxyServer = 'http://31.59.20.176:6754';
const proxyUsername = 'dgmtstlf';
const proxyPassword = 'pm4wnuro0gy9';

(async () => {
    console.log("🚀 Browser start ho raha hai (Direct Proxy Mode)...");
    
    const browser = await puppeteer.launch({ 
        headless: true, 
        defaultViewport: { width: 1280, height: 720 },
        args: [
            '--no-sandbox',              
            '--disable-setuid-sandbox',  
            '--mute-audio',
            '--autoplay-policy=no-user-gesture-required',
            `--proxy-server=${proxyServer}` // 🌐 Proxy yahan set ho rahi hai
        ] 
    });
    
    const page = await browser.newPage();

    // 🔐 Proxy par Username aur Password lagana
    console.log("🔐 Proxy ID aur Password apply kar raha hoon...");
    await page.authenticate({
        username: proxyUsername,
        password: proxyPassword
    });

    // 💡 Network Tab ko sunna
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

    const recorder = new PuppeteerScreenRecorder(page);
    const videoPath = path.join(videoDir, `stream-video-${Date.now()}.mp4`);
    
    console.log("🎥 Video recording start kar raha hoon...");
    await recorder.start(videoPath);

    console.log("🌐 Iframe URL load kar raha hoon...");
    
    try {
        await page.goto('https://dadocric.st/player.php?id=willowextra', { 
            waitUntil: 'networkidle2',
            timeout: 60000 
        });
    } catch(e) {
        console.log("🚨 URL Load Error:", e.message);
    }

    console.log("⏳ 20 second wait kar raha hoon (Video Record ho rahi hai)...");
    await new Promise(r => setTimeout(r, 20000));

    console.log("🛑 Video recording stop kar raha hoon...");
    await recorder.stop();

    console.log("🛑 Extraction mukammal. Browser band kar raha hoon.");
    await browser.close();
})();
