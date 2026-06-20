import http.server
import socketserver
import subprocess

PORT = 9999  # You can change this port

class ShutdownHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'Shutting down now...')
        subprocess.call(['sudo', 'shutdown', 'now'])

with socketserver.TCPServer(("", PORT), ShutdownHandler) as httpd:
    print(f"Serving on port {PORT}")
    httpd.serve_forever()
