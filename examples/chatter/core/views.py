from django.http import HttpRequest, HttpResponse
from django.shortcuts import render, redirect


def index(request: HttpRequest) -> HttpResponse:
    """
    Main (index) endpoint for entire project.
    :param request: The HTTP request
    :return: The main index page or the logged-in home page
    """
    if request.user.is_authenticated():
        return redirect('chat:home')

    return render(request, 'core/index.html')
