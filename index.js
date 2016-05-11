var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var net = require('net');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	console.log('Somebody connected');
	socket.on('disconnect', function(){
		console.log('User disconnected');
	});

	socket.on('chat message', function(msg){
		socket.broadcast.emit('chat message', msg);

		// Open socket to www.chattr.io:1024, bot: therapp
		var client = new net.Socket();
		client.connect(1024, 'www.chattr.io', function() {
			console.log('connected to chattr');
			// Send message as username + \0 + bot name + \0 + message + \0
			client.write(msg.user + '\0' + 'therapp' + '\0' + msg.msg + '\0');
		});

		client.on('data', function(data) {
			console.log('Received: ' + data);
			io.emit('chat message', {user: 'therapp', msg: data});
			client.destroy();
		});

		client.on('close', function() {
			console.log('Connection closed');
		});

	});

	socket.on('typing', function(user){
		socket.broadcast.emit('typing', user);
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
