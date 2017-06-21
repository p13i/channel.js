from crispy_forms.bootstrap import FormActions
from crispy_forms.layout import Submit, Layout
from django import forms
from django.contrib.auth.models import User
from django.db.models import Q

from core.forms import CrispyForm, CrispyModelForm


class RegistrationForm(CrispyModelForm):
    DUPLICATE_EMAIL_MSG = "User with username/email {email} already exists."

    password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ('email', 'password')

    def __init__(self, *args, **kwargs):
        super(RegistrationForm, self).__init__(*args, **kwargs)
        self.helper.layout = Layout(
            'email',
            'password',
            FormActions(
                Submit('save', 'Register', css_class='btn btn-outline-success btn-block')
            )
        )

    def clean_email(self):
        email = self.cleaned_data['email']

        # Check if there is a duplicate username/email
        if User.objects.filter(Q(username__iexact=email) | Q(email__iendswith=email)).exists():
            raise forms.ValidationError(self.DUPLICATE_EMAIL_MSG.format(email=email))

        return email


class LoginForm(CrispyForm):
    username = forms.CharField(max_length=150, label="Email")
    password = forms.CharField(widget=forms.PasswordInput)

    def __init__(self, *args, **kwargs):
        super(LoginForm, self).__init__(*args, **kwargs)
        self.helper.layout = Layout(
            'username',
            'password',
            FormActions(
                Submit('submit', 'Login', css_class='btn btn-outline-primary btn-block')
            )
        )
