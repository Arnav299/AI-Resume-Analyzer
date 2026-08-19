# Automated & Manual Test Cases

This document outlines the test cases for the AI Resume Analyzer to verify end-to-end functionality.

## 1. Authentication & Profile (If configured)
| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| AUTH-01 | User Login | 1. Navigate to login. 2. Enter valid credentials. | User is redirected to Dashboard and session token is stored. |
| AUTH-02 | Invalid Login | 1. Navigate to login. 2. Enter invalid credentials. | System displays "Invalid credentials" error. |

## 2. Resume Upload & Validation
| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| UPL-01 | Valid PDF Upload | 1. Select `docs/samples/good_resume.pdf`. 2. Submit. | Upload succeeds, UI shows "Processing". |
| UPL-02 | Unsupported File | 1. Select `docs/samples/unsupported_format.txt`. 2. Submit. | System rejects file and shows "Only PDF supported". |
| UPL-03 | Missing Information | 1. Upload `docs/samples/missing_email.pdf`. | Extraction completes but ATS score is lower due to missing contact details. |
| UPL-04 | Scanned Image PDF | 1. Upload `docs/samples/scanned_resume.pdf`. | OCR fallback triggers and extracts text successfully. |

## 3. Extraction & Analysis
| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| ANA-01 | Basic Extraction | 1. Upload `good_resume.pdf`. | Name, email, phone, and skills are extracted correctly. |
| ANA-02 | Missing Skills | 1. Upload `missing_skills.pdf`. | Hard skills list is empty. Skill gap highlights many missing skills. |
| ANA-03 | Career Recs | 1. Review results of `good_resume.pdf`. | System suggests 2-3 relevant career paths. |

## 4. Dashboard & Reporting
| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| DASH-01 | View History | 1. Navigate to Dashboard. | Previous uploads are listed with their ATS scores. |

## 5. Feedback Mechanism
| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| FB-01 | Submit Feedback | 1. On results page, enter feedback text. 2. Submit. | "Feedback saved" confirmation appears. |
