from http.server import SimpleHTTPRequestHandler, HTTPServer
import os

class FallbackRequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # If the requested path is a file, serve it normally
        if os.path.exists(self.path[1:]):
            return super().do_GET()

        # If it's not a file, fallback to index.html
        self.path = '/index.html'
        return super().do_GET()

# Start the server
port = 8000
server_address = ('10.11.4.4', port)
httpd = HTTPServer(server_address, FallbackRequestHandler)
print(f"Serving on port {port}...")
httpd.serve_forever()
