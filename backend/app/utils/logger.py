import logging
import os
from datetime import datetime
from typing import List


class Logger:
    def __init__(self, log_dir: str = "logs"):
        self.log_dir = log_dir
        self.log_file = os.path.join(log_dir, f"breach_log_{datetime.now().strftime('%Y%m%d')}.log")
        self.logs: List[str] = []
        
        # Create logs directory if it doesn't exist
        os.makedirs(log_dir, exist_ok=True)
        
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def log_breach(self, message: str, severity: str = "INFO"):
        """Log a breach event"""
        log_entry = f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {severity}: {message}"
        self.logs.append(log_entry)
        
        if severity == "HIGH":
            self.logger.warning(message)
        else:
            self.logger.info(message)
    
    def log_info(self, message: str):
        """Log general info"""
        log_entry = f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] INFO: {message}"
        self.logs.append(log_entry)
        self.logger.info(message)
    
    def get_logs(self, limit: int = 50) -> List[str]:
        """Get recent log entries"""
        return self.logs[-limit:] if self.logs else []
    
    def clear_logs(self):
        """Clear in-memory logs"""
        self.logs = []
