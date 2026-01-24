from typing import Tuple, List, Dict, Any


def route_claim(fields: Dict[str, Any], missing_fields: List[str], inconsistencies: List[str]) -> Tuple[str, str]:
    description = (fields.get("incidentDescription") or "").lower()
    claim_type = (fields.get("claimType") or "").lower()

    # 1) Investigation Flag
    suspicious_words = ["fraud", "inconsistent", "staged"]
    if any(word in description for word in suspicious_words):
        return "Investigation Flag", "Description contains suspicious keywords (fraud/inconsistent/staged)."

    # 2) Specialist Queue
    if "injury" in claim_type:
        return "Specialist Queue", "Claim type indicates injury."

    # 3) Manual review if missing mandatory fields
    if missing_fields:
        return "Manual review", f"Mandatory fields missing: {missing_fields}"

    # 4) Manual review if inconsistencies
    if inconsistencies:
        return "Manual review", f"Inconsistencies detected: {inconsistencies}"

    # 5) Fast-track if estimated damage < 25000
    try:
        dmg = fields.get("estimatedDamage")
        if dmg:
            dmg_int = int(str(dmg).replace(",", ""))
            if dmg_int < 25000:
                return "Fast-track", "Estimated damage is less than 25,000."
    except:
        pass

    return "Standard queue", "Claim does not match fast-track criteria and has no red flags."
