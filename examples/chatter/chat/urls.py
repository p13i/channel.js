from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'rooms/(?P<slug>[a-zA-Z0-9_]+)/$', views.chatroom, name='room'),
    url(r'$', views.home, name='home'),
]
