
/*
    Resize messages container when screen changes
*/
$(window).resize(function(){
    var heightresult  = $(window).outerHeight() - $('#input-footer').outerHeight();
    $('#messagesContainer').css('height', heightresult);
    $('#personsContainer').css('height', heightresult);
});
$(window).load(function(){
    var heightresult  = $(window).outerHeight() - $('#input-footer').outerHeight();
    $('#messagesContainer').css('height', heightresult);
    $('#personsContainer').css('height', heightresult);
});

/*
    Scroll down for new message
*/
function scroll(){
    var height = $('#messages').innerHeight();
    $('#messagesContainer').animate({ scrollTop: height }, "slow");
    // theultimatememedestroyeroftheworldakamcmemelordshillary
    return false;
}



var socket = io();

/*
    Recieve users list
*/
socket.on('online', function(online){
    $('#online').html('');
    for(var i = 0; i < online.users.length; i++){
        $('#online').append($('<li>', {class: 'collection-item'}).text(online.users[i]));
    }
});

/*
    Send your nickname
*/
$('#nicknameForm').submit(function(){
    var name = $('#name');
    var name_val = $('#name').val();

    socket.emit('nickname', name_val);
    $('#online').append($('<li>').text(name_val));
    name.val('');
    $('#nickname').css('display', "none");
    return false;
});

/*
    Send a message and append to own screen
*/
$('#chatForm').submit(function(){
    var msg = $('#m').val();

    if(msg.length > 0){
        socket.emit('chat message', msg);
        $('#messages').append($('<div>').attr('class', 'msg-right').text(msg));
        scroll();
    }
    
    $('#m').val('');
    return false;
});

/*
    Recieve message and append to screen
*/
socket.on('chat message', function(msg){
    $('#messages').append($('<div>', {class: 'msg-left'}).text(msg.nickname + ': ' + msg.message));
    scroll();
});

/*
    Recieve server messages
*/
socket.on('server message', function(req){
    switch(req.type){
        case 'joined':
            $('#messages').append($('<div>', {class: 'blue-grey-text text-lighten-3'}).text('user '+req.data+ ' has joined'));
            break;
        case 'left':
            $('#messages').append($('<div>', {class: 'blue-grey-text text-lighten-3'}).text('user '+req.data+ ' has left'));
            break;
        case 'lurker':
            $('#messages').append($('<div>', {class: 'blue-grey-text text-lighten-3'}).text('a lurker has left'));
            break;
    }
});

/*
    ToDo: Send started typing message
*/
var searchTimeout;
$('#m').keypress(function(e){
    if($('#m').val().length > 0){
        //socket.emit('started typing');
        console.log('typing');
    }
});

/*
    Recieve who is typing
*/
socket.on('started typing', function(nickname){
   console.log(nickname);
});