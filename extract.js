const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const fs = require('fs');
const path = require('path');

// Video save karne ke liye directory set karein
const videoDir = path.join(__dirname, 'videos');

// Agar folder nahi hai toh naya bana lein
if (!fs.existsSync(videoDir)){
    fs.mkdirSync(videoDir);
}

(async () => {
    console.log("🚀 Browser start ho raha hai (Video Recording Mode)...");
    
    const browser = await puppeteer.launch({ 
        headless: true, 
        defaultViewport: { width: 1280, height: 720 }, // HD Video resolution
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

    // 🎥 Video Recorder Setup
    const recorder = new PuppeteerScreenRecorder(page);
    const videoPath = path.join(videoDir, `stream-video-${Date.now()}.mp4`);
    
    console.log("🎥 Video recording start kar raha hoon...");
    await recorder.start(videoPath);

    console.log("🌐 Iframe URL load kar raha hoon...");
    
    await page.goto('https://dadocric.st/player.php?id=starsp3', { 
        waitUntil: 'networkidle2',
        timeout: 60000 
    });

    console.log("⏳ 15 second wait kar raha hoon (Video Record ho rahi hai)...");
    await new Promise(r => setTimeout(r, 15000));

    // 🛑 Recording aur Browser band karna
    console.log("🛑 Video recording stop kar raha hoon...");
    await recorder.stop();

    console.log("🛑 Extraction mukammal. Browser band kar raha hoon.");
    await browser.close();
})();
