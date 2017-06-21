from django.core.urlresolvers import reverse
from django.shortcuts import render, redirect


def index(request):
    if request.user.is_authenticated() is True:
        return redirect('chat:home')

    return render(request, 'core/index.html')
