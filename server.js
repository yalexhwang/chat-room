var http = require('http');
var fs = require('fs');

//server is what happens when someone loads up the page in a browser.
//server is listening below for http traffic at port 8080.
var server = http.createServer(function(req, res) {
	console.log("Someone connected by HTTP.");
	if (req.url == 'styles.css') {
		fs.readFile('styles.css', function(error, data) {
			if (error) { 
				res.writeHead(500, {'content-type': 'text/css'});
				res.end(error); 
			} else {
				res.writeHead(200, {'content-type': 'text/css'});
				res.end(data);
			}
		});
	} else {
		fs.readFile('index.html', 'utf-8', function(error, data) {
			if (error) { 
				res.end(error); 
			} else {
				res.writeHead(200, {'content-type': 'text/html'});
				res.end(data);
			}
		});
	}
});

//includes the socket.io module
var socketIo = require('socket.io');
//listens to the server which is listening on port 8080
var io = socketIo.listen(server);
var socketUsers = [];

//Need to deal with a new socket connection (from <script> in index.html)
io.sockets.on('connect', function(socket) {
	console.log(socket.conn.id);
	var time = new Date();
	var newId = {
		id: socket.conn.id,
		name: "Anonymous",
		time: time
	};   
	socketUsers.push(newId);
	
	io.sockets.emit('connected', {
		list: socketUsers,
		newUser: newId
	});

	socket.on('message_to_server', function(data) {
		io.sockets.emit('message_to_client', {
			message: data.message,
			name: data.name
		});
	});

	socket.on('name_submitted', function(data) {
		console.log(data);
		console.log("NAME SUBMITTED!!!");
		var id = data.id;
		var name = data.name;
		var status = "";
		for (var i = 0; i < socketUsers.length; i++) {
			if(id == socketUsers[i].id) {
				console.log(socketUsers[i]);
				var prev = socketUsers[i].name;
				var index = i;
				socketUsers[i].name = name;
				console.log(socketUsers[i]);
				// break;
			}
		}

		io.sockets.emit('userList_updated', {
			list: socketUsers,
			status: {
				prev: prev,
				index: index,
				action: 'name_changed'
			}
		});
	});

	socket.on('drawing_to_server', function(data) {
		if (data.lastPosition !== null) {
			io.sockets.emit('drawing_to_client', data);
		}
	});

	socket.on('disconnect', function() {
		console.log("A user has disconnect.");
		var index = "";
		for (var i = 0; i < socketUsers.length; i++) {
			if (socketUsers[i].id == socket.conn.id) {
				index = i;
				break;
			}
		}
		console.log(index);
		var prev = socketUsers[index].name;
		socketUsers.splice(index, 1);
		io.sockets.emit('userList_updated', {
			list: socketUsers,
			status: {
				prev: prev,
				index: index,
				action: 'disconnected'
			}
		})
	});
});

server.listen(8080);
console.log("Listening on port 8080...");


	// fs.readFile('index.html', 'utf-8', function(error, data) {
	// 	// data in this case: contents (borderplate) in index.html 
	// 	if (error) {
	// 		res.writeHead(500, {'content-type': 'text/html'});
	// 		res.end(error);
	// 	} else {
	// 		if (req.url == '/styles.css') {
	// 			var styles = fs.readFileSync('styles.css', function(error, data) {
	// 				if (error) {
	// 					res.writeHead(500, {'content-type': 'text/html'});
	// 					res.end(error);
	// 				} else {
	// 					res.writeHead(200, {'content-type': 'text/css'});
	// 					res.end(data);
	// 				}
	// 			});
				
	// 		} else if (req.url == '/') {
	// 			res.writeHead(200, {'content-type': 'text/html'});
	// 			res.end(data);
	// 		}
	// 	}
	// });
