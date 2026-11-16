
import json
import re
from pathlib import Path

try:
    from src.pdf_extractor import extract_text_from_pdf
except ImportError:
    from pdf_extractor import extract_text_from_pdf


# Standard GSTIN structure: 15 characters
GSTIN_PATTERN = re.compile(
    r"\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]\b",
    re.IGNORECASE
)


def clean_value(value):
    """Normalize extracted text."""
    return re.sub(r"\s+", " ", value or "").strip(" \t:|-")


def extract_field(text, labels):
    """
    Extract a field value appearing after a given label.
    Supports labels followed by values on the same line.
    """
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


def extract_gstin(text):
    """Extract GSTIN and perform basic format validation."""
    match = GSTIN_PATTERN.search(text.upper())
    return match.group(0).upper() if match else None


def extract_gst_details(pdf_path):
    """
    Extract structured information from a GST registration PDF.

    Note: This module performs text extraction and basic format
    validation. It does not authenticate the GST registration.
    """

    pdf_path = Path(pdf_path)

    pages = extract_text_from_pdf(pdf_path)
    full_text = "\n".join(
        page.get("text", "") for page in pages
    )

    gstin = extract_gstin(full_text)

    legal_name = extract_field(
        full_text,
        [
            r"Legal Name of Business",
            r"Legal Name",
            r"Name of Business"
        ]
    )

    trade_name = extract_field(
        full_text,
        [
            r"Trade Name",
            r"Trade Name, if any"
        ]
    )

    registration_date = extract_field(
        full_text,
        [
            r"Date of Registration",
            r"Effective Date of Registration",
            r"Registration Date"
        ]
    )

    constitution = extract_field(
        full_text,
        [
            r"Constitution of Business",
            r"Constitution of Business"
        ]
    )

    principal_address = extract_field(
        full_text,
        [
            r"Principal Place of Business",
            r"Principal Address",
            r"Address of Principal Place of Business"
        ]
    )

    extracted_fields = {
        "gstin": gstin,
        "legal_name": legal_name,
        "trade_name": trade_name,
        "registration_date": registration_date,
        "constitution_of_business": constitution,
        "principal_place_of_business": principal_address
    }

    missing_fields = [
        field
        for field, value in extracted_fields.items()
        if not value
    ]

    return {
        "document_type": "GST_REGISTRATION_CERTIFICATE",
        "source_file": pdf_path.name,
        "extracted_fields": extracted_fields,
        "validation": {
            "gstin_format_valid": bool(
                gstin and GSTIN_PATTERN.fullmatch(gstin)
            ),
            "authenticity_verified": False,
            "note": (
                "GSTIN format validation only. "
                "Registration authenticity has not been verified "
                "against an authorized GST database."
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


def save_gst_extraction(pdf_path, output_path):
    """Extract GST details and save them as JSON."""

    result = extract_gst_details(pdf_path)

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
        / "03_synthetic_gst.pdf"
    )

    output_path = (
        project_root
        / "data"
        / "processed"
        / "bidder_documents"
        / "gst_extracted.json"
    )

    if not input_path.exists():
        raise FileNotFoundError(
            f"GST document not found: {input_path}"
        )

    result = save_gst_extraction(
        input_path,
        output_path
    )

    print(json.dumps(result, indent=4))
    print(f"\nExtraction saved to: {output_path}")
