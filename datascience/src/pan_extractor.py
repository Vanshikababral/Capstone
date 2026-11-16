import json
import re
from pathlib import Path
from pdf_extractor import extract_text_from_pdf


PAN_PATTERN = re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b")


def extract_pan_details(pdf_path):
    """
    Extract PAN information from a bidder's PAN PDF.
    """

    pages = extract_text_from_pdf(pdf_path)
    full_text = "\n".join(page["text"] for page in pages)

    # Extract PAN number
    pan_match = PAN_PATTERN.search(full_text.upper())
    pan_number = pan_match.group(0) if pan_match else None

    # Extract holder name
    name_match = re.search(
        r"(?:Name of (?:the )?holder|Holder Name|Name)\s*[:\-]?\s*([A-Za-z .'-]+)",
        full_text,
        re.IGNORECASE
    )
    holder_name = name_match.group(1).strip() if name_match else None

    # Extract business name
    business_match = re.search(
        r"(?:Business Name|Name of Business|Entity Name)\s*[:\-]?\s*([A-Za-z0-9 .'-]+)",
        full_text,
        re.IGNORECASE
    )
    business_name = business_match.group(1).strip() if business_match else None

    # Extract date of birth/incorporation
    date_match = re.search(
        r"(?:Date of Birth\s*/\s*Incorporation|"
        r"Date of Birth|Date of Incorporation)"
        r"\s*[:\-]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
        full_text,
        re.IGNORECASE
    )

    date = date_match.group(1) if date_match else None

    extracted_fields = {
        "pan_number": pan_number,
        "holder_name": holder_name,
        "business_name": business_name,
        "date_of_birth_or_incorporation": date
    }

    missing_fields = [
        field for field, value in extracted_fields.items()
        if not value
    ]

    return {
        "document_type": "PAN",
        "source_file": Path(pdf_path).name,
        "extracted_fields": extracted_fields,
        "validation": {
            "pan_format_valid": bool(
                pan_number and PAN_PATTERN.fullmatch(pan_number)
            ),
            "authenticity_verified": False
        },
        "missing_fields": missing_fields,
        "extraction_status": (
            "EXTRACTED" if not missing_fields else "REQUIRES_REVIEW"
        )
    }


def save_pan_extraction(pdf_path, output_path):
    result = extract_pan_details(pdf_path)

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("w", encoding="utf-8") as file:
        json.dump(result, file, indent=4, ensure_ascii=False)

    return result

if __name__ == "__main__":

    project_root = Path(__file__).resolve().parent.parent

    input_path = (
        project_root
        / "data"
        / "raw"
        / "bidder documents"
        / "01_synthetic_pan.pdf"
    )

    output_path = (
        project_root
        / "data"
        / "processed"
        / "bidder_documents"
        / "pan_extracted.json"
    )

    result = save_pan_extraction(input_path, output_path)

    print(json.dumps(result, indent=4))
    print(f"\nExtraction saved to: {output_path}")
