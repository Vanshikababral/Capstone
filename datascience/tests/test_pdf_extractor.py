import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from src.pdf_extractor import extract_text_from_pdf

PROJECT_ROOT = Path(__file__).resolve().parents[1]

TENDER_DIR = PROJECT_ROOT / "data" / "raw" / "tenders"


def main():
    for pdf_path in sorted(TENDER_DIR.glob("*.pdf")):
        print(f"\n{'=' * 60}")
        print(f"File: {pdf_path.name}")
        print("=" * 60)

        pages = extract_text_from_pdf(pdf_path)

        for page in pages:
            print(f"\n--- Page {page['page']} ---")
            print(page["text"][:1500])

        print(f"\nTotal pages extracted: {len(pages)}")


if __name__ == "__main__":
    main()