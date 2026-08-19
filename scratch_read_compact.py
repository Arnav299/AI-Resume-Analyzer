import pandas as pd
import json

file_path = r"C:\Users\TANUJA SOPAN SHELKE\Downloads\AI resume analyzer RAG report 2026-07-08 14-48-19.xlsx"

try:
    xls = pd.ExcelFile(file_path)
    for sheet_name in xls.sheet_names:
        df = pd.read_excel(file_path, sheet_name=sheet_name)
        df = df.dropna(how='all', axis=1)
        columns_lower = [str(c).lower() for c in df.columns]
        
        ac_col = None
        task_col = None
        for c in df.columns:
            if 'acceptance' in str(c).lower():
                ac_col = c
            if 'task' in str(c).lower() or 'activity' in str(c).lower():
                task_col = c
                
        if ac_col and task_col:
            print(f"--- Sheet: {sheet_name} ---")
            for idx, row in df.iterrows():
                print(f"Task: {row[task_col]} | AC: {row[ac_col]}")
            print("\n")
except Exception as e:
    print(f"Error: {e}")
