const fs = require("fs");
const url = require('url');
const http = require('http');
const path = require('path');
const Mustache = require('mustache');
const request = require('request');
const config = require('./config');

module.exports = Weather;

function Weather(req, res) {
	this.response = res;
	this.request = req;
	this.weatherAppPath = config.appPath;
	this.weatheAppApi = config.apiKey;
}

Weather.prototype.getUrlParam = function() {
	return url.parse(this.request.url, true).query;
}

Weather.prototype.get = function() {
	let self = this;
	let url = this.requestUrl();
	let options = this.httpOption(url, 'GET');

	self.response.writeHead(200, {'Content-Type': 'text/html'});

	fs.readFile(__dirname + '/weather.html', function (err, file) {
		if (err) throw err;

		if (url !== false) {
			request.get(options, function(err, res, body) {
				var responseWeather = JSON.parse(res.body);
				var output = Mustache.render(file.toString(), {result: JSON.stringify(responseWeather) });	
				self.response.end(output);			
			});
		}
		else {
			var output = Mustache.render(file.toString(), {result: JSON.stringify({})} );	
			self.response.end(output);	
		}
	});
}

Weather.prototype.requestUrl = function() {
	var paramUrl = this.weatherAppPath + '?appid=' + this.weatheAppApi;
	var params = this.getUrlParam();
	var paramKeys = Object.keys(params);

	if (paramKeys.length) {
		if (typeof params['zipcode'] !== 'undefined') {
			params.zip = params['zipcode'];
			delete params['zipcode'];
			paramKeys = Object.keys(params);
		}
		for(var i=0; i<paramKeys.length; i++) {
			paramUrl += '&' + paramKeys[i] + '=' + params[paramKeys[i]];
		}
		return paramUrl;

	}
	else return false;	
}

Weather.prototype.public = function() {
	let self = this;
	fs.readFile(__dirname + '/public' + this.request.url, function (err, file) {

		var extname = path.extname(__dirname + '/public' + self.request.url);

		var contentType = 'text/html';
	    switch (extname) {
	        case '.js':
	            contentType = 'text/javascript';
	            break;
	        case '.css':
	            contentType = 'text/css';
	            break;
	        case '.json':
	            contentType = 'application/json';
	            break;
	        case '.png':
	            contentType = 'image/png';
	            break;      
	        case '.jpg':
	            contentType = 'image/jpg';
	            break;
	        case '.wav':
	            contentType = 'audio/wav';
	            break;
            case '.ttf':
            	contentType = 'font/ttf';
            	break;  
            case '.eot':
            	contentType = 'font/eot';
            	break;  
          	case '.otf':
            	contentType = 'font/otf';
            	break;  
        	case '.woff':
            	contentType = 'font/woff';
            	break;
            case '.woff2':
            	contentType = 'font/woff2';
            	break;
	    }

		self.response.writeHead(200, {'Content-Type': contentType});
		if (err) {
			self.response.end('file not found');
		}
		else {
			self.response.end(file);
		}
	});
}

Weather.prototype.httpOption = function(url, type) {
	return { url: url, method: type};
}