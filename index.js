const puppeteer = require("puppeteer");
const { exec } = require("child_process");
const readline = require("readline");
const fs = require("fs");

let count1 = 0;
let count2 = 0;
 
(async () => {
	const browser = await puppeteer.launch({
		headless: false
	});

	function askQuestion(query) {
		const rl = readline.createInterface({
			input:  process.stdin,
			output: process.stdout,
		});
	
		return new Promise(resolve => rl.question(query, ans => {
			rl.close();
			resolve(ans);
		}));
	}
	
	async function processPage() {
		console.log("---- hit: " + count1 + " - missed: " + count2);
		const page = await browser.newPage();
		try {
			page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36");
			await page.goto("http://www.tjrs.jus.br/site_php/consulta/index.php", { "waitUntil": "networkidle0"} );
		
			const processNumberMaks = await page.$("input[name=num_processo_mask]");
			processNumberMaks.type("00008418120088210154");
	
	
			// const processNumber = await page.$("input[name=num_processo]");
			// processNumber.type("20178210015");
	
			let enterValue = false;
			let resultCaptcha = false;
			const captchaCheck = await page.$("input[name=code]");
			if (enterValue) {
				resultCaptcha = await askQuestion("digite o captcha que voce esta vendo ");
			} else {
				const imgCheck = await page.$("img[name=img_check]");
				await imgCheck.screenshot({
					path:           "img.jpg",
					omitBackground: true,
				});
	
				resultCaptcha = await new Promise(resolve => {
					exec("python model.py ./img.jpg", (err, stdout, stderr) => {
						if (err) throw new Error(err);
						resolve(stdout);
					});
				});
				console.log("predict captcha: ", resultCaptcha.slice(0, 4));
			}
	
		
			resultCaptcha = resultCaptcha.slice(0, 4);
			await captchaCheck.type(resultCaptcha);
			await page.click("input[name=btnPesquisar]");
			
			await page.waitForNavigation({
				waitUntil: "networkidle0",
				timeout:   15000
			});
	
			const btnPrint = await page.$("form[name=impressao_totem]");
			if (!btnPrint) {
				count2++;
				console.log("wrong captcha");
			} else {
				let path = "./captchas/" + resultCaptcha + ".jpg";
				if (fs.existsSync(path) == false) {
					fs.copyFileSync("./img.jpg", path);
				}
				count1++;
				console.log("enter");
			}
		} catch (error) {
			console.log("catch error");
		} finally {
			await page.close();
			processPage();
		}
	}
	
	try {
		processPage();
	} catch (err) {
		count2++;
		console.log("catch error");
		processPage();
	}
})();
