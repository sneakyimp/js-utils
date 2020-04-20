/**
 * SNEAKYIMP.Crypt - a JS library to provide simple encryption functions. It implements a basic symmetric polyalphabetic cipher.
 * 
 * This code is provided primarily as a tool to obfuscate data, and is not to
 * be considered cryptographically secure for any sensitive application.
 * 
 * FIXME we need to be able to specify a key as a string so the key can arrive from a web server or cookie and decoded. Maybe just base64 encode the byte array?
 * TODO test if argument or char limits are exceeded
 * 
 * NO WARRANTY IS EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

(function(){

	// encryption class to encapsulate functions
	var Crypt = function(key16) {
            // properties here
            this.symKey16 = null; // Uint16 key used for symmetric encryption/decryption
            this.symKey8 = null; // symKey16 case as Uint8Array
            
            
            this.setSymKey(key16);
	}; // Crypt
	
	// TODO maybe make this smarter to allow strings and/or base64-encoded ByteArray objects for convenience
	// TODO odd-length Uint16Array still works? Maybe explore what happens if symKey8 is odd number of bytes.
	// public method to set the symmetric key for encrypt/decrypt operations
	Crypt.prototype.setSymKey = function(key16) {
		if (!(key16 instanceof Uint16Array)) {
			throw "key16 is not a Uint16Array, it is " + key16.constructor.name;
		}
		// TODO: test for degenerate key -- e.g., all zeroes or of zero length, etc.
		this.symKey16 = key16;
		this.symKey8 = new Uint8Array(key16.buffer);
	}
	
	// encrypts a string using JS-native btoa function, first taking pains to convert the string to avoid InvalidChar exceptions
	// this fn corresponds to BTOA6 in my dev project, the performance winner after extensive profiling
	Crypt.encryptString = function(key16, strParam) {
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
	
	// decrypts a JS string from an encrypted string by using JS-native atob function
	// this fn corresponds to ATOB6 in my dev project, performance winner after profiling.
	Crypt.decryptString = function(key16, strEncrypted) {
		// this fnc requires a Uint16Array strKey
		if (!(key16 instanceof Uint16Array)) {
			throw "key16 is not a Uint16Array, it is " + key16.constructor.name;
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
			// yes, i know this is ugly, but it might be faster because we aren't allocated vars
			retval += String.fromCharCode(Crypt.decryptOneUint16(i/2, key16, (encrypted.charCodeAt(i)) + (encrypted.charCodeAt(i+1) << 8)));
		}
		
		return retval;
	};
	
	// converts the supplied strParam to UTF8 then encrypts it
	// this can be useful if the output  handler needs UTF8 chars, and also can shorten the output length dramatically
	// if strParam is ASCII text
	Crypt.encryptStringUTF8 = function(key8, strParam) {
		if (!(key8 instanceof Uint8Array)) {
			throw "key8 must be Uint8Array. Instead, it is " + (key8.constructor.name);
		}
		if ((typeof strParam) != "string") {
			throw "strParam is not a string, it is " + strParam.constructor.name;
		}
		
		const byteArray = new TextEncoder("utf-8").encode(strParam);
		
		return Crypt.encryptByteArray(key8, byteArray);
	};

	// decrypts the encrypted string and converts decrypted result from UTF8 to a JS string
	Crypt.decryptStringUTF8 = function(key8, strEncrypted) {
		if (!(key8 instanceof Uint8Array)) {
			throw "key8 must be Uint8Array. Instead, it is " + (key8.constructor.name);
		}
		if ((typeof strEncrypted) != "string") {
			throw "strEncrypted is not a string, it is " + strEncrypted.constructor.name;
		}

		let byteArray = Crypt.decryptByteArray(key8, strEncrypted);

		return new TextDecoder("utf-8").decode(byteArray);
	};

	// JS-native btoa() function casts bytearrays as strings before encoding
	// so we must use our own base64 encode function
	// uses the supplied Uint8Array key to encrypt the supplied byteArray
	// MODIFIED to use custom base64 encoding fn to eliminate one loop
	Crypt.encryptByteArray = function(key8, byteArray) {
		function checkForBase64() {
			if (!window.SNEAKYIMP.Base64) {
				throw "SNEAKYIMP.Base64 does not exist";
			}
		}

		if (!(key8 instanceof Uint8Array)) {
			throw "key8 must be Uint8Array. Instead, it is " + (key8.constructor.name);
		}
		if (!(byteArray instanceof Uint8Array)) {
			throw "byteArray must be Uint8Array. Instead, it is " + (byteArray.constructor.name);
		}
		
		return SNEAKYIMP.Base64.encodeAndEncrypt(key8, byteArray);
	};


	// JS-native atob() function returns strings rather than bytearrays after encoding
	// so we must use our own base64 decode function
	Crypt.decryptByteArray = function(key8, encrypted) {
		function checkForBase64() {
			if (!window.SNEAKYIMP.Base64) {
				throw "SNEAKYIMP.Base64 does not exist";
			}
		}
		
		if (!(key8 instanceof Uint8Array)) {
			throw "key8 must be Uint8Array. Instead, it is " + (key8.constructor.name);
		}
		if (!(typeof encrypted == "string")) {
			throw "encrypted must be a string. Instead, it is " + (encrypted.constructor.name);
		}

		let byteArray = SNEAKYIMP.Base64.decodeAndDecrypt(key8, encrypted);

		return byteArray;
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

	
	/**
	 * key generator, returns Uint16Array of len random values to encrypt strings
	 * NOTE this key will be *much* stronger than any key specified as a string of ASCII chars
	 * because it utilizes the entire number space (1-65535) rather than just 1-127 of ASCII range
	 */
	Crypt.generateKey = function(len) {
		const u16 = new Uint16Array(len);
		window.crypto.getRandomValues(u16);
		return u16;
	};
	
	
	// encrypts data by first converting to JSON
	Crypt.prototype.e = function(data) {
		return Crypt.encryptString(this.symKey16, JSON.stringify(data));
	};
	// decrypts the JSON string and then parses it as object
	Crypt.prototype.d = function(cipherText) {
		return JSON.parse(Crypt.decryptString(this.symKey16, cipherText));
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
