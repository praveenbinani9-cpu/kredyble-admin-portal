#!/usr/bin/env python3
import requests
import sys
import json
from datetime import datetime

class KredybleAPITester:
    def __init__(self, base_url="https://fintech-command-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_result(self, test_name, success, message="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}: {message}")
        return success

    def run_api_test(self, name, method, endpoint, expected_status=200, data=None, needs_auth=True):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if needs_auth and self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            
            success = response.status_code == expected_status
            
            if success:
                try:
                    response_json = response.json()
                    message = f"Status {response.status_code} - Response received"
                except:
                    message = f"Status {response.status_code} - Non-JSON response"
            else:
                message = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    message += f" - {error_detail}"
                except:
                    message += f" - {response.text[:100]}"
            
            return self.log_result(name, success, message, response.json() if success else None)
        
        except Exception as e:
            return self.log_result(name, False, f"Error: {str(e)}")

    def test_authentication(self):
        """Test login flow"""
        print("\n=== AUTHENTICATION TESTS ===")
        
        # Test valid login
        login_data = {"email": "admin@kredyble.com", "password": "admin123"}
        success = self.run_api_test("Valid Login", "POST", "auth/login", 200, login_data, False)
        
        if success:
            # Get token from response
            try:
                response = requests.post(f"{self.base_url}/api/auth/login", json=login_data)
                token_data = response.json()
                self.token = token_data['token']
                self.log_result("Token Extraction", True, "JWT token retrieved successfully")
            except Exception as e:
                self.log_result("Token Extraction", False, f"Failed to extract token: {str(e)}")
                return False
        
        # Test invalid login
        self.run_api_test("Invalid Login", "POST", "auth/login", 401, 
                         {"email": "admin@kredyble.com", "password": "wrong"}, False)
        
        # Test auth verification
        if self.token:
            self.run_api_test("Token Verification", "GET", "auth/verify", 200, needs_auth=True)
        
        return success

    def test_dashboard_endpoints(self):
        """Test dashboard related endpoints"""
        print("\n=== DASHBOARD TESTS ===")
        
        self.run_api_test("Dashboard Stats", "GET", "dashboard/stats")
        self.run_api_test("Volume Chart Data", "GET", "dashboard/charts/volume")
        self.run_api_test("Revenue Chart Data", "GET", "dashboard/charts/revenue")

    def test_transactions_endpoints(self):
        """Test transaction related endpoints"""
        print("\n=== TRANSACTIONS TESTS ===")
        
        self.run_api_test("Get Transactions", "GET", "transactions")
        self.run_api_test("Get Transactions with Pagination", "GET", "transactions?page=1&limit=10")
        self.run_api_test("Filter by Status", "GET", "transactions?status=completed")
        self.run_api_test("Filter by Type", "GET", "transactions?type=vendor")
        self.run_api_test("Transaction Detail", "GET", "transactions/TXN123456")

    def test_collections_endpoints(self):
        """Test collections related endpoints"""
        print("\n=== COLLECTIONS TESTS ===")
        
        self.run_api_test("Collections Stats", "GET", "collections/stats")
        self.run_api_test("Collections Flow", "GET", "collections/flow")

    def test_payouts_endpoints(self):
        """Test payouts related endpoints"""
        print("\n=== PAYOUTS TESTS ===")
        
        self.run_api_test("Get Payouts", "GET", "payouts")
        self.run_api_test("Payouts Stats", "GET", "payouts/stats")
        self.run_api_test("Filter Payouts by Status", "GET", "payouts?status=completed")

    def test_payment_links_endpoints(self):
        """Test payment links related endpoints"""
        print("\n=== PAYMENT LINKS TESTS ===")
        
        self.run_api_test("Get Payment Links", "GET", "payment-links")
        self.run_api_test("Payment Links Stats", "GET", "payment-links/stats")
        self.run_api_test("Payment Link Detail", "GET", "payment-links/LINK123456")

    def test_users_endpoints(self):
        """Test users related endpoints"""
        print("\n=== USERS & KYB TESTS ===")
        
        self.run_api_test("Get Users", "GET", "users")
        self.run_api_test("User Detail", "GET", "users/USR123456")

    def test_other_endpoints(self):
        """Test other management endpoints"""
        print("\n=== OTHER ENDPOINTS TESTS ===")
        
        # Beneficiaries
        self.run_api_test("Get Beneficiaries", "GET", "beneficiaries")
        
        # Memberships
        self.run_api_test("Get Memberships", "GET", "memberships")
        
        # Offers & Pricing
        self.run_api_test("Get Offers", "GET", "offers")
        self.run_api_test("Toggle Offer", "PUT", "offers/OFF001/toggle")
        
        # Revenue Analytics
        self.run_api_test("Revenue Analytics", "GET", "revenue/analytics")
        self.run_api_test("Revenue Trend", "GET", "revenue/trend")
        
        # PG Charges
        self.run_api_test("PG Charges", "GET", "pg-charges")
        self.run_api_test("PG Charges Summary", "GET", "pg-charges/summary")
        
        # GST & Tax
        self.run_api_test("GST Summary", "GET", "gst/summary")
        self.run_api_test("GST Transactions", "GET", "gst/transactions")
        
        # Risk & Flags
        self.run_api_test("Risk Alerts", "GET", "risk/alerts")
        self.run_api_test("Risk Summary", "GET", "risk/summary")
        self.run_api_test("Risk Alert Action", "PUT", "risk/alerts/ALERT123456/action", data={"action": "reviewed"})

    def run_all_tests(self):
        """Run complete test suite"""
        print(f"🚀 Starting Kredyble API Tests - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🔗 Testing against: {self.base_url}")
        
        # Test authentication first - critical for other tests
        if not self.test_authentication():
            print("❌ Authentication failed - stopping tests")
            return False
            
        # Run all other endpoint tests
        self.test_dashboard_endpoints()
        self.test_transactions_endpoints()
        self.test_collections_endpoints()
        self.test_payouts_endpoints()
        self.test_payment_links_endpoints()
        self.test_users_endpoints()
        self.test_other_endpoints()
        
        # Print summary
        print(f"\n📊 TEST SUMMARY")
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        # Show failed tests
        failed_tests = [r for r in self.test_results if not r['success']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['message']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = KredybleAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results for analysis
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'summary': {
                'total': tester.tests_run,
                'passed': tester.tests_passed,
                'failed': tester.tests_run - tester.tests_passed,
                'success_rate': tester.tests_passed/tester.tests_run*100 if tester.tests_run > 0 else 0
            },
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())