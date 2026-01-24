import json
from pathlib import Path

from src.extractor import load_document
from src.validator import extract_fields, find_missing, find_inconsistencies
from src.router import route_claim
from src.schemas import ClaimOutput


def process_file(file_path: str):
    text = load_document(file_path)

    extracted = extract_fields(text)
    missing = find_missing(extracted)
    inconsistencies = find_inconsistencies(extracted)

    route, reason = route_claim(extracted, missing, inconsistencies)

    output = ClaimOutput(
        extractedFields=extracted,
        missingFields=missing,
        recommendedRoute=route,
        reasoning=reason
    )

    return output.model_dump()


def main():
    input_dir = Path("data")
    output_dir = Path("outputs")
    output_dir.mkdir(exist_ok=True)

    files = list(input_dir.glob("*"))

    if not files:
        print("❌ No FNOL files found in backend/data")
        print("✅ Add sample PDF/TXT files into backend/data and run again.")
        return

    for f in files:
        result = process_file(str(f))
        out_file = output_dir / f"{f.stem}_output.json"
        out_file.write_text(json.dumps(result, indent=2), encoding="utf-8")
        print(f"✅ Processed {f.name} → {out_file.name}")

    print("✅ Completed all FNOL documents.")


if __name__ == "__main__":
    main()
