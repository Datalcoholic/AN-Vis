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

// Completar los diputados que faltan por bancada
const dipFaltanMud = [
	{ name: 'Romel Edgardo Guzamana', estado: 'Amazonas' },
	{ name: 'Julio Ygarza', estado: 'Amazonas' },
	{ name: 'Nirma Guarulla', estado: 'Amazonas' }
].map(d => ({
	name: d.name,
	img: 'NA',
	condicion: 'NA',
	bancada: 'NA',
	circuncripcion: 'NA',
	representante_de: 'NA',
	estado: d.estado,
	suplente: 'NA',
	twitter: 'NA',
	instagram: 'NA'
}));

const totalDipMud = [...mudDip, ...dipFaltanMud];

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

//TODO:
// Completar info de diputados del PSUV

// console.log(totalDipMud);
// console.log('mudDip', mudDip.length, 'Vs', 'totalDipMud', totalDipMud.length);

// Save totalDipMud
// fs.writeFileSync(
// 	'Diputados_mud.csv',
// 	'name,img ,condicion ,bancada ,circuncripcion,representante_d,estado ,suplente ,twitter ,instagram\n'
// );

// totalDipMud
// 	.sort((a, b) => a.condicion > b.condicion)
// 	.forEach(d =>
// 		fs.appendFileSync(
// 			'Diputados_mud.csv',
// 			`${d.name},${d.img} ,${d.condicion} ,${d.bancada} ,${d.circuncripcion},${d.representante_d},${d.estado} ,${d.suplente} ,${d.twitter} ,${d.instagram}\n`
// 		)
// 	);

// Concatenar
