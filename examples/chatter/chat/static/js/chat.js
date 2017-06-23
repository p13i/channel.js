$(document).ready(function () {
    var room_name = $('#room-name').val();
    // Get the web socket path from the room name
    var ws_path = '/chat/' + room_name + '/stream/';
    // Create a new Channel instance (which handles connecting to server)
    var channel = new Channel(ws_path);

    channel.on('connect', function (channel) {
        var username = "pramodk";
        while (!username) {
            username = prompt('What is your username? (Required)');
        }

        var username_element = $('#chat-username');
        username_element.val(username);
        username_element.attr('disabled', true);

        channel.emit('user-join', {
            'username': username
        })
    });

    /**
     * Updates the member count in the chat room
     * @param data The data dictionary from the server
     */
    var update_members = function (data) {
        var members = data['members'];
        var html = '';
        $.each(members, function (idx, member) {
            html += '<li class="list-group-item">';
            html += member['username'];
            html += '</li>';
        });
        $('#chat-members').html(html);
        $('#chat-member-count').html(members.length);
    };

    // Register the user-join and user-leave events
    channel.on('user-join', update_members);
    channel.on('user-leave', update_members);

    // Handle receiving new messages from other users
    channel.on('message-new', function (data) {
        $('#chat-messages').prepend(
            '<li class="list-group-item">'
            + '<strong>'
            + data['username']
            + '</strong>&nbsp;|&nbsp;'
            + data['msg']
            + '</li>');
    });

    // Handle the user submitting new messages
    var submit_button = $('#chat-submit');
    submit_button.on('click', function () {
        // Get the username and message
        var username = $('#chat-username');
        var message = $('#chat-form');

        var data = {
            'msg': message.val(),
            'username': username.val()
        };

        // Don't let the user change his/her username
        username.attr('disabled', true);
        // Clear the message
        message.val('');

        // Send the message across the channel
        channel.emit('message-send', data);

        // Prevent page reloading
        return false;
    });

    var binder = new Channel('/binding/');
    var bindingAgent = binder.bind('room');
    bindingAgent.create(function (data) {
        var roomItem =
            '<li data-room_id="'
            + data.pk
            + '" class="list-group-item">'
            + data.name
            + '</li>';
        $("#chat-rooms").append(roomItem);
    });
    bindingAgent.update(function (data) {
        $("[data-room_id=" + data.pk + "]").html(data.name);
    });
    bindingAgent.destroy(function (data) {
        $("[data-room_id=" + data.pk + "]").remove();
    });
});
