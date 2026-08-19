import json

with open("extracted_criteria.json", "r", encoding="utf-8") as f:
    data = json.load(f)

with open("excel_items.md", "w", encoding="utf-8") as f:
    for sheetname, items in data.items():
        f.write(f"\n# SHEET: {sheetname} ({len(items)} items)\n\n")
        f.write("| Row | ID | Name | Status | Acceptance Criteria |\n")
        f.write("| --- | --- | --- | --- | --- |\n")
        for item in items:
            row_data = item["row_data"]
            row_idx = item["row_index"]
            
            task_id = ""
            task_name = ""
            ac = ""
            status = ""
            
            if sheetname == "Milestones":
                task_id = row_data.get("Milestone ID")
                task_name = row_data.get("Milestone")
                ac = row_data.get("Acceptance Criteria")
                status = row_data.get("Status")
            elif sheetname == "Deliverables":
                task_id = row_data.get("Deliverable ID")
                task_name = row_data.get("Deliverable")
                ac = row_data.get("Acceptance Criteria")
                status = row_data.get("Status")
            elif sheetname == "Detailed Plan":
                task_id = row_data.get("WBS ID")
                task_name = row_data.get("Activity / Task")
                ac = row_data.get("Acceptance Criteria")
                status = row_data.get("Status")
            elif sheetname == "PM Reviews":
                task_id = row_data.get("Week")
                task_name = row_data.get("Review Theme")
                ac = row_data.get("Acceptacne Criteia")
                status = row_data.get("Status")
                
            task_id = str(task_id).replace("\n", " ") if task_id is not None else ""
            task_name = str(task_name).replace("\n", " ") if task_name is not None else ""
            ac = str(ac).replace("\n", " ") if ac is not None else ""
            status = str(status).replace("\n", " ") if status is not None else ""
            
            f.write(f"| {row_idx} | {task_id} | {task_name} | {status} | {ac} |\n")

print("Written all items to C:\\Users\\User\\.gemini\\antigravity-ide\\scratch\\excel_items.md")
