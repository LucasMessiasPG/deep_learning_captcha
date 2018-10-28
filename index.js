const puppeteer = require("puppeteer");
const { exec } = require("child_process");
const readline = require("readline");
const fs = require("fs");
const uuid = require("uuid");
const request = require("request");

let count1 = 0;
let count2 = 0;
 
(async () => {
	const browser = await puppeteer.launch({
		headless: false
	});

	async function extractInfo(page) {
		let tables = await page.evaluate(() => {
			let texts = [];
			let index_1 = 0;
			var tbodys = document.querySelectorAll("tbody");
			for (let tbody of tbodys) {
				index_1++;
				if (!texts[index_1]) texts[index_1] = [];
				let trs = tbody.querySelectorAll("tr");
				let index_2 = 0;
				for ( let tr of trs) {
					index_2++;
					if (!texts[index_1][index_2]) texts[index_1][index_2] = [];
					let tds = tr.querySelectorAll("td");
					tds.forEach(item => {
						let text = item.innerText;
						text = text.replace(/[\r\n\t]/g, "").trim();
						text && texts[index_1][index_2].push(text);
					});
				}
			}
			return texts;
		});
		tables = tables.filter(item => item != null).map(item => {
			item = item.filter(item2 => item2 != null);
			return item;
		}).filter(item => item.length);
		let info = {};
		info.raw = tables;
		for (let i in tables) {
			let item = tables[i];
			if (["0", "1", "5", "7", "9"].indexOf(i.toString()) !== -1) continue;

			switch (i.toString()) {
				case "2":
					info.themis = item[0] && item[0][2];
					info.cnj = item[1] && item[1][1];
					break;
				case "3":
					info.stage = item[1] && item[1][0];
					info.legalSecrect = item[1] && item[1][1].indexOf("Não") === -1;
					break;
				case "4":
					if (item[0][0].indexOf("Julgador") !== -1) {
						info.location = {
							state: "RS",
							place: item[0] && item[0][1]
						};
						info.proposedDate = item[3][1];
						info.volume = item[4][1];
						info.amountSheets = item[5] && item[5][1] || 0;
					} else if (item[0][0].indexOf("Comarca") !== -1) {
						info.location = {
							city:  item[0] && item[0][1],
							state: "RS",
							place: item[1][1]
						};
						info.proposedDate = item[2][1];
						info.situationDescription = item[3][1];
						info.situation = item[4][1];
						info.volume = item[5][1];
						info.amountSheets = item[6] && item[6][1] || 0;
					}
					break;
				case "6":
					info.parties = { 
						author: {
							name: item[1][0],
							adv:  {
								name: item[3][0],
								oab:  item[3][1]
							}
						},
						defendant: {
							name: item[5][0],
							adv:  {
								name: item[7][0],
								oab:  item[7][1]
							}
						}
					};
					break;
				case "8":
					info.history = [];
					for (let i of item) {
						info.history.push({
							date:        i[0],
							description: i[1]
						});
					}
					break;
			}
		}
		request.post("http://localhost:8081/api/update", { form: info }, function(err, response) {
			if (err) throw err;
			return true;
		});
	}

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

	async function getCpj(skip) {
		return new Promise(resolve => {
			request.get("http://localhost:8081/api/process?skip=" + skip, (err, response, body) => {
				body = JSON.parse(body);
				resolve(body.result);
			});
		});
	}
	
	let numbers = [];

	async function processPage(skip) {
		if (numbers.length == 0) {
			console.log("get more cnj");
			numbers = await getCpj(skip);

			if (!numbers || !numbers.length) {
				console.log("all processed");
				process.exit(0);
			}
		}
		const process = numbers.pop();
		console.log("---- hit: " + count1 + " - missed: " + count2 );
		console.log(process.cnj);
		const page = await browser.newPage();
		let name = uuid();
		try {
			page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36");
			await page.goto("http://www.tjrs.jus.br/site_php/consulta/index.php", { "waitUntil": "networkidle0"} );
		
			const processNumberMaks = await page.$("input[name=num_processo_mask]");
			processNumberMaks.type(process.cnj);
	
	
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
					path:           name + ".jpg",
					omitBackground: true,
				});
	
				resultCaptcha = await new Promise(resolve => {
					exec("python model.py ./" + name + ".jpg", (err, stdout, stderr) => {
						if (err) throw new Error(err);
						resolve(stdout);
					});
				});
				console.log("----> predict captcha: ", resultCaptcha.slice(0, 4));
			}
	
		
			resultCaptcha = resultCaptcha.slice(0, 4);
			await captchaCheck.type(resultCaptcha);
			await page.click("input[name=btnPesquisar]");
			
			await page.waitForNavigation({
				waitUntil: "networkidle0"
			});
	
			const btnPrint = await page.$("form[name=impressao_totem]");
			if (!btnPrint) {
				count2++;
				console.log("wrong captcha");
			} else {
				let path = "./captchas/" + resultCaptcha + ".jpg";
				if (fs.existsSync(path) == false) {
					fs.copyFileSync("./" + name + ".jpg", path);
				}
				count1++;
				console.log("enter");
				await extractInfo(page);
			}
		} catch (error) {
			console.log(error);
			console.log("catch error");
			numbers.push(process);
		} finally {
			fs.unlinkSync("./" + name + ".jpg");
			await page.close();
			processPage();
		}
	}
	
	try {
		processPage(400);
	} catch (err) {
		count2++;
		console.log("catch error");
		processPage();
	}
})();