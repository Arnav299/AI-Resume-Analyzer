import urllib.request, json

def main():
    boundary = 'TestBound123'
    pdf = b'%PDF-1.4\n%%EOF'

    part1 = ('--' + boundary + '\r\n'
             'Content-Disposition: form-data; name="file"; filename="test.pdf"\r\n'
             'Content-Type: application/pdf\r\n\r\n').encode()
    body = part1 + pdf + ('\r\n--' + boundary + '--\r\n').encode()

    req = urllib.request.Request('http://127.0.0.1:8000/api/resumes/parse-pdf-text', data=body)
    req.add_header('Content-Type', 'multipart/form-data; boundary=' + boundary)
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            print('OK:', r.read().decode()[:200])
    except urllib.error.HTTPError as e:
        body_txt = e.read().decode()
        print('HTTP', e.code, body_txt)
    except urllib.error.URLError as e:
        print('URL Error:', e)

if __name__ == '__main__':
    main()
