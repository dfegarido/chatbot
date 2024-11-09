import http.server
import socketserver
import os

# Set the directory to the folder containing your HTML file
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Set up the request handler to serve files
Handler = http.server.SimpleHTTPRequestHandler

# Start the server on port 8000
PORT = 8000
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving on port {PORT}...")
    httpd.serve_forever()
