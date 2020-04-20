// our encryption/decryption keys that we use for testing
let myKey = {
		"uint8" : new Uint8Array([138,226,172,154,198,177,120,240,187,70,205,136,85,228,223,172,157,15,117,108,128,116,76,220,239,91,128,112,1,101,149,176])
}
//let myKey = {
//		"uint8" : new Uint8Array([255, 1])
//}

myKey["uint16"] = new Uint16Array(myKey.uint8.buffer);
myKey["string"] = String.fromCharCode(...myKey.uint16);
