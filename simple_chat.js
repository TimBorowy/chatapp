//var http = require("http");
//
//http.createServer(function (request, response) {
//
//    // Send the HTTP header
//    // HTTP Status: 200 : OK
//    // Content Type: text/plain
//    response.writeHead(200, {'Content-Type': 'text/plain'});
//
//    // Send the response body as "Hello World"
//    response.end('Hello World\n');
//}).listen(8081);
//
//// Console will print the message
//console.log('Server running at http://127.0.0.1:8081/');



var express = require('express');
var app = express();
var fs = require('fs');

var http = require('http').Server(app);
var io = require('socket.io')(http);


app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/static', express.static(__dirname + '/node_modules'));

app.get('/', function(req, res){
    //res.send('<h1>Hello world</h1>');
    res.sendFile(__dirname + '/index.html');
});

var users = [];

io.on('connection', function(socket){

    socket.on('nickname', function(nickname){
        users.push(nickname);
        console.log(users);
        socket.username = nickname;
        //console.log('a user connected');
        socket.broadcast.emit('server message', {
            type: 'joined',
            data: socket.username
        });

        socket.emit('online', {
            type: 'joined',
            users: users
        });
        socket.broadcast.emit('online', {
            type: 'joined',
            users: users
        });

        // log to file
        fs.appendFile('nicknamelog.txt', "date: "+ new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')+", nickname: "+nickname+";\n", function (err) {
            if(err){
                console.log(err);
            }
        });
        
    });

    // triggers when a message is send
    socket.on('chat message', function(msg){
        // returns to all clients if message is not empty
        if(msg.length > 0){
            socket.broadcast.emit('chat message', {
                message: msg,
                nickname: socket.username
            }); 

            // log to file
            fs.appendFile('chatlog.txt', "date: "+ new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')+", nickname: "+socket.username+", message: "+msg+";\n" , function (err) {
                if(err){
                    console.log(err);
                }
            });
        }

        console.log(msg);        
    });

    socket.on('started typing', function(){
       socket.broadcast.emit('started typing', socket.username);
    });

    socket.on('stoped typing', function(){
        socket.broadcast.emit('stoped typing', socket.username);
    })

    socket.on('disconnect', function(){
        usernameIndex = users.indexOf(socket.username);

        if(usernameIndex > -1){
            socket.broadcast.emit('server message', {
                type: 'left',
                data: socket.username
            });

            users.splice(usernameIndex, 1);

            socket.broadcast.emit('online', {
                type: 'joined',
                users: users
            });
        }else{
            socket.broadcast.emit('server message', {
                type: 'lurker'
            });
        }

        //console.log('user disconnected');
    });
});

http.listen(process.env.PORT || 5000, function(){
    console.log('Listening on *:5000');
});
