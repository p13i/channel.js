FROM python:3.6

# Set the working directory to the container's /www path
WORKDIR /www

# Install the project's requirements
COPY ./requirements.txt ./
RUN ["pip", "install", "-r", "requirements.txt"]

# Copy all the code into the image so we can easily run
# this image (without code dependencies)
COPY ./ ./

# By default, any commands run with `docker-compose run` will be
# prefixed with the ENTRYPOINT below
ENTRYPOINT ["python", "manage.py"]
