from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_POST

from core.decorators import require_GET_or_POST
from .forms import RegistrationForm, LoginForm


@require_GET_or_POST
def login(request):
    form = LoginForm(reverse('user:login'), data=request.POST or None)

    if request.method == 'POST':
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(username=username, password=password)
            if user is not None and user.is_active:
                auth_login(request, user)
                messages.success(request, 'Successfully logged in')
                return redirect('chat:home')
            else:
                form.add_error(None, 'Invalid login credentials')

    return render(request, 'user/login.html', {'login_form': form})


@require_GET_or_POST
def register(request):
    form = RegistrationForm(reverse('user:register'), data=request.POST or None)

    if request.method == 'POST':
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']

            user = User.objects.create_user(
                username=email,
                email=email,
                password=password
            )

            messages.success(request, 'Created account for email {}! Please log in.'.format(user.email))
            return redirect('user:login')

    return render(request, 'user/register.html', {'registration_form': form})


@require_POST
def logout(request):
    auth_logout(request)

    messages.success(request, 'Successfully logged out.')

    return redirect('index')
