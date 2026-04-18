const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

// ==========================================
// 🛡️ ANTI-CRASH SHIELDS
// ==========================================
process.on('uncaughtException', (err) => {
    console.log(`\n[🛡️ SILENT CRASH PREVENTED] Exception: ${err.message}`);
});
process.on('unhandledRejection', (reason) => {
    console.log(`\n[🛡️ SILENT CRASH PREVENTED] Rejection: ${reason}`);
});

// ==========================================
// 🌐 DIRECT PROXY SETTINGS
// ==========================================
const proxyIP = '142.111.67.146:5611';
const proxyUsername = 'dgmtstlf';
const proxyPassword = 'pm4wnuro0gy9';
const proxyServer = `http://${proxyIP}`;

// 🛡️ FFMPEG KO DENE KE LIYE PROXY URL FORMAT
const ffmpegProxyUrl = `http://${proxyUsername}:${proxyPassword}@${proxyIP}`;

// ==========================================
// 🎯 GITHUB INPUTS & HARDCODED OK.RU KEYS
// ==========================================
const STREAM_ID = process.env.STREAM_ID || '1'; 
const TARGET_URL = process.env.TARGET_URL || 'https://dlstreams.com/embed/stream-31.php';

const MULTI_KEYS = {
    '1': '14601603391083_14040893622891_puxzrwjniu',
    '2': '14601696583275_14041072274027_apdzpdb5xi',
    '3': '14617940008555_14072500914795_ohw67ls7ny',
    '4': '14601972227691_14041593547371_obdhgewlmq'
};

const STREAM_KEY = MULTI_KEYS[STREAM_ID] || MULTI_KEYS['1'];
const RTMP_URL = `rtmp://vsu.okcdn.ru/input/${STREAM_KEY}`;

function formatPKT(timestampMs = Date.now()) {
    return new Date(timestampMs).toLocaleString('en-US', {
        timeZone: 'Asia/Karachi', hour12: true, year: 'numeric', month: 'short',
        day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
    }) + " PKT";
}

(async () => {
    console.log(`\n[🚀 MAIN] Project 10 Boot: ${formatPKT()}`);
    console.log("-".repeat(60));
    console.log(`[🎯 TARGET URL]: ${TARGET_URL}`);
    console.log(`[📡 STREAM SERVER]: Number ${STREAM_ID}`);
    console.log("-".repeat(60));
    console.log("[🔍 STEP 1] Browser start ho raha hai (Direct Proxy Mode)...");
    
    const browser = await puppeteer.launch({ 
        headless: true, 
        defaultViewport: { width: 1280, height: 720 },
        args: [
            '--no-sandbox',              
            '--disable-setuid-sandbox',  
            '--mute-audio',
            '--autoplay-policy=no-user-gesture-required',
            `--proxy-server=${proxyServer}`
        ] 
    });
    
    const page = await browser.newPage();

    console.log("🔐 Proxy ID aur Password apply kar raha hoon...");
    await page.authenticate({ username: proxyUsername, password: proxyPassword });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    let streamData = null;

    // 💡 Network Tab ko sunna
    page.on('response', async (response) => {
        const url = response.url();
        const status = response.status();
        
        // 🌟 NAYA: Sirf wo M3U8 pakro jo 403 Forbidden nahi de raha!
        if (url.includes('.m3u8') && status === 200) {
            const urlObj = new URL(url);
            const expires = urlObj.searchParams.get('expires') || urlObj.searchParams.get('e') || urlObj.searchParams.get('exp');
            let expireMs = expires ? parseInt(expires) * 1000 : Date.now() + (60 * 60 * 1000);

            if (!streamData) { 
                const request = response.request();
                streamData = {
                    url: url,
                    referer: request.headers()['referer'] || TARGET_URL,
                    cookie: request.headers()['cookie'] || '',
                    ua: request.headers()['user-agent'] || '',
                    expireTime: expireMs
                };

                console.log("\n" + "=".repeat(60));
                console.log("🎉 BINGO! Valid 200 OK M3U8 Link Pakra Gaya!");
                console.log(`🔗 URL: ${url.substring(0, 80)}...`);
                console.log(`📅 EXPIRY TIME: ${formatPKT(expireMs)}`);
                console.log("=".repeat(60) + "\n");
            }
        }
    });

    console.log(`🌐 Target URL load kar raha hoon...`);
    try {
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.log("🚫 (Click functions comment kar diye gaye hain)");
    } catch(e) {
        console.log("🚨 URL Load Error:", e.message);
    }

    console.log("⏳ Smart Wait: Valid M3U8 link aane ka intezar kar raha hoon (Max 45s)...");
    let waitTimer = 0;
    while (!streamData && waitTimer < 45) {
        await new Promise(r => setTimeout(r, 1000));
        waitTimer++;
    }

    console.log("🛑 Extraction mukammal. Browser band kar raha hoon.");
    await browser.close();

    // ==========================================
    // 2️⃣ FFMPEG ENGINE (STREAM TO OK.RU)
    // ==========================================
    if (streamData) {
        console.log(`\n[🚀 STEP 2] FFmpeg Engine Shuru...`);
        console.log(`[📡] Streaming to OK.RU Server ${STREAM_ID} (Quality: 640x360, 300k)`);
        console.log(`[⏰ TIME] FFmpeg Started at: ${formatPKT()}`);

        const headersCmd = `User-Agent: ${streamData.ua}\r\nReferer: ${streamData.referer}\r\nCookie: ${streamData.cookie}\r\n`;

        const args = [
            "-re", "-loglevel", "error", 
            
            // 🛡️ IP-BINDING FIX: FFmpeg ab wohi proxy use karega jo browser ne ki thi
            "-http_proxy", ffmpegProxyUrl,
            
            "-reconnect", "1", 
            "-reconnect_at_eof", "1", 
            "-reconnect_streamed", "1", 
            "-reconnect_delay_max", "5",
            
            "-headers", headersCmd, 
            "-i", streamData.url, 
            
            "-c:v", "libx264", "-preset", "ultrafast", "-b:v", "300k",
            "-vf", "scale=640:360", "-r", "20", "-c:a", "aac", "-b:a", "32k",
            "-f", "flv", RTMP_URL
        ];

        const ffmpeg = spawn('ffmpeg', args);

        ffmpeg.stderr.on('data', (err) => {
            const msg = err.toString().trim();
            console.log(`[⚠️ FFmpeg Log]: ${msg}`);
        });

        ffmpeg.on('close', (code) => {
            console.log(`\n🛑 FFmpeg Band Hua. (Code: ${code})`);
            console.log(`[🛑] Stream khatam ho gayi hai. Script exit kar rahi hai.`);
            process.exit(code);
        });

        // 💓 HEARTBEAT (KEEPS GITHUB ALIVE)
        setInterval(() => {
            let remainingMs = streamData.expireTime - Date.now();
            let minsLeft = Math.max(0, Math.round(remainingMs / 60000));
            console.log(`[💓 HEARTBEAT] Stream Server ${STREAM_ID} par live hai! Expiry mein approx ${minsLeft} minutes baqi hain...`);
        }, 3 * 60 * 1000);

    } else {
        console.log("\n❌ [FATAL ERROR] 45 seconds tak koi valid M3U8 link nahi mila. Exiting...");
        process.exit(1);
    }
})();













































































































































// ============== 100% correct for just extract the m3u8 link ==============================================







// const puppeteer = require('puppeteer');
// const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
// const fs = require('fs');
// const path = require('path');

// const videoDir = path.join(__dirname, 'videos');
// if (!fs.existsSync(videoDir)){
//     fs.mkdirSync(videoDir);
// }

// // 🛡️ Aapki Direct Proxy Details
// const proxyServer = 'http://142.111.67.146:5611';
// const proxyUsername = 'dgmtstlf';
// const proxyPassword = 'pm4wnuro0gy9';

// (async () => {
//     console.log("🚀 Browser start ho raha hai (Direct Proxy Mode)...");
    
//     const browser = await puppeteer.launch({ 
//         headless: true, 
//         defaultViewport: { width: 1280, height: 720 },
//         args: [
//             '--no-sandbox',              
//             '--disable-setuid-sandbox',  
//             '--mute-audio',
//             '--autoplay-policy=no-user-gesture-required',
//             `--proxy-server=${proxyServer}` // 🌐 Proxy yahan set ho rahi hai
//         ] 
//     });
    
//     const page = await browser.newPage();

//     // 🔐 Proxy par Username aur Password lagana
//     console.log("🔐 Proxy ID aur Password apply kar raha hoon...");
//     await page.authenticate({
//         username: proxyUsername,
//         password: proxyPassword
//     });

//     // 💡 Network Tab ko sunna
//     page.on('request', (request) => {
//         const url = request.url();
        
//         if (url.includes('.m3u8')) {
//             console.log("\n" + "=".repeat(50));
//             console.log("🎉 BINGO! M3U8 Link Pakra Gaya!");
//             console.log("🔗 URL:", url);
            
//             const headers = request.headers();
//             console.log("🛡️ Referer:", headers['referer'] || "Nahi mila");
//             console.log("🍪 Cookie:", headers['cookie'] || "Nahi mili");
//             console.log("=".repeat(50) + "\n");
//         }
//     });

//     const recorder = new PuppeteerScreenRecorder(page);
//     const videoPath = path.join(videoDir, `stream-video-${Date.now()}.mp4`);
    
//     console.log("🎥 Video recording start kar raha hoon...");
//     await recorder.start(videoPath);

//     console.log("🌐 Iframe URL load kar raha hoon...");
    
//     try {
//         await page.goto('https://dlstreams.com/embed/stream-31.php', { 
//             waitUntil: 'networkidle2',
//             timeout: 60000 
//         });
//     } catch(e) {
//         console.log("🚨 URL Load Error:", e.message);
//     }

//     console.log("⏳ 20 second wait kar raha hoon (Video Record ho rahi hai)...");
//     await new Promise(r => setTimeout(r, 20000));

//     console.log("🛑 Video recording stop kar raha hoon...");
//     await recorder.stop();

//     console.log("🛑 Extraction mukammal. Browser band kar raha hoon.");
//     await browser.close();
// })();
