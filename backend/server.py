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
from datetime import datetime, timezone, timedelta
import jwt
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'kredyble-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI()
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
    for i in range(count):
        base_amount = random.randint(5000, 500000)
        platform_fee = round(base_amount * 0.02, 2)
        gst_collected = round(platform_fee * 0.18, 2)
        pg_fee = round(base_amount * 0.018, 2)
        pg_gst = round(pg_fee * 0.18, 2)
        total_charged = base_amount + platform_fee + gst_collected
        net_revenue = platform_fee - pg_fee
        
        transactions.append({
            "id": generate_transaction_id(),
            "user": generate_user_names(),
            "type": random.choice(["vendor", "link"]),
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
            "payment_mode": random.choice(["card", "upi", "netbanking"])
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
    for i in range(count):
        amount_requested = random.randint(1000, 100000)
        status = random.choice(["paid", "pending", "expired", "partial"])
        amount_paid = amount_requested if status == "paid" else (random.randint(100, amount_requested) if status == "partial" else 0)
        
        links.append({
            "id": f"LINK{random.randint(100000, 999999)}",
            "customer": generate_user_names(),
            "customer_email": f"customer{i}@example.com",
            "amount_requested": amount_requested,
            "amount_paid": amount_paid,
            "status": status,
            "attempts": random.randint(0, 5),
            "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(0, 15))).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=random.randint(1, 7))).isoformat(),
            "link_url": f"https://pay.kredyble.com/l/{uuid.uuid4().hex[:8]}",
            "timeline": [
                {"event": "created", "timestamp": (datetime.now(timezone.utc) - timedelta(days=random.randint(5, 15))).isoformat()},
                {"event": "viewed", "timestamp": (datetime.now(timezone.utc) - timedelta(days=random.randint(2, 4))).isoformat()},
                {"event": "attempted", "timestamp": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 2))).isoformat()},
            ]
        })
    return links

def generate_mock_users(count: int = 20):
    users = []
    statuses = ["active", "pending_kyb", "suspended", "verified"]
    for i in range(count):
        users.append({
            "id": f"USR{random.randint(100000, 999999)}",
            "name": generate_user_names(),
            "email": f"user{i}@example.com",
            "phone": f"+91 {random.randint(70000, 99999)} {random.randint(10000, 99999)}",
            "status": random.choice(statuses),
            "kyb_status": random.choice(["verified", "pending", "rejected", "not_submitted"]),
            "total_transactions": random.randint(5, 200),
            "total_volume": random.randint(50000, 5000000),
            "membership": random.choice(["standard", "premium", "enterprise", None]),
            "joined_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(30, 365))).isoformat(),
            "linked_cards": random.randint(0, 4)
        })
    return users

def generate_mock_beneficiaries(count: int = 15):
    beneficiaries = []
    for i in range(count):
        beneficiaries.append({
            "id": f"BEN{random.randint(100000, 999999)}",
            "name": generate_company_names(),
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
    # Mock authentication - accept any email with password "admin123"
    if request.password != "admin123":
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_id = str(uuid.uuid4())
    token = create_token(user_id, request.email)
    
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": request.email,
            "name": request.email.split("@")[0].title(),
            "role": "admin"
        }
    }

@api_router.get("/auth/verify")
async def verify_auth(payload: dict = Depends(verify_token)):
    return {"valid": True, "user": payload}

# ==================== DASHBOARD ENDPOINTS ====================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    return {
        "total_collected": 15789234,
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
    type: Optional[str] = None
):
    all_transactions = generate_mock_transactions(100)
    
    if status:
        all_transactions = [t for t in all_transactions if t["status"] == status]
    if type:
        all_transactions = [t for t in all_transactions if t["type"] == type]
    
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
async def get_payouts(status: Optional[str] = None):
    payouts = generate_mock_payouts(50)
    if status:
        payouts = [p for p in payouts if p["status"] == status]
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
async def get_payment_links():
    links = generate_mock_payment_links(30)
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
async def get_beneficiaries():
    beneficiaries = generate_mock_beneficiaries(20)
    return {"beneficiaries": beneficiaries, "total": len(beneficiaries)}

# ==================== USERS & KYB ENDPOINTS ====================

@api_router.get("/users")
async def get_users():
    users = generate_mock_users(25)
    return {"users": users, "total": len(users)}

@api_router.get("/users/{user_id}")
async def get_user_detail(user_id: str):
    users = generate_mock_users(1)
    user = users[0]
    user["id"] = user_id
    user["transactions"] = generate_mock_transactions(10)
    user["applied_offers"] = ["Standard Plan"]
    return user

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
