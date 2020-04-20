# js-utils

## Sneakyimp Javascript Utilities
Some miscellaneous Javascript utilities that I hope might be useful to others.

### Crypt
A simple tool to provide symmetric encryption and decryption using a key consisting of unsigned 16-bit integers. You only need two JS files and a couple of script tags. Copy **sneakyimp-base64.js** and **sneakyimp-crypt.js** from the src folder of this project into your own project and then update these tags to reflect whatever location you have chosen:
```html
<script charset="utf-8" src="sneakyimp-base64.js"></script>
<script charset="utf-8" src="sneakyimp-crypt.js"></script>
```
You'll also need a Uint16Array for your key. You can use the Crypt library to generate a new key -- **make sure you hang onto they key if you start using it because anything you encrypt with it will require that key to decrypt.** Here's the command:
```js
// generates a key consisting of thirty two 16-bit unsigned integers
let myKey = SNEAKYIMP.Crypt.generateKey(32);
```
Alternatively, you can create a Uint16Array object by specifying the integers like so:
```js
const myKey = new Uint16Array([49529,26319,28702,58547,36876,41785,62253,14050,21424,3489,45614,32839,3687,56797,25509,54343]);
```
Once you have your key, you can instantiate the SNEAKYIMP.Crypt class with the key as a parameter and start encrypting:
```js
const myKey16 = new Uint16Array([49529,26319,28702,58547,36876,41785,62253,14050,21424,3489,45614,32839,3687,56797,25509,54343]);
let myEnc = new SNEAKYIMP.Crypt(myKey16);
let v = "Here is a secret message";
let e = myEnc.e(v); // encrypts the message
console.log(e); // W8GHZntwweRpkBmjRPORNpBTwA0OsjSAAg6+3ddjItQNwe9mc3DW5H+QSqNM84U21VODDQ==
let d = myEnc.d(e); // decrypts our encrypted message e
console.log(d); // Here is a secret message
```
