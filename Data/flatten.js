const fs = require('fs')

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
	partido: getinfo(data.info, 'Partido'),
	circuncripcion: getinfo(data.info, 'Circunscripción'),
	representante_de: getinfo(data.info, 'Representante de'),
	estado: getinfo(data.info, 'Estado'),
	suplente: getinfo(data.info, 'Suplente'),
	twitter: getinfo(data.info, 'Twitter'),
	instagram: getinfo(data.info, 'Instagram')
}));

console.log(flatJson);
// Dividir los diputados por bancada
// Completar los diputados que faltan por bancada
// Completar la informacion de partido, condicion
// Concatenar