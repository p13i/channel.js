from crispy_forms import helper
from crispy_forms.bootstrap import FormActions
from crispy_forms.layout import Submit, Layout, Field
from django import forms

from .models import Room



class CrispyModelForm(forms.ModelForm):
    helper = helper.FormHelper()

    def __init__(self, form_action, *args, **kwargs):
        self.helper.form_action = form_action
        super(CrispyModelForm, self).__init__(*args, **kwargs)


class RoomForm(CrispyModelForm):

    def __init__(self, *args, **kwargs):
        super(RoomForm, self).__init__(*args, **kwargs)
        self.helper.layout = Layout(
            'slug',
            FormActions(
                Submit('submit', 'Create')
            )
        )

    class Meta:
        model = Room
        fields = ('slug',)
