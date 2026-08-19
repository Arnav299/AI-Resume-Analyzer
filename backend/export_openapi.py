import json
from app.main import app
import os

if __name__ == "__main__":
    openapi_schema = app.openapi()
    
    docs_dir = os.path.join(os.path.dirname(__file__), '..', 'docs')
    os.makedirs(docs_dir, exist_ok=True)
    
    output_path = os.path.join(docs_dir, 'openapi.json')
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(openapi_schema, f, indent=2)
        
    print(f"OpenAPI spec successfully exported to {output_path}")
