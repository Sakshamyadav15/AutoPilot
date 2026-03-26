from bson import ObjectId
from datetime import datetime
from typing import Any, Dict, List, Optional


def serialize_doc(doc: Dict) -> Dict:
    """Convert MongoDB document to JSON-serializable dict."""
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if key == "_id":
            result["id"] = str(value)
        elif isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value
        elif isinstance(value, list):
            result[key] = [
                str(v) if isinstance(v, ObjectId) else v for v in value
            ]
        else:
            result[key] = value
    return result


def serialize_docs(docs: List[Dict]) -> List[Dict]:
    """Convert list of MongoDB documents."""
    return [serialize_doc(doc) for doc in docs]


def to_object_id(id_str: str) -> Optional[ObjectId]:
    """Safely convert string to ObjectId."""
    try:
        return ObjectId(id_str)
    except Exception:
        return None
