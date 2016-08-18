$(document).ready(function () {
    var room_slug = $('#room-slug').val();
    // Get the web socket path from the room slug
    var ws_path = '/chat/' + room_slug + '/stream/';
    // Create a new Channel instance (which handles connecting to server)
    var channel = new Channel(ws_path);

    /**
     * Updates the member count in the chat room
     * @param data The data dictionary from the server
     */
    var update_member_count = function (data) {
        var member_count = data['member_count'];
        $('#member-count').html(member_count);
    };

    // Register the user_join event
    channel.on('user-join', update_member_count);
    channel.on('user-leave', update_member_count);

    // Handle receiving new messages from other users
    channel.on('message-new', function (data) {
        $('#chat-messages').prepend(
            '<li class="list-group-item"><strong>'
            + data['username']
            + '</strong>&nbsp;'
            + data['msg'] +
            '<span class="tag tag-pill tag-success float-right italics">'
            + data['time']
            + '</span></li>');
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
    });
});
