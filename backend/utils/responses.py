import math
from datetime import date, datetime

import numpy as np
import pandas as pd
from flask import jsonify


def clean_for_json(value):
    """Recursively converts numpy/pandas values into plain JSON-safe types.

    pandas/numpy scalars (np.int64, np.float64, pd.Timestamp, NaN, ...)
    aren't JSON-serializable by default and NaN/Inf break strict JSON
    parsers, so every response payload is passed through this first.
    """
    if isinstance(value, dict):
        return {str(k): clean_for_json(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [clean_for_json(v) for v in value]
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        f = float(value)
        return None if (math.isnan(f) or math.isinf(f)) else f
    if isinstance(value, float):
        return None if (math.isnan(value) or math.isinf(value)) else value
    if isinstance(value, np.bool_):
        return bool(value)
    if isinstance(value, np.ndarray):
        return clean_for_json(value.tolist())
    if isinstance(value, (pd.Timestamp, datetime, date)):
        return value.isoformat()
    if isinstance(value, pd.Series):
        return clean_for_json(value.to_dict())
    if value is None:
        return None
    try:
        if pd.isna(value):
            return None
    except (TypeError, ValueError):
        pass
    return value


def ok(data=None, status=200, **extra):
    payload = {"success": True}
    if data is not None:
        payload["data"] = clean_for_json(data)
    payload.update(clean_for_json(extra))
    return jsonify(payload), status


def error(message, status=400, code=None, **extra):
    payload = {"success": False, "error": {"message": message}}
    if code:
        payload["error"]["code"] = code
    if extra:
        payload["error"].update(clean_for_json(extra))
    return jsonify(payload), status
