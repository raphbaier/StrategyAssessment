#FROM python:latest

#WORKDIR .
#COPY preprocessed-data /

#RUN pip install -r requirements.txt
#CMD [ "python", "./app2.py"]



# Use an official Python runtime as a parent image
FROM python:3.8-slim

# Set the working directory in the container
WORKDIR .

# Copy the current directory contents into the container at /app
COPY preprocessed-data /

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Install Gunicorn
RUN pip install gunicorn

# Make port 8000 available to the world outside this container
EXPOSE 8001


# Run app.py when the container launches using Gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:8001", "app2:app"]