from crispy_forms.bootstrap import FormActions
from crispy_forms.layout import Submit, Layout

from core.forms import CrispyModelForm
from .models import Room


class RoomForm(CrispyModelForm):
    def __init__(self, *args, **kwargs):
        super(RoomForm, self).__init__(*args, **kwargs)
        self.helper.layout = Layout(
            'name',
            FormActions(
                Submit('submit', 'Create')
            )
        )

    class Meta:
        model = Room
        fields = ('name',)
