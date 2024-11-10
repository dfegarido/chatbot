FROM ollama/ollama:latest


# Set the entrypoint to the script
ENTRYPOINT ["ollama", "serve"]
