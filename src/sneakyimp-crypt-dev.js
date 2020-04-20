/**
 * SNEAKYIMP.Crypt - a JS library to provide simple encryption functions. It implements a basic symmetric polyalphabetic cipher.
 * 
 * This code is provided primarily as a tool to obfuscate data, and is not to
 * be considered cryptographically secure for any sensitive application.
 * 
 * FIXME we need to be able to specify a key as a string so the key can arrive from a web server or cookie and decoded. Maybe just base64 encode the byte array?
 * FIXME consistent casts and byte conversions
 * FIXME alter encryptString fn to encrypt while converting to string???
 * TODO test if argument or char limits are exceeded
 * 
 * NO WARRANTY IS EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

(function(){
	//if (!jQuery) throw "SNEAKYIMP.Crypt requires jQuery to work";

	// encryption object to encapsulate functions
	var Crypt = function() {
            // properties here
            this.symmetricKey = null;
	}; // Crypt
	
	// these must be set before encrypting with custom options
	// they are ignored if you use btoa
	Crypt.base64EncodeFn = null;
	Crypt.base64DecodeFn = null;
	
	function checkForBase64() {
		if (!window.SNEAKYIMP.Base64) {
			throw "SNEAKYIMP.Base64 does not exist";
		}
	}
	// configures this class to the custom function for base64 encoding that encrypts at the same time
	// IMPORTANT only compatible with fn encryptByteArray2 due to the different param structure 
	Crypt.useBase64CustomEncrypt = function() {
		checkForBase64();
		Crypt.base64EncodeFn = SNEAKYIMP.Base64.encodeAndEncrypt;
		Crypt.base64DecodeFn = SNEAKYIMP.Base64.decodeAndDecrypt;
	};
	// configures this class to the native/btoa function for base64 encoding that encrypts at the same time
	// IMPORTANT only compatible with fn encryptByteArray2 due to the different param structure 
	Crypt.useBase64NativeEncrypt = function() {
		checkForBase64();
		Crypt.base64EncodeFn = SNEAKYIMP.Base64.nativeEncodeAndEncrypt;
		Crypt.base64DecodeFn = SNEAKYIMP.Base64.nativeDecodeAndDecrypt;
	};
	
	// configures this class to the custom function for base64 encoding
	// only applies when you use custom encoding option
	Crypt.useBase64Custom = function() {
		checkForBase64();
		Crypt.base64EncodeFn = SNEAKYIMP.Base64.encode;
		Crypt.base64DecodeFn = SNEAKYIMP.Base64.decode;
	};
	// configures this class to the "native" function for base64 encoding
	// (utilizes btoa and atob -- slightly better performance?)
	// only applies when you use custom encoding option
	Crypt.useBase64Native = function() {
		checkForBase64();
		Crypt.base64EncodeFn = SNEAKYIMP.Base64.nativeEncode;
		Crypt.base64DecodeFn = SNEAKYIMP.Base64.nativeDecode;
	};

	// FIXME change this fn to check if the key is string or bytearray and act accordingly
	// FIXME MAKE SURE that odd-length bytearray still works?
	// public method to set the symmetric key for encrypt/decrypt operations
	Crypt.prototype.setSymmetricKey = function(key) {
		// TODO: validate the key
		throw "not implemented";
		this.symmetricKey = key;
	}
	// public method to symmetrically encrypt data
	Crypt.prototype.symmetricEncrypt = function(data) {
		// TODO: validate the key
		throw "not implemented";
		if (!this.symmetricKey) {
			throw ("No symmetric key defined. Unable to encipher");
		}
		return Crypt.staticSymmetricEncrypt(this.symmetricKey, data);
	}
	// public method to symmetrically decrypt data
	Crypt.prototype.symmetricDecrypt = function(encryptedData) {
		throw "not implemented";
		// TODO: validate the key
		if (!this.symmetricKey) {
			throw ("No symmetric key defined. Unable to decipher");
		}
		return Crypt.staticSymmetricDecrypt(this.symmetricKey, encryptedData);
	}
	
	// static method for symmetric encryption
	// returns base64-encoded string of the dataString
	// NOTE: this process appears to have 3 loops total: two loops in
	// encryptBTOA and surely another in btoa
	Crypt.staticSymmetricEncryptString = function(key, dataString) {
		throw "throw you have to pick one of the encrypt fns, silly man";
		return Crypt.btoaEncryptFn(key, dataString);
	};
	// static method for symmetric decryption
	Crypt.staticSymmetricDecryptString = function(key, encryptedDataString) {
		throw "You to pick one of the decrypt fns, silly man";
		return Crypt.btoaDecryptFn(key, encryptedDataString);
	};
	
	// encrypts a string by converting it to a byte array, encrypting the byte array, and converting back to string
	Crypt.encryptString = function(key, strParam) {
		if (!(key instanceof Uint8Array)) {
			throw "key must be Uint8Array. Instead, it is " + (key.constructor.name);
		}
		if ((typeof strParam) != "string") {
			throw "strParam is not a string, it is " + strParam.constructor.name;
		}
		
		// convert strParam to a byte array, gotta hold 16 bits per char
		const byteArray = SNEAKYIMP.Util.stringToUint8Array(strParam);

		return Crypt.encryptByteArray(key, byteArray);
	};
	
	// encrypts a string by converting it to a byte array, encrypting the byte array, and converting back to string
	// MODIFIED to use base64 fn that encodes and encrypts, eliminating one loop
	Crypt.encryptString2 = function(key, strParam) {
		if (!(key instanceof Uint8Array)) {
			throw "key must be Uint8Array. Instead, it is " + (key.constructor.name);
		}
		if ((typeof strParam) != "string") {
			throw "strParam is not a string, it is " + strParam.constructor.name;
		}
		
		// convert strParam to a byte array, gotta hold 16 bits per char
		const byteArray = SNEAKYIMP.Util.stringToUint8Array(strParam);

		return Crypt.encryptByteArray2(key, byteArray);
	};
	
	Crypt.encryptString3 = function(key16, strParam) {
		// FIXME we should try and extend or wrap this in functions to also encrypt 16- and 32-bit arrays
		// OR MAYBE NOT? Keep in mind we will not know at the decryption stage what sort of data was in the
		// original object
		if (!(key16 instanceof Uint16Array)) {
			throw "key must be Uint16Array. Instead, it is " + (key16.constructor.name);
		}
		if ((typeof strParam) != "string") {
			throw "strParam is not a string, it is " + strParam.constructor.name;
		}
		
		// this loop is eliminated by using the base64-encoding function that also encrypts
//		for (let i = 0; i < byteArray.length; i++) {
//			// jta added this line to perform the encryption with the key
//			byteArray[i] = Crypt.encryptOneByte(i, key, byteArray[i]);
//		}
		return SNEAKYIMP.Base64.encodeAndEncrypt2(key16, strParam);
	};

	// decrypts a string from an encrypted string by converting to bytearray, decryping the byte array, and converting back to string
	Crypt.decryptString = function(key, strParam) {
		if (!(key instanceof Uint8Array)) {
			throw "key must be Uint8Array. Instead, it is " + (key.constructor.name);
		}
		if ((typeof strParam) != "string") {
			throw "strParam is not a string, it is " + strParam.constructor.name;
		}

		const byteArray = Crypt.decryptByteArray(key, strParam);
		// convert byteArray to a JS string and return
		return SNEAKYIMP.Util.uint8ArrayToString(byteArray);
	};
	
	// decrypts a string from an encrypted string by converting to bytearray, decryping the byte array, and converting back to string
	// MODIFIED to use base64 fn that encodes and encrypts, eliminating one loop
	Crypt.decryptString2 = function(key, strParam) {
		if (!(key instanceof Uint8Array)) {
			throw "key must be Uint8Array. Instead, it is " + (key.constructor.name);
		}
		if ((typeof strParam) != "string") {
			throw "strParam is not a string, it is " + strParam.constructor.name;
		}

		const byteArray = Crypt.decryptByteArray2(key, strParam);
		// convert byteArray to a JS string and return
		return SNEAKYIMP.Util.uint8ArrayToString(byteArray);
	};

	
	// converts the supplied strParam to UTF8 then encrypts it
	Crypt.encryptStringUTF8 = function(key, strParam) {
		if (!(key instanceof Uint8Array)) {
			throw "key must be Uint8Array. Instead, it is " + (key.constructor.name);
		}
		if ((typeof strParam) != "string") {
			throw "strParam is not a string, it is " + strParam.constructor.name;
		}
		
		const byteArray = new TextEncoder("utf-8").encode(strParam);
		
		return Crypt.encryptByteArray(key, byteArray);
	};

	// decrypts the encrypted string and converts result from UTF8 to a JS string
	Crypt.decryptStringUTF8 = function(key, strEncrypted) {
		if (!(key instanceof Uint8Array)) {
			throw "key must be Uint8Array. Instead, it is " + (key.constructor.name);
		}
		if ((typeof strEncrypted) != "string") {
			throw "strEncrypted is not a string, it is " + strEncrypted.constructor.name;
		}

		let byteArray = Crypt.decryptByteArray(key, strEncrypted);

		return new TextDecoder("utf-8").decode(byteArray);
	};

	
	// uses the supplied key to encrypt the supplied byteArray. This is the original fn which has
	// separate loops to encrypt and base64-encode
	// FIXME this should probably use the latest encodeAndEncrypt2 function for better performance.
	Crypt.encryptByteArrayOLD = function(key, byteArray) {
		// FIXME we should try and extend or wrap this in functions to also encrypt 16- and 32-bit arrays
		// OR MAYBE NOT? Keep in mind we will not know at the decryption stage what sort of data was in the
		// original object
		if (!(key instanceof Uint8Array)) {
			throw "key must be Uint8Array. Instead, it is " + (key.constructor.name);
		}
		if (!(byteArray instanceof Uint8Array)) {
			throw "byteArray must be Uint8Array. Instead, it is " + (byteArray.constructor.name);
		}
		for (let i = 0; i < byteArray.length; i++) {
			// jta added this line to perform the encryption with the key
			byteArray[i] = Crypt.encryptOneByte(i, key, byteArray[i]);
		}
		// cannot use btoa because it cases Uint8Array objects as a string
		return Crypt.base64EncodeFn(byteArray);
	};
	
	// uses the supplied key to encrypt the supplied byteArray
	// MODIFIED to use updated base64 encoding fn to eliminate one loop
	Crypt.encryptByteArray = function(key8, byteArray) {
		// FIXME we should try and extend or wrap this in functions to also encrypt 16- and 32-bit arrays
		// OR MAYBE NOT? Keep in mind we will not know at the decryption stage what sort of data was in the
		// original object
		if (!(key8 instanceof Uint8Array)) {
			throw "key8 must be Uint8Array. Instead, it is " + (key8.constructor.name);
		}
		if (!(byteArray instanceof Uint8Array)) {
			throw "byteArray must be Uint8Array. Instead, it is " + (byteArray.constructor.name);
		}
		
		// this loop is eliminated by using the base64-encoding function that also encrypts
//		for (let i = 0; i < byteArray.length; i++) {
//			// jta added this line to perform the encryption with the key
//			byteArray[i] = Crypt.encryptOneByte(i, key, byteArray[i]);
//		}
		// FIXME this needs to be reconciled with the base64 fn it calls, which requires key16 instead
		return SNEAKYIMP.Base64.encodeAndEncrypt(key8, byteArray);
	};


	// fn uses custom base64 decode function to decrypt the supplied string as Uint8Array
	// DEPRECATED in favor of an updated version which combines decoding & decryption
	Crypt.decryptByteArrayOLD = function(key8, encrypted) {
		if (!(key8 instanceof Uint8Array)) {
			throw "key8 must be Uint8Array. Instead, it is " + (key8.constructor.name);
		}
		if (!(typeof encrypted == "string")) {
			throw "encrypted must be a string. Instead, it is " + (encrypted.constructor.name);
		}

		// FIXME change this to use SNEAKYIMP.Base64.encodeAndEncrypt(key8, byteArray);
		let byteArray = SNEAKYIMP.Base64.decode(encrypted);

		for (let i = 0; i < byteArray.length; i++) {
			// jta added this line to perform the encryption with the key
			byteArray[i] = Crypt.decryptOneByte(i, key8, byteArray[i]);
		}

		// just return the byteArray
		return byteArray;
	};

	
	Crypt.decryptByteArray = function(key8, encrypted) {
		if (!(key8 instanceof Uint8Array)) {
			throw "key8 must be Uint8Array. Instead, it is " + (key8.constructor.name);
		}
		if (!(typeof encrypted == "string")) {
			throw "encrypted must be a string. Instead, it is " + (encrypted.constructor.name);
		}

		// FIXME change this to use SNEAKYIMP.Base64.encodeAndEncrypt(key8, byteArray);
		let byteArray = SNEAKYIMP.Base64.decodeAndDecrypt(key8, encrypted);

		// just return the byteArray
		return byteArray;
	};
	
	// static methods for converting strings to binary and back
	// see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa
	// btoa complains if you try and convert a string containing any chars that exceed one byte
	// but JS strings are UTF16 so we must convert such strings to a Uint8Array for btoa not to complain
	// the LAME aspect here is that JS strings are two bytes, which is a waste for ASCII strings, which require only one byte
	// POSSIBLE ADVANTAGE this performs conversion to bytes (actually byte pairs) and encryption in one step
	// DEPRECATED in favor of encryptBTOA3 below, which is faster.
	Crypt.encryptBTOA = function(strKey, strParam) {
		// this old fnc requires a string key
		if ((typeof strKey) != "string") {
			throw "strKey is not a string, it is " + strKey.constructor.name;
		}
		// JS strings are UTF16! Convert string to array of unsigned 16-bit integers, apply encryption offset to each
		const u16 = new Uint16Array(strParam.length);
		for (let i = 0; i < u16.length; i++) {
			// jta added this line to perform the encryption with the key
			u16[i] = Crypt.encryptOneChar(i, strKey, strParam.charCodeAt(i));
		}

		// cast u16 as a Uint8Array
		const byteArray = new Uint8Array(u16.buffer);
		
		// this doesn't do what we need, btoa might barf on the result
//		const myConv = SNEAKYIMP.Util.uint8ArrayToString(byteArray);
		
		// WARNING this is NOT a simple byteArray-to-string conversion despite how it looks
		// it is different from uint8ArrayToString in that it creates a string from *each byte*
		// so all bytes are kept under 256 to void btoa complaints. This is the secret
		// sauce that prevents btoa from throwing InvalidCharacterError
		let retval = "";
		byteArray.forEach((byte, i) => {
			// get the char code
			// FIXME can we not apply the encryption here using a Uint8Array key instead of above?
			retval += String.fromCharCode(byte);
		});
		return btoa(retval);

	};
	
	// modified version of original encryptBTOA to use my stringToUint8Array fn to convert to Uint8Array
	// and then apply key in bottom loop
	// for some reason this is slower than encryptForBTOA, probably because it loops thru a
	// Uint8Array (8 bits per loop) instead of 16 bits
	// DEPRECATED FOR BEING SLOW
	Crypt.encryptBTOA2 = function(key, strParam) {
		if (!(key instanceof Uint8Array)) {
			throw "key must be Uint8Array. Instead, it is " + (key.constructor.name);
		}

		// convert strParam to Uint8Array
		const byteArray = SNEAKYIMP.Util.stringToUint8Array(strParam);
		
		// WARNING this is NOT a simple byteArray-to-string conversion despite how it looks
		// it is different from uint8ArrayToString in that it creates a string from *each byte*
		// so all bytes are kept under 256 to void btoa complaints. This is the secret
		// sauce that prevents btoa from throwing InvalidCharacterError
		let retval = "";
		byteArray.forEach((byte, i) => {
			// get the char code
			// apply the encryption here using a Uint8Array key
			retval += String.fromCharCode(Crypt.encryptOneByte(i, key, byte));
		});
		return btoa(retval);

	};
	
	// NOTE: this fn is identical to encryptForBTOA except it calls btoa() right here in this function
	// static method for encrypting a string. only works on strings and uses built-in JS function btoa()
	// for base64 encoding.
	// see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa
	// btoa complains if you try and convert a string containing any chars that exceed one byte (String.fromCharCode(256));
	// but JS strings are UTF16 so we must convert such strings to a Uint8Array for btoa not to complain
	// the LAME aspect here is that JS strings are two bytes, which is a waste for ASCII strings, which require only one byte
	// POSSIBLE ADVANTAGE this performs conversion to bytes (actually byte pairs) and encryption in one step
	// NOTE: this fn is basically our champion in performance profiling.
	Crypt.encryptBTOA3 = function(strKey, strParam) {
		// this old fnc requires a string key
		if ((typeof strKey) != "string") {
			throw "strKey is not a string, it is " + strKey.constructor.name;
		}
		// JS strings are UTF16! Convert string to array of unsigned 16-bit integers, apply encryption offset to each
		const u16 = new Uint16Array(strParam.length);
		for (let i = 0; i < u16.length; i++) {
			// jta added this line to perform the encryption with the key
			u16[i] = Crypt.encryptOneChar(i, strKey, strParam.charCodeAt(i));
		}

		// cast u16 as a Uint8Array
		const byteArray = new Uint8Array(u16.buffer);
		
		// this doesn't do what we need, btoa might barf on the result
		//const myConv = SNEAKYIMP.Util.uint8ArrayToString(byteArray);
		
		// WARNING this is NOT a simple byteArray-to-string conversion despite how it looks
		// it is different from uint8ArrayToString in that it creates a string from *each byte*
		// so all bytes are kept under 256 to void btoa complaints. This is the secret
		// sauce that prevents btoa from throwing InvalidCharacterError
		let retval = "";
		byteArray.forEach((byte, i) => {
			// get the char code
			retval += String.fromCharCode(byte);
		});
		return btoa(retval);
	};
	
	Crypt.encryptBTOA4 = function(strKey, strParam) {
		throw "we never actually wrote a BTOA4";
	};


	// an exact copy of btoa3 except it accepts the key not as a string but rather Uint16Array
	// and applies encrypt/decryption via integer work instead of doing charCodeFrom
	Crypt.encryptBTOA5 = function(key16, strParam) {
		// this old fnc requires a string key
		if (!(key16 instanceof Uint16Array)) {
			throw "key16 is not a Uint16Array, it is " + key16.constructor.name;
		}

		// JS strings are UTF16! Convert string to array of unsigned 16-bit integers, apply encryption offset to each
		const u16 = new Uint16Array(strParam.length);
		for (let i = 0; i < u16.length; i++) {
			// jta added this line to perform the encryption with the key
			u16[i] = Crypt.encryptOneUint16(i, key16, strParam.charCodeAt(i));
		}

		// cast u16 as a Uint8Array
		const byteArray = new Uint8Array(u16.buffer);
		
		// this doesn't do what we need, btoa might barf on the result
		//const myConv = SNEAKYIMP.Util.uint8ArrayToString(byteArray);
		
		// WARNING this is NOT a simple byteArray-to-string conversion despite how it looks
		// it is different from uint8ArrayToString in that it creates a string from *each byte*
		// so all bytes are kept under 256 to void btoa complaints. This is the secret
		// sauce that prevents btoa from throwing InvalidCharacterError
		let retval = "";
		byteArray.forEach((byte, i) => {
			// get the char code
			retval += String.fromCharCode(byte);
		});
		return btoa(retval);
	};
	
	// an exact copy of btoa5 except it combines the output loop with the encryption loop
	Crypt.encryptBTOA6 = function(key16, strParam) {
		// this old fnc requires a Uint16Array key
		if (!(key16 instanceof Uint16Array)) {
			throw "key16 is not a Uint16Array, it is " + key16.constructor.name;
		}
		
		// JS strings are UTF16! Convert string to array of unsigned 16-bit integers, apply encryption offset to each
		let retval = "";

		for (let i = 0; i < strParam.length; i++) {
			// grab the next 16-bit char
			let encryptedUint16 = Crypt.encryptOneUint16(i, key16, strParam.charCodeAt(i));
			//u16[i] = Crypt.encryptOneUint16(i, key16, strParam.charCodeAt(i));
			retval += String.fromCharCode(encryptedUint16 & 255);
			retval += String.fromCharCode(encryptedUint16 >> 8);
		}
		
		
		return btoa(retval);
	};

	
	// early decrypt function, prepares a string so it can be fed to atob for base64-decoding, which is
	// called elsewhere. Uses for loops, rather than foreach loops
	// POSSIBLE ADVANTAGE this performs conversion to bytes (actually byte pairs) and decryption in one step
	Crypt.decryptATOB = function(strKey, strEncrypted) {
		// this old fnc requires a string key
		if ((typeof strKey) != "string") {
			throw "strKey is not a string, it is " + strKey.constructor.name;
		}
		if ((typeof strEncrypted) != "string") {
			throw "strEncrypted is not a string, it is " + strEncrypted.constructor.name;
		}
		
		// base64 decode
		// LOOP 1
		const encrypted = atob(strEncrypted)

		// convert the encrypted into an array of 8-bit ints
		// NOTE this has the effect of deflating the 16-bit chars we created to get around
		// the btoa complaint, all of which are under 256, into a tight Uint8Array
		let byteArray = new Uint8Array(encrypted.length);
		// LOOP 2
		for (let i = 0; i < byteArray.length; i++) {
			byteArray[i] = encrypted.charCodeAt(i);
		}

		// cast the now-recompressed bytes retrieved as array of 16-bit ints and reverse the offset value derived from the encryption key
		// and concatenate into retval in one loop
		let retval = "";
		let u16 = new Uint16Array(byteArray.buffer);
		// LOOP 3 and decrypt 16-bits
		for(let i = 0; i < u16.length; i++) {
			retval += String.fromCharCode(Crypt.decryptOneChar(i, strKey, u16[i]));
		}

		return retval;
	};

	// modified version of function above to decrypt at byte level rather than u16 level
	// ALSO: key must be Uint8Array AND uses foreach loops instead of for loops
	// this appears to be slower because the loop is only doing a byte at a time rather than two
	// NOTE: encrypted is an EXPANDED version of our orig string, with EVERY OTHER byte a zero
	// and all strings less than 256
	Crypt.decryptATOB2 = function(key, strEncrypted) {
		if (!(key instanceof Uint8Array)) {
			throw "key is not a Uint8Array, it is " + key.constructor.name;
		}
		if ((typeof strEncrypted) != "string") {
			throw "strEncrypted is not a string, it is " + strEncrypted.constructor.name;
		}
		
		
		// gotta base64 decode the data string, the result is still encrypted
		// LOOP 1
		let encrypted = atob(strEncrypted);

		// convert the encrypted into an array of 8-bit ints while decrypting
		// NOTE this has the effect of deflating the 16-bit chars we created to get around
		// the btoa complaint, all of which are under 256, into a tight Uint8Array
		let byteArray = new Uint8Array(encrypted.length);
		// LOOP 2
//		byteArray.forEach((byte, i) => {
//			// get the char code
//			// apply the decryption here using a Uint8Array key
//			byteArray[i] = Crypt.decryptOneByte(i, key, encrypted.charCodeAt(i));
//		});
		// is foreach slow?
		for (let i = 0; i < byteArray.length; i++) {
			byteArray[i] = Crypt.decryptOneByte(i, key, encrypted.charCodeAt(i));
		}

		// cast the byteArray as 16-bit array -- this should be quick and efficient as they reference the same buffer
		let u16 = new Uint16Array(byteArray.buffer);

		// convert the 16-bit array as a string
		// OLD WAY: this barfs if there are too many chars, i believe 250000 is the limit
		//return String.fromCharCode(...u16);
		let retval = "";
		// LOOP 3
		// is foreach slow?
//		u16.forEach((code, i) => {
//			// get the char code
//			retval += String.fromCharCode(code);
//		});
		for(let i = 0; i < u16.length; i++) {
			retval += String.fromCharCode(u16[i]);
		}		
		return retval;
	};
	
	// this is just like original decryptATOB, accepts string key etc., BUT it uses
	// foreach loop in the final step
	// NOTE: encrypted is an EXPANDED version of our orig string, with EVERY OTHER byte a zero
	// and all strings less than 256
	Crypt.decryptATOB3 = function(strKey, strEncrypted) {
		// this fnc requires a string strKey
		if ((typeof strKey) != "string") {
			throw "strKey is not a string, it is " + strKey.constructor.name;
		}
		if ((typeof strEncrypted) != "string") {
			throw "strEncrypted is not a string, it is " + strEncrypted.constructor.name;
		}
		
		// gotta base64 decode the data string, the result is still encrypted
		// LOOP 1
		let encrypted = atob(strEncrypted);

		// convert the encrypted into an array of 8-bit ints
		let byteArray = new Uint8Array(encrypted.length);
		// LOOP 2
		for (let i = 0; i < byteArray.length; i++) {
			byteArray[i] = encrypted.charCodeAt(i);
		}
		
		// cast the now-recompressed bytes retrieved as array of 16-bit ints and reverse the offset value derived from the encryption key
		// and concatenate into retval in one loop
		let retval = "";
		// cast the byteArray as 16-bit array -- this should be quick and efficient as they reference the same buffer
		let u16 = new Uint16Array(byteArray.buffer);
		// LOOP 3 and decrypt
		u16.forEach((elt, i) => {
			retval += String.fromCharCode(Crypt.decryptOneChar(i, strKey, elt));
		});
		
		return retval;
	};

	// DIFFERENT than fns above because its loop handles bytes in pairs (fewer iterations) and
	// uses bitwise shifting to combine the byte pairs and then decrypt
	// NOTE: encrypted is an EXPANDED version of our orig string, with EVERY OTHER byte a zero
	// and all strings less than 256
	Crypt.decryptATOB4 = function(strKey, strEncrypted) {
		// this fnc requires a string strKey
		if ((typeof strKey) != "string") {
			throw "strKey is not a string, it is " + strKey.constructor.name;
		}
		if ((typeof strEncrypted) != "string") {
			throw "strEncrypted is not a string, it is " + strEncrypted.constructor.name;
		}
		
		// gotta base64 decode the data string, the result is still encrypted
		let encrypted = atob(strEncrypted); // this returns a JS string

		// convert the btoa-friendly long string, originally expanded to avoid double-byte chars,
		// back to its compressed form with a bit of bitwise shifting
		// also apply decryption
		let retval = "";
		for (let i = 0; i < encrypted.length; i+=2) {
			const int16 = (encrypted.charCodeAt(i)) + (encrypted.charCodeAt(i+1) << 8);
			retval += String.fromCharCode(Crypt.decryptOneChar(i/2, strKey, int16));
		}
//		encrypted = null;
		
		return retval;
	};
	

	// a *tiny* variation on #4 which uses a Uint16Array key and applies encrypt/decryption
	// via integer work instead of doing charCodeFrom
	// NOTE: encrypted is an EXPANDED version of our orig string, with EVERY OTHER byte a zero
	// and all strings less than 256
	Crypt.decryptATOB5 = function(key16, strEncrypted) {
		// this fnc requires a Uint16Array strKey
//		if (!(key16 instanceof Uint16Array)) {
//			throw "key16 is not a Uint16Array, it is " + key16.constructor.name;
//		}
//		if ((typeof strEncrypted) != "string") {
//			throw "strEncrypted is not a string, it is " + strEncrypted.constructor.name;
//		}
		
		// gotta base64 decode the data string, the result is still encrypted
		let encrypted = atob(strEncrypted); // this returns a JS string

		// convert the btoa-friendly long string, originally expanded to avoid double-byte chars,
		// back to its compressed form with a bit of bitwise shifting
		// also apply decryption
		let retval = "";
		let int16
		for (let i = 0; i < encrypted.length; i+=2) {
			int16 = (encrypted.charCodeAt(i)) + (encrypted.charCodeAt(i+1) << 8);
			retval += String.fromCharCode(Crypt.decryptOneUint16(i/2, key16, int16));
		}
//		encrypted = null;
		
		return retval;
	};
	
	// COPIED FROM #5 but doesn't define a separate var to hold bit-shifted charCodes
	// uses a Uint16Array key and applies encrypt/decryption via integer work instead of doing charCodeFrom
	// NOTE: encrypted is an EXPANDED version of our orig string, with EVERY OTHER byte a zero
	// and all strings less than 256
	Crypt.decryptATOB6 = function(key16, strEncrypted) {
		// this fnc requires a Uint16Array strKey
//		if (!(key16 instanceof Uint16Array)) {
//			throw "key16 is not a Uint16Array, it is " + key16.constructor.name;
//		}
//		if ((typeof strEncrypted) != "string") {
//			throw "strEncrypted is not a string, it is " + strEncrypted.constructor.name;
//		}
		
		// gotta base64 decode the data string, the result is still encrypted
		let encrypted = atob(strEncrypted); // this returns a JS string

		// convert the btoa-friendly long string, originally expanded to avoid double-byte chars,
		// back to its compressed form with a bit of bitwise shifting
		// also apply decryption
		let retval = "";
//		let int16 = 0;
		for (let i = 0; i < encrypted.length; i+=2) {
			// yes, i know this is ugly, but it might be faster because we aren't allocated vars
			retval += String.fromCharCode(Crypt.decryptOneUint16(i/2, key16, (encrypted.charCodeAt(i)) + (encrypted.charCodeAt(i+1) << 8)));
		}
//		encrypted = null;
		
		return retval;
	};

	
	
	// returns the charCode from the ith position of the key string, using modulus to cycle thru the key
	Crypt.getKeyOffset = function(i, key) {
		// key is typically shorter than encrypted content, so loop thru the chars of the key using modulus
		const keyI = i % key.length;
		return key.charCodeAt(keyI);
	};
	// encrypts a charCode from the original string using the key
	// NEW way uses XOR
	Crypt.encryptOneChar = function(i, key, charCode) {
		const keyOffset = Crypt.getKeyOffset(i, key);
		// XOR the charCode with the keyOffse to perform the encryption
		return (charCode ^ keyOffset);
	};
	Crypt.decryptOneChar = function(i, key, charCode) {
		let keyOffset = Crypt.getKeyOffset(i, key);
		return (charCode ^ keyOffset);
	};
	
	// identical to encryptOneChar but instead of a string key, it's a Uint16Array
	// encrypts a byte pair from the original string using the key
	Crypt.encryptOneUint16 = function(i, key16, charCode) {
		// we XOR the current plaintext charCode with its corresponding key digit 
		return (charCode ^ key16[i % key16.length]);
	};
	// decrypts one char from the ciphertext to the original string's charCode using the key
	// identical to cryptOneChar but instead of a string key, it's a Uint16Array
	Crypt.decryptOneUint16 = function(i, key16, charCode) {
		// we XOR the current ciphertext charCode with its corresponding key digit 
		return (charCode ^ key16[i % key16.length]);
	};
	// encrypts a charCode from the original string using the key
	// i is the byte offset in the overall message being encrypted, we use modulus to locate corresponding byte in the key
	// key must be a Uint8Array
	Crypt.encryptOneByte = function(i, key8, byteVal) {
		// we XOR keyByte to the plaintext charCode to get the encrypted byte
		return (byteVal ^ key8[i % key8.length]);
	};
	// decrypts one char from the ciphertext to the original string's byteVal using the key
	Crypt.decryptOneByte = function(i, key8, byteVal) {
		// we XOR keyByte to the corresponding ciphertext charCode to get the original byte
		return (byteVal ^ key8[i % key8.length]);
	};



	// === OLD ENCRYPT CHAR FNS
	// THE OLD WAY char codes of plaintext char and key char moduluo 2^16, resulting in
	// a 16-bit cycle where values exceeding the 16-bit limit start back at zero like an
	// odometer clock. The problem is that 8-bit cycling and 16-bit cycling yield
	// different cipher text and cannot decipher each other.
	// encrypts a charCode from the original string using the key
	Crypt.encryptOneCharOLD = function(i, key, charCode) {
		const keyOffset = Crypt.getKeyOffset(i, key);
		// we keyOffset to the data's char code and modulus 65536 to perform the encryption
		return (charCode + keyOffset) % 65536;
	};
	// decrypts one char from the ciphertext to the original string's charCode using the key
	Crypt.decryptOneCharOLD = function(i, key, charCode) {
		let keyOffset = Crypt.getKeyOffset(i, key);

		// we keyOffset to the data's char code and modulus 65536 to perform the encryption
		let retval = (charCode - keyOffset);
		if (retval < 0) {
			retval = retval + 65536;
		}
		return retval;
	};
	
	// identical to encryptOneChar but instead of a string key, it's a Uint16Array
	// encrypts a byte pair from the original string using the key
	Crypt.encryptOneUint16OLD = function(i, key16, charCode) {
		// we keyOffset to the data's char code and modulus 65536 to perform the encryption
		return (charCode + key16[i % key16.length]) % 65536;
	};
	// decrypts one char from the ciphertext to the original string's charCode using the key
	// identical to cryptOneChar but instead of a string key, it's a Uint16Array
	Crypt.decryptOneUint16OLD = function(i, key16, charCode) {
		// we keyOffset to the data's char code and modulus 65536 to perform the encryption
		let retval = (charCode - key16[i % key16.length]);
		if (retval < 0) {
			retval += 65536;
		}
		return retval;
	};

	// encrypts a charCode from the original string using the key
	// i is the byte offset in the overall message being encrypted, we use modulus to locate corresponding byte in the key
	// key must be a Uint8Array
	// uses modulus on i to cycle thru the key array and grab a particular byte
	// i must be an int, key must be Uint8Array
	Crypt.getKeyByte = function(i, key8) {
		// use modulus to loop thru the bytes of they key
		return key8[i % key8.length];
	};
	Crypt.encryptOneByteOLD = function(i, key8, byteVal) {
		// we add keyByte to the data's char code and modulus 65536 to perform the encryption
		return (byteVal + Crypt.getKeyByte(i, key8)) % 256; // 256 is 2^8 which cycles us back to zero and prevents overflow
	};
	// decrypts one char from the ciphertext to the original string's byteVal using the key
	Crypt.decryptOneByteOLD = function(i, key8, byteVal) {
		// we subtract keyByte from data's char code and modulus 256 to perform the encryption
		let retval = (byteVal - Crypt.getKeyByte(i, key8));
		if (retval < 0) {
			// if it's negative, add 2^8 to cycle down from the max value...imagine a mobius strip where 0 and 255 are adjacent
			retval = retval + 256;
		}
		return retval;
	};

	
	
	// generates a random key of the specified length
	// NOTE this key will be *much* stronger than any key specified as a string of ASCII chars
	// because it utilizes the entire number space (1-65535) rather than just 1-127 of ASCII range
	// returns result as a string
	// DEPRECATED because the new style encrypts Uint18Array instead of Uint16Array
	Crypt.generateRandomKey = function(len) {
		const u16 = new Uint16Array(len);
		window.crypto.getRandomValues(u16);
		return String.fromCharCode(...u16);
	};

	/**
	 * Updated key generator, returns Uint8Array of len random values to encrypt strings
	 * NOTE this key will be *much* stronger than any key specified as a string of ASCII chars
	 * because it utilizes the entire number space (1-65535) rather than just 1-127 of ASCII range
	 */
	Crypt.generateKey = function(len) {
		const u8 = new Uint8Array(len);
		window.crypto.getRandomValues(u8);
		return u8;
	};
	
	
	// encrypts data by first converting to JSON
	Crypt.e = function(key, data) {
		return Crypt.staticSymmetricEncryptString(key, JSON.stringify(data));
	};
	Crypt.d = function(key, cipherText) {
		return JSON.parse(Crypt.staticSymmetricDecryptString(key, cipherText));
	};

	
	if(typeof window != "undefined"){
		window.SNEAKYIMP || (window.SNEAKYIMP = {});
		if(window.SNEAKYIMP.Crypt){
			for(const prop in Crypt){
				window.SNEAKYIMP.Crypt[prop] = Crypt[prop];
			}
		} else {
			window.SNEAKYIMP.Crypt = Crypt
		}
	} else {
		throw "'window' not defined. Unable to attach SNEAKYIMP.Crypt";
	}
})();
