const puppeteer = require('puppeteer');

(async () => {
    console.log("🚀 Browser start ho raha hai (Direct Iframe Navigation Method)...");
    
    const browser = await puppeteer.launch({ 
        headless: true, 
        args: [
            '--no-sandbox',              
            '--disable-setuid-sandbox',  
            '--mute-audio'
        ] 
    });
    
    const page = await browser.newPage();

    // Asli user banne ka natak
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // 💡 Asal M3U8 Pakadne ka Logic (Hamesha on rahega)
    page.on('request', (request) => {
        const url = request.url();
        if (url.includes('.m3u8')) {
            console.log("\n" + "=".repeat(50));
            console.log("🎉 BINGO! M3U8 Link Pakra Gaya!");
            console.log("🔗 URL:", url);
            console.log("=".repeat(50) + "\n");
        }
    });

    console.log("🌐 Step 1: Main website load kar raha hoon taake Iframe ka link chura sakun...");
    
    try {
        await page.goto('https://dadocric.st/player.php?id=willowextra', { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
    } catch (e) {
        console.log("🚨 Main website load error:", e.message);
    }

    console.log("⏳ 5 second wait kar raha hoon taake iframe DOM mein aa jaye...");
    await new Promise(r => setTimeout(r, 5000));

    // 🕵️‍♂️ Step 2: Page ke andar se Iframe ka link nikalna
    const iframeUrl = await page.evaluate(() => {
        const iframe = document.querySelector('iframe');
        return iframe ? iframe.src : null;
    });

    if (iframeUrl) {
        console.log(`\n🎯 Iframe ka khufiya link mil gaya: ${iframeUrl}`);
        console.log("🚀 Step 3: Ab seedha is link par ja raha hoon (Bypassing Iframe restrictions)...");

        // YEH BOHAT ZAROORI HAI: Hum server ko jhoot bolenge ke hum dadocric.st se hi aaye hain
        await page.setExtraHTTPHeaders({
            'Referer': 'https://dadocric.st/'
        });

        try {
            // Ab hum direct player wale link par jayenge
            await page.goto(iframeUrl, { 
                waitUntil: 'networkidle2', 
                timeout: 45000 
            });
            console.log("✅ Direct player load ho gaya! Ab stream play hone ka wait karte hain...");
        } catch (e) {
            console.log("🚨 Player load error:", e.message);
        }

        // M3U8 load hone ka aakhri wait
        console.log("⏳ 15 second wait kar raha hoon...");
        await new Promise(r => setTimeout(r, 15000));

    } else {
        console.log("❌ ERROR: Page par koi Iframe nahi mila. Shayad link change ho gaya hai.");
    }

    console.log("🛑 Extraction mukammal. Browser band kar raha hoon.");
    await browser.close();
})();
