import os
import openpyxl

excel_path = r"C:\Users\User\Downloads\AI resume analyzer RAG report 20260707_185359.xlsx"
if not os.path.exists(excel_path):
    print(f"[INFO] Excel file not found: {excel_path}. Skipping column check.")
else:
    wb = openpyxl.load_workbook(excel_path)
    sheet = wb["Detailed Plan"]
    rows = list(sheet.iter_rows(values_only=True))
    headers = rows[0]

    status_idx = headers.index("Status")
    print("Headers:", headers[status_idx:])
    for i in range(1, 11):
        if i < len(rows):
            print(f"Row {i+1}:", rows[i][status_idx:])
