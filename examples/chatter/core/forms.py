from crispy_forms import helper
from django import forms


class CrispyForm(forms.Form):
    helper = helper.FormHelper()

    def __init__(self, form_action, *args, **kwargs):
        self.helper.form_action = form_action
        super(CrispyForm, self).__init__(*args, **kwargs)


class CrispyModelForm(forms.ModelForm):
    helper = helper.FormHelper()

    def __init__(self, form_action, *args, **kwargs):
        self.helper.form_action = form_action
        super(CrispyModelForm, self).__init__(*args, **kwargs)
