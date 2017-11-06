const http = require('http');
const Weather = require('./weather');

http.createServer(function (req, res) {

	var weather = new Weather(req, res);

    switch(true) {
	    case /api\/weather/.test(req.url):
	    	weather.get();
	        break;
        case /.\.css|js|font|map$/.test(req.url):
        	weather.public();
        	break;
	    default:
	    	res.writeHead(404, {});
	    	res.end();
	        break;
	}
}).listen(3000);