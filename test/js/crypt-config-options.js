// the tests to choose from
if (!myKey) {
	throw "myKey not defined";
}
if (!SNEAKYIMP.Crypt) {
	throw "Crypt library not defined";
}

let cryptConfOptions = [
 	{
 		"name" : "btoa1",
 		"initFuncs" : [ // fns to call before running the tests
 			// no funcs
 		],
 		"encryptFn" : SNEAKYIMP.Crypt.encryptBTOA, // function to encrypt data
 		"decryptFn" : SNEAKYIMP.Crypt.decryptATOB, // function to decrypt data
 		"key" : myKey.string
// 		"key" : String.fromCharCode(255)
 	},
 	{
 		"name" : "btoa2",
 		"initFuncs" : [
 		],
 		"encryptFn" : SNEAKYIMP.Crypt.encryptBTOA2,
 		"decryptFn" : SNEAKYIMP.Crypt.decryptATOB2,
 		"key" : myKey.uint8
 	},
 	{
 		"name" : "btoa3",
 		"initFuncs" : [],
 		"encryptFn" : SNEAKYIMP.Crypt.encryptBTOA3,
 		"decryptFn" : SNEAKYIMP.Crypt.decryptATOB3,
 		"key" : myKey.string
 	},
 	{
 		"name" : "btoa4",
 		"initFuncs" : [],
 		"encryptFn" : SNEAKYIMP.Crypt.encryptBTOA3,
 		"decryptFn" : SNEAKYIMP.Crypt.decryptATOB4,
 		"key" : myKey.string
 	},
	{
		"name" : "btoa5",
		"initFuncs" : [],
		"encryptFn" : SNEAKYIMP.Crypt.encryptBTOA5,
		"decryptFn" : SNEAKYIMP.Crypt.decryptATOB5,
		"key" : myKey.uint16
	},
// IMPORTANT FUCKING NOTE
// the performance of your decryption algorithm depends on which ENCRYPTION algoithm you ran first
// because the encryption and decryption happen in one run of the script, BTOA6 appears to introduce
// some kind of stochastic, memory-related problem -- maybe garbage collection or memory allocation
// bottlenecks -- which don't usually appear when you run BTOA5 instead. The different memory usage
// patterns apparently (i have no proof for this) result in a delayed memory issue which adversely
// affects the performance of decryptATOB6. That led to lots of gnashing of teeth.
 	{
 		"name" : "btoa6",
 		"initFuncs" : [],
 		"encryptFn" : SNEAKYIMP.Crypt.encryptBTOA6,
 		"decryptFn" : SNEAKYIMP.Crypt.decryptATOB6,
 		"key" : myKey.uint16
 	},
 	{
 		"name" : "custom",
 		"initFuncs" : [
 			SNEAKYIMP.Crypt.useBase64Custom
 		],
 		"encryptFn" : SNEAKYIMP.Crypt.encryptString,
 		"decryptFn" : SNEAKYIMP.Crypt.decryptString,
 		"key" : myKey.uint8
 	},
 	{
 		"name" : "customUTF8",
 		"initFuncs" : [
 			SNEAKYIMP.Crypt.useBase64Custom
 		],
 		"encryptFn" : SNEAKYIMP.Crypt.encryptStringUTF8,
 		"decryptFn" : SNEAKYIMP.Crypt.decryptStringUTF8,
 		"key" : myKey.uint8
 	},
 	{
 		"name" : "native",
 		"initFuncs" : [
 			SNEAKYIMP.Crypt.useBase64Native
 		],
 		"encryptFn" : SNEAKYIMP.Crypt.encryptString,
 		"decryptFn" : SNEAKYIMP.Crypt.decryptString,
 		"key" : myKey.uint8
 	},
 	{
 		"name" : "nativeUTF8",
 		"initFuncs" : [
 			SNEAKYIMP.Crypt.useBase64Native
 		],
 		"encryptFn" : SNEAKYIMP.Crypt.encryptStringUTF8,
 		"decryptFn" : SNEAKYIMP.Crypt.decryptStringUTF8,
 		"key" : myKey.uint8
 	},
 	{
 		"name" : "custom2",
 		"initFuncs" : [
 			SNEAKYIMP.Crypt.useBase64CustomEncrypt
 		],
 		"encryptFn" : SNEAKYIMP.Crypt.encryptString2,
 		"decryptFn" : SNEAKYIMP.Crypt.decryptString2,
 		"key" : myKey.uint8
 	},
 	{
 		"name" : "native2",
 		"initFuncs" : [
 			SNEAKYIMP.Crypt.useBase64NativeEncrypt
 		],
 		"encryptFn" : SNEAKYIMP.Crypt.encryptString2,
 		"decryptFn" : SNEAKYIMP.Crypt.decryptString2,
 		"key" : myKey.uint8
 	},
 	{
 		"name" : "custom3",
 		"initFuncs" : [],
 		"encryptFn" : SNEAKYIMP.Crypt.encryptString3,
 		"decryptFn" : SNEAKYIMP.Crypt.decryptString2,
 		"key" : myKey.uint16
 	},

];