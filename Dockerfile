FROM ollama/ollama:latest

EXPOSE 11434

# Set the entrypoint to the script
ENTRYPOINT ["ollama", "serve"]
