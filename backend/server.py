from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import jwt
import random
import requests

def send_otp_email(to_email, otp):
    url = "https://control.msg91.com/api/v5/email/send"


    headers = {
        "authkey": os.getenv("MSG91_AUTH_KEY"),
        "Content-Type": "application/json"
    }

    payload = {
        "to": [
            {
                "email": user_email,
                "name": "Admin"
            }
        ],
        "from": {
            "email": "hello@kredyble.com",
            "name": "Kredyble"
        },
        "domain": "kredyble.com",
        "mail_type_id": "admin_password_2",
        "variables": {
            "OTP": otp
        }
    }

    response = requests.post(url, headers=headers, json=payload)
    print("MSG91 RESPONSE:", response.text)


def generate_otp():
    return str(random.randint(100000, 999999))


def send_otp_email(to_email, otp):
    url = "https://control.msg91.com/api/v5/email/send"

    headers = {
        "authkey": "468144AyiRgR3xVK6s698c1622P1",
        "Content-Type": "application/json"
    }

    payload = {
        "to": [
            {
                "email": to_email,
                "name": "Admin"
            }
        ],
        "from": {
            "email": "admin@kredyble.com",
            "name": "Kredyble"
        },
        "domain": "kredyble.com",
        "mail_type_id": "admin_password_2",
        "variables": {
            "OTP": otp
        }
    }

    response = requests.post(url, headers=headers, json=payload)
    print("MSG91 RESPONSE:", response.text)

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
from dotenv import load_dotenv
import os

load_dotenv()

JWT_SECRET = os.environ.get('JWT_SECRET')

if not JWT_SECRET:
    raise ValueError("JWT_SECRET is not set. Please configure it in .env file")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI(
    root_path="/proxy/8000"
)
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: dict

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str

# ==================== AUTH HELPERS ====================

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== MOCK DATA GENERATORS ====================

def generate_transaction_id():
    return f"TXN{random.randint(100000, 999999)}"

def generate_user_names():
    return random.choice([
        "Rahul Sharma", "Priya Patel", "Amit Kumar", "Sneha Gupta",
        "Vikram Singh", "Anita Desai", "Rajesh Verma", "Meera Nair"
    ])

def generate_company_names():
    return random.choice([
        "TechCorp Solutions", "Global Traders Ltd", "InnovateTech Pvt",
        "Prime Logistics", "CloudServe India", "Digital Ventures"
    ])

def generate_status():
    return random.choice(["completed", "pending", "failed", "processing"])

def generate_mock_transactions(count: int = 50):
    transactions = []
    card_types = ["retail", "business", "corporate"]
    for i in range(count):
        base_amount = random.randint(5000, 500000)
        platform_fee = round(base_amount * 0.02, 2)
        gst_collected = round(platform_fee * 0.18, 2)
        pg_fee = round(base_amount * 0.018, 2)
        pg_gst = round(pg_fee * 0.18, 2)
        total_charged = base_amount + platform_fee + gst_collected
        net_revenue = platform_fee - pg_fee
        txn_type = random.choice(["vendor", "link"])
        
        # Payment mode based on type
        if txn_type == "vendor":
            payment_mode = "card"
            card_type = random.choice(card_types)
        else:
            payment_mode = random.choice(["upi", "credit_card", "debit_card", "netbanking"])
            card_type = random.choice(card_types) if payment_mode in ["credit_card", "debit_card"] else None
        
        transactions.append({
            "id": generate_transaction_id(),
            "user": generate_user_names(),
            "user_email": f"user{i}@example.com",
            "type": txn_type,
            "base_amount": base_amount,
            "platform_fee": platform_fee,
            "gst_collected": gst_collected,
            "pg_fee": pg_fee,
            "pg_gst": pg_gst,
            "total_charged": total_charged,
            "net_revenue": net_revenue,
            "net_cash_balance": base_amount - pg_fee - pg_gst,
            "status": generate_status(),
            "beneficiary": generate_company_names(),
            "date": (datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30))).isoformat(),
            "payment_mode": payment_mode,
            "card_type": card_type,
            "card_last_four": f"{random.randint(1000, 9999)}" if payment_mode in ["card", "credit_card", "debit_card"] else None,
            "card_network": random.choice(["Visa", "Mastercard", "Rupay", "Amex"]) if payment_mode in ["card", "credit_card", "debit_card"] else None,
            "upi_id": f"user{i}@upi" if payment_mode == "upi" else None,
            "bank_name": random.choice(["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank"]) if payment_mode == "netbanking" else None
        })
    return sorted(transactions, key=lambda x: x['date'], reverse=True)

def generate_mock_payouts(count: int = 30):
    payouts = []
    statuses = ["completed", "processing", "failed"]
    for i in range(count):
        amount = random.randint(10000, 300000)
        payouts.append({
            "id": f"PAY{random.randint(100000, 999999)}",
            "beneficiary": generate_company_names(),
            "amount": amount,
            "linked_transaction": generate_transaction_id(),
            "status": random.choice(statuses),
            "date": (datetime.now(timezone.utc) - timedelta(days=random.randint(0, 20))).isoformat(),
            "account_number": f"****{random.randint(1000, 9999)}",
            "ifsc": f"HDFC000{random.randint(100, 999)}"
        })
    return sorted(payouts, key=lambda x: x['date'], reverse=True)

def generate_mock_payment_links(count: int = 25):
    links = []
    payment_modes = ["upi", "credit_card", "debit_card", "netbanking"]
    card_types = ["retail", "business", "corporate"]
    
    for i in range(count):
        amount_requested = random.randint(1000, 100000)
        status = random.choice(["paid", "pending", "expired", "partial"])
        amount_paid = amount_requested if status == "paid" else (random.randint(100, amount_requested) if status == "partial" else 0)
        payment_mode = random.choice(payment_modes) if status in ["paid", "partial"] else None
        
        links.append({
            "id": f"LINK{random.randint(100000, 999999)}",
            "customer": generate_user_names(),
            "customer_email": f"customer{i}@example.com",
            "customer_phone": f"+91 {random.randint(70000, 99999)} {random.randint(10000, 99999)}",
            "amount_requested": amount_requested,
            "amount_paid": amount_paid,
            "status": status,
            "attempts": random.randint(0, 5),
            "payment_mode": payment_mode,
            "card_type": random.choice(card_types) if payment_mode in ["credit_card", "debit_card"] else None,
            "card_network": random.choice(["Visa", "Mastercard", "Rupay", "Amex"]) if payment_mode in ["credit_card", "debit_card"] else None,
            "card_last_four": f"{random.randint(1000, 9999)}" if payment_mode in ["credit_card", "debit_card"] else None,
            "upi_id": f"customer{i}@upi" if payment_mode == "upi" else None,
            "bank_name": random.choice(["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank"]) if payment_mode == "netbanking" else None,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(0, 15))).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=random.randint(1, 7))).isoformat(),
            "paid_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(0, 5))).isoformat() if status in ["paid", "partial"] else None,
            "link_url": f"https://pay.kredyble.com/l/{uuid.uuid4().hex[:8]}",
            "timeline": [
                {"event": "created", "timestamp": (datetime.now(timezone.utc) - timedelta(days=random.randint(5, 15))).isoformat()},
                {"event": "viewed", "timestamp": (datetime.now(timezone.utc) - timedelta(days=random.randint(2, 4))).isoformat()},
                {"event": "attempted", "timestamp": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 2))).isoformat()},
            ],
            "failure_reasons": [
                {"reason": "Card declined", "count": random.randint(0, 2)},
                {"reason": "Insufficient funds", "count": random.randint(0, 1)},
                {"reason": "Bank timeout", "count": random.randint(0, 1)}
            ] if status != "paid" else []
        })
    return links

def generate_mock_users(count: int = 20):
    users = []
    statuses = ["active", "pending_kyb", "suspended", "verified"]
    approval_statuses = ["pending_approval", "approved", "rejected"]
    business_types = ["proprietorship", "partnership", "pvt_ltd", "llp"]
    
    for i in range(count):
        is_first_time = random.choice([True, False])
        business_type = random.choice(business_types)
        
        # Base documents for all business types
        base_documents = [
            {
                "type": "gst_certificate",
                "label": "GST Certificate",
                "status": random.choice(["pending", "approved", "rejected"]),
                "submitted_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))).isoformat(),
                "rejection_reason": "GST number mismatch" if random.random() > 0.8 else None,
                "file_url": f"https://storage.kredyble.com/docs/gst_{i}.pdf"
            },
            {
                "type": "aadhar_card",
                "label": "Aadhar Card",
                "status": random.choice(["pending", "approved", "rejected"]),
                "submitted_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))).isoformat(),
                "rejection_reason": "Aadhar not clear" if random.random() > 0.85 else None,
                "file_url": f"https://storage.kredyble.com/docs/aadhar_{i}.pdf"
            },
            {
                "type": "pan_card",
                "label": "PAN Card",
                "status": random.choice(["pending", "approved", "rejected"]),
                "submitted_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))).isoformat(),
                "rejection_reason": "PAN details mismatch" if random.random() > 0.85 else None,
                "file_url": f"https://storage.kredyble.com/docs/pan_{i}.pdf"
            },
            {
                "type": "bank_account",
                "label": "Bank Account Statement",
                "status": random.choice(["pending", "approved", "rejected"]),
                "submitted_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))).isoformat(),
                "rejection_reason": "Statement older than 3 months" if random.random() > 0.9 else None,
                "file_url": f"https://storage.kredyble.com/docs/bank_{i}.pdf"
            }
        ]
        
        # Additional documents based on business type
        if business_type == "partnership":
            base_documents.append({
                "type": "partnership_deed",
                "label": "Partnership Deed",
                "status": random.choice(["pending", "approved", "rejected"]),
                "submitted_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))).isoformat(),
                "rejection_reason": "Deed not notarized" if random.random() > 0.85 else None,
                "file_url": f"https://storage.kredyble.com/docs/deed_{i}.pdf"
            })
        elif business_type in ["pvt_ltd", "llp"]:
            base_documents.append({
                "type": "cin_number",
                "label": "CIN Certificate",
                "status": random.choice(["pending", "approved", "rejected"]),
                "submitted_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))).isoformat(),
                "rejection_reason": "CIN not matching MCA records" if random.random() > 0.85 else None,
                "file_url": f"https://storage.kredyble.com/docs/cin_{i}.pdf"
            })
        
        # Generate proprietor/director details
        num_proprietors = 1 if business_type == "proprietorship" else random.randint(2, 4)
        proprietors = []
        for p in range(num_proprietors):
            proprietors.append({
                "name": generate_user_names(),
                "designation": "Proprietor" if business_type == "proprietorship" else ("Partner" if business_type == "partnership" else "Director"),
                "aadhar_verified": random.choice([True, False]),
                "pan_verified": random.choice([True, False]),
                "din_number": f"DIN{random.randint(10000000, 99999999)}" if business_type in ["pvt_ltd", "llp"] else None
            })
        
        users.append({
            "id": f"USR{random.randint(100000, 999999)}",
            "name": generate_user_names(),
            "email": f"user{i}@example.com",
            "phone": f"+91 {random.randint(70000, 99999)} {random.randint(10000, 99999)}",
            "business_name": generate_company_names(),
            "business_type": business_type,
            "status": random.choice(statuses),
            "kyb_status": random.choice(["verified", "pending", "rejected", "not_submitted"]),
            "approval_status": random.choice(approval_statuses) if is_first_time else "approved",
            "is_first_time_user": is_first_time,
            "total_transactions": random.randint(5, 200),
            "total_volume": random.randint(50000, 5000000),
            "membership": random.choice(["standard", "premium", "enterprise", None]),
            "joined_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(30, 365))).isoformat(),
            "linked_cards": random.randint(0, 4),
            "documents": base_documents,
            "proprietors": proprietors,
            "last_active": (datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 720))).isoformat(),
            "drop_off_stage": random.choice([None, "registration", "kyb_upload", "kyb_verification", "first_transaction", "payment_setup"]) if random.random() > 0.6 else None,
            "last_error": random.choice([None, "KYB_UPLOAD_FAILED", "PAYMENT_DECLINED", "SESSION_TIMEOUT", "DOCUMENT_REJECTED", "VERIFICATION_FAILED"]) if random.random() > 0.5 else None
        })
    return users

def generate_mock_beneficiaries(count: int = 15):
    beneficiaries = []
    for i in range(count):
        state_code = random.choice(["27", "29", "06", "09", "33"])  # MH, KA, HR, UP, TN
        beneficiaries.append({
            "id": f"BEN{random.randint(100000, 999999)}",
            "name": generate_company_names(),
            "gst_number": f"{state_code}{''.join([str(random.randint(0,9)) for _ in range(5)])}{''.join([chr(random.randint(65,90)) for _ in range(4)])}{random.randint(1,9)}Z{random.randint(1,9)}",
            "pan_number": f"{''.join([chr(random.randint(65,90)) for _ in range(5)])}{random.randint(1000,9999)}{''.join([chr(random.randint(65,90)) for _ in range(1)])}",
            "account_number": f"****{random.randint(1000, 9999)}",
            "ifsc": f"HDFC000{random.randint(100, 999)}",
            "bank_name": random.choice(["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank"]),
            "total_received": random.randint(100000, 2000000),
            "transactions_count": random.randint(10, 100),
            "status": random.choice(["active", "inactive"]),
            "added_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(10, 180))).isoformat()
        })
    return beneficiaries

def generate_mock_memberships(count: int = 15):
    plans = [
        {"type": "standard", "fee_percent": 2.0},
        {"type": "premium", "fee_percent": 1.5},
        {"type": "enterprise", "fee_percent": 1.0}
    ]
    memberships = []
    for i in range(count):
        plan = random.choice(plans)
        start_date = datetime.now(timezone.utc) - timedelta(days=random.randint(30, 180))
        memberships.append({
            "id": f"MEM{random.randint(100000, 999999)}",
            "user": generate_user_names(),
            "user_id": f"USR{random.randint(100000, 999999)}",
            "plan_type": plan["type"],
            "fee_percent": plan["fee_percent"],
            "start_date": start_date.isoformat(),
            "expiry_date": (start_date + timedelta(days=365)).isoformat(),
            "status": random.choice(["active", "expired", "cancelled"]),
            "benefits": ["Lower transaction fees", "Priority support", "Detailed analytics"]
        })
    return memberships

def generate_mock_offers():
    return [
        {
            "id": "OFF001",
            "name": "Standard Plan",
            "description": "Default pricing for all users",
            "fee_percent": 2.0,
            "is_active": True,
            "users_count": 156,
            "revenue_generated": 2450000,
            "revenue_forgone": 0
        },
        {
            "id": "OFF002",
            "name": "Launch Promo",
            "description": "Zero fees for first month",
            "fee_percent": 0,
            "is_active": True,
            "users_count": 45,
            "revenue_generated": 0,
            "revenue_forgone": 89000
        },
        {
            "id": "OFF003",
            "name": "Enterprise Discount",
            "description": "Reduced fees for high volume",
            "fee_percent": 1.0,
            "is_active": True,
            "users_count": 12,
            "revenue_generated": 1200000,
            "revenue_forgone": 600000
        },
        {
            "id": "OFF004",
            "name": "Festival Special",
            "description": "50% off during festivals",
            "fee_percent": 1.0,
            "is_active": False,
            "users_count": 0,
            "revenue_generated": 0,
            "revenue_forgone": 0
        }
    ]

def generate_mock_risk_alerts(count: int = 10):
    alert_types = [
        {"type": "suspicious", "severity": "high", "reason": "Unusual transaction pattern detected"},
        {"type": "repeated_failure", "severity": "medium", "reason": "Multiple failed payment attempts"},
        {"type": "high_value", "severity": "low", "reason": "Transaction exceeds normal threshold"},
        {"type": "velocity", "severity": "high", "reason": "Too many transactions in short time"},
        {"type": "new_beneficiary", "severity": "medium", "reason": "First payment to new beneficiary"}
    ]
    alerts = []
    for i in range(count):
        alert = random.choice(alert_types)
        alerts.append({
            "id": f"ALERT{random.randint(100000, 999999)}",
            "transaction_id": generate_transaction_id(),
            "user": generate_user_names(),
            "type": alert["type"],
            "severity": alert["severity"],
            "reason": alert["reason"],
            "amount": random.randint(10000, 500000),
            "status": random.choice(["pending", "reviewed", "cleared", "blocked"]),
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 72))).isoformat()
        })
    return sorted(alerts, key=lambda x: x['created_at'], reverse=True)

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):

    email = request.email.strip().lower()

    # Find user in DB
    user = await db.users.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Check password
    if not verify_password(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Generate token
    user_id = str(user["_id"])
    token = create_token(user_id, email)

    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": user["email"],
            "name": email.split("@")[0].title(),
            "role": user.get("role", "admin")
        }
    }
from pydantic import BaseModel

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    
@api_router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
   
    # check if user exists
    user = await db.users.find_one({"email": data.email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 2. Generate OTP
    otp = generate_otp()
    expiry = datetime.utcnow() + timedelta(minutes=10)

    # 3. Store OTP in DB
    await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "otp": otp,
                "otp_expiry": expiry
            }
        }
    )

    # 4. Send OTP via MSG91
    send_otp_email(email, otp)
    
    print("OTP:", otp)

    return {"message": "OTP sent successfully"}
    
    token = jwt.encode(
        {
            "email": data.email,
            "exp": datetime.utcnow() + timedelta(minutes=15)
        },
        JWT_SECRET,
        algorithm="HS256"
    )

    reset_link = f"https://admin.kredyble.com/reset-password?token={token}"

    print("RESET LINK:", reset_link)

    return {"message": "Reset link generated", "link": reset_link}    
@api_router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordRequest):
    try:
        payload = jwt.decode(data.token, JWT_SECRET, algorithms=["HS256"])
        email = payload["email"].strip().lower()

        # DEBUG
        print("RESET EMAIL:", email)

        # UPDATE
        result = await db.users.update_one(
            {"email": email},
            {"$set": {"password": hash_password(data.new_password)}}
        )

        print("MATCHED:", result.matched_count)
        print("MODIFIED:", result.modified_count)

        # VERIFY AFTER UPDATE
        user = await db.users.find_one({"email": email})
        print("DB AFTER UPDATE:", user)

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return {"message": "Password reset successful"}

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Token expired")

    except:
        raise HTTPException(status_code=400, detail="Invalid token")
    
@api_router.get("/auth/verify")
async def verify_auth(payload: dict = Depends(verify_token)):
    return {"valid": True, "user": payload}

# ==================== DASHBOARD ENDPOINTS ====================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    return {
        "total_collected": 15789234,
        "vendor_payments_collected": 8500000,
        "links_collected": 7289234,
        "vendor_payouts": 12456000,
        "platform_revenue": 315784,
        "pg_charges": 284205,
        "net_profit": 31579,
        "gst_payable": 56841,
        "total_transactions": 1247,
        "active_users": 342,
        "pending_settlements": 2345000
    }

@api_router.get("/dashboard/charts/volume")
async def get_volume_chart():
    # Generate 30 days of mock data
    data = []
    for i in range(30):
        date = datetime.now(timezone.utc) - timedelta(days=29-i)
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "vendor": random.randint(100000, 800000),
            "links": random.randint(50000, 400000)
        })
    return data

@api_router.get("/dashboard/charts/revenue")
async def get_revenue_chart():
    data = []
    for i in range(30):
        date = datetime.now(timezone.utc) - timedelta(days=29-i)
        revenue = random.randint(8000, 15000)
        pg_cost = random.randint(6000, 12000)
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "revenue": revenue,
            "pg_cost": pg_cost,
            "net": revenue - pg_cost
        })
    return data

# ==================== COLLECTIONS & FLOW ENDPOINTS ====================

@api_router.get("/collections/stats")
async def get_collections_stats():
    return {
        "gross_collected": 15789234,
        "vendor_paid": 12456000,
        "pending_pg": 1234567,
        "in_settlement": 890123,
        "net_revenue": 315784,
        "gst_liability": 56841
    }

@api_router.get("/collections/flow")
async def get_collections_flow():
    return {
        "vendor_flow": {
            "user_paid": 8500000,
            "pg_received": 8500000,
            "platform_collected": 170000,
            "vendor_paid": 8330000
        },
        "link_flow": {
            "user_paid": 7289234,
            "pg_received": 7289234,
            "platform_collected": 145784,
            "vendor_paid": 7143450
        }
    }

# ==================== TRANSACTIONS ENDPOINTS ====================

@api_router.get("/transactions")
async def get_transactions(
    page: int = 1,
    limit: int = 20,
    status: Optional[str] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    card_type: Optional[str] = None,
    payment_mode: Optional[str] = None
):
    all_transactions = generate_mock_transactions(100)
    
    if status and status != 'all':
        all_transactions = [t for t in all_transactions if t["status"] == status]
    if type and type != 'all':
        all_transactions = [t for t in all_transactions if t["type"] == type]
    if card_type and card_type != 'all':
        all_transactions = [t for t in all_transactions if t.get("card_type") == card_type]
    if payment_mode and payment_mode != 'all':
        all_transactions = [t for t in all_transactions if t.get("payment_mode") == payment_mode]
    if search:
        search_lower = search.lower().strip()
        filtered = []
        for t in all_transactions:
            # Text search
            if (search_lower in t["id"].lower() or 
                search_lower in t["user"].lower() or
                search_lower in t.get("beneficiary", "").lower() or
                search_lower in t.get("user_email", "").lower()):
                filtered.append(t)
                continue
            # Amount search - try to match numbers
            try:
                search_amount = float(search_lower.replace(',', '').replace('₹', ''))
                if (t["base_amount"] == search_amount or
                    t["total_charged"] == search_amount or
                    t["platform_fee"] == search_amount or
                    t["gst_collected"] == search_amount or
                    t["pg_fee"] == search_amount or
                    t["net_revenue"] == search_amount or
                    # Partial match - amount contains the search number
                    str(int(t["base_amount"])).startswith(str(int(search_amount))) or
                    str(int(t["total_charged"])).startswith(str(int(search_amount)))):
                    filtered.append(t)
            except (ValueError, TypeError):
                pass
        all_transactions = filtered
    if start_date:
        all_transactions = [t for t in all_transactions if t["date"] >= start_date]
    if end_date:
        all_transactions = [t for t in all_transactions if t["date"] <= end_date]
    
    total = len(all_transactions)
    start = (page - 1) * limit
    end = start + limit
    
    return {
        "transactions": all_transactions[start:end],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@api_router.get("/transactions/{transaction_id}")
async def get_transaction_detail(transaction_id: str):
    transactions = generate_mock_transactions(1)
    txn = transactions[0]
    txn["id"] = transaction_id
    return txn

# ==================== PAYOUTS ENDPOINTS ====================

@api_router.get("/payouts")
async def get_payouts(status: Optional[str] = None, search: Optional[str] = None):
    payouts = generate_mock_payouts(50)
    if status:
        payouts = [p for p in payouts if p["status"] == status]
    
    if search:
        search_lower = search.lower().strip()
        filtered = []
        for p in payouts:
            # Text search
            if (search_lower in p["id"].lower() or
                search_lower in p["beneficiary"].lower() or
                search_lower in p["linked_transaction"].lower()):
                filtered.append(p)
                continue
            # Amount search
            try:
                search_amount = float(search_lower.replace(',', '').replace('₹', ''))
                if (p["amount"] == search_amount or
                    str(int(p["amount"])).startswith(str(int(search_amount)))):
                    filtered.append(p)
            except (ValueError, TypeError):
                pass
        payouts = filtered
    
    return {"payouts": payouts, "total": len(payouts)}

@api_router.get("/payouts/stats")
async def get_payouts_stats():
    return {
        "completed": {"count": 234, "amount": 12456000},
        "processing": {"count": 12, "amount": 890000},
        "failed": {"count": 5, "amount": 234000}
    }

# ==================== PAYMENT LINKS ENDPOINTS ====================

@api_router.get("/payment-links")
async def get_payment_links(search: Optional[str] = None):
    links = generate_mock_payment_links(30)
    
    if search:
        search_lower = search.lower().strip()
        filtered = []
        for link in links:
            # Text search
            if (search_lower in link["id"].lower() or
                search_lower in link["customer"].lower() or
                search_lower in link["customer_email"].lower()):
                filtered.append(link)
                continue
            # Amount search
            try:
                search_amount = float(search_lower.replace(',', '').replace('₹', ''))
                if (link["amount_requested"] == search_amount or
                    link["amount_paid"] == search_amount or
                    str(int(link["amount_requested"])).startswith(str(int(search_amount))) or
                    str(int(link["amount_paid"])).startswith(str(int(search_amount)))):
                    filtered.append(link)
            except (ValueError, TypeError):
                pass
        links = filtered
    
    return {"links": links, "total": len(links)}

@api_router.get("/payment-links/stats")
async def get_payment_links_stats():
    return {
        "created": 456,
        "paid": 312,
        "expired": 89,
        "conversion_percent": 68.4
    }

@api_router.get("/payment-links/{link_id}")
async def get_payment_link_detail(link_id: str):
    links = generate_mock_payment_links(1)
    link = links[0]
    link["id"] = link_id
    return link

# ==================== BENEFICIARIES ENDPOINTS ====================

@api_router.get("/beneficiaries")
async def get_beneficiaries(search: Optional[str] = None):
    beneficiaries = generate_mock_beneficiaries(20)
    
    if search:
        search_lower = search.lower().strip()
        filtered = []
        for b in beneficiaries:
            # Text search
            if (search_lower in b["id"].lower() or
                search_lower in b["name"].lower() or
                search_lower in b["bank_name"].lower() or
                search_lower in b["account_number"].lower() or
                search_lower in b.get("gst_number", "").lower() or
                search_lower in b.get("pan_number", "").lower()):
                filtered.append(b)
                continue
            # Amount search
            try:
                search_amount = float(search_lower.replace(',', '').replace('₹', ''))
                if (b["total_received"] == search_amount or
                    str(int(b["total_received"])).startswith(str(int(search_amount)))):
                    filtered.append(b)
            except (ValueError, TypeError):
                pass
        beneficiaries = filtered
    
    return {"beneficiaries": beneficiaries, "total": len(beneficiaries)}

# ==================== USERS & KYB ENDPOINTS ====================

@api_router.get("/users")
async def get_users(search: Optional[str] = None):
    users = generate_mock_users(25)
    
    if search:
        search_lower = search.lower().strip()
        filtered = []
        for u in users:
            # Text search
            if (search_lower in u["id"].lower() or
                search_lower in u["name"].lower() or
                search_lower in u["email"].lower() or
                search_lower in u.get("business_name", "").lower() or
                search_lower in u.get("business_type", "").lower()):
                filtered.append(u)
                continue
            # Amount search
            try:
                search_amount = float(search_lower.replace(',', '').replace('₹', ''))
                if (u["total_volume"] == search_amount or
                    str(int(u["total_volume"])).startswith(str(int(search_amount)))):
                    filtered.append(u)
            except (ValueError, TypeError):
                pass
        users = filtered
    
    return {"users": users, "total": len(users)}

@api_router.get("/users/analytics/dropoff")
async def get_user_dropoff_analytics():
    """Get funnel analytics showing where users drop off"""
    return {
        "funnel": [
            {"stage": "Registration Started", "users": 1000, "percentage": 100},
            {"stage": "Registration Completed", "users": 850, "percentage": 85},
            {"stage": "KYB Documents Uploaded", "users": 680, "percentage": 68},
            {"stage": "KYB Verification Pending", "users": 612, "percentage": 61.2},
            {"stage": "KYB Approved", "users": 520, "percentage": 52},
            {"stage": "First Transaction", "users": 416, "percentage": 41.6},
            {"stage": "Active User", "users": 342, "percentage": 34.2}
        ],
        "drop_off_reasons": [
            {"stage": "registration", "count": 150, "percentage": 15, "top_errors": ["SESSION_TIMEOUT", "VALIDATION_ERROR"]},
            {"stage": "kyb_upload", "count": 170, "percentage": 17, "top_errors": ["UPLOAD_FAILED", "FILE_TOO_LARGE", "INVALID_FORMAT"]},
            {"stage": "kyb_verification", "count": 68, "percentage": 6.8, "top_errors": ["DOCUMENT_REJECTED", "VERIFICATION_FAILED"]},
            {"stage": "kyb_approval", "count": 92, "percentage": 9.2, "top_errors": ["APPROVAL_PENDING", "DOCUMENT_MISMATCH"]},
            {"stage": "first_transaction", "count": 104, "percentage": 10.4, "top_errors": ["PAYMENT_DECLINED", "INSUFFICIENT_LIMIT"]},
            {"stage": "payment_setup", "count": 74, "percentage": 7.4, "top_errors": ["CARD_DECLINED", "BANK_ERROR"]}
        ],
        "error_breakdown": [
            {"error": "DOCUMENT_REJECTED", "count": 89, "description": "Document quality or validity issues"},
            {"error": "KYB_UPLOAD_FAILED", "count": 67, "description": "Upload timeout or file issues"},
            {"error": "PAYMENT_DECLINED", "count": 54, "description": "Card/bank payment failures"},
            {"error": "SESSION_TIMEOUT", "count": 48, "description": "User session expired"},
            {"error": "VERIFICATION_FAILED", "count": 42, "description": "Auto-verification failed"},
            {"error": "VALIDATION_ERROR", "count": 38, "description": "Form validation errors"}
        ],
        "weekly_trend": [
            {"week": "Week 1", "registrations": 250, "completions": 85, "drop_offs": 165},
            {"week": "Week 2", "registrations": 280, "completions": 98, "drop_offs": 182},
            {"week": "Week 3", "registrations": 245, "completions": 82, "drop_offs": 163},
            {"week": "Week 4", "registrations": 225, "completions": 77, "drop_offs": 148}
        ]
    }

@api_router.get("/users/analytics/journey")
async def get_user_journey_analytics():
    """Get user journey analytics - where users spend time and leave"""
    return {
        "page_analytics": [
            {"page": "Dashboard", "avg_time_seconds": 45, "bounce_rate": 5.2, "exit_rate": 8.1},
            {"page": "KYB Upload", "avg_time_seconds": 180, "bounce_rate": 22.5, "exit_rate": 28.4},
            {"page": "Document Verification", "avg_time_seconds": 120, "bounce_rate": 15.3, "exit_rate": 18.7},
            {"page": "Payment Setup", "avg_time_seconds": 90, "bounce_rate": 18.2, "exit_rate": 24.1},
            {"page": "First Transaction", "avg_time_seconds": 60, "bounce_rate": 12.4, "exit_rate": 15.8},
            {"page": "Vendor Payment", "avg_time_seconds": 75, "bounce_rate": 8.5, "exit_rate": 10.2}
        ],
        "session_data": {
            "avg_session_duration": 420,
            "avg_pages_per_session": 4.2,
            "returning_user_rate": 68.5
        },
        "exit_points": [
            {"point": "KYB Document Upload", "percentage": 28.4, "users": 284},
            {"point": "Payment Setup", "percentage": 24.1, "users": 241},
            {"point": "Document Verification Wait", "percentage": 18.7, "users": 187},
            {"point": "First Transaction Attempt", "percentage": 15.8, "users": 158},
            {"point": "Other Pages", "percentage": 13.0, "users": 130}
        ],
        "device_breakdown": [
            {"device": "Desktop", "users": 580, "completion_rate": 42.5},
            {"device": "Mobile", "users": 320, "completion_rate": 28.1},
            {"device": "Tablet", "users": 100, "completion_rate": 35.0}
        ]
    }

@api_router.get("/users/pending-approval")
async def get_pending_approval_users():
    """Get first-time users pending document approval"""
    users = generate_mock_users(15)
    pending_users = [u for u in users if u.get("approval_status") == "pending_approval" or 
                    any(d.get("status") == "pending" for d in u.get("documents", []))]
    return {"users": pending_users[:10], "total": len(pending_users)}

@api_router.get("/users/{user_id}")
async def get_user_detail(user_id: str):
    users = generate_mock_users(1)
    user = users[0]
    user["id"] = user_id
    user["transactions"] = generate_mock_transactions(10)
    user["applied_offers"] = ["Standard Plan"]
    user["activity_log"] = [
        {"action": "Document Uploaded", "document": "GST Certificate", "timestamp": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()},
        {"action": "Document Uploaded", "document": "PAN Card", "timestamp": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()},
        {"action": "Document Uploaded", "document": "Aadhar Card", "timestamp": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()},
        {"action": "KYB Submitted", "document": None, "timestamp": (datetime.now(timezone.utc) - timedelta(hours=12)).isoformat()},
    ]
    return user

class DocumentApprovalRequest(BaseModel):
    action: str  # "approve" or "reject"
    rejection_reason: Optional[str] = None

@api_router.put("/users/{user_id}/documents/{document_type}/approve")
async def approve_document(user_id: str, document_type: str, request: DocumentApprovalRequest):
    """Approve or reject a specific document for a user"""
    if request.action == "approve":
        return {
            "success": True,
            "message": f"Document {document_type} approved for user {user_id}",
            "new_status": "approved"
        }
    else:
        return {
            "success": True,
            "message": f"Document {document_type} rejected for user {user_id}",
            "new_status": "rejected",
            "rejection_reason": request.rejection_reason
        }

@api_router.put("/users/{user_id}/approve")
async def approve_user(user_id: str):
    """Approve a first-time user after all documents are verified"""
    return {
        "success": True,
        "message": f"User {user_id} approved successfully",
        "new_status": "approved"
    }

@api_router.put("/users/{user_id}/reject")
async def reject_user(user_id: str, reason: str = "Documents not satisfactory"):
    """Reject a first-time user"""
    return {
        "success": True,
        "message": f"User {user_id} rejected",
        "new_status": "rejected",
        "reason": reason
    }

# ==================== MEMBERSHIPS ENDPOINTS ====================

@api_router.get("/memberships")
async def get_memberships():
    memberships = generate_mock_memberships(20)
    return {"memberships": memberships, "total": len(memberships)}

# ==================== OFFERS & PRICING ENDPOINTS ====================

@api_router.get("/offers")
async def get_offers():
    offers = generate_mock_offers()
    return {"offers": offers}

@api_router.put("/offers/{offer_id}/toggle")
async def toggle_offer(offer_id: str):
    return {"success": True, "message": f"Offer {offer_id} toggled"}

# ==================== REVENUE ANALYTICS ENDPOINTS ====================

@api_router.get("/revenue/analytics")
async def get_revenue_analytics():
    return {
        "total_platform_fee": 315784,
        "total_pg_cost": 284205,
        "net_revenue": 31579,
        "by_flow": {
            "vendor": {"revenue": 170000, "pg_cost": 153000},
            "links": {"revenue": 145784, "pg_cost": 131205}
        },
        "by_payment_mode": {
            "card": {"revenue": 180000, "pg_cost": 162000},
            "upi": {"revenue": 95784, "pg_cost": 86205},
            "netbanking": {"revenue": 40000, "pg_cost": 36000}
        }
    }

@api_router.get("/revenue/trend")
async def get_revenue_trend():
    data = []
    for i in range(30):
        date = datetime.now(timezone.utc) - timedelta(days=29-i)
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "platform_fee": random.randint(8000, 15000),
            "pg_cost": random.randint(6000, 12000)
        })
    return data

# ==================== PG CHARGES ENDPOINTS ====================

@api_router.get("/pg-charges")
async def get_pg_charges():
    transactions = generate_mock_transactions(50)
    pg_data = []
    for t in transactions:
        pg_data.append({
            "transaction_id": t["id"],
            "amount": t["base_amount"],
            "pg_fee": t["pg_fee"],
            "pg_gst": t["pg_gst"],
            "effective_percent": round((t["pg_fee"] + t["pg_gst"]) / t["base_amount"] * 100, 2),
            "date": t["date"]
        })
    return {"charges": pg_data, "total": len(pg_data)}

@api_router.get("/pg-charges/summary")
async def get_pg_charges_summary():
    return {
        "total_pg_cost": 284205,
        "total_pg_gst": 51156,
        "avg_pg_rate": 1.8,
        "transactions_count": 1247
    }

# ==================== GST & TAX ENDPOINTS ====================

@api_router.get("/gst/summary")
async def get_gst_summary():
    return {
        "gst_collected": 56841,
        "input_credit": 51156,
        "net_payable": 5685,
        "cgst": 2842,
        "sgst": 2843
    }

@api_router.get("/gst/transactions")
async def get_gst_transactions():
    transactions = generate_mock_transactions(50)
    gst_data = []
    for t in transactions:
        cgst = round(t["gst_collected"] / 2, 2)
        gst_data.append({
            "transaction_id": t["id"],
            "base_amount": t["base_amount"],
            "platform_fee": t["platform_fee"],
            "gst_collected": t["gst_collected"],
            "cgst": cgst,
            "sgst": t["gst_collected"] - cgst,
            "date": t["date"]
        })
    return {"transactions": gst_data, "total": len(gst_data)}

# ==================== RISK & FLAGS ENDPOINTS ====================

@api_router.get("/risk/alerts")
async def get_risk_alerts():
    alerts = generate_mock_risk_alerts(15)
    return {"alerts": alerts, "total": len(alerts)}

@api_router.get("/risk/summary")
async def get_risk_summary():
    return {
        "high_severity": 3,
        "medium_severity": 7,
        "low_severity": 5,
        "pending_review": 8,
        "blocked_today": 2
    }

class RiskActionRequest(BaseModel):
    action: str

@api_router.put("/risk/alerts/{alert_id}/action")
async def risk_alert_action(alert_id: str, request: RiskActionRequest = None, action: Optional[str] = None):
    # Support both query param and body
    action_value = action or (request.action if request else "reviewed")
    return {"success": True, "message": f"Alert {alert_id} marked as {action_value}"}

# ==================== ROOT ENDPOINT ====================

@api_router.get("/")
async def root():
    return {"message": "Kredyble API v1.0"}

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
