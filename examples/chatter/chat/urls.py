from django.conf.urls import url
from django.contrib import admin

from . import views

urlpatterns = [
    url(r'^(?P<slug>[a-zA-Z0-9_]+)/$', views.chatroom),
]
