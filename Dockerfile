# Use the official Python 3.12 image as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the requirements file into the container
COPY requirements.txt ./

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code and .env file
COPY ./ .

# If your .env file is in the src directory, copy it to the working directory
COPY .env ./

# Command to run your application
CMD ["python", "src/app.py"]

# Expose a port if your app is a web service (optional)
EXPOSE 8000
