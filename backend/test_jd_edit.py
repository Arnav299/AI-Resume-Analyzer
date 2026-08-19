import requests

r = requests.post('http://127.0.0.1:8000/api/auth/login', data={
    'username': 'recruiter@rocas.ai', 'password': 'recruiter123'
})
token = r.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

r2 = requests.get('http://127.0.0.1:8000/api/jd/', headers=headers)
jds = r2.json()
print('Total JDs:', len(jds))
for jd in jds[:5]:
    uid = jd.get('user_id', 'NONE')
    title = jd.get('title', '')[:30]
    jid = jd.get('id', '')
    print(f'  id={jid}, user_id={uid}, title={title}')

if jds:
    jd_id = jds[0]['id']
    r3 = requests.put(f'http://127.0.0.1:8000/api/jd/{jd_id}', json={
        'title': jds[0]['title'] + ' Updated',
        'employmentType': 'Contract',
        'workMode': 'Remote',
        'experienceLevel': 'Senior',
        'skills': ['Python'],
        'preferredSkills': [],
        'certifications': [],
        'aiMatchingThreshold': 70,
        'selectedThreshold': 90,
        'waitingThreshold': 75,
        'status': 'Active'
    }, headers=headers)
    print('Update status:', r3.status_code)
    print('Response:', r3.text[:300])
