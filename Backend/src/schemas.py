from pydantic import BaseModel
from typing import Dict, List, Any


class ClaimOutput(BaseModel):
    extractedFields: Dict[str, Any]
    missingFields: List[str]
    recommendedRoute: str
    reasoning: str
