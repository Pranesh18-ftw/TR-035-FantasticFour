"""
Simple HTTP server for serving the frontend dashboard
Run this script to serve the frontend on port 8080
"""

import http.server
import socketserver
import os
from pathlib import Path


PORT = 8080
FRONTEND_DIR = Path(__file__).parent / "Frontend"


class FrontendHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FRONTEND_DIR), **kwargs)
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()


def serve_frontend():
    """Start the frontend server"""
    os.chdir(FRONTEND_DIR)
    
    with socketserver.TCPServer(("", PORT), FrontendHandler) as httpd:
        print("=" * 60)
        print("🌐 Frontend Server")
        print("=" * 60)
        print(f"✅ Serving frontend at: http://localhost:{PORT}")
        print(f"📁 Directory: {FRONTEND_DIR.absolute()}")
        print()
        print("Press Ctrl+C to stop the server")
        print("=" * 60)
        print()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n🛑 Server stopped by user")


if __name__ == "__main__":
    serve_frontend()
