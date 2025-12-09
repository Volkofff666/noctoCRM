#!/usr/bin/env python3
import sys
import getpass
from app.database import SessionLocal
from app.models.user import User
from app.auth import get_password_hash

def create_admin():
    db = SessionLocal()
    
    print("\n=== noctoCRM - Создание администратора ===")
    
    existing_admin = db.query(User).filter(User.role == "admin").first()
    if existing_admin:
        print(f"\nWARNING: Админ уже существует: {existing_admin.username}")
        response = input("Создать еще одного? (y/n): ")
        if response.lower() != 'y':
            print("Cancelled")
            return
    
    email = input("\nEmail: ").strip()
    if not email:
        print("ERROR: Email required")
        return
    
    username = input("Username: ").strip()
    if not username:
        print("ERROR: Username required")
        return
    
    full_name = input("Full name: ").strip()
    if not full_name:
        print("ERROR: Full name required")
        return
    
    password = getpass.getpass("Password: ")
    if not password or len(password) < 6:
        print("ERROR: Password must be at least 6 characters")
        return
    
    password_confirm = getpass.getpass("Confirm password: ")
    if password != password_confirm:
        print("ERROR: Passwords don't match")
        return
    
    existing = db.query(User).filter(
        (User.email == email) | (User.username == username)
    ).first()
    
    if existing:
        print("ERROR: User with this email or username already exists")
        return
    
    admin = User(
        email=email,
        username=username,
        full_name=full_name,
        hashed_password=get_password_hash(password),
        role="admin",
        is_active=True
    )
    
    db.add(admin)
    db.commit()
    db.refresh(admin)
    
    print("\nSUCCESS: Admin created!")
    print(f"ID: {admin.id}")
    print(f"Email: {admin.email}")
    print(f"Username: {admin.username}")
    print(f"Role: {admin.role}")
    
    db.close()

if __name__ == "__main__":
    try:
        create_admin()
    except KeyboardInterrupt:
        print("\n\nCancelled")
        sys.exit(0)
    except Exception as e:
        print(f"\nERROR: {e}")
        sys.exit(1)
