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
                # Check for monetization flow - visible vs internal totals
                if 'totals' in response:
                    totals = response['totals']
                    if 'visible' in totals and 'internal' in totals:
                        self.log(f"✅ MONETIZATION: Visible total: ${totals['visible']}, Internal total: ${totals['internal']}")
                        if totals['internal'] > totals['visible']:
                            self.log(f"✅ MONETIZATION: Hidden margin detected: ${totals['internal'] - totals['visible']}")
                        return True
                    else:
                        self.log("❌ MONETIZATION: Missing visible/internal totals separation")
                        return False
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
                
                # Check monetization flow in quote
                quote = response['quote']
                if 'visibleTotal' in quote and 'internalTotal' in quote:
                    self.log(f"✅ MONETIZATION: Quote visible total: ${quote['visibleTotal']}, internal total: ${quote['internalTotal']}")
                    if 'hiddenFee' in quote:
                        self.log(f"✅ MONETIZATION: Hidden fee: ${quote['hiddenFee']}")
                else:
                    self.log("❌ MONETIZATION: Missing visibleTotal/internalTotal in quote")
                
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

    def test_leads_api(self):
        """Test leads API with monetization data"""
        self.log("\n=== TESTING LEADS API ===")
        
        if not self.token:
            self.log("❌ No token available for leads API test")
            return False
        
        success, response = self.run_test(
            "Get Leads",
            "GET",
            "leads",
            200
        )
        
        if success:
            if 'data' in response and isinstance(response['data'], list):
                leads = response['data']
                self.log(f"✅ Found {len(leads)} leads")
                
                # Check for monetization data in leads
                for lead in leads[:3]:  # Check first 3 leads
                    if 'metadata' in lead and lead['metadata']:
                        metadata = lead['metadata']
                        if 'internalTotal' in metadata and 'hiddenFee' in metadata:
                            self.log(f"✅ MONETIZATION: Lead {lead.get('id', 'N/A')} has internal total: ${metadata['internalTotal']}, hidden fee: ${metadata['hiddenFee']}")
                        else:
                            self.log(f"⚠️  Lead {lead.get('id', 'N/A')} missing monetization metadata")
                    
                return True
            else:
                self.log("❌ Invalid leads response format")
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

    def test_calculator_admin_profile(self):
        """Test calculator admin profile endpoints"""
        self.log("\n=== TESTING CALCULATOR ADMIN PROFILE ===")
        
        if not self.token:
            self.log("❌ No token available for admin test")
            return False
        
        # Get active profile
        success, response = self.run_test(
            "Get Active Profile",
            "GET",
            "calculator/config/profile",
            200
        )
        
        if not success:
            return False
            
        profile = response
        if not profile:
            self.log("❌ No active profile found")
            return False
            
        self.log(f"✅ Found active profile: {profile.get('name', 'Unknown')}")
        
        # Test profile update
        update_data = {
            "name": profile.get('name', 'Test Profile'),
            "insuranceRate": 0.02,
            "usaHandlingFee": 500
        }
        
        success, response = self.run_test(
            "Update Profile",
            "PATCH", 
            "calculator/config/profile",
            200,
            data=update_data
        )
        
        if success:
            self.log("✅ Profile updated successfully")
            return True
        return False

    def test_calculator_admin_stats(self):
        """Test calculator admin stats"""
        self.log("\n=== TESTING CALCULATOR ADMIN STATS ===")
        
        if not self.token:
            self.log("❌ No token available for admin test")
            return False
        
        success, response = self.run_test(
            "Get Calculator Stats",
            "GET",
            "calculator/admin/stats",
            200
        )
        
        if success:
            if 'totalQuotes' in response and 'profiles' in response:
                self.log(f"✅ Stats: {response['totalQuotes']} quotes, {response['profiles']} profiles")
                return True
            else:
                self.log("❌ Invalid stats response format")
                return False
        return False

    def test_calculator_admin_routes(self):
        """Test calculator admin route rates"""
        self.log("\n=== TESTING CALCULATOR ADMIN ROUTES ===")
        
        if not self.token:
            self.log("❌ No token available for admin test")
            return False
        
        # First get active profile to get profile code
        success, profile = self.run_test(
            "Get Profile for Routes",
            "GET",
            "calculator/config/profile", 
            200
        )
        
        if not success or not profile or not profile.get('code'):
            self.log("❌ No profile code available for routes test")
            return False
            
        profile_code = profile['code']
        
        # Get route rates
        success, response = self.run_test(
            "Get Route Rates",
            "GET",
            f"calculator/config/routes/{profile_code}",
            200
        )
        
        if success:
            routes = response if isinstance(response, list) else []
            self.log(f"✅ Found {len(routes)} route rates")
            
            # Test adding a new route rate
            new_route = {
                "profileCode": profile_code,
                "rateType": "usa_inland",
                "originCode": "TEST",
                "vehicleType": "sedan",
                "amount": 1000
            }
            
            success, response = self.run_test(
                "Add Route Rate",
                "POST",
                "calculator/config/routes",
                201,
                data=new_route
            )
            
            if success:
                self.log("✅ Route rate added successfully")
                return True
            else:
                self.log("❌ Failed to add route rate")
                return False
        return False

    def test_calculator_admin_auction_fees(self):
        """Test calculator admin auction fee rules"""
        self.log("\n=== TESTING CALCULATOR ADMIN AUCTION FEES ===")
        
        if not self.token:
            self.log("❌ No token available for admin test")
            return False
        
        # First get active profile to get profile code
        success, profile = self.run_test(
            "Get Profile for Auction Fees",
            "GET",
            "calculator/config/profile",
            200
        )
        
        if not success or not profile or not profile.get('code'):
            self.log("❌ No profile code available for auction fees test")
            return False
            
        profile_code = profile['code']
        
        # Get auction fee rules
        success, response = self.run_test(
            "Get Auction Fee Rules",
            "GET",
            f"calculator/config/auction-fees/{profile_code}",
            200
        )
        
        if success:
            rules = response if isinstance(response, list) else []
            self.log(f"✅ Found {len(rules)} auction fee rules")
            
            # Test adding a new auction fee rule
            new_rule = {
                "profileCode": profile_code,
                "minBid": 50000,
                "maxBid": 60000,
                "fee": 2500
            }
            
            success, response = self.run_test(
                "Add Auction Fee Rule",
                "POST",
                "calculator/config/auction-fees",
                201,
                data=new_rule
            )
            
            if success:
                self.log("✅ Auction fee rule added successfully")
                return True
            else:
                self.log("❌ Failed to add auction fee rule")
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
            ("Leads API", self.test_leads_api),
            ("Auth Me", self.test_auth_me),
            ("Calculator Admin Profile", self.test_calculator_admin_profile),
            ("Calculator Admin Stats", self.test_calculator_admin_stats),
            ("Calculator Admin Routes", self.test_calculator_admin_routes),
            ("Calculator Admin Auction Fees", self.test_calculator_admin_auction_fees),
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