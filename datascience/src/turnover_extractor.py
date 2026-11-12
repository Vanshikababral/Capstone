
import json
import re
from pathlib import Path

try:
    from src.pdf_extractor import extract_text_from_pdf
except ImportError:
    from pdf_extractor import extract_text_from_pdf


def clean_value(value):
    return re.sub(r"\s+", " ", value or "").strip(" \t:|-")


def extract_field(text, labels):
    for label in labels:
        pattern = re.compile(
            rf"(?:{label})\s*[:\-]?\s*(.+)",
            re.IGNORECASE
        )

        for line in text.splitlines():
            match = pattern.search(line)

            if match:
                value = clean_value(match.group(1))
                if value:
                    return value

    return None


def extract_turnover_records(text):
    """
    Extract financial-year and annual-turnover pairs.
    Supports formats such as:
    FY 2022-23: INR 12,00,000
    2023-24 - Rs. 18,50,000
    """

    pattern = re.compile(
        r"(?:FY\s*)?((?:19|20)\d{2}\s*[-/]\s*\d{2,4})"
        r"\s*[:\-|]?\s*"
        r"(?:INR|RS\.?|₹)?\s*"
        r"([\d,]+(?:\.\d{1,2})?)",
        re.IGNORECASE
    )

    records = []

    for match in pattern.finditer(text):
        financial_year = clean_value(match.group(1))
        amount = match.group(2).replace(",", "")

        records.append({
            "financial_year": financial_year,
            "annual_turnover": amount,
            "currency": "INR"
        })

    # Avoid duplicate year entries.
    unique_records = {}
    for record in records:
        unique_records[record["financial_year"]] = record

    return list(unique_records.values())


def extract_turnover_details(pdf_path):
    """
    Extract structured information from a turnover certificate.
    """

    pdf_path = Path(pdf_path)

    pages = extract_text_from_pdf(pdf_path)

    full_text = "\n".join(
        page.get("text", "") for page in pages
    )

    business_name = extract_field(
        full_text,
        [
            r"Name of Business",
            r"Business Name",
            r"Name of Firm",
            r"Name of Entity"
        ]
    )

    ca_name = extract_field(
        full_text,
        [
            r"Chartered Accountant",
            r"CA Name",
            r"Certified By",
            r"Name of Auditor"
        ]
    )

    certificate_date = extract_field(
        full_text,
        [
            r"Certificate Date",
            r"Date of Issue",
            r"Date"
        ]
    )

    membership_number = extract_field(
        full_text,
        [
            r"Membership Number",
            r"Membership No",
            r"ICAI Membership No"
        ]
    )

    records = extract_turnover_records(full_text)

    missing_fields = []

    if not business_name:
        missing_fields.append("business_name")

    if not records:
        missing_fields.append("annual_turnover_records")

    extracted_fields = {
        "business_name": business_name,
        "certifying_authority": ca_name,
        "membership_number": membership_number,
        "certificate_date": certificate_date,
        "annual_turnover_records": records
    }

    return {
        "document_type": "TURNOVER_CERTIFICATE",
        "source_file": pdf_path.name,
        "extracted_fields": extracted_fields,
        "validation": {
            "turnover_records_found": bool(records),
            "authenticity_verified": False,
            "note": (
                "Extracted turnover information only. "
                "The certificate and CA credentials have not "
                "been independently authenticated."
            )
        },
        "missing_fields": missing_fields,
        "extraction_status": (
            "EXTRACTED"
            if not missing_fields
            else "REQUIRES_REVIEW"
        ),
        "source_pages": [
            page["page"]
            for page in pages
            if page.get("text", "").strip()
        ]
    }


def save_turnover_extraction(pdf_path, output_path):
    result = extract_turnover_details(pdf_path)

    output_path = Path(output_path)
    output_path.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with output_path.open("w", encoding="utf-8") as file:
        json.dump(
            result,
            file,
            indent=4,
            ensure_ascii=False
        )

    return result


if __name__ == "__main__":

    project_root = Path(__file__).resolve().parent.parent

    input_path = (
        project_root
        / "data"
        / "raw"
        / "bidder documents"
        / "04_synthetic_turnover_certificate.pdf"
    )

    output_path = (
        project_root
        / "data"
        / "processed"
        / "bidder_documents"
        / "turnover_extracted.json"
    )

    if not input_path.exists():
        raise FileNotFoundError(
            f"Turnover certificate not found: {input_path}"
        )

    result = save_turnover_extraction(
        input_path,
        output_path
    )

    print(json.dumps(result, indent=4))
    print(f"\nExtraction saved to: {output_path}")
