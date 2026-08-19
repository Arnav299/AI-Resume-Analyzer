import requests

# We will test getting JDs for the 'admin@rocas.ai' account
data = {
    "username": "admin@rocas.ai",
    "password": "password"  # Wait, demo accounts in main.py are recruiter@rocas.ai and student@rocas.ai.
}
# Actually I will use 'recruiter@rocas.ai' first
data = {
    "username": "recruiter@rocas.ai",
    "password": "recruiter123"
}
try:
    response = requests.post("http://127.0.0.1:8000/api/auth/login", data=data, timeout=5)
    token = response.json().get("access_token")
    if token:
        res = requests.get("http://127.0.0.1:8000/api/jd/", headers={"Authorization": f"Bearer {token}"}, timeout=5)
        print("Status code:", res.status_code)
        if res.status_code != 200:
            print("Response:", res.text)
        else:
            print("Number of JDs:", len(res.json()))
    else:
        print("Login failed:", response.text)
except Exception as e:
    print("Exception:", e)
