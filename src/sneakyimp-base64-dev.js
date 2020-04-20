/**
 * Class for base64-encoding/decoding binary strings, designed to avoid the invalid char issue with btoa/atob
 * that comes when you do this:
 * const myVar = btoa("☸☹☺☻☼☾☿"); // throws InvalidCharacterError: String contains an invalid character
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa#Unicode_strings
 * 
 * btoa() also casts ByteArray objects as a string before encoding them, which is not cool.
 * 
 * It's worth noting that javascript strings are utf16-encoded arrays of 2-byte characters. If you are dealing
 * with utf8-encoded data, you might need to do some casting or conversion to get reasonable results. By default
 * the decode function returns a Uint8Array, but you can specify an optional second parameter to have it
 * return a javascript string instead. This will barf if the decoding yields a decoded byte array of odd
 * length. It's also worth noting that decoding to a string when the original object encoded was a Uint8Array
 * will also yield a different object from the original. You'll need to stay on top of this in your application.
 * 
 * if you need to utf8-encode or decode anything
 * https://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
 * 
 * NO WARRANTY IS EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

(function(){
	//if (!jQuery) throw "SNEAKYIMP.Crypt requires jQuery to work";
	
	
	// base64 class...dunno if we need to instantiate
	let Base64 = function() {
		// properties here
//		this.foo = null;
	};
	
	Base64.ENCODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	Base64.encodeCharLookup = {}; // a dictionary/assoc array for inverting char lookups
	for (let i = 0; i < Base64.ENCODE_CHARS.length; i++) {
		Base64.encodeCharLookup[Base64.ENCODE_CHARS[i]] = i;
	}

	
	// fn to base64-encode the supplied parameter, either a Uint8Array or string
	// the intent here is that str can be a binary string and this won't choke, like btoa does
	// but also to strive for possible optimization
	Base64.encode = function(param){
		let byteArr = null;
		if ((typeof param) == "string") {
			// JS strings are UTF-16 encoded, two bytes each
			// ASCII chars have the meaingful byte first in each byte pair, e.g., "a" has the 97 first and the second bye is zero 
			const bytePairs = new Uint16Array(param.length);
			for (var i = 0; i < bytePairs.length; i++) {
				bytePairs[i] = param.charCodeAt(i);
			}
			// cast as byte array
			byteArr = new Uint8Array(bytePairs.buffer)
		} else if (param instanceof Uint8Array) {
			byteArr = param;
		} else {
			throw "Base64.encode only encodes String or Uint8Array. Invalid type: " + ( typeof param);
		}
		if (!byteArr) {
			throw "Invalid parameter. Cannot cast as byte array";
		}

		let retval = ""; // the encoding to return
		let padding = ""; // padding of = at the end
		let remainder = byteArr.length % 3;
		
		// if string is not a multiple of 3 characters, we need this much padding
		// the idea being that 8-bit bytes are encoding in increments of 6 bits...3 bytes = 8x3 = 6x4
		if (remainder > 0) {
			for (; remainder < 3; remainder++) {
				padding += "=";
			} 
		}
		
		// loop thru the byte array, grabbing three bytes at once
		for (let offset = 0; offset < byteArr.length; offset += 3) {
			// add newlines after every 76 output characters according to the MIME specs?
//			if (offset > 0 && (offset / 3 * 4) % 76 == 0) {
//		      retval += "\r\n";
//		    }

			// combine three bytes become one 24-bit number so we can get the bits
			let num = (byteArr[offset] << 16);
			if ((offset+1) < byteArr.length) {
				num += (byteArr[offset+1] << 8);
			}
			if ((offset+2) < byteArr.length) {
				num += byteArr[offset+2];
			}

		    // from those 24 bits, we extract four 6-bit values to encode
		    let toEncode = [(num >>> 18) & 63, (num >>> 12) & 63, (num >>> 6) & 63, num & 63];

		    // look up those 6-bit values in the ENCODE_CHARS
		    for(let i=0; i<4; i++) {
		    	retval += Base64.ENCODE_CHARS[toEncode[i]];
		    }
		}

		// add = padding string, after removing the zero pad
		return retval.substring(0, retval.length - padding.length) + padding;
	};

	// encodes param as base64, encrypting as it does so one byte at a time
	// modified version of basic encode() fn which takes additional encryptFn parameter
	// in the hope that we might eliminate a loop or two and improve performance
	// param must be either string (which we convert to Uint8Array) or a Uint8Array
	// second param is fn to encrypt a single byte, takes two params encryptFn(i, byte)
	// the intent here is that str can be a binary string and this won't choke, like btoa does
	// DEPRECATED in favor of newer one that uses key16
	Base64.encodeAndEncryptOLD = function(param, encryptFn){
		let byteArr = null;
		if ((typeof param) == "string") {
			// JS strings are UTF-16 encoded, two bytes each
			// ASCII chars have the meaingful byte first in each byte pair, e.g., "a" has the 97 first and the second bye is zero 
			const bytePairs = new Uint16Array(param.length);
			for (var i = 0; i < bytePairs.length; i++) {
				bytePairs[i] = param.charCodeAt(i);
			}
			// cast as byte array
			byteArr = new Uint8Array(bytePairs.buffer)
		} else if (param instanceof Uint8Array) {
			byteArr = param;
		} else {
			throw "Base64.encode only encodes String or Uint8Array. Invalid type: " + ( typeof param);
		}
		if (!byteArr) {
			throw "Invalid parameter. Cannot cast as byte array";
		}

		let retval = ""; // the encoding to return
		let padding = "";
		let remainder = byteArr.length % 3;

		
		// if string is not a multiple of 3 characters, we need this much padding
		// the idea being that 8-bit bytes are encoding in increments of 6 bits...3 bytes = 8x3 = 6x4
		if (remainder > 0) {
			for (; remainder < 3; remainder++) {
				padding += "=";
			} 
		}
		
		// loop thru the byte array, grabbing three bytes at once
		for (let offset = 0; offset < byteArr.length; offset += 3) {
			// add newlines after every 76 output characters according to the MIME specs?
//			if (offset > 0 && (offset / 3 * 4) % 76 == 0) {
//		      retval += "\r\n";
//		    }

			// combine three bytes become one 24-bit number so we can get the bits
			// apply encryptFn to each byte
			let num = (encryptFn(offset, byteArr[offset]) << 16);
			if ((offset+1) < byteArr.length) {
				num += (encryptFn(offset+1, byteArr[offset+1]) << 8);
			}
			if ((offset+2) < byteArr.length) {
				num += encryptFn(offset+2, byteArr[offset+2]);
			}


		    // from those 24 bits, we extract four 6-bit values to encode
		    let toEncode = [(num >>> 18) & 63, (num >>> 12) & 63, (num >>> 6) & 63, num & 63];

		    // look up those 6-bit values in the ENCODE_CHARS
		    for(let i=0; i<4; i++) {
		    	retval += Base64.ENCODE_CHARS[toEncode[i]];
		    }
		}

		// add = padding string, after removing the zero pad
		return retval.substring(0, retval.length - padding.length) + padding;
	};

	
	
	// modified encodeAndEncrypt that accepts key rather than encrypt fn and just
	// does the xor thing
	// encodes param as base64, encrypting as it does so one byte at a time
	// modified version of basic encode() fn which takes additional key parameter
	// in the hope that we might eliminate a loop or two and improve performance
	// key16 must be a Uint16Array
	// second param is the string to encrypt
	// the intent here is that str can be a binary string and this won't choke, like btoa does
	Base64.encodeAndEncrypt = function(key, param){
		let byteArr = null;
		if ((typeof param) == "string") {
			if (!(key16 instanceof Uint16Array)) {
				throw "key must be Uint16Array for encrypting strings";
			}
			// JS strings are UTF-16 encoded, two bytes each
			// ASCII chars have the meaingful byte first in each byte pair, e.g., "a" has the 97 first and the second bye is zero 
			const bytePairs = new Uint16Array(param.length);
			for (var i = 0; i < bytePairs.length; i++) {
				bytePairs[i] = SNEAKYIMP.Crypt.encryptOneUint16(i, key, param.charCodeAt(i));
			}
			// cast as byte array
			byteArr = new Uint8Array(bytePairs.buffer)
		} else if (param instanceof Uint8Array) {
			if (!(key instanceof Uint8Array)) {
				throw "key must be Uint8Array for encrypting byte arrays";
			}

			byteArr = new Uint8Array(param.length);
			for(let i=0; i<param.length; i++) {
				byteArr[i] = SNEAKYIMP.Crypt.encryptOneByte(i, key, param[i]);
			}
		} else {
			throw "Base64.encode only encodes String or Uint8Array. Invalid type: " + ( typeof param);
		}
		if (!byteArr) {
			throw "Invalid parameter. Cannot cast as byte array";
		}

		let retval = ""; // the encoding to return
		let padding = "";
		let remainder = byteArr.length % 3;

		
		// if string is not a multiple of 3 characters, we need this much padding
		// the idea being that 8-bit bytes are encoding in increments of 6 bits...3 bytes = 8x3 = 6x4
		if (remainder > 0) {
			for (; remainder < 3; remainder++) {
				padding += "=";
			} 
		}
		
		let num = 0; // var where we aggregate bytes from param to encode+encrypt
		let idxP = 0; // index into plaintext string that we are reading
//		let idxE = 0; // index into Encrypted string that we are writing
		// loop thru the byte array, grabbing three bytes at once
		for (let offset = 0; offset < byteArr.length; offset += 3) {
			// add newlines after every 76 output characters according to the MIME specs?
//			if (offset > 0 && (offset / 3 * 4) % 76 == 0) {
//		      retval += "\r\n";
//		    }

			// combine three bytes become one 24-bit number so we can get the bits
			// apply encryptFn to each byte
			idxP = offset;
			num = (byteArr[idxP] << 16);
			idxP++;
			// TODO we might eliminate these if checks in favor of one that lets us
			// break this loop and just perform the if check at the end (see decrypt fn which is more optimized)
			if ((idxP) < byteArr.length) {
				num += (byteArr[idxP] << 8);
			}
			idxP++;
			if ((idxP) < byteArr.length) {
				num += byteArr[idxP];
			}


		    // from those 24 bits, we extract four 6-bit values to encode
		    let toEncode = [(num >>> 18) & 63, (num >>> 12) & 63, (num >>> 6) & 63, num & 63];

		    // look up those 6-bit values in the ENCODE_CHARS
		    for(let i=0; i<4; i++) {
		    	retval += Base64.ENCODE_CHARS[toEncode[i]];
		    }
		}

		// add = padding string, after removing the zero pad
		return retval.substring(0, retval.length - padding.length) + padding;
	};

	
	// decodes a base64-encoded string, set optional second param to true to return a Javascript string object
	// rather than a binary (unicode?) string -- you should probably set it to true if you are decoding JSON
	// for data types other than Uint8Array or String, you'll need to case the output in the calling scope
	Base64.decode = function(encodedStr, boolReturnString = false) {
		// remove any non-base64 characters not in the base64 characters list
//		encodedStr = encodedStr.replace(new RegExp('[^'+Base64.ENCODE_CHARS.split("")+'=]', 'g'), "");
		// this yields a miniscule performance improvement, maybe 1%
//		encodedStr = encodedStr.replace(new RegExp('[^a-zA-Z0-9+/=]', 'g'), "");

		// count the number of padding chars ("=") at the end of the string, should be exactly 0, 1, or 2
		const paddingCount = (encodedStr.match(/=*$/g))[0].length;
		
		// calculcate the approximate number of bytes we need here for our decode buffer
		// note that base64 has 6 bits per char, and we will expand to 8 bits per char
		const expectedByteLength = (encodedStr.length*6)/8 - paddingCount;

		encodedStr = encodedStr.substr(0, encodedStr.length - paddingCount);// + "A".repeat(paddingCount); // only pad chars if we iterate too far
		
		const decoded = new Uint8Array(expectedByteLength);
		//console.log("decoded length: " + decoded.length);
		// increment over the length of this encoded string, four characters at a time
		// each char in encodedStr represents 6 bits in the output string
		// declaring these here instead of in the loop *seems* faster, but I haven't done any real analysis
		let num = 0;
		let idxE = 0; // index into Encrypted string that we are reading
		let idxD = 0; // index into Decrypted string that we are writing
		let shift = 0;
		// WARNING: this loop is highly optimized and relies on some quirky mathematical tricks
		// because we increment by FOUR and further increment offset by up to 3, we can exit the
		// loop before attempting to read past the end of encodedStr and still depend on num
		// being defined for that last 1-3 bytes we need. This works because
		const lastIndex = encodedStr.length - 1; // set this here to avoid substraction operations below
		
		// we name this code section so we can break out
		main_loop_block : {
			for (let offset=0; offset < lastIndex; offset += 4) {
				// combine four of the 6-bit sections into a single 24-bit using bitwise operators
				buf = 0;
				for(let i=0; i<4; i++) {
					idxE = offset + i;
					//console.log("reading 6bit idxE=" + idxE);
	
	
					// this achieves a substantial performance improvement over continued iteration
					// for a few reasons:
					// * exits the loop sooner, eliminating iterations
					// * we don't have to concatenate string padding to encodedStr above to avoid out-of-bounds error
					// * we don't have to remove padding after the main loop completes (this required an array splice before)
					if (idxE > lastIndex){
						// we don't want to read past the lastIndex of the encoded string
						//console.log("breaking before we set buf");
						break main_loop_block;
					}
					
					shift = 6*(3 - i);
					//console.log('setting buf');
					buf += (Base64.encodeCharLookup[encodedStr.charAt(idxE)] << shift);
					
					// alternative is to use indexof, but this is actually slower
	//				num += (Base64.ENCODE_CHARS.indexOf(encodedStr.charAt(idxE)) << shift);
				}
				//console.log('after bit read loop');
	
				// tried this, it is definitely slower than the loop
	//			idxE = offset;
	//			num = (Base64.encodeCharLookup[encodedStr.charAt(idxE++)] << 18)
	//				+ (Base64.encodeCharLookup[encodedStr.charAt(idxE++)] << 12)
	//				+ (Base64.encodeCharLookup[encodedStr.charAt(idxE++)] << 6)
	//				+ Base64.encodeCharLookup[encodedStr.charAt(idxE)];
	
				// this also slower
	//			idxE = offset;
	//			num = (Base64.encodeCharLookup[encodedStr.charAt(idxE++)] << 18);
	//			num += (Base64.encodeCharLookup[encodedStr.charAt(idxE++)] << 12)
	//			num	+= (Base64.encodeCharLookup[encodedStr.charAt(idxE++)] << 6)
	//			num += Base64.encodeCharLookup[encodedStr.charAt(idxE)];
	
				// now read 3 bytes from that 24-bit number using bitwise operators
	//		    for(let i=0; i<3; i++) {
	//		    	const idxD = offset*6/8 + i; // 6-bit offset is slightly different than our byte offset
	//		    	const shift = 8*(2 - i); 
	//		    	const byte = (num >> shift) & 255;
	//		    	decoded[idxD] = byte;
	//		    }
			    
			    idxD = offset*6/8;
				//console.log("== WRITING SET idxD=" + idxD);
	
			    // this *seems* faster than the loop
				//console.log("WRITING idxD=" + idxD);
			    decoded[idxD++] = (buf >> 16) & 255; 
				//console.log("WRITING idxD=" + idxD);
			    decoded[idxD++] = (buf >> 8) & 255;
				//console.log("WRITING idxD=" + idxD);
			    decoded[idxD++] = buf & 255;
			    
			    
			    //console.log("decoded length is " + decoded.length);
			    
			}
		} // end of main_loop_block
		// and we do these last 3 bytes outside the loop
		// IMPORTANT: due to the math quirks described above we can be sure
		// that num has been set before the loop was exited
//		idxD = (offset*6)/8;
		//console.log("OUT, setting WRITE idxD from end of loop is " + idxD);
	    decoded[idxD++] = (buf >> 16) & 255; 
	    if (idxD < expectedByteLength) decoded[idxD++] = (buf >> 8) & 255;
	    if (idxD < expectedByteLength) decoded[idxD] = buf & 255;
	    //console.log("OUT just set idxD" + idxD);

		// remove any zero padding that was added to make this a multiple of 24 bits
		// NOTE: this might seem a bit mystifying, just remember that each =
		// char adds 6 bits, which is almost a full byte, more math quirks
	    // REMOVED thanks to optimization whereby we exit the loop before attempting
	    // to concatenate additional bytes
		//const retval = decoded.slice(0, (decoded.length - paddingCount));
		
		if (boolReturnString) { 
			// although base64 encoding is meant for binary strings, this is convenient for getting a JS string object
			const u16 = new Uint16Array(decoded.buffer);
			return String.fromCharCode(...u16);
		} else {
			// just return the Uint8Array (an array of bytes)
			// might have to cast the data as some other object back up in the calling scope
			return decoded;
		}
	};

	// modified version of standard decode fn which accepts a decryption key to
	// hopefully eliminate looping and improve performance
	// first param is a key, a Uint8Array
	// decodes a base64-encoded string, encodedStr
	// set optional third param to true to return a Javascript string object
	// rather than a Uint8Array -- you should probably set it to true if you are decoding JSON
	// for data types other than Uint8Array or String, you'll need to case the output in the calling scope
	Base64.decodeAndDecrypt = function(key8, encodedStr, boolReturnString = false) {
		// remove any non-base64 characters not in the base64 characters list
//		encodedStr = encodedStr.replace(new RegExp('[^'+Base64.ENCODE_CHARS.split("")+'=]', 'g'), "");
		// this yields a miniscule performance improvement, maybe 1%
//		encodedStr = encodedStr.replace(new RegExp('[^a-zA-Z0-9+/=]', 'g'), "");

		// count the number of padding chars ("=") at the end of the string, should be exactly 0, 1, or 2
		const paddingCount = (encodedStr.match(/=*$/g))[0].length;
		
		// calculcate the approximate number of bytes we need here for our decode buffer
		// note that base64 has 6 bits per char, and we will expand to 8 bits per char
		const expectedByteLength = (encodedStr.length*6)/8 - paddingCount;

		encodedStr = encodedStr.substr(0, encodedStr.length - paddingCount);// + "A".repeat(paddingCount); // only pad chars if we iterate too far
		
		const decoded = new Uint8Array(expectedByteLength);
		//console.log("decoded length: " + decoded.length);
		// increment over the length of this encoded string, four characters at a time
		// each char in encodedStr represents 6 bits in the output string
		// declaring these here instead of in the loop *seems* faster, but I haven't done any real analysis
		let num = 0;
		let idxE = 0; // index into Encrypted string that we are reading
		let idxD = 0; // index into Decrypted string that we are writing
		let shift = 0;
		// WARNING: this loop is highly optimized and relies on some quirky mathematical tricks
		// because we increment by FOUR and further increment offset by up to 3, we can exit the
		// loop before attempting to read past the end of encodedStr and still depend on num
		// being defined for that last 1-3 bytes we need. This works because
		const lastIndex = encodedStr.length - 1; // set this here to avoid substraction operations below
		
		// we name this code section so we can break out
		main_loop_block : {
			for (let offset=0; offset < lastIndex; offset += 4) {
				// combine four of the 6-bit sections into a single 24-bit using bitwise operators
				buf = 0;
				for(let i=0; i<4; i++) {
					idxE = offset + i;
					//console.log("reading 6bit idxE=" + idxE);
	
	
					// this achieves a substantial performance improvement over continued iteration
					// for a few reasons:
					// * exits the loop sooner, eliminating iterations
					// * we don't have to concatenate string padding to encodedStr above to avoid out-of-bounds error
					// * we don't have to remove padding after the main loop completes (this required an array splice before)
					if (idxE > lastIndex){
						// we don't want to read past the lastIndex of the encoded string
						//console.log("breaking before we set buf");
						break main_loop_block;
					}
					
					shift = 6*(3 - i);
					//console.log('setting buf');
					buf += (Base64.encodeCharLookup[encodedStr.charAt(idxE)] << shift);
					
					// alternative is to use indexof, but this is actually slower
	//				num += (Base64.ENCODE_CHARS.indexOf(encodedStr.charAt(idxE)) << shift);
				}
				//console.log('after bit read loop');
	
				// tried this, it is definitely slower than the loop
	//			idxE = offset;
	//			num = (Base64.encodeCharLookup[encodedStr.charAt(idxE++)] << 18)
	//				+ (Base64.encodeCharLookup[encodedStr.charAt(idxE++)] << 12)
	//				+ (Base64.encodeCharLookup[encodedStr.charAt(idxE++)] << 6)
	//				+ Base64.encodeCharLookup[encodedStr.charAt(idxE)];
	
				// this also slower
	//			idxE = offset;
	//			num = (Base64.encodeCharLookup[encodedStr.charAt(idxE++)] << 18);
	//			num += (Base64.encodeCharLookup[encodedStr.charAt(idxE++)] << 12)
	//			num	+= (Base64.encodeCharLookup[encodedStr.charAt(idxE++)] << 6)
	//			num += Base64.encodeCharLookup[encodedStr.charAt(idxE)];
	
				// now read 3 bytes from that 24-bit number using bitwise operators
//			    for(let i=0; i<3; i++) {
//			    	const idxD = offset*6/8 + i; // 6-bit offset is slightly different than our byte offset
//			    	const shift = 8*(2 - i); 
//			    	decoded[idxD] = decryptFn(idxD, (num >> shift) & 255);
//			    	decoded[idxD] = byte;
//			    }
			    
			    idxD = offset*6/8;
				//console.log("== WRITING SET idxD=" + idxD);
	
			    // this *seems* faster than the loop
				//console.log("WRITING idxD=" + idxD);
		    	let tmp = idxD++
		    	decoded[tmp] = SNEAKYIMP.Crypt.decryptOneByte(tmp, key8, ((buf >> 16) & 255));
				//console.log("WRITING idxD=" + idxD);
		    	tmp = idxD++;
			    decoded[tmp] = SNEAKYIMP.Crypt.decryptOneByte(tmp, key8, ((buf >> 8) & 255));
				//console.log("WRITING idxD=" + idxD);
			    tmp = idxD++;
			    decoded[tmp] = SNEAKYIMP.Crypt.decryptOneByte(tmp, key8, (buf & 255));
			    	
			    
			    
			    //console.log("decoded length is " + decoded.length);
			    
			}
		} // end of main_loop_block
		// and we do these last 3 bytes outside the loop
		// IMPORTANT: due to the math quirks described above we can be sure
		// that num has been set before the loop was exited
//		idxD = (offset*6)/8;
		let tmp = idxD++;
	    decoded[tmp] = SNEAKYIMP.Crypt.decryptOneByte(tmp, key8, ((buf >> 16) & 255));
	    if (idxD < expectedByteLength) {
	    	tmp = idxD++;
	    	decoded[tmp] = SNEAKYIMP.Crypt.decryptOneByte(tmp, key8, ((buf >> 8) & 255));
	    }
	    if (idxD < expectedByteLength){
	    	tmp = idxD++;
	    	decoded[tmp] = SNEAKYIMP.Crypt.encryptOneByte(tmp, key8, (buf & 255));
	    }
			

		// remove any zero padding that was added to make this a multiple of 24 bits
		// NOTE: this might seem a bit mystifying, just remember that each =
		// char adds 6 bits, which is almost a full byte, more math quirks
	    // REMOVED thanks to optimization whereby we exit the loop before attempting
	    // to concatenate additional bytes
		//const retval = decoded.slice(0, (decoded.length - paddingCount));
		
		if (boolReturnString) { 
			// although base64 encoding is meant for binary strings, this is convenient for getting a JS string object
			const u16 = new Uint16Array(decoded.buffer);
			return String.fromCharCode(...u16);
		} else {
			// just return the Uint8Array (an array of bytes)
			// might have to cast the data as some other object back up in the calling scope
			return decoded;
		}
	};

	
	// this fn uses native btoa(), which is finicky to encode the supplied param
	// requires some conversion to avoid InvalidCharacterError: String contains an invalid character
	// to make sure th
	// to assist with conversion of multibyte chars (i.e., charCode > 255)
	// @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa
	Base64.nativeEncode = function(param) {
		// first convert string to a string in which each 16-bit
		// unit occupies only one byte to avoid InvalidCharacter complaints
		// on multibyte chars
		// always use typeof when checking for a string because instanceof doesn't work on "primitives"
		// @see https://stackoverflow.com/questions/203739/why-does-instanceof-return-false-for-some-literals
		let toConvert = null;
		if ((typeof param) == "string") {
			// JS strings are utf-16 encoded and for some mystifying reason we must
			// convert to avoid btoa barfing on any multibyte chars
			// not sure why this works (or is necessary) but it's what they do in btoa docs
			// on MDN website
			const codeUnits = new Uint16Array(param.length);
			for (let i = 0; i < codeUnits.length; i++) {
				codeUnits[i] = param.charCodeAt(i);
			}
			toConvert = String.fromCharCode(...new Uint8Array(codeUnits.buffer));
			
		} else if (param instanceof Uint8Array) {
			// for some reason we must convert to string...btoa is a black box
			// String.fromCharCode barfs if you supply a Uint8Array with length > 500000
			//toConvert = String.fromCharCode(...param);
			
			// NOTE this is DIFFERENT than SNEAKYIMP.Util.uint8ArrayToString(param);
			toConvert = "";
			param.forEach((elt, i) => {
				
				toConvert += String.fromCharCode(elt);
			});
			
			

		} else {
			throw "Base64.encode only encodes String or Uint8Array. Invalid type: " + ( typeof param);
		}
		
		return btoa(toConvert);
	};

	// modified version of nativeEncode, which takes encryptFn as second param
	// this fn uses native btoa(), which is finicky to encode the supplied param
	// requires some conversion to avoid InvalidCharacterError: String contains an invalid character
	// to make sure th
	// to assist with conversion of multibyte chars (i.e., charCode > 255)
	// @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa
	Base64.nativeEncodeAndEncrypt = function(param, encryptFn) {
		// first convert string to a string in which each 16-bit
		// unit occupies only one byte to avoid InvalidCharacter complaints
		// on multibyte chars
		// always use typeof when checking for a string because instanceof doesn't work on "primitives"
		// @see https://stackoverflow.com/questions/203739/why-does-instanceof-return-false-for-some-literals
		let toConvert = null;
		if ((typeof param) == "string") {
			// JS strings are utf-16 encoded and for some mystifying reason we must
			// convert to avoid btoa barfing on any multibyte chars
			// not sure why this works (or is necessary) but it's what they do in btoa docs
			// on MDN website
			const codeUnits = new Uint16Array(param.length);
			for (let i = 0; i < codeUnits.length; i++) {
				if (encryptFn) {
					throw "encode fn not implemented for nativeEncode of strings";
				}
				codeUnits[i] = param.charCodeAt(i);
			}
			toConvert = String.fromCharCode(...new Uint8Array(codeUnits.buffer));
			
		} else if (param instanceof Uint8Array) {
			// for some reason we must convert to string...btoa is a black box
			// String.fromCharCode barfs if you supply a Uint8Array with length > 500000
			//toConvert = String.fromCharCode(...param);
			
			// NOTE this is DIFFERENT than SNEAKYIMP.Util.uint8ArrayToString(param);
			toConvert = "";
			param.forEach((elt, i) => {
				
				toConvert += String.fromCharCode(encryptFn(i, elt));
			});
			
			

		} else {
			throw "Base64.encode only encodes String or Uint8Array. Invalid type: " + ( typeof param);
		}
		
		return btoa(toConvert);
	};

	// performs some data casting/transformation to reverse the byte-padding
	// in the encode function; basically a wrapper around atob to allow
	// decoding of multibyte chars and/or Uint8Array objects.
	Base64.nativeDecode = function(encoded, boolReturnString = false) {
		// this native js function does most of the work, decodes base64
		const decoded = atob(encoded); // this appears to always be a string, another black box


		// due to our modified encoding process, (neccessitated by weird btoa choking
		// on multibyte chars), we have to convert the result bytes. I believe the process
		// here is basically down-converting, reducing the number of bytes we are looking at
		// @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa 
		const bytes = new Uint8Array(decoded.length);
		for (let i = 0; i < bytes.length; i++) {
			bytes[i] = decoded.charCodeAt(i);
		}

		// we have this boolean option because any odd-length byte arrays will cause the string
		// case to break because all JS strings are 16-bit, so an odd number of bytes throws an exception
		if (boolReturnString) {
			// this barfs if the buffer length has an odd number of bytes
			return String.fromCharCode(...new Uint16Array(bytes.buffer));
		} else {
			return bytes;
		}

	};


	// modified version of baseid nativeDecode() fn which accepts decryptFn param
	// uses atob, but also performs some data casting/transformation to reverse the byte-padding
	// in the encode function; basically a wrapper around atob to allow
	// decoding of multibyte chars and/or Uint8Array objects.
	Base64.nativeDecodeAndDecrypt = function(encoded, decryptFn, boolReturnString = false) {
		// this native js function does most of the work, decodes base64
		const decoded = atob(encoded); // this appears to always be a string, another black box


		// due to our modified encoding process, (neccessitated by weird btoa choking
		// on multibyte chars), we have to convert the result bytes. I believe the process
		// here is basically down-converting, reducing the number of bytes we are looking at
		// @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa 
		const bytes = new Uint8Array(decoded.length);
		for (let i = 0; i < bytes.length; i++) {
			bytes[i] = decryptFn(i, decoded.charCodeAt(i));
		}

		// we have this boolean option because any odd-length byte arrays will cause the string
		// case to break because all JS strings are 16-bit, so an odd number of bytes throws an exception
		if (boolReturnString) {
			// this barfs if the buffer length has an odd number of bytes
			// FIXME test this on very large strings, we may need to explicitly loop
			return String.fromCharCode(...new Uint16Array(bytes.buffer));
		} else {
			return bytes;
		}

	};

	if(typeof window != "undefined"){
		window.SNEAKYIMP || (window.SNEAKYIMP = {});
		if(window.SNEAKYIMP.Base64){
			for(let prop in Base64){
				window.SNEAKYIMP.Base64[prop] = Base64[prop];
			}
		} else {
			window.SNEAKYIMP.Base64 = Base64
		}
	} else {
		throw "'window' not defined. Unable to attach SNEAKYIMP.Base64";
	}
	

})();
