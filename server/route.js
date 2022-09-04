let url = require('url');
let fs = require('fs');

function renderHTML(path, res) {
    fs.readFile(path, null, (err, data) => {
        if(err){
            res.writeHead(404);
            res.write('File not found');
        } else {
            res.write(data);
        }
        res.end();
    })
}

module.exports = {
    handleRequest: (req, res) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        var path = url.parse(req.url).pathname;
        if(path == '/'){
            renderHTML('./www/index.html', res);
        } else {
            res.writeHead(404);
            res.write('Route not defined');
            res.end();
        }
    }
}