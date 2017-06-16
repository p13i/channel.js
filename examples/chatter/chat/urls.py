from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^chat/(?P<slug>[a-zA-Z0-9_]+)/$', views.chatroom, name='room'),
    url(r'^$', views.index, name='index'),
]
