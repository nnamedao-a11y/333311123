#!/usr/bin/env python3
"""
BIBI Cars CRM - Backend API Testing
Tests auction ranking endpoints and admin authentication
"""

import requests
import sys
import json
from datetime import datetime

class BIBICarsAPITester:
    def __init__(self, base_url="https://code-resume-32.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        test_headers = self.session.headers.copy()
        if headers:
            test_headers.update(headers)
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, list):
                        print(f"   Response: Array with {len(response_data)} items")
                    elif isinstance(response_data, dict):
                        print(f"   Response keys: {list(response_data.keys())}")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )

    def test_auction_stats(self):
        """Test auction ranking stats endpoint"""
        return self.run_test(
            "Auction Stats",
            "GET", 
            "api/auction-ranking/stats",
            200
        )

    def test_hot_auctions(self):
        """Test hot auctions endpoint"""
        return self.run_test(
            "Hot Auctions",
            "GET",
            "api/auction-ranking/hot?limit=8",
            200
        )

    def test_ending_soon_auctions(self):
        """Test ending soon auctions endpoint"""
        return self.run_test(
            "Ending Soon Auctions", 
            "GET",
            "api/auction-ranking/ending-soon?limit=8",
            200
        )

    def test_upcoming_auctions(self):
        """Test upcoming auctions endpoint"""
        return self.run_test(
            "Upcoming Auctions",
            "GET", 
            "api/auction-ranking/upcoming?limit=8",
            200
        )

    def test_top_auctions(self):
        """Test top auctions endpoint"""
        return self.run_test(
            "Top Auctions",
            "GET",
            "api/auction-ranking/top?limit=20",
            200
        )

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "api/auth/login",
            201,  # NestJS returns 201 for successful login
            data={"email": "admin@crm.com", "password": "admin123"}
        )
        
        if success and isinstance(response, dict) and 'access_token' in response:
            self.token = response['access_token']
            print(f"   ✅ Token received: {self.token[:20]}...")
            return True
        return False

    def test_admin_me(self):
        """Test admin me endpoint (requires auth)"""
        if not self.token:
            print("❌ Skipping admin/me test - no token available")
            return False
            
        return self.run_test(
            "Admin Me (Auth Required)",
            "GET",
            "api/auth/me", 
            200
        )[0]

    def test_vin_public_endpoint(self):
        """Test public VIN check endpoint"""
        # Test with a sample VIN
        test_vin = "1HGBH41JXMN109186"
        return self.run_test(
            f"VIN Check Public ({test_vin})",
            "GET",
            f"api/vin/public/{test_vin}",
            200  # Expecting 200 even if VIN not found (should return structured response)
        )

def main():
    print("🚗 BIBI Cars CRM - Backend API Testing")
    print("=" * 50)
    
    tester = BIBICarsAPITester()
    
    # Test public endpoints first
    print("\n📊 Testing Public Auction Endpoints...")
    tester.test_health_check()
    tester.test_auction_stats()
    tester.test_hot_auctions()
    tester.test_ending_soon_auctions()
    tester.test_upcoming_auctions()
    tester.test_top_auctions()
    
    # Test VIN endpoint
    print("\n🔍 Testing VIN Check Endpoint...")
    tester.test_vin_public_endpoint()
    
    # Test admin authentication
    print("\n🔐 Testing Admin Authentication...")
    if tester.test_admin_login():
        tester.test_admin_me()
    else:
        print("❌ Admin login failed, skipping authenticated tests")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())