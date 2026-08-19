import openpyxl

wb = openpyxl.load_workbook(r"C:\Users\User\Downloads\AI resume analyzer RAG report 20260707_185359.xlsx")
sheet = wb["Risks"]
rows = list(sheet.iter_rows(values_only=True))
headers = rows[0]

print("Headers:")
for i, h in enumerate(headers):
    if h:
        print(f"  Col {i}: {h}")

print("\nRows:")
for i in range(1, len(rows)):
    row = rows[i]
    if any(row):
        print(f"Row {i+1}:", [row[j] for j in range(len(headers)) if headers[j] is not None])
