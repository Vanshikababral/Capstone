from pathlib import Path
import fitz
import pytesseract
from PIL import Image
import pytesseract

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

def extract_text_from_pdf(pdf_path):
    pdf_path = Path(pdf_path)

    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    extracted_pages = []

    with fitz.open(pdf_path) as document:

        for page_number, page in enumerate(document, start=1):

            # First attempt: normal text extraction
            text = page.get_text("text").strip()

            # Fallback: OCR for scanned/image-based pages
            if not text:
                pix = page.get_pixmap(
                    matrix=fitz.Matrix(2, 2),
                    alpha=False
                )

                image = Image.frombytes(
                    "RGB",
                    [pix.width, pix.height],
                    pix.samples
                )

                text = pytesseract.image_to_string(
                    image,
                    config="--psm 6"
                ).strip()

            extracted_pages.append({
                "page": page_number,
                "text": text
            })

    return extracted_pages
