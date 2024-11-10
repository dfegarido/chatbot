# Use the official Ollama image as a base
FROM ollama/ollama:latest

# Ensure the .ollama directory is copied from the build context to the container
RUN mkdir -p /root/.ollama

# Copy any additional files you may need (like your app files)
COPY . /app

# Set the working directory to /app
WORKDIR /app

# Expose the port that Ollama will serve on (if applicable)
EXPOSE 11434

# Run 'ollama serve' in the background and keep the container running
ENTRYPOINT ["sh", "-c", "ollama serve"]

CMD [ "bin", "bash" ]
