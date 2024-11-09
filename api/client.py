import http.server
import socketserver
import os
from dotenv import load_dotenv
import socket

load_dotenv()

# Set the directory to the folder containing your HTML file
os.chdir(os.getcwd())

# Set up the request handler to serve files
Handler = http.server.SimpleHTTPRequestHandler

# Start the server on port 8000
HOST = os.getenv('CLIENT_HOST', '0.0.0.0')
PORT = int(os.getenv('CLIENT_PORT', 5000))

with socketserver.TCPServer((HOST, PORT), Handler) as httpd:
    print(" ")
    print(f"Serving on http://{HOST}:{PORT}")
    httpd.serve_forever()
