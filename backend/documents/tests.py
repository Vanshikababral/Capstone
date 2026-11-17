from unittest.mock import patch

from django.test import SimpleTestCase, override_settings

from .extraction import ExtractionContractError, extract_document


class DocumentExtractionAdapterTests(SimpleTestCase):
    @patch("documents.extraction.extract_text_from_pdf", return_value="PDF text")
    @override_settings(DATASCIENCE_EXTRACTOR="")
    def test_uses_text_extraction_when_provider_is_not_configured(
        self, extract_text
    ):
        output = extract_document("bid.pdf", {"document_type": "FINANCIAL"})

        self.assertEqual(output["extracted_text"], "PDF text")
        self.assertEqual(
            output["extraction_result"]["extraction_status"],
            "TEXT_ONLY",
        )
        extract_text.assert_called_once_with("bid.pdf")

    @patch("documents.extraction.import_string")
    @override_settings(DATASCIENCE_EXTRACTOR="datascience.pipeline.extract")
    def test_normalizes_colleague_extractor_output(self, import_string):
        provider = import_string.return_value
        provider.return_value = {
            "document_type": "GST",
            "extracted_text": "GST certificate text",
            "extracted_fields": {"gstin": "03ABCDE1234F1Z5"},
            "validation": {"gstin_format_valid": True},
            "missing_fields": [],
            "extraction_status": "EXTRACTED",
            "source_pages": [1],
        }

        context = {"document_type": "CERTIFICATION"}
        output = extract_document("gst.pdf", context)

        import_string.assert_called_once_with("datascience.pipeline.extract")
        provider.assert_called_once_with("gst.pdf", context)
        self.assertEqual(output["extracted_text"], "GST certificate text")
        self.assertEqual(output["extraction_result"]["schema_version"], 1)
        self.assertEqual(
            output["extraction_result"]["extracted_fields"]["gstin"],
            "03ABCDE1234F1Z5",
        )

    @patch("documents.extraction.import_string")
    @override_settings(DATASCIENCE_EXTRACTOR="datascience.pipeline.extract")
    def test_rejects_malformed_extractor_output(self, import_string):
        import_string.return_value.return_value = {
            "extracted_text": "",
            "extracted_fields": {"gstin": "value"},
            "missing_fields": "gstin",
        }

        with self.assertRaises(ExtractionContractError):
            extract_document("gst.pdf", {"document_type": "CERTIFICATION"})
