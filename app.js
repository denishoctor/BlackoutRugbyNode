// Module dependencies
var http = require('http'),
    express = require('express'),
    slowAES = require('slowAES'),
    cryptoHelpers = require('cryptoHelpers'),
    jsHash = require('jsHash'),
    crypto = require('crypto');
    
var app = module.exports = express.createServer(),
    blackoutAPI = http.createClient(80, 'http://api.blackoutrugby.com');

// Configuration
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
    app.use(express.errorHandler()); 
});

app.use(express.bodyParser());

// Routes

app.get('/', function(req, res) {
    res.render('index', {
        title: 'BlackoutRugbyNode POC'
    });
});

app.post('/', function(req, res) {
    apiRequest(req.body, function(apiResponse) {
        res.render('view', {
            title: 'BlackoutRugbyNode', result: apiResponse
        });
    });
});

function apiRequest(reqBody, callback) {
    var result = aesslowRequest(reqBody.requestParams, reqBody.devKey, reqBody.devIV, reqBody.devID, reqBody.memberAccess),
        result2 = cryptoRequest(reqBody.requestParams, reqBody.devKey, reqBody.devIV, reqBody.devID, reqBody.memberAccess);
    
    /*
    
    console.log(result.plainUri);
    console.log(result.encryptedUri);
        options = {
            host: 'api.blackoutrugby.com',
            port: 80,
            path: result.encryptedUri
        };
        
    var apiRequest = http.get(options, function(apiResponse) {
        apiResponse.addListener("data", function(data) {
            result.encrypted += data;
        });

        apiResponse.addListener("end", function() {
            callback(result);
        });
    });
    apiRequest.end();
    */
}



function cryptoRequest(request, key, iv, devId, memberAccess) {
	var cipher = crypto.createCipheriv('AES-128-CBC', key, iv);
	
	request = memberAccess + request;
	
	request += (16 - request.length % 16) * 0;
	
	var encrypted  = cipher.update(request, input_encoding='utf8', output_encoding='base64');
	console.log('http://api.blackoutrugby.com/?d=' + devId + '&er=' + encrypted + '\n\n\n');
	cipherFinal = cipher.final(output_encoding='binary');
	console.log(cipherFinal);
	
	var decipher = crypto.createDecipheriv('AES-128-CBC', key, iv);
	
	var decrypted = decipher.update(encrypted, input_encoding='base64', output_encoding='utf8');
	
	console.log(decrypted);
	console.log(request);
}

function aesslowRequest(request, key, iv, devid, memberAccess) {
    /*
     * Blackout Rugby API requires AES in CBC mode with zero padding, finally encoded in base64
     */
    // TODO: Unsure of the padding. Is it needed or does slowAES look after it?
    var byteArrayKey = cryptoHelpers.convertStringToByteArray(key),
        byteArrayiv = cryptoHelpers.convertStringToByteArray(iv),        
        byteArrayRequest = cryptoHelpers.convertStringToByteArray(request + '&'),
        
        encryptedRequest = slowAES.encrypt(byteArrayRequest, 
            slowAES.modeOfOperation.CBC,
            key,
            slowAES.aes.keySize.SIZE_128,
            iv);
    
    base64EncryptedRequest = cryptoHelpers.base64.encode(encryptedRequest);

    return {
        encryptedUri: "/?d=" + devid + "&er=" + base64EncryptedRequest,
        plainUri: "/?d=" + devid + "&dk=" + key + '&' + memberAccess + '&' + request
    };
}

// Only listen on $ node app.js
if (!module.parent) {
    app.listen(3000);
    console.log("Express server listening on port %d", app.address().port);
}
