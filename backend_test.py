#!/usr/bin/env python3
"""
BIBI Cars CRM - Backend API Testing
Tests Calculator Engine, Lead Conversion, and Auth APIs
"""

import requests
import sys
import json
from datetime import datetime

class BIBICRMTester:
    def __init__(self, base_url="https://repo-study-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.quote_id = None

    def log(self, message):
        """Log test messages"""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        self.log(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                self.log(f"✅ PASSED - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 500:
                        self.log(f"   Response: {json.dumps(response_data, indent=2)}")
                    return True, response_data
                except:
                    return True, {}
            else:
                self.log(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    self.log(f"   Error: {json.dumps(error_data, indent=2)}")
                except:
                    self.log(f"   Error: {response.text}")
                return False, {}

        except requests.exceptions.Timeout:
            self.log(f"❌ FAILED - Request timeout (30s)")
            return False, {}
        except Exception as e:
            self.log(f"❌ FAILED - Error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin authentication"""
        self.log("\n=== TESTING ADMIN LOGIN ===")
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            201,
            data={
                "email": "admin@crm.com",
                "password": "admin123"
            }
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.log(f"✅ Token obtained: {self.token[:20]}...")
            return True
        elif success and 'token' in response:
            self.token = response['token']
            self.log(f"✅ Token obtained: {self.token[:20]}...")
            return True
        else:
            self.log("❌ No token in response")
            return False

    def test_calculator_ports(self):
        """Test calculator ports endpoint"""
        self.log("\n=== TESTING CALCULATOR PORTS ===")
        
        success, response = self.run_test(
            "Get Calculator Ports",
            "GET",
            "calculator/ports",
            200
        )
        
        if success:
            if 'ports' in response and 'vehicleTypes' in response:
                self.log(f"✅ Found {len(response['ports'])} ports and {len(response['vehicleTypes'])} vehicle types")
                return True
            else:
                self.log("❌ Missing ports or vehicleTypes in response")
                return False
        return False

    def test_calculator_calculate(self):
        """Test calculator calculation endpoint"""
        self.log("\n=== TESTING CALCULATOR CALCULATE ===")
        
        test_data = {
            "price": 15000,
            "port": "NJ",
            "vehicleType": "sedan"
        }
        
        success, response = self.run_test(
            "Calculate Delivery Cost",
            "POST",
            "calculator/calculate",
            201,
            data=test_data
        )
        
        if success:
            if 'totals' in response or 'total' in response:
                self.log("✅ Calculation completed successfully")
                return True
            else:
                self.log("❌ Missing totals in calculation response")
                return False
        return False

    def test_calculator_quote(self):
        """Test calculator quote creation"""
        self.log("\n=== TESTING CALCULATOR QUOTE ===")
        
        test_data = {
            "price": 15000,
            "port": "NJ", 
            "vehicleType": "sedan",
            "vin": "1HGBH41JXMN109186",
            "vehicleTitle": "2021 Honda Accord"
        }
        
        success, response = self.run_test(
            "Create Quote",
            "POST",
            "calculator/quote",
            201,
            data=test_data
        )
        
        if success:
            # Store quote ID for lead conversion test
            if 'quote' in response and 'id' in response['quote']:
                self.quote_id = response['quote']['id']
                self.log(f"✅ Quote created with ID: {self.quote_id}")
                return True
            elif '_id' in response:
                self.quote_id = response['_id']
                self.log(f"✅ Quote created with ID: {self.quote_id}")
                return True
            elif 'id' in response:
                self.quote_id = response['id']
                self.log(f"✅ Quote created with ID: {self.quote_id}")
                return True
            else:
                self.log("❌ No quote ID in response")
                return False
        return False

    def test_lead_quick_create(self):
        """Test quick lead creation"""
        self.log("\n=== TESTING LEAD QUICK CREATE ===")
        
        test_data = {
            "vin": "1HGBH41JXMN109186",
            "firstName": "Test",
            "lastName": "User",
            "phone": "+380501234567",
            "email": "test@example.com",
            "comment": "Test lead from API",
            "price": 15000,
            "vehicleTitle": "2021 Honda Accord",
            "source": "vin_page_quick"
        }
        
        success, response = self.run_test(
            "Create Quick Lead",
            "POST",
            "public/leads/quick",
            201,
            data=test_data
        )
        
        if success:
            if 'success' in response and response['success']:
                self.log(f"✅ Lead created successfully")
                if 'leadId' in response:
                    self.log(f"   Lead ID: {response['leadId']}")
                return True
            else:
                self.log("❌ Lead creation failed")
                return False
        return False

    def test_lead_from_quote(self):
        """Test lead creation from quote"""
        self.log("\n=== TESTING LEAD FROM QUOTE ===")
        
        if not self.quote_id:
            self.log("❌ No quote ID available for lead conversion test")
            return False
        
        test_data = {
            "quoteId": self.quote_id,
            "firstName": "Quote",
            "lastName": "User", 
            "phone": "+380501234568",
            "email": "quote@example.com",
            "comment": "Test lead from quote"
        }
        
        success, response = self.run_test(
            "Create Lead from Quote",
            "POST",
            "public/leads/from-quote",
            201,
            data=test_data
        )
        
        if success:
            if 'success' in response and response['success']:
                self.log(f"✅ Lead from quote created successfully")
                if 'leadId' in response:
                    self.log(f"   Lead ID: {response['leadId']}")
                return True
            else:
                self.log("❌ Lead from quote creation failed")
                return False
        return False

    def test_auth_me(self):
        """Test authenticated user info"""
        self.log("\n=== TESTING AUTH ME ===")
        
        if not self.token:
            self.log("❌ No token available for auth test")
            return False
        
        success, response = self.run_test(
            "Get User Info",
            "GET",
            "auth/me",
            200
        )
        
        if success:
            if 'email' in response or 'id' in response:
                self.log("✅ User info retrieved successfully")
                return True
            else:
                self.log("❌ Invalid user info response")
                return False
        return False

    def run_all_tests(self):
        """Run all backend tests"""
        self.log("🚀 Starting BIBI Cars CRM Backend API Tests")
        self.log(f"   Base URL: {self.base_url}")
        
        # Test sequence
        tests = [
            ("Admin Login", self.test_admin_login),
            ("Calculator Ports", self.test_calculator_ports),
            ("Calculator Calculate", self.test_calculator_calculate),
            ("Calculator Quote", self.test_calculator_quote),
            ("Lead Quick Create", self.test_lead_quick_create),
            ("Lead from Quote", self.test_lead_from_quote),
            ("Auth Me", self.test_auth_me),
        ]
        
        for test_name, test_func in tests:
            try:
                test_func()
            except Exception as e:
                self.log(f"❌ {test_name} failed with exception: {str(e)}")
        
        # Final results
        self.log(f"\n📊 FINAL RESULTS")
        self.log(f"   Tests run: {self.tests_run}")
        self.log(f"   Tests passed: {self.tests_passed}")
        self.log(f"   Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test runner"""
    tester = BIBICRMTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())