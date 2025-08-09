import os
import sys
import json
import io

# Third-party imports
try:
    import pytesseract
    import pandas as pd
    import fitz  # PyMuPDF
    from pdf2image import convert_from_path
    from PIL import Image
except Exception as e:
    # Fail fast with a clear message about missing dependencies
    print(json.dumps({
        "success": False,
        "error": f"Missing Python dependency: {e}",
        "text": ""
    }))
    sys.exit(1)


def _configure_binaries():
    """Configure platform-specific binary paths (Tesseract, Poppler)."""
    # Tesseract
    tess_path = os.environ.get(
        "TESSERACT_PATH",
        r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe" if os.name == "nt" else None,
    )
    if tess_path:
        pytesseract.pytesseract.tesseract_cmd = tess_path

    # Poppler (for pdf2image). Optional; if missing, we'll fall back to PyMuPDF rasterization.
    poppler_path = os.environ.get(
        "POPPLER_PATH",
        r"C:\\Program Files\\poppler-24.02.0\\Library\\bin" if os.name == "nt" else None,
    )
    return poppler_path


def process_file(file_path: str, poppler_path: str | None = None) -> str:
    ext = os.path.splitext(file_path)[-1].lower()
    extracted_text = ""

    if ext in [".jpg", ".jpeg", ".png", ".bmp", ".tiff"]:
        img = Image.open(file_path)
        extracted_text = pytesseract.image_to_string(img)

    elif ext == ".pdf":
        pdf_file = fitz.open(file_path)
        for page_num in range(len(pdf_file)):
            page = pdf_file[page_num]
            text = page.get_text()
            if text and text.strip():
                extracted_text += text + "\n"
            else:
                # If no embedded text, run OCR on the page image.
                try:
                    if poppler_path:
                        images = convert_from_path(file_path, first_page=page_num + 1, last_page=page_num + 1, poppler_path=poppler_path)
                        if images:
                            extracted_text += pytesseract.image_to_string(images[0]) + "\n"
                    else:
                        # Fallback: render the page to a pixmap using PyMuPDF, then OCR
                        pix = page.get_pixmap()
                        img = Image.open(io.BytesIO(pix.tobytes("png")))
                        extracted_text += pytesseract.image_to_string(img) + "\n"
                except Exception:
                    # As a last resort, try PyMuPDF rasterization
                    try:
                        pix = page.get_pixmap()
                        img = Image.open(io.BytesIO(pix.tobytes("png")))
                        extracted_text += pytesseract.image_to_string(img) + "\n"
                    except Exception:
                        pass

    elif ext == ".xlsx":
        df = pd.read_excel(file_path)
        extracted_text = df.to_string(index=False)

    elif ext == ".csv":
        df = pd.read_csv(file_path)
        extracted_text = df.to_string(index=False)

    else:
        raise ValueError(f"Unsupported file type: {ext}")

    return extracted_text.strip()


def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: process_file.py <file_path>",
            "text": ""
        }))
        sys.exit(1)

    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(json.dumps({
            "success": False,
            "error": f"File not found: {file_path}",
            "text": ""
        }))
        sys.exit(1)

    try:
        poppler_path = _configure_binaries()
        text = process_file(file_path, poppler_path)
        print(json.dumps({
            "success": True,
            "error": None,
            "text": text
        }))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e),
            "text": ""
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()
