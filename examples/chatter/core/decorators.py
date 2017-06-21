from django.views.decorators.http import require_http_methods

require_GET_or_POST = require_http_methods(['GET', 'POST'])
