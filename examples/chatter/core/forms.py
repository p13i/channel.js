from crispy_forms import helper
from django import forms


class CrispyForm(forms.Form):
    """
    Utilize Django Crispy Forms to automatically render HTML forms.
    """

    helper = helper.FormHelper()

    def __init__(self, form_action: str, *args, **kwargs):
        self.helper.form_action = form_action
        super(CrispyForm, self).__init__(*args, **kwargs)


class CrispyModelForm(forms.ModelForm):
    """
    Django Crispy Forms specifically for ModelForms
    """

    helper = helper.FormHelper()

    def __init__(self, form_action: str, *args, **kwargs):
        self.helper.form_action = form_action
        super(CrispyModelForm, self).__init__(*args, **kwargs)
