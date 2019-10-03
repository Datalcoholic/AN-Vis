const fs = require('fs');
const csv = require('csv-parser');
const iconv = require('iconv-lite');

// Extraer los elementos de cada diputado
const raw = fs.readFileSync('dipData.json', { encoding: 'latin1' });
const encode = iconv.encode(raw, 'iso885915');
const json = JSON.parse(encode);

// 1.- Filtrar array de info por el valor que se desea extraer
function getinfo(array, regex) {
	try {
		var re = new RegExp(regex);
		let res = array.filter(e => e.match(re))[0];
		return res.split(':')[1].trim();
	} catch (error) {
		console.log('Error');
	}
}

const flatJson = json.map(data => ({
	name: data.name,
	img: data.img,
	condicion: data.condicion,
	bancada: getinfo(data.info, 'Partido'),
	circuncripcion: getinfo(data.info, 'Circunscripción'),
	representante_de: getinfo(data.info, 'Representante de'),
	estado: getinfo(data.info, 'Estado'),
	suplente: getinfo(data.info, 'Suplente'),
	twitter: getinfo(data.info, 'Twitter'),
	instagram: getinfo(data.info, 'Instagram')
}));

// Dividir los diputados por bancada

const mudDip = flatJson.filter(d => d.bancada === 'MUD');
const psuvDip = flatJson.filter(d => d.bancada === 'PSUV');

// Save formato de diputados por bancada
function saveCsv(path, array, sep = ';') {
	const cols = Object.keys(array[0]);
	const colsNames = cols.join(sep);
	console.log('Columnas:\n', colsNames);

	fs.writeFile(path, `${colsNames}\n`, function(err) {
		if (err) throw err;
	});

	array.forEach(obj => {
		const colnomjoint = cols.map(d => {
			return `\$\{obj.${d}\}`;
		});
		const bar = [];
		bar.push(colnomjoint.join(sep));

		const colNom = bar.map(d => {
			return `\`${d}`;
		});

		fs.appendFile(
			path,
			`${obj.name};${obj.img};${obj.condicion};${obj.bancada};${obj.circuncripcion};${obj.representante_de};${obj.estado};${obj.suplente};${obj.twitter};${obj.instagram}\n`,
			function(err) {
				if (err) throw err;
			}
		);
	});

	console.log(`File save it in : ${path}`);
}

//saveCsv('../Data/diputadosPsuv.csv', psuvDip, ';');

//Crear archivo para completar la informacion que falta de cada bancada

function makeLookUpTable(path, array) {
	const cols = 'name,coalicion,condicion,partido,estado_legal\n';

	fs.writeFile(path, cols, function(err) {
		if (err) throw err;
	});

	array
		.sort((a, b) => a.condicion > b.condicion)
		.forEach(d => {
			fs.appendFile(
				path,
				`${d.name},${d.bancada},${d.condicion},NA,NA\n`,
				function(err) {
					if (err) throw err;
				}
			);
		});
}

//makeLookUpTable('../Data/lookup_psuv_table.csv', psuvDip);

//Completar los diputados que faltan por bancada
let dipQueFaltanMud = [
	//{ name: 'Romel Edgardo Guzamana', estado: 'Amazonas' },
	{ name: 'Julio Ygarza', estado: 'Amazonas' },
	{ name: 'Nirma Guarulla', estado: 'Amazonas' }
];
const dipFaltanMud = dipQueFaltanMud.map(d => ({
	name: d.name,
	img: 'NA',
	condicion: 'Principal',
	bancada: 'NA',
	circuncripcion: 'NA',
	representante_de: 'NA',
	estado: d.estado,
	suplente: 'NA',
	twitter: 'NA',
	instagram: 'NA'
}));

let dipQueFaltanPsuv = [];
const dipFaltanPsuv = dipQueFaltanPsuv.map(d => ({
	name: d.name,
	img: 'NA',
	condicion: 'Principal',
	bancada: 'NA',
	circuncripcion: 'NA',
	representante_de: 'NA',
	estado: d.estado,
	suplente: 'NA',
	twitter: 'NA',
	instagram: 'NA'
}));

const totalDipMud = [...mudDip, ...dipFaltanMud];
const totalDipPsuv = [...psuvDip, ...dipFaltanPsuv];

// Completar la informacion de partido, condicion
const dataMudDipRaw = [];

fs.createReadStream('../Data/diputadosMud.csv')
	.pipe(iconv.decodeStream('iso88591'))
	.pipe(csv({ separator: ';' }))
	.on('data', d => dataMudDipRaw.push(d))
	.on('end', () => {
		console.log(dataMudDipRaw);
		let match = [];

		totalDipMud.forEach(d => {
			dataMudDipRaw.forEach(r => {
				if (
					d.name.trim().replace('ń', 'ñ') ===
					r.name.trim().replace('ń', 'ñ')
				) {
					match.push({
						name: d.name,
						img: d.img,
						condicion: d.condicion,
						bancada: r.coalicion,
						partido: r.partido,
						circuncripcion: d.circuncripcion,
						representante_de: d.representante_de,
						estado: d.estado,
						suplente: d.suplente,
						estado_legal: r.estado_legal
					});

					// console.log(
					// 	'total Dip',
					// 	d.name.trim(),
					// 	'total Dip json',
					// 	r.name.trim(),
					// 	'true'
					// );
				}
			});
		});
		console.log(match.length, 'de', dataMudDipRaw.length);
		console.log(match);

		let name1 = [];
		let matchNames = [];

		totalDipMud.forEach(a => name1.push(a.name.replace('ń', 'ñ')));
		dataMudDipRaw.forEach(a => matchNames.push(a.name.replace('ń', 'ñ')));

		let difference = name1
			.filter(x => !matchNames.includes(x))
			.concat(matchNames.filter(x => !name1.includes(x)));
		console.log(difference);

		//Creacion del archivo Donde esat consolidado toda la data
		fs.writeFile(
			'../Data/mudDipClean.csv',
			'name;img;condicion;bancada;partido;circuncripcion;representante_de;estado;suplente;estado_legal\n',
			'utf8',
			err => console.log(err)
		);

		match.forEach(d =>
			fs.appendFile(
				'../Data/mudDipClean.csv',
				`${d.name};${d.img};${d.condicion};${d.bancada};${d.partido};${d.circuncripcion};${d.representante_de};${d.estado};${d.suplente};${d.estado_legal}\n`,
				'utf8',
				err => {
					if (err) {
						console.log(err);
					}
				}
			)
		);
	});

const dataPsuvDipRaw = [];
fs.createReadStream('../Data/lookup_psuv_table.csv')
	.pipe(iconv.decodeStream('utf8'))
	.pipe(csv({ separator: ',' }))
	.on('data', d => dataPsuvDipRaw.push(d))
	.on('end', () => {
		console.log(dataPsuvDipRaw);
		let match = [];

		totalDipPsuv.forEach(d => {
			dataPsuvDipRaw.forEach(r => {
				if (
					d.name.trim().replace('ń', 'ñ') ===
					r.name.trim().replace('ń', 'ñ')
				) {
					match.push({
						name: d.name,
						img: d.img,
						condicion: d.condicion,
						bancada: r.coalicion,
						partido: r.partido,
						circuncripcion: d.circuncripcion,
						representante_de: d.representante_de,
						estado: d.estado,
						suplente: d.suplente,
						estado_legal: r.estado_legal
					});

					// console.log(
					// 	'total Dip',
					// 	d.name.trim(),
					// 	'total Dip json',
					// 	r.name.trim(),
					// 	'true'
					// );
				}
			});
		});
		console.log(match.length, 'de', dataPsuvDipRaw.length);
		//console.log(match);

		let name1 = [];
		let matchNames = [];

		totalDipPsuv.forEach(a => name1.push(a.name.replace('ń', 'ñ')));
		dataPsuvDipRaw.forEach(a => matchNames.push(a.name.replace('ń', 'ñ')));

		let difference = name1
			.filter(x => !matchNames.includes(x))
			.concat(matchNames.filter(x => !name1.includes(x)));
		console.log('Sin coincidencia:', difference);

		//Creacion del archivo Donde esat consolidado toda la data
		fs.writeFile(
			'../Data/psuvClean.csv',
			'name;img;condicion;bancada;partido;circuncripcion;representante_de;estado;suplente;estado_legal\n',
			'utf8',
			err => console.log(err)
		);

		match.forEach(d =>
			fs.appendFile(
				'../Data/psuvClean.csv',
				`${d.name};${d.img};${d.condicion};${d.bancada};${d.partido};${d.circuncripcion};${d.representante_de};${d.estado};${d.suplente};${d.estado_legal}\n`,
				'utf8',
				err => {
					if (err) {
						console.log(err);
					}
				}
			)
		);
	});

//TODO:
// Completar info de diputados del PSUV

// Concatenar
