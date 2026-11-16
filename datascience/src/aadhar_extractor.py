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
    """Extract a value appearing after a field label."""

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


def extract_aadhaar_number(text):
    """Extract a masked Aadhaar number only."""

    patterns = [
        r"\bX{4}\s+X{4}\s+\d{4}\b",
        r"\bX{8}\d{4}\b"
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return re.sub(r"\s+", " ", match.group(0)).upper()

    return None


def extract_aadhaar_details(pdf_path):
    """
    Extract information from a masked Aadhaar test document.

    This module does not authenticate Aadhaar documents.
    """

    pdf_path = Path(pdf_path)

    pages = extract_text_from_pdf(pdf_path)

    full_text = "\n".join(
        page.get("text", "") for page in pages
    )

    aadhaar_number = extract_aadhaar_number(full_text)

    holder_name = extract_field(
        full_text,
        [
            r"Name",
            r"Name of Holder",
            r"Name of Resident"
        ]
    )

    date_of_birth = extract_field(
        full_text,
        [
            r"Date of Birth",
            r"DOB"
        ]
    )

    year_of_birth = extract_field(
        full_text,
        [
            r"Year of Birth",
            r"YOB"
        ]
    )

    gender = extract_field(
        full_text,
        [
            r"Gender",
            r"Sex"
        ]
    )

    address = extract_field(
        full_text,
        [
            r"Address",
            r"Address of Resident"
        ]
    )

    extracted_fields = {
        "masked_aadhaar_number": aadhaar_number,
        "holder_name": holder_name,
        "date_of_birth": date_of_birth,
        "year_of_birth": year_of_birth,
        "gender": gender,
        "address": address
    }

    # DOB or year of birth can satisfy the date requirement.
    required_fields = [
        "masked_aadhaar_number",
        "holder_name"
    ]

    missing_fields = [
        field
        for field in required_fields
        if not extracted_fields[field]
    ]

    if not date_of_birth and not year_of_birth:
        missing_fields.append("date_of_birth_or_year_of_birth")

    return {
        "document_type": "AADHAAR",
        "source_file": pdf_path.name,
        "extracted_fields": extracted_fields,
        "validation": {
            "masked_number_detected": bool(aadhaar_number),
            "authenticity_verified": False,
            "note": (
                "Masked Aadhaar information extraction only. "
                "No government authenticity verification performed."
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


def save_aadhaar_extraction(pdf_path, output_path):
    result = extract_aadhaar_details(pdf_path)

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
        / "02_synthetic_aadhaar_masked.pdf"
    )

    output_path = (
        project_root
        / "data"
        / "processed"
        / "bidder_documents"
        / "aadhaar_extracted.json"
    )

    if not input_path.exists():
        raise FileNotFoundError(
            f"Aadhaar document not found: {input_path}"
        )

    result = save_aadhaar_extraction(
        input_path,
        output_path
    )

    print(json.dumps(result, indent=4))
    print(f"\nExtraction saved to: {output_path}")
