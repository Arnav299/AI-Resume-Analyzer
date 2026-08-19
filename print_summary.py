import json

with open("extracted_criteria.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for sheetname, items in data.items():
    print(f"\n======================================")
    print(f"SHEET: {sheetname} ({len(items)} items)")
    print(f"======================================")
    for idx, item in enumerate(items):
        row_data = item["row_data"]
        row_idx = item["row_index"]
        
        # Find identifier and task name depending on sheet
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
            
        if ac or task_name:
            print(f"Row {row_idx} | ID: {task_id} | Name: {task_name} | Status: {status}")
            print(f"  Acceptance Criteria: {ac}")
            print("-" * 40)
