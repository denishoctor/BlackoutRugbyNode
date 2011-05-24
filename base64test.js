var crypto = require('crypto'),
    cryptoHelpers = require('cryptoHelpers');

var data = "f7a7a7e21ec1cf2d526ef5f8f9bd8e191b3c11f4";

console.log('Original cleartext: 		' + data);

var algorithm = 'aes-128-cbc';
var key = 'mysecretkey';
var clearEncoding = 'utf8';
var cipherEncoding = 'hex';

//If the next line is commented, the final cleartext is correct.
cipherEncoding = 'base64';

var cipher = crypto.createCipher(algorithm, key);
var cipherChunks = [];
cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
cipherChunks.push(cipher.final(cipherEncoding));
console.log(cipherEncoding + ' ciphertext: 		' + cipherChunks.join(''));
var decipher = crypto.createDecipher(algorithm, key);
var plainChunks = [];
for (var i = 0;i < cipherChunks.length;i++) {
  plainChunks.push(decipher.update(cipherChunks[i], cipherEncoding, clearEncoding));

}
plainChunks.push(decipher.final(clearEncoding));
console.log("Base64 deciphered: 		" + cryptoHelpers.base64.encode(encryptedRequest));
console.log("UTF8 plaintext deciphered: 	" + plainChunks.join(''));