import re
from typing import Dict, Any, List


MANDATORY_FIELDS = [
    "policyNumber",
    "policyholderName",
    "incidentDate",
    "incidentLocation",
    "incidentDescription",
    "claimType",
    "attachments",
    "initialEstimate",
]


def extract_fields(text: str) -> Dict[str, Any]:
    fields = {}

    def find(pattern, default=None):
        match = re.search(pattern, text, re.IGNORECASE)
        return match.group(1).strip() if match else default

    # Policy Information
    fields["policyNumber"] = find(r"Policy Number[:\s]+([A-Z0-9\-]+)")
    fields["policyholderName"] = find(r"Policyholder Name[:\s]+([A-Za-z ]+)")
    fields["effectiveDates"] = find(r"Effective Dates?[:\s]+(.+)")

    # Incident Information
    fields["incidentDate"] = find(r"Date of Incident[:\s]+([0-9\/\-]+)")
    fields["incidentTime"] = find(r"Time of Incident[:\s]+([0-9:\sAPMapm]+)")
    fields["incidentLocation"] = find(r"Location[:\s]+(.+)")
    fields["incidentDescription"] = find(r"Description[:\s]+(.+)")

    # Involved Parties
    fields["claimant"] = find(r"Claimant[:\s]+([A-Za-z ]+)")
    fields["thirdParties"] = find(r"Third Parties[:\s]+(.+)")
    fields["contactDetails"] = find(r"Contact[:\s]+(.+)")

    # Asset Details
    fields["assetType"] = find(r"Asset Type[:\s]+(.+)")
    fields["assetId"] = find(r"Asset ID[:\s]+([A-Z0-9\-]+)")
    fields["estimatedDamage"] = find(r"Estimated Damage[:\s]+₹?([\d,]+)")

    # Other Mandatory Fields
    fields["claimType"] = find(r"Claim Type[:\s]+(.+)")
    fields["attachments"] = find(r"Attachments[:\s]+(.+)")
    fields["initialEstimate"] = find(r"Initial Estimate[:\s]+₹?([\d,]+)")

    return fields


def find_missing(fields: Dict[str, Any]) -> List[str]:
    missing = []
    for f in MANDATORY_FIELDS:
        value = fields.get(f)
        if value is None or str(value).strip() == "":
            missing.append(f)
    return missing


def find_inconsistencies(fields: Dict[str, Any]) -> List[str]:
    issues = []

    # Simple example inconsistency check
    try:
        est_damage = fields.get("estimatedDamage")
        init_est = fields.get("initialEstimate")

        if est_damage and init_est:
            est_damage_int = int(str(est_damage).replace(",", ""))
            init_est_int = int(str(init_est).replace(",", ""))

            if init_est_int > est_damage_int:
                issues.append("Initial estimate is greater than estimated damage")
    except:
        pass

    return issues
