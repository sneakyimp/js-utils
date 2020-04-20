// moved functions here which i kept defining over and over

let start = null;

if (!("TextEncoder" in window)) { 
	throw "Sorry, this browser does not support TextEncoder...";
}
let enc = new TextEncoder(); // always utf-8

if (!("TextDecoder" in window)) { 
	throw "Sorry, this browser does not support TextDecoder...";
}
let dec = new TextDecoder(); // always utf-8


function now() {
	return Date.now()/1000;
}

function getRandomIntInclusive(min, max) {
	  min = Math.ceil(min);
	  max = Math.floor(max);
	  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

// generates random string of the specified length, optional params
// outline UTF16 charCode range:
// limit 32-126 for (mostly?) printable ascii chars
// limit 32, 255 for mostly printable chars, all of which are single-byte but includes accented chars
// limit 32, 1024 for mostly printable chars, most of which are multibyte
// limit 0-55295 for utf8 preservation
function getRandomString(len, minCode=null, maxCode=null) {
	minCode = minCode ? minCode : 0;
	maxCode = maxCode ? maxCode : 65535;
	let retval = "";
	while(retval.length < len) {
		// this range should generate a lot of printable chars greater than one byte
		// TODO try and expand it to the entire range
//		const rnd = getRandomIntInclusive(32,126);
		// lets start with just uppercase letters
//		const rnd = getRandomIntInclusive(65,1024);
//		const rnd = getRandomIntInclusive(0, 65535);
		const rnd = getRandomIntInclusive(minCode, maxCode); // i did some research and translation to utf8 and back for some 2049 chars fails

		retval += String.fromCharCode(rnd);
	}
	return retval;
}

// generates cnt strings of length len spanning the entire 16-bit range
function generateTestStrings(cnt, len) {
	let test = [];
	for(let i=0; i<cnt; i++) {
		// generate a string of the specified len
		test[i] = getRandomString(len, 0, 65535);
//		test[i] = getRandomString(len, 0, 55295);
	}
	return test;
}

//writes the specified str to the end of the document body
function docLog(str) {
	let elem = document.createElement('div');
	elem.innerHTML = str;
// 	elem.style.cssText = 'position:absolute;width:100%;height:100%;opacity:0.3;z-index:100;background:#000';
	document.body.appendChild(elem);
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}