# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install eSpeak
RUN apt-get update && apt-get install -y espeak && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Run the app
CMD ["python", "src/app.py"]
