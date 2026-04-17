const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const fs = require('fs');
const path = require('path');

const videoDir = path.join(__dirname, 'videos');
if (!fs.existsSync(videoDir)){
    fs.mkdirSync(videoDir);
}

(async () => {
    console.log("🚀 Browser start ho raha hai (Iframe Bypass Mode)...");
    
    const browser = await puppeteer.launch({ 
        headless: true, 
        defaultViewport: { width: 1280, height: 720 },
        args: [
            '--no-sandbox',              
            '--disable-setuid-sandbox',  
            '--mute-audio',
            '--autoplay-policy=no-user-gesture-required',
            // 👇 YEH 2 LINES NAYI HAIN (ERR_BLOCKED_BY_RESPONSE KO FIX KARNE KE LIYE) 👇
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
        ] 
    });
    
    const page = await browser.newPage();

    // Browser ke andar ka console log print karega
    page.on('console', msg => console.log('💻 BROWSER CONSOLE:', msg.text()));
    
    // Agar koi network request fail hui toh batayega
    page.on('requestfailed', request => {
        // Sirf main errors dikhaye taake log lamba na ho
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

    const recorder = new PuppeteerScreenRecorder(page);
    const videoPath = path.join(videoDir, `debug-video-${Date.now()}.mp4`);
    
    console.log("🎥 Video recording start kar raha hoon...");
    await recorder.start(videoPath);

    console.log("🌐 Iframe URL load kar raha hoon...");
    
    try {
        await page.goto('https://dadocric.st/player.php?id=willowextra', { 
            waitUntil: 'networkidle2',
            timeout: 60000 
        });
    } catch (e) {
        console.log("🚨 Goto Error:", e.message);
    }

    console.log("⏳ 15 second wait kar raha hoon taake iframe poora load ho...");
    await new Promise(r => setTimeout(r, 15000));

    // Ek aakhri koshish: Iframe ke andar ja kar video play command bhejna
    console.log("🔍 Iframe ke andar video play karne ki koshish kar raha hoon...");
    try {
        for (const frame of page.frames()) {
            await frame.evaluate(() => {
                const v = document.querySelector('video');
                if(v) {
                    v.play();
                    console.log("▶️ Iframe ke andar video play command chali gayi!");
                }
            }).catch(() => {}); // Agar kisi frame mein error aaye toh ignore karo
        }
    } catch (e) {
        console.log("⚠️ Iframe play error:", e.message);
    }

    // Video chalne ke baad thoda aur wait
    await new Promise(r => setTimeout(r, 5000));

    console.log("🛑 Video recording stop kar raha hoon...");
    await recorder.stop();

    console.log("🛑 Browser band kar raha hoon.");
    await browser.close();
})();
