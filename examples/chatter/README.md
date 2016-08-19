### Chatter: a simple example for usage of channel.js

#### Getting up and running

* `pip install virtualenv --upgrade`
* `git clone https://github.com/k-pramod/channel.js.git`
* `virtualenv venv` or `virtual -p C:\Python27\python.exe venv` for Python 2.7
* `cd examples/chatter`
* `venv\Scripts\activate`
* `pip install -r requirements.txt`
* `python manage.py runserver`

Navigate to `localhost:8000/chat/myRoom/` and have fun chatting!

This example works with Python 2.7+. (When using a virtualenv with Python 2.7, you may run into [this error](http://stackoverflow.com/questions/16259729/django-python-manage-py-runserver-gives-runtimeerror-maximum-recursion-depth-e).)
