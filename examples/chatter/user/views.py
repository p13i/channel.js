from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.http import HttpRequest, HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_POST

from core.decorators import require_GET_or_POST
from user.forms import RegistrationForm, LoginForm


@require_GET_or_POST
def login(request: HttpRequest) -> HttpResponse:
    """
    Endpoint for logging in a user.
    :param request: The GET or POST request
    :return: An HTTP response
    """
    form = LoginForm(reverse('user:login'), data=request.POST or None)

    if request.method == 'POST' and form.is_valid():

        username: str = form.cleaned_data['username']
        password: str = form.cleaned_data['password']

        user = authenticate(username=username, password=password)

        if user is not None and user.is_active:
            auth_login(request, user)

            messages.success(request, 'Successfully logged in')
            return redirect('chat:home')

        form.add_error(None, 'Invalid login credentials')

    return render(request, 'user/login.html', {'login_form': form})


@require_GET_or_POST
def register(request: HttpRequest) -> HttpResponse:
    """
    Endpoint for registering new users.
    :param request: The GET or POST request
    :return: An HTTP response
    """
    form = RegistrationForm(reverse('user:register'), data=request.POST or None)

    if request.method == 'POST' and form.is_valid():
        # Get the email and password from the form data
        email: str = form.cleaned_data['email']
        password: str = form.cleaned_data['password']

        # Create the user where the saved username and email are the same
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password
        )

        messages.success(request, 'Created account for email {}! Please log in.'.format(user.email))
        return redirect('user:login')

    return render(request, 'user/register.html', {'registration_form': form})


@require_POST
@login_required
def logout(request: HttpRequest) -> HttpResponse:
    """
    Logs out the active user from the incoming request.
    :param request: The authenticated HTTP request
    :return: An HTTP response direction to the index page
    """
    # Logout is as simple as calling the Django method on the HTTP request
    auth_logout(request)

    messages.success(request, 'Successfully logged out.')
    return redirect('index')
