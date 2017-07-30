from crispy_forms.bootstrap import FormActions
from crispy_forms.layout import Submit, Layout
from django import forms
from django.contrib.auth.models import User
from django.db.models import Q
from typing import List, Dict
from core.forms import CrispyForm, CrispyModelForm


class RegistrationForm(CrispyModelForm):
    """
    Registration form for new users
    """

    # Specify the PasswordInput widget for the password field
    # Django Crispy Forms will automatically
    password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ('email', 'password')

    def __init__(self, *args: List, **kwargs: Dict) -> None:
        super(RegistrationForm, self).__init__(*args, **kwargs)
        self.helper.layout = Layout(
            'email',
            'password',
            FormActions(
                Submit('save', 'Register', css_class='btn btn-outline-success btn-block')
            )
        )

    def clean_email(self) -> str:
        """
        Cleans the email field by checking if there is a user with the same username or email.
        :return: The email from the cleaned form data.
        """
        email = self.cleaned_data['email']

        # Check if there is a duplicate username/email
        if User.objects.filter(Q(username__iexact=email) | Q(email__iexact=email)).exists():
            raise forms.ValidationError(f"User with username/email {email} already exists.")

        return email


class LoginForm(CrispyForm):
    """
    Form used to log in existing user
    """

    username = forms.CharField(max_length=150, label="Email")
    password = forms.CharField(widget=forms.PasswordInput)

    def __init__(self, *args: List, **kwargs: Dict) -> None:
        super(LoginForm, self).__init__(*args, **kwargs)
        self.helper.layout = Layout(
            'username',
            'password',
            FormActions(
                Submit('submit', 'Login', css_class='btn btn-outline-primary btn-block')
            )
        )
