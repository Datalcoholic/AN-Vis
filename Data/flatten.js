const fs = require('fs');

// Extraer los elementos de cada diputado
const raw = fs.readFileSync('dipData.json');
const json = JSON.parse(raw);

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

//TODO:
// Completar info de diputados del PSUV

// console.log(totalDipMud);
// console.log('mudDip', mudDip.length, 'Vs', 'totalDipMud', totalDipMud.length);
//TODO:
// Completar la informacion de partido, condicion

// Save totalDipMud
fs.writeFileSync(
	'Diputados_mud.csv',
	'name,img ,condicion ,bancada ,circuncripcion,representante_d,estado ,suplente ,twitter ,instagram\n'
);

totalDipMud
	.sort((a, b) => a.condicion > b.condicion)
	.forEach(d =>
		fs.appendFileSync(
			'Diputados_mud.csv',
			`${d.name},${d.img} ,${d.condicion} ,${d.bancada} ,${d.circuncripcion},${d.representante_d},${d.estado} ,${d.suplente} ,${d.twitter} ,${d.instagram}\n`
		)
	);

// Concatenar
