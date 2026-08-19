import pandas as pd

input_file = r"C:\Users\TANUJA SOPAN SHELKE\Downloads\AI resume analyzer RAG report 20260708_183616.xlsx"

try:
    xls = pd.ExcelFile(input_file)
    for sheet_name in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sheet_name)
        print(f"--- Sheet: {sheet_name} ---")
        for col in df.columns:
            if 'acceptance' in str(col).lower() or 'criteria' in str(col).lower():
                print(f"Found AC column: {col}")
                print(df[[c for c in df.columns if 'task' in str(c).lower() or 'activity' in str(c).lower()] + [col]].head())
except Exception as e:
    print(f"Error: {e}")
