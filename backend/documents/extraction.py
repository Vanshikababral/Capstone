import json
import logging
from pathlib import Path

from django.conf import settings
from django.utils.module_loading import import_string

from .utils import extract_text_from_pdf

logger = logging.getLogger(__name__)


class ExtractionContractError(ValueError):
    pass


def _validate_result(result):
    if not isinstance(result, dict):
        raise ExtractionContractError("The extractor result must be an object.")

    extracted_fields = result.get("extracted_fields", {})
    validation = result.get("validation", {})
    missing_fields = result.get("missing_fields", [])
    source_pages = result.get("source_pages", [])
    extraction_status = result.get("extraction_status", "REQUIRES_REVIEW")

    if not isinstance(extracted_fields, dict):
        raise ExtractionContractError("extracted_fields must be an object.")
    if not isinstance(validation, dict):
        raise ExtractionContractError("validation must be an object.")
    if not isinstance(missing_fields, list) or not all(
        isinstance(field, str) for field in missing_fields
    ):
        raise ExtractionContractError("missing_fields must be a list of strings.")
    if not isinstance(source_pages, list) or not all(
        isinstance(page, int) and not isinstance(page, bool) and page > 0
        for page in source_pages
    ):
        raise ExtractionContractError("source_pages must contain positive integers.")
    if not isinstance(extraction_status, str) or not extraction_status:
        raise ExtractionContractError("extraction_status must be a non-empty string.")
    document_type = result.get("document_type", "")
    if not isinstance(document_type, str):
        raise ExtractionContractError("document_type must be a string.")

    normalized_result = {
        "schema_version": 1,
        "document_type": document_type,
        "extracted_fields": extracted_fields,
        "validation": validation,
        "missing_fields": missing_fields,
        "extraction_status": extraction_status,
        "source_pages": source_pages,
    }
    try:
        json.dumps(normalized_result)
    except (TypeError, ValueError) as error:
        raise ExtractionContractError(
            "The extractor result must contain JSON-compatible values."
        ) from error
    return normalized_result


def extract_document(file_path, context):
    extractor_path = settings.DATASCIENCE_EXTRACTOR
    if not extractor_path:
        text = extract_text_from_pdf(file_path)
        return {
            "extracted_text": text,
            "extraction_result": {
                "schema_version": 1,
                "document_type": context.get("document_type", ""),
                "extracted_fields": {},
                "validation": {},
                "missing_fields": [],
                "extraction_status": "TEXT_ONLY" if text else "REQUIRES_REVIEW",
                "source_pages": [],
            },
        }

    extractor = import_string(extractor_path)
    if not callable(extractor):
        raise ExtractionContractError(
            "The configured data-science extractor is not callable."
        )

    output = extractor(str(Path(file_path)), context)
    if not isinstance(output, dict):
        raise ExtractionContractError(
            "The data-science extractor must return an object."
        )

    extracted_text = output.get("extracted_text", "")
    if not isinstance(extracted_text, str):
        raise ExtractionContractError("extracted_text must be a string.")

    result = output.get("extraction_result", output)
    normalized_result = _validate_result(result)
    if not normalized_result["document_type"]:
        normalized_result["document_type"] = context.get("document_type", "")

    if not extracted_text and Path(file_path).suffix.lower() == ".pdf":
        extracted_text = extract_text_from_pdf(file_path)

    return {
        "extracted_text": extracted_text,
        "extraction_result": normalized_result,
    }


def process_document(document, document_kind):
    document.processing_status = type(document).ProcessingStatus.PROCESSING
    document.processing_error = ""
    document.save(
        update_fields=["processing_status", "processing_error", "updated_at"]
    )

    requirement = getattr(document, "requirement", None)
    context = {
        "document_kind": document_kind,
        "document_type": getattr(document, "document_type", "TENDER"),
        "title": document.title,
        "original_filename": document.original_filename,
        "requirement": (
            {
                "id": requirement.pk,
                "title": requirement.title,
                "category": requirement.category,
                "description": requirement.description,
                "priority": requirement.priority,
            }
            if requirement
            else None
        ),
    }

    try:
        output = extract_document(document.file.path, context)
        document.extracted_text = output["extracted_text"]
        document.extraction_result = output["extraction_result"]
        document.processing_status = type(document).ProcessingStatus.PROCESSED
    except Exception:
        logger.exception(
            "Document extraction failed for %s document %s",
            document_kind,
            document.pk,
        )
        document.processing_status = type(document).ProcessingStatus.FAILED
        document.processing_error = (
            "Document processing failed. Please try again or contact support."
        )

    document.save(
        update_fields=[
            "extracted_text",
            "extraction_result",
            "processing_status",
            "processing_error",
            "updated_at",
        ]
    )
