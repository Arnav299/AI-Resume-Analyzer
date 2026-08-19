from fpdf import FPDF

def create_pdf(filename, content):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    for line in content:
        pdf.cell(200, 10, txt=line, ln=1, align='L')
    pdf.output(filename)

# 1. Good Resume
good_content = [
    "John Doe",
    "Email: john.doe@example.com | Phone: 555-0198",
    "",
    "Summary:",
    "Experienced software engineer with 5 years in backend development.",
    "",
    "Skills:",
    "Python, Java, React, SQL, AWS, Docker",
    "",
    "Experience:",
    "Software Engineer at Tech Corp (2020-Present)",
    "- Developed scalable APIs",
    "- Optimized database queries",
    "",
    "Education:",
    "B.S. Computer Science, University of Technology (2019)"
]
create_pdf("docs/samples/good_resume.pdf", good_content)

# 2. Missing Email
no_email_content = [
    "Jane Smith",
    "Phone: 555-0199",
    "",
    "Summary:",
    "Data Scientist with expertise in ML.",
    "",
    "Skills:",
    "Python, Machine Learning, Data Analysis",
    "",
    "Experience:",
    "Data Scientist at Data Inc (2021-Present)"
]
create_pdf("docs/samples/missing_email.pdf", no_email_content)

# 3. Missing Skills
no_skills_content = [
    "Alice Jones",
    "Email: alice@example.com",
    "",
    "Experience:",
    "Manager at Retail Co (2018-Present)",
    "- Managed a team of 10",
    "- Handled inventory",
    "",
    "Education:",
    "B.A. Business Administration (2017)"
]
create_pdf("docs/samples/missing_skills.pdf", no_skills_content)

# 4. Scanned PDF mock (just text for now, since generating a real image-only PDF is complex without images, but we'll label it as scanned)
scanned_content = [
    "--- SCANNED DOCUMENT MOCK ---",
    "Bob Brown",
    "Email: bob@example.com",
    "Skills: Sales, Marketing"
]
create_pdf("docs/samples/scanned_resume.pdf", scanned_content)

# 5. Unsupported format
with open("docs/samples/unsupported_format.txt", "w") as f:
    f.write("This is a text file, not a PDF.\nName: Test\nEmail: test@example.com")

print("Samples generated successfully.")
