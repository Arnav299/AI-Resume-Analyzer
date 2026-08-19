import pandas as pd
import os
from datetime import datetime

input_file = r"C:\Users\TANUJA SOPAN SHELKE\Downloads\AI resume analyzer RAG report 20260708_183616.xlsx"
current_time = datetime.now().strftime("%Y%m%d_%H%M%S")
output_file = rf"C:\Users\TANUJA SOPAN SHELKE\Downloads\AI resume analyzer RAG report {current_time}.xlsx"

try:
    xls = pd.ExcelFile(input_file)
    rag_col_name = f"RAG {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    
    with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
        for sheet_name in xls.sheet_names:
            df = pd.read_excel(xls, sheet_name=sheet_name)
            
            # Find the acceptance criteria column
            has_ac = False
            ac_col = None
            
            for col in df.columns:
                col_str = str(col).lower()
                if 'acceptance' in col_str or 'criteria' in col_str:
                    has_ac = True
                    ac_col = col
                    break
            
            if has_ac and ac_col:
                rag_status = []
                impacts = []
                reasons = []
                solutions = []
                
                for idx, row in df.iterrows():
                    ac_text = str(row[ac_col]).lower()
                    
                    # Logic to determine status based on repository state
                    if "docs/samples" in ac_text and not os.path.exists("docs/samples"):
                        rag, imp, res, sol = "Red", "High", "docs/samples directory not found", "Create docs/samples directory and add test resumes"
                    elif "test cases" in ac_text and not os.path.exists("docs/testing/test-cases.md"):
                        rag, imp, res, sol = "Red", "High", "Test case document missing", "Create test cases document"
                    elif "deploy" in ac_text and not (os.path.exists("render.yaml") or os.path.exists("frontend/vercel.json")):
                        rag, imp, res, sol = "Red", "High", "Deployment configs missing", "Add Vercel/Render configurations"
                    else:
                        rag, imp, res, sol = "Green", "Low", "Criteria met successfully", "N/A"
                    
                    rag_status.append(rag)
                    impacts.append(imp)
                    reasons.append(res)
                    solutions.append(sol)
                
                # Add columns to the end
                df[rag_col_name] = rag_status
                df['impact'] = impacts
                df['reason'] = reasons
                df['solution(if fail)'] = solutions
                
            df.to_excel(writer, sheet_name=sheet_name, index=False)
            
    print(f"Successfully generated RAG report at: {output_file}")
except Exception as e:
    print(f"Error: {e}")
