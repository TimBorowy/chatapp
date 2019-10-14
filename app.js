var express = require('express');
var app = express();
var fs = require('fs');

var http = require('http').Server(app);
var io = require('socket.io')(http);
const port = process.env.PORT || 5000


app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/static', express.static(__dirname + '/node_modules'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

var users = [];

io.on('connection', function (socket) {

    socket.on('nickname', function (nickname) {
        users.push(nickname);
        console.log(users);
        socket.username = nickname;
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

        let logline = `date: "${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}, nickname: ${nickname};\n`

        // log to file
        fs.appendFile('nicknamelog.txt', logline, function (err) {
            if (err) {
                console.log(err);
            }
        });

    });

    // triggers when a message is send
    socket.on('chat message', function (msg) {
        // returns to all clients if message is not empty
        if (msg.length > 0) {
            socket.broadcast.emit('chat message', {
                message: msg,
                nickname: socket.username
            });

            let logline = `date: ${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}, nickname: ${socket.username}, message: ${msg};\n`

            // log to file
            fs.appendFile('chatlog.txt', logline, function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }

        console.log(msg);
    });

    socket.on('started typing', function () {
        socket.broadcast.emit('started typing', socket.username);
    });

    socket.on('stoped typing', function () {
        socket.broadcast.emit('stoped typing', socket.username);
    })

    socket.on('disconnect', function () {
        usernameIndex = users.indexOf(socket.username);

        if (usernameIndex > -1) {
            socket.broadcast.emit('server message', {
                type: 'left',
                data: socket.username
            });

            users.splice(usernameIndex, 1);

            socket.broadcast.emit('online', {
                type: 'joined',
                users: users
            });
        } else {
            socket.broadcast.emit('server message', {
                type: 'lurker'
            });
        }

        //console.log('user disconnected');
    });
});

http.listen(port, function () {
    console.log(`Listening on port ${port}`);
    console.log(`Server started on: http://localhost:${port}`)
});
