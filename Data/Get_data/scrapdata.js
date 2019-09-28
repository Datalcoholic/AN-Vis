const puppeteer = require('puppeteer');
const fs = require('fs');
const _ = require('lodash');

(async () => {
	const getDipData = async url => {
		const page = await browser.newPage();
		page.setUserAgent(
			'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
		);

		await page.goto(url);
		await page.waitForSelector('img');

		const dipHref = await page.evaluate(href =>
			Array.from(
				document.querySelectorAll(
					'div.wrap10.minfont.txcenter.cdarkgrey > div.wrap10.padding05.midle-font.bold.txcenter > a'
				)
			).map(ref => ref.href)
		);

		console.log(`scraping : ${url}`);
		const data = [];
		for (const link of dipHref) {
			await page.goto(link, { waitUntil: 'load', timeout: 0 });
			await page.waitForSelector('ul');

			const name = await page.evaluate(() =>
				document
					.querySelector(
						'body > div.wrapper-content.bb-box.z-two > 		div.wrap10.blightgrey > div > 		div.wrap3.flleft.padding05.second-full-size > 		div:nth-child(1) > 		div.wrap10.padding1.midle-font.bold.txcenter'
					)
					.textContent.trim()
			);

			const img = await page.evaluate(
				() =>
					document.querySelector(
						'div.user-profile.center.circle.margint2.fototu > img'
					).src
			);

			const condicion = await page.evaluate(() =>
				document
					.querySelector(
						'body > div.wrapper-content.bb-box.z-two > 		div.wrap10.blightgrey > div > 		div.wrap3.flleft.padding05.second-full-size > 		div:nth-child(1) > div:nth-child(3) > div'
					)
					.textContent.trim()
			);
			const info = await page.evaluate(() =>
				Array.from(
					document.querySelectorAll(
						'div.wrap3.flleft.padding05.second-full-size > 		div:nth-child(1) li'
					)
				).map(a => a.innerText)
			);

			data.push({
				name: name,
				img: img,
				condicion: condicion,
				info: info
			});

			const time = _.random(1500, 4500);
			setTimeout(() => console.log(`tiempo de espera de:${time}`), time);

			//await page.close();
		}
		await page.close();
		console.log(`Array de: ${data.length}`);

		if (data.length < 8) {
			console.log(`terminate recursion on: ${url}`);
			console.log(data);
			return data;
		} else {
			const nextPageNumber =
				parseInt(url.match(/page=(\d+)$/)[1], 10) + 1;
			const nextUrl = `http://www.asambleanacional.gob.ve/diputados?page=${nextPageNumber}`;
			return data.concat(await getDipData(nextUrl));
		}
	};

	const url = 'http://www.asambleanacional.gob.ve/diputados?page=1';
	const browser = await puppeteer.launch({ headless: true, timeout: 45000 });
	const dipData = await getDipData(url);

	// Convertir el Obj to JSON
	let jsonData = JSON.stringify(dipData, null, 2);
	console.log(jsonData);
	//Escribeindo el archivo en disco
	fs.writeFileSync('Data/dipData.json', jsonData);

	await browser.close();
})();
