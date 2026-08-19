import json
import os
import sys

# Add backend directory to sys.path so we can import the app
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

try:
    from app.main import app
    from fastapi.openapi.utils import get_openapi
    
    def export_openapi():
        openapi_schema = get_openapi(
            title=app.title,
            version=app.version,
            openapi_version=app.openapi_version,
            description=app.description,
            routes=app.routes,
        )
        
        output_path = os.path.join(os.path.dirname(__file__), '..', 'docs', 'openapi.json')
        
        with open(output_path, 'w') as f:
            json.dump(openapi_schema, f, indent=2)
            
        print(f"OpenAPI spec successfully exported to {output_path}")

    if __name__ == "__main__":
        export_openapi()
except ImportError as e:
    print(f"Error importing backend app: {e}")
    print("Make sure you run this from within the backend virtual environment.")
