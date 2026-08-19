from fastapi import APIRouter, HTTPException
import json
import os

router = APIRouter()

JOBS_DB_FILE = "jobs_status.json"

def _get_jobs():
    if not os.path.exists(JOBS_DB_FILE):
        return {}
    with open(JOBS_DB_FILE, "r") as f:
        try:
            return json.load(f)
        except:
            return {}

def update_job_status(job_id: str, status: str, result: dict = None):
    jobs = _get_jobs()
    jobs[job_id] = {
        "status": status,
        "result": result
    }
    with open(JOBS_DB_FILE, "w") as f:
        json.dump(jobs, f)

@router.get("/{job_id}")
async def get_job_status(job_id: str):
    """Get the status of a background AI analysis job."""
    jobs = _get_jobs()
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return jobs[job_id]
