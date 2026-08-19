import urllib.request, urllib.parse, urllib.error, json

base = 'http://127.0.0.1:8000'
data = urllib.parse.urlencode({'username': 'recruiter@rocas.ai', 'password': 'recruiter123'}).encode()
req = urllib.request.Request(base + '/api/auth/login', data=data)
r = urllib.request.urlopen(req)
token = json.loads(r.read())['access_token']

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = (
    '--' + boundary + '\r\n'
    'Content-Disposition: form-data; name="files"; filename="test.pdf"\r\n'
    'Content-Type: application/pdf\r\n\r\n'
    '%PDF-1.4 dummy\r\n'
    '--' + boundary + '--\r\n'
).encode('utf-8')

req2 = urllib.request.Request(base + '/api/resumes/bulk-analyze', data=body, method='POST')
req2.add_header('Authorization', 'Bearer ' + token)
req2.add_header('Content-Type', 'multipart/form-data; boundary=' + boundary)

try:
    r2 = urllib.request.urlopen(req2, timeout=5)
    print('bulk-analyze OK:', r2.read().decode()[:200])
except urllib.error.HTTPError as e:
    print('HTTPError:', e.code, e.read().decode())
except Exception as e:
    print('FAILED:', e)
