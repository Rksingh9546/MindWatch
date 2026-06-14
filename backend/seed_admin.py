"""Seed demo admin user for local development."""
from services.local_store import create_local_user, get_user_profile

try:
    if not any(
        u.get("email") == "ranjankum95080@gmail.com"
        for u in __import__("services.local_store", fromlist=[""])._users.values()
    ):
        create_local_user(
            "ranjankum95080@gmail.com",
            "123456",
            "Ranjan Kumar"
        )
        print("Admin user created")
except Exception as e:
    print(e)
