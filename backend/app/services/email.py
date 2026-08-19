import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import get_settings

settings = get_settings()

def send_confirmation_email(to_email: str, full_name: str):
    """
    Sends a welcome/confirmation email.
    If SMTP credentials are not configured in .env, it simulates sending by printing to console.
    """
    subject = f"Welcome to {settings.APP_NAME}!"
    body = f"""\
Hello {full_name},

Thank you for registering for {settings.APP_NAME}! 
Your account has been successfully created.

We are excited to help you supercharge your career with AI-driven resume analysis.

Best regards,
The {settings.APP_NAME} Team
"""

    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("\n" + "="*50)
        print(f"[SIMULATED EMAIL] To: {to_email}")
        print(f"Subject: {subject}")
        print("-" * 50)
        print(body)
        print("="*50 + "\n")
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
            
        print(f"[SUCCESS] Email successfully sent to {to_email}")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to send email to {to_email}: {str(e)}")
        # We return False but usually don't want to crash the registration API if email fails
        return False
