"""Data layer facade: Firebase or local JSON store."""

import os

LOCAL_DEV = os.getenv("LOCAL_DEV", "1") == "1"
_use_local = LOCAL_DEV


def use_local() -> bool:
    return _use_local


def set_use_local(value: bool):
    global _use_local
    _use_local = value


def init_data_layer(credentials_path: str):
    global _use_local
    if LOCAL_DEV and not os.path.exists(credentials_path):
        _use_local = True
        return "local"
    try:
        from services import firebase_service

        firebase_service.init_firebase(credentials_path)
        _use_local = False
        return "firebase"
    except Exception:
        _use_local = True
        return "local"
