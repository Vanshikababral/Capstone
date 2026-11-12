
import json
import re
from pathlib import Path

import fitz
import numpy as np
import pytesseract
from PIL import Image
from pytesseract import Output

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


def clean_text(text):
    return re.sub(r"\s+", " ", text or "").strip()


def normalize_cell_text(text):
    """Repair common word joins produced when OCR reads table cells."""

    text = clean_text(text)
    text = re.sub(r"(?<=[a-z])(?=[A-Z])", " ", text)
    text = re.sub(r"(?<=[A-Z])(?=[A-Z][a-z])", " ", text)
    joined_phrases = {
        "copyof": "copy of",
        "remittancedetails": "remittance details",
        "ofContractor": "of Contractor",
        "Registrationdetails": "Registration details",
        "detailsregarding": "details regarding",
        "classand": "class and",
        "itsrenewal": "its renewal",
        "forcurrent": "for current",
        "andPAN": "and PAN",
        "etc.as": "etc. as",
    }
    for joined, separated in joined_phrases.items():
        text = re.sub(re.escape(joined), separated, text, flags=re.IGNORECASE)
    text = re.sub(r"Fee/Pre\s+Qual", "Fee/PreQual", text, flags=re.IGNORECASE)
    text = re.sub(r"\bBo\s+Q\b", "BoQ", text, flags=re.IGNORECASE)
    return clean_text(text)


def get_ocr_lines(image):
    """Extract OCR words and group them by their visual lines."""

    data = pytesseract.image_to_data(
        image,
        output_type=Output.DICT,
        config="--psm 11"
    )

    lines = {}

    for i, word in enumerate(data["text"]):
        word = clean_text(word)

        if not word:
            continue

        try:
            confidence = float(data["conf"][i])
        except (ValueError, TypeError):
            continue

        if confidence < 25:
            continue

        key = (
            data["block_num"][i],
            data["par_num"][i],
            data["line_num"][i]
        )

        lines.setdefault(key, []).append({
            "text": word,
            "x": data["left"][i],
            "y": data["top"][i],
            "width": data["width"][i],
            "height": data["height"][i]
        })

    result = []

    for words in lines.values():
        words.sort(key=lambda item: item["x"])

        result.append({
            "y": sum(w["y"] for w in words) / len(words),
            "words": words
        })

    return sorted(result, key=lambda item: item["y"])


def extract_grid_rows(image, lines, header_index):
    """Read each ruled cover-table row one cell at a time."""

    header_words = [
        word
        for line in lines[header_index:header_index + 6]
        for word in line["words"]
    ]
    description_word = next(
        (word for word in header_words
         if re.sub(r"[^a-z]", "", word["text"].lower()) == "description"),
        None,
    )
    if not description_word:
        return []

    header_y = description_word["y"]
    first_cover_x = min(
        (word["x"] for word in header_words
         if word["y"] <= header_y + 20
         and re.sub(r"[^a-z]", "", word["text"].lower()) == "cover"),
        default=None,
    )
    if first_cover_x is None:
        return []

    # Bound the table at the next section (or the page footer) so other ruled
    # sections on the tender page cannot be mistaken for cover rows.
    stop_y = image.height
    for line in lines[header_index + 1:]:
        text = " ".join(word["text"] for word in line["words"]).lower()
        if "tender fee details" in text or any("http" in word["text"].lower() for word in line["words"]):
            stop_y = int(line["y"])
            break

    gray = np.asarray(image.convert("L"))
    y0 = max(0, int(header_y - 20))
    y1 = max(y0 + 1, min(gray.shape[0], stop_y))
    x0 = max(0, int(first_cover_x - 150))
    vertical_counts = (gray[y0:y1, x0:] < 100).sum(axis=0)
    threshold = max(300, (y1 - y0) * 0.48)
    vertical_hits = np.flatnonzero(vertical_counts >= threshold) + x0
    vertical_runs = []
    for x in vertical_hits:
        if not vertical_runs or x > vertical_runs[-1][-1] + 2:
            vertical_runs.append([int(x)])
        else:
            vertical_runs[-1].append(int(x))
    verticals = [int(sum(run) / len(run)) for run in vertical_runs]

    left = next(
        (x for x in reversed(verticals)
         if first_cover_x - 100 <= x <= first_cover_x + 20),
        None,
    )
    right = next((x for x in verticals if x >= description_word["x"] + 100), None)
    if left is None or right is None:
        return []
    boundaries = [left] + [x for x in verticals if left < x < right] + [right]
    if len(boundaries) != 5:
        return []

    table_width = right - left
    row_counts = (gray[:, left:right] < 100).sum(axis=1)
    horizontal_hits = np.flatnonzero(row_counts >= table_width * 0.90)
    horizontal_runs = []
    for y in horizontal_hits:
        if not horizontal_runs or y > horizontal_runs[-1][-1] + 3:
            horizontal_runs.append([int(y)])
        else:
            horizontal_runs[-1].append(int(y))
    horizontal_lines = [
        int(sum(run) / len(run))
        for run in horizontal_runs
        if sum(run) / len(run) > header_y + 15
        and sum(run) / len(run) < stop_y
    ]

    rows = []
    for top, bottom in zip(horizontal_lines, horizontal_lines[1:]):
        if bottom - top < 20:
            continue
        cells = []
        for cell_left, cell_right in zip(boundaries, boundaries[1:]):
            crop = image.crop((cell_left + 3, top + 3, cell_right - 3, bottom - 3))
            value = normalize_cell_text(
                pytesseract.image_to_string(crop, config="--psm 6")
            )
            cells.append(value)
        if len(cells) == 4:
            extension = cells[2].lower().replace(" ", "")
            if "pdf" in extension:
                cells[2] = ".pdf"
            elif "xls" in extension or "xis" in extension:
                cells[2] = ".xls"
            if cells[3].upper() == "BOQ":
                cells[3] = "BoQ"
        if len(cells) != 4 or not any(cells):
            continue
        rows.append({
            "number": cells[0],
            "cover": cells[1],
            "type": cells[2],
            "description": cells[3],
        })
    return rows



def find_header(lines):
    """Find table headers even when OCR splits them across lines."""

    for index in range(len(lines)):
        # Combine the current line and next three lines.
        window = lines[index:index + 4]

        all_words = [
            word
            for line in window
            for word in line["words"]
        ]

        text = " ".join(
            word["text"].lower() for word in all_words
        )

        previous_text = " ".join(
            word["text"].lower()
            for line in lines[max(0, index - 2):index]
            for word in line["words"]
        )
        has_cover_no = "cover no" in text or ("cover" in text and "no" in text)
        has_cover = "cover" in text
        has_document_type = "document type" in text
        has_description = "description" in text
        is_eprocure_header = (
            "instrument" in text and "no" in text and has_document_type
            and "cover" in previous_text
        )
        is_eprocure_description_header = (
            has_description and "cover" in previous_text and "instrument" not in text
        )

        if (
            (has_cover_no and has_cover and has_document_type and has_description)
            or is_eprocure_header
            or is_eprocure_description_header
        ):
            return index, all_words

    return None, None



def extract_table_from_page(page, page_number):
    """Extract Cover Details rows using OCR word positions."""

    pix = page.get_pixmap(matrix=fitz.Matrix(3, 3), alpha=False)

    image = Image.frombytes(
        "RGB",
        [pix.width, pix.height],
        pix.samples
    )

    lines = get_ocr_lines(image)

    header_index, header_words = find_header(lines)

    if header_index is None:
        return []

    grid_rows = extract_grid_rows(image, lines, header_index)
    if grid_rows:
        return grid_rows

    # Tesseract commonly splits "Cover No" into two words.
    anchors = {}
    ordered_words = sorted(header_words, key=lambda item: (item["y"], item["x"]))
    normalized = [re.sub(r"[^a-z]", "", word["text"].lower()) for word in ordered_words]

    number_cover_index = None
    for index, value in enumerate(normalized):
        if "cover" in value and "no" in value:
            anchors["number"] = ordered_words[index]["x"]
            number_cover_index = index
            break
        if value == "cover" and index + 1 < len(normalized) and normalized[index + 1] in {"no", "number"}:
            anchors["number"] = ordered_words[index]["x"]
            number_cover_index = index
            break

    for index, word in enumerate(ordered_words):
        value = normalized[index]
        if value == "cover" and index != number_cover_index:
            anchors["cover"] = word["x"]
        elif "document" in value:
            anchors["type"] = word["x"]
        elif "description" in value:
            anchors["description"] = word["x"]

    is_description_only_header = (
        "description" in normalized
        and "instrument" not in normalized
        and "number" not in anchors
    )
    if is_description_only_header:
        description_word = next(
            word for word, value in zip(ordered_words, normalized)
            if value == "description"
        )
        type_word = next(
            (word for line in lines[header_index + 1:] for word in line["words"]
             if "pdf" in word["text"].lower()),
            None,
        )
        if type_word:
            anchors["description"] = description_word["x"]
            anchors["type"] = type_word["x"]
            for line in lines[header_index + 1:]:
                number_word = next(
                    (word for word in line["words"]
                     if word["text"].isdigit() and word["x"] < type_word["x"]),
                    None,
                )
                if number_word:
                    anchors["number"] = number_word["x"]
                    cover_word = next(
                        (word for word in line["words"]
                         if number_word["x"] < word["x"] < type_word["x"] - 30
                         and not word["text"].isdigit()),
                        None,
                    )
                    if cover_word:
                        anchors["cover"] = cover_word["x"]
                    break

    if len(anchors) != 4 and "number" not in anchors:
        # GeM eProcurement tender detail pages use a compact header such as
        # "Instrument Type | No | Document Type". The cover name and document
        # description headers are omitted, though their columns are present.
        no_word = next(
            (word for word, value in zip(ordered_words, normalized) if value in {"no", "number"}),
            None,
        )
        document_word = next(
            (word for word, value in zip(ordered_words, normalized) if value == "document"),
            None,
        )
        if no_word and document_word and "instrument" in " ".join(normalized):
            anchors["number"] = no_word["x"]
            anchors["cover"] = (no_word["x"] + document_word["x"]) / 2
            anchors["type"] = document_word["x"]
            description_x = min(
                (word["x"] for line in lines[header_index + 1:] for word in line["words"]
                 if word["x"] > document_word["x"] + 100),
                default=None,
            )
            if description_x is not None:
                anchors["description"] = description_x

    if len(anchors) != 4:
        return []

    if is_description_only_header and "cover" in anchors:
        description_rows = []
        for line in lines[header_index + 1:]:
            line_text = " ".join(word["text"] for word in line["words"])
            if "tender fee details" in line_text.lower() or any(
                "http" in word["text"].lower() for word in line["words"]
            ):
                break
            words = [
                word["text"] for word in line["words"]
                if word["x"] >= anchors["description"] - 20
            ]
            if words:
                description_rows.append(clean_text(" ".join(words)))

        starts_document = re.compile(
            r"^(?:scanned\b|scan\s+copies\b|tender\s+acceptance\b|"
            r"\[?experience\b|proprietorship\b|copies\b|copy\b|annexure\b)",
            re.IGNORECASE,
        )
        descriptions = []
        current_words = []
        for value in description_rows:
            if starts_document.search(value) and current_words:
                descriptions.append(clean_text(" ".join(current_words)))
                current_words = []
            if value.lower() != "description":
                current_words.append(value)
        if current_words:
            descriptions.append(clean_text(" ".join(current_words)))

        return [{
            "number": "1",
            "cover": next((
                word["text"] for line in lines[header_index + 1:]
                for word in line["words"]
                if word["x"] >= anchors["cover"]
                and word["x"] < anchors["type"] - 30
                and "fee" in word["text"].lower()
            ), ""),
            "type": "pdf",
            "description": description,
        } for description in descriptions if description]

    # The GeM tender summary uses a scanned, vertically wrapped table. Its
    # "Instrument Type | No | Document Type" header omits the Cover and
    # Description labels, and the payment instruments sit in unrelated
    # columns to the left. Parse its right-hand cover table as wrapped text.
    is_eprocure_layout = (
        "instrument" in " ".join(normalized)
        and "number" in anchors
        and "description" in anchors
    )
    if is_eprocure_layout:
        number_x = anchors["number"]
        type_x = anchors["type"]
        description_x = anchors["description"]
        cover_number = ""
        cover_name = ""
        description_lines = []

        for line in lines[header_index + 1:]:
            if any("http" in word["text"].lower() for word in line["words"]):
                break
            for word in line["words"]:
                x = word["x"]
                value = word["text"]
                if x > description_x - 100:
                    description_lines.append((line["y"], value))
                elif number_x - 160 <= x < type_x - 80:
                    if re.fullmatch(r"\d+", value) and not cover_number:
                        cover_number = value
                    elif x >= number_x - 10 and not cover_name and not value.isdigit():
                        cover_name = value

        documents = []
        current_words = []
        for _, value in description_lines:
            normalized_value = value.lower().strip(".,:;|")
            starts_document = normalized_value in {"scanned", "scan", "tender"}
            if starts_document and current_words:
                documents.append(clean_text(" ".join(current_words)))
                current_words = []
            current_words.append(value)
        if current_words:
            documents.append(clean_text(" ".join(current_words)))

        return [{
            "number": cover_number,
            "cover": cover_name,
            "type": "pdf",
            "description": description,
        } for description in documents if description]

    columns = sorted(
        [(x, name) for name, x in anchors.items()]
    )

    boundaries = [
        (columns[i][0] + columns[i + 1][0]) / 2
        for i in range(len(columns) - 1)
    ]

    def get_column(x):
        if x < boundaries[0]:
            return "number"
        if x < boundaries[1]:
            return "cover"
        if x < boundaries[2]:
            return "type"
        return "description"

    rows = []

    for line in lines[header_index + 1:]:
        cells = {
            "number": [],
            "cover": [],
            "type": [],
            "description": []
        }

        for word in line["words"]:
            column = get_column(word["x"])
            cells[column].append(word["text"])

        row = {
            key: clean_text(" ".join(value))
            for key, value in cells.items()
        }

        if any(row.values()):
            rows.append(row)

    return rows


def extract_cover_details(pdf_path):

    pdf_path = Path(pdf_path)

    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    covers = {}
    current_number = ""
    current_cover = ""

    with fitz.open(pdf_path) as document:

        for page_number, page in enumerate(document, start=1):

            rows = extract_table_from_page(page, page_number)

            for row in rows:

                if row["number"]:
                    current_number = row["number"]

                if row["cover"]:
                    current_cover = row["cover"]

                description = row["description"]
                document_type = row["type"]

                if not current_number or not description:
                    continue

                if current_number not in covers:
                    covers[current_number] = {
                        "cover_number": current_number,
                        "cover_name": current_cover,
                        "documents": []
                    }

                # Merge wrapped descriptions into the previous document.
                documents = covers[current_number]["documents"]

                if (
                    not document_type
                    and documents
                ):
                    documents[-1]["description"] += " " + description
                    continue

                documents.append({
                    "document_type": document_type,
                    "description": description,
                    "source_page": page_number
                })

    if not covers:
        raise ValueError(
            "Cover Details could not be extracted. "
            "Check the OCR output and table layout."
        )

    return {
        "file_name": pdf_path.name,
        "covers": list(covers.values())
    }


if __name__ == "__main__":

    project_root = Path(__file__).resolve().parent.parent

    input_dir = project_root / "data" / "raw" / "tenders"
    output_dir = project_root / "data" / "processed"

    output_dir.mkdir(parents=True, exist_ok=True)

    for pdf_path in input_dir.glob("*.pdf"):

        print(f"\nProcessing: {pdf_path.name}")

        result = extract_cover_details(pdf_path)

        output_path = (
            output_dir / f"{pdf_path.stem}_cover_details.json"
        )

        with open(output_path, "w", encoding="utf-8") as file:
            json.dump(result, file, indent=4, ensure_ascii=False)

        print("Covers extracted:", len(result["covers"]))

        for cover in result["covers"]:
            print(
                cover["cover_number"],
                cover["cover_name"],
                "| Documents:",
                len(cover["documents"])
            )

        print("JSON saved:", output_path)
