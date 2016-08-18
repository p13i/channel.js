import json


def get_payload(message, slug):
    """
    Creates a payload from the socket message and slug
    :param message: The socket message
    :param slug: The slug representing a room
    :return:
    """
    content = message.content

    payload = json.loads(content['text'])
    payload['slug'] = slug
    payload['reply_channel'] = content['reply_channel']

    return payload

