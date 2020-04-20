/**
 * SNEAKYIMP.Util - a JS library containing various useful functions
 * 
 * NO WARRANTY IS EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

(function(){
	var Util = function() {
            // properties here
	}; // Util
	
	// converts the supplied Uint8Array into a Javascript string
	// BIG FAT WARNING this only works on byteArrays with even number of elements
	// FIXME we might want to rename this castUint8ArrayToString to make it more obvious
	Util.uint8ArrayToString = function(byteArray) {
		if (byteArray.length %2) {
			throw "a Uint8Array must have an even length to be cast as U16";
		}
		
		const u16 = new Uint16Array(byteArray.buffer);
		
		// OLD WAY: this barfs if u16.length > 500000
		//return String.fromCharCode(...u16);
		
		// NEW WAY: iteratively generate the string
		// I spent quite a bit of time performance profiling and, surprisingly, this seems faster.
		// it should also handle much larger amounts of data if necessary. not sure how much.
		// i tested this conversion on a Uint16Array with 25 million elements (50M bytes!)
		// and it ran in 1.12 seconds
		let retval = "";
		u16.forEach((code, i) => {
			// get the char code
			retval += String.fromCharCode(code);
		});
		return retval;
	};
	
	// converts JS string, which is UTF16-encoded, to Uint8Array
	Util.stringToUint8Array = function(strParam) {
		// FIXME: hmmm i wonder if we might get better performance if we just instantiate
		// a Uint8Array and use bitwise operators to populate it from each char?
		 let u16 = new Uint16Array(strParam.length);
		 u16.forEach((elt, i) => {
		 	u16[i] = strParam.charCodeAt(i);
		 });
		 // cast as Uint8Array and return
		return new Uint8Array(u16.buffer);
	};


	
	if(typeof window != "undefined"){
		window.SNEAKYIMP || (window.SNEAKYIMP = {});
		if(window.SNEAKYIMP.Util){
			for(const prop in Util){
				window.SNEAKYIMP.Util[prop] = Util[prop];
			}
		} else {
			window.SNEAKYIMP.Util = Util;
		}
	} else {
		throw "'window' not defined. Unable to attach SNEAKYIMP.Util";
	}
})();
