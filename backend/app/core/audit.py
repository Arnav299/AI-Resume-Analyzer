import os
import json
import hashlib
from datetime import datetime

AUDIT_LOG_FILE = "audit_log.jsonl"

def log_audit_event(action: str, user_id: str, resource_id: str, details: dict = None):
    """
    Append an audit event to a local file to avoid database schema modifications.
    Uses cryptographic hashing to simulate immutability.
    """
    if details is None:
        details = {}
        
    entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "action": action,
        "user_id": str(user_id) if user_id else "anonymous",
        "resource_id": str(resource_id) if resource_id else "none",
        "details": details
    }
    
    # Calculate hash of entry
    entry_str = json.dumps(entry, sort_keys=True)
    entry_hash = hashlib.sha256(entry_str.encode()).hexdigest()
    entry["hash"] = entry_hash
    
    try:
        with open(AUDIT_LOG_FILE, "a") as f:
            f.write(json.dumps(entry) + "\n")
    except Exception as e:
        print(f"Failed to write audit log: {e}")
