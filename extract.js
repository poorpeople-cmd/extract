const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const fs = require('fs');
const path = require('path');

const videoDir = path.join(__dirname, 'videos');
if (!fs.existsSync(videoDir)){
    fs.mkdirSync(videoDir);
}

(async () => {
    console.log("🚀 Browser start ho raha hai (Advanced Debugging Mode)...");
    
    const browser = await puppeteer.launch({ 
        headless: true, 
        defaultViewport: { width: 1280, height: 720 },
        args: [
            '--no-sandbox',              
            '--disable-setuid-sandbox',  
            '--mute-audio',
            '--autoplay-policy=no-user-gesture-required' // Auto-play restrictions hatane ke liye
        ] 
    });
    
    const page = await browser.newPage();

    // 🕵️‍♂️ DEBUGGING LOGIC START 🕵️‍♂️
    
    // 1. Browser ke andar ka console log print karega
    page.on('console', msg => console.log('💻 BROWSER CONSOLE:', msg.text()));
    
    // 2. Agar page mein koi JavaScript error aaya toh batayega
    page.on('pageerror', error => console.error('❌ PAGE ERROR:', error.message));
    
    // 3. Agar koi network request fail hui (e.g. Cloudflare ne block kiya) toh batayega
    page.on('requestfailed', request => {
        console.error(`⚠️ REQUEST FAILED: ${request.url()} - Reason: ${request.failure()?.errorText}`);
    });

    // 🕵️‍♂️ DEBUGGING LOGIC END 🕵️‍♂️

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

    const recorder = new PuppeteerScreenRecorder(page);
    const videoPath = path.join(videoDir, `debug-video-${Date.now()}.mp4`);
    
    console.log("🎥 Video recording start kar raha hoon...");
    await recorder.start(videoPath);

    console.log("🌐 Iframe URL load kar raha hoon...");
    
    // Yahan timeout catch karne ka logic lagaya hai
    try {
        await page.goto('https://dadocric.st/player.php?id=willowextra', { 
            waitUntil: 'networkidle2',
            timeout: 60000 
        });
    } catch (e) {
        console.log("🚨 Goto Error:", e.message);
    }

    // 🔍 Page ka status check karna
    const title = await page.title();
    console.log("📄 PAGE TITLE HAI:", title || "Koi title nahi");

    if (title.toLowerCase().includes('cloudflare') || title.toLowerCase().includes('just a moment')) {
        console.log("🚨 WARNING: Cloudflare (Anti-Bot) ne aapko block kar diya hai!");
    }

    // Check karna ke page par <video> ya <iframe> tag load hua bhi hai ya nahi?
    const hasVideo = await page.evaluate(() => !!document.querySelector('video'));
    const hasIframe = await page.evaluate(() => !!document.querySelector('iframe'));
    console.log(`🔍 ELEMENT CHECK -> Video Tag: ${hasVideo ? 'HAAN' : 'NAHI'}, Iframe: ${hasIframe ? 'HAAN' : 'NAHI'}`);

    // Ek naya tareeqa video khud play karwane ka
    if (hasVideo) {
        console.log("▶️ Video element mil gaya, code se Play command bhej raha hoon...");
        try {
            await page.evaluate(() => {
                const v = document.querySelector('video');
                if(v) v.play();
            });
        } catch (e) {
            console.log("⚠️ Play command fail hui:", e.message);
        }
    }

    console.log("⏳ 15 second wait kar raha hoon...");
    await new Promise(r => setTimeout(r, 15000));

    console.log("🛑 Video recording stop kar raha hoon...");
    await recorder.stop();

    console.log("🛑 Browser band kar raha hoon.");
    await browser.close();
})();
