// Module dependencies
var http = require('http'),
    express = require('express'),
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

app.get('/binary/:message', function(req, res){
	var result = cryptoTest(req.params.message, 'NO2FzK17iDEKY2Kt', 'S8I15NEwsC7RdSNl', 'binary');
	res.send(req.params.message + 
		' <br/><br/> ' + 
		result.encrypted + 
		' <br/><br/> ' + 
		result.decrypted + 
		' <br/><br/> ' + 
		'<a href="http://api.blackoutrugby.com/?d=10&er=' + result.encrypted + '">http://api.blackoutrugby.com/?d=19&er=' + result.encrypted + '</a>');
});

app.get('/base64/:message', function(req, res){
	var result = cryptoTest(req.params.message, 'NO2FzK17iDEKY2Kt', 'S8I15NEwsC7RdSNl', 'base64');
	res.send(req.params.message + 
		' <br/><br/> ' + 
		result.encrypted + 
		' <br/><br/> ' + 
		result.decrypted + 
		' <br/><br/> ' + 
		'<a href="http://api.blackoutrugby.com/?d=10&er=' + result.encrypted + '">http://api.blackoutrugby.com/?d=19&er=' + result.encrypted + '</a>');
});

function cryptoTest(data, key, iv, format) {
	var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
	var cipherChunks = [];
	cipherChunks.push(cipher.update(data, 'utf8', format));
	cipherChunks.push(cipher.final());
	
	var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
	var plainChunks = [];
	for (var i = 0;i < cipherChunks.length;i++) {
	  plainChunks.push(decipher.update(cipherChunks[i], format, 'utf8'));
	}
	plainChunks.push(decipher.final());

	return {
		"encrypted": cipherChunks.join(''),
		"decrypted": plainChunks.join('')
	};
}

// Only listen on $ node app.js
if (!module.parent) {
    app.listen(3000);
    console.log("Express server listening on port %d", app.address().port);
}
