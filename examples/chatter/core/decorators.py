from django.views.decorators.http import require_http_methods

# A Django view decorator that ensures that requests are either GET or POST.
# Usage:
#
#   @require_GET_or_POST
#   def view(request):
#       assert request.method in ['GET', 'POST']
#
require_GET_or_POST = require_http_methods(['GET', 'POST'])
