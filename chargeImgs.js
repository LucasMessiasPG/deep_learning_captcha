// 1539350384955
const puppeteer = require("puppeteer");
const fs = require("fs");
const uuid = require("uuid");
 
(async () => {
	const browser = await puppeteer.launch({headless: false});

	const chargePage = () => {
		return new Promise(async resolve => {
			const timestamp = uuid();
			const page = await browser.newPage();
			page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36");
			const img = await page.goto("http://www.tjrs.jus.br/site_php/consulta/human_check/humancheck_showcode.php?" + timestamp, { "waitUntil": "networkidle0"} );
			fs.writeFile("./captcha/" + timestamp + ".jpg", await img.buffer(), err => {
				if (err) console.log(err);
			});
			await page.close();
			resolve(true);
		});
	};

	for (let i = 0; i < 100; i++) {
		console.log("loop: " + i);
		let promises = [];

		promises.push(chargePage());
		promises.push(chargePage());
		promises.push(chargePage());
		promises.push(chargePage());
		promises.push(chargePage());

		await Promise.all(promises);
	}
	browser.close();
})();