#!/usr/bin/env python3
"""
BIBI Cars CRM - Calculator Engine Backend API Testing
Tests calculator endpoints for pricing calculations and quote management
"""

import requests
import sys
import json
from datetime import datetime

class BIBICalculatorAPITester:
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

    def test_calculator_sedan_nj_calculation(self):
        """Test calculation for sedan NJ $15,500 → total ~$22,699"""
        success, response = self.run_test(
            "Calculator - Sedan NJ $15,500",
            "POST",
            "api/calculator/calculate",
            201,
            data={
                "price": 15500,
                "port": "NJ", 
                "vehicleType": "sedan",
                "vin": "1HGBH41JXMN109186",
                "lotNumber": "12345"
            }
        )
        
        if success and isinstance(response, dict):
            visible_total = response.get('totals', {}).get('visible', 0)
            print(f"   💰 Visible Total: ${visible_total}")
            # Expected around $22,699 based on requirements
            if 22000 <= visible_total <= 23500:
                print(f"   ✅ Total within expected range (${visible_total})")
                return True
            else:
                print(f"   ⚠️  Total ${visible_total} outside expected range $22,000-$23,500")
        
        return success

    def test_calculator_bigsuv_ca_calculation(self):
        """Test calculation for bigSUV CA $42,000 → total ~$54,635"""
        success, response = self.run_test(
            "Calculator - BigSUV CA $42,000",
            "POST", 
            "api/calculator/calculate",
            201,
            data={
                "price": 42000,
                "port": "CA",
                "vehicleType": "bigSUV", 
                "vin": "5UXWX7C5XBA123456",
                "lotNumber": "67890"
            }
        )
        
        if success and isinstance(response, dict):
            visible_total = response.get('totals', {}).get('visible', 0)
            print(f"   💰 Visible Total: ${visible_total}")
            # Expected around $54,635 based on requirements
            if 53000 <= visible_total <= 56000:
                print(f"   ✅ Total within expected range (${visible_total})")
                return True
            else:
                print(f"   ⚠️  Total ${visible_total} outside expected range $53,000-$56,000")
        
        return success

    def test_calculator_hidden_fee_under_5000(self):
        """Test hidden fee calculation for price under $5,000 (should be $700)"""
        success, response = self.run_test(
            "Calculator - Hidden Fee Under $5,000",
            "POST",
            "api/calculator/calculate", 
            201,
            data={
                "price": 3500,
                "port": "NJ",
                "vehicleType": "sedan"
            }
        )
        
        if success and isinstance(response, dict):
            hidden_fee = response.get('hiddenBreakdown', {}).get('hiddenFee', 0)
            print(f"   🔒 Hidden Fee: ${hidden_fee}")
            if hidden_fee == 700:
                print(f"   ✅ Hidden fee correct for under $5,000")
                return True
            else:
                print(f"   ❌ Expected $700 hidden fee, got ${hidden_fee}")
        
        return success

    def test_calculator_hidden_fee_over_5000(self):
        """Test hidden fee calculation for price over $5,000 (should be $1,400)"""
        success, response = self.run_test(
            "Calculator - Hidden Fee Over $5,000",
            "POST",
            "api/calculator/calculate",
            201,
            data={
                "price": 15500,
                "port": "NJ", 
                "vehicleType": "sedan"
            }
        )
        
        if success and isinstance(response, dict):
            hidden_fee = response.get('hiddenBreakdown', {}).get('hiddenFee', 0)
            print(f"   🔒 Hidden Fee: ${hidden_fee}")
            if hidden_fee == 1400:
                print(f"   ✅ Hidden fee correct for over $5,000")
                return True
            else:
                print(f"   ❌ Expected $1,400 hidden fee, got ${hidden_fee}")
        
        return success

    def test_calculator_auction_fee_brackets(self):
        """Test auction fee brackets work correctly"""
        test_cases = [
            (500, 300, "Under $1,000"),
            (2500, 450, "$1,000-$2,999"),
            (4500, 600, "$3,000-$4,999"),
            (6500, 750, "$5,000-$7,499"),
            (15500, 1200, "$15,000-$24,999"),
            (45000, 1500, "$25,000-$49,999")
        ]
        
        all_passed = True
        for price, expected_fee, bracket_desc in test_cases:
            success, response = self.run_test(
                f"Auction Fee Bracket - {bracket_desc}",
                "POST",
                "api/calculator/calculate",
                201,
                data={
                    "price": price,
                    "port": "NJ",
                    "vehicleType": "sedan"
                }
            )
            
            if success and isinstance(response, dict):
                auction_fee = response.get('breakdown', {}).get('auctionFee', 0)
                print(f"   💸 Price: ${price} → Auction Fee: ${auction_fee}")
                if auction_fee == expected_fee:
                    print(f"   ✅ Correct auction fee for {bracket_desc}")
                else:
                    print(f"   ❌ Expected ${expected_fee}, got ${auction_fee}")
                    all_passed = False
            else:
                all_passed = False
        
        return all_passed

    def test_create_quote_with_vin(self):
        """Test quote creation with VIN"""
        success, response = self.run_test(
            "Create Quote with VIN",
            "POST",
            "api/calculator/quote",
            201,
            data={
                "price": 15500,
                "port": "NJ",
                "vehicleType": "sedan",
                "vin": "1HGBH41JXMN109186",
                "lotNumber": "12345",
                "vehicleTitle": "2023 Honda Accord",
                "notes": "Test quote creation"
            }
        )
        
        if success and isinstance(response, dict):
            quote_info = response.get('quote', {})
            quote_number = quote_info.get('quoteNumber', '')
            print(f"   📋 Quote Number: {quote_number}")
            if quote_number and quote_number.startswith('QT-'):
                print(f"   ✅ Quote created successfully")
                return True
            else:
                print(f"   ❌ Invalid quote number format")
        
        return success

    def test_get_active_profile(self):
        """Test GET /api/calculator/config/profile - returns active profile"""
        success, response = self.run_test(
            "Get Active Profile",
            "GET",
            "api/calculator/config/profile",
            200
        )
        
        if success and isinstance(response, dict):
            profile_code = response.get('code', '')
            profile_name = response.get('name', '')
            print(f"   📊 Profile: {profile_code} - {profile_name}")
            if profile_code == 'default-bg':
                print(f"   ✅ Default profile active")
                return True
            else:
                print(f"   ⚠️  Unexpected profile code: {profile_code}")
        
        return success

    def test_get_auction_fee_rules(self):
        """Test GET /api/calculator/config/auction-fees/default-bg - returns bracket rules"""
        success, response = self.run_test(
            "Get Auction Fee Rules",
            "GET", 
            "api/calculator/config/auction-fees/default-bg",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   📋 Found {len(response)} auction fee rules")
            # Check if we have the expected brackets
            if len(response) >= 8:  # Should have 9 brackets based on seed data
                print(f"   ✅ Auction fee brackets loaded")
                return True
            else:
                print(f"   ⚠️  Expected at least 8 brackets, got {len(response)}")
        
        return success

    def test_get_ports_and_vehicle_types(self):
        """Test GET /api/calculator/ports - returns ports and vehicleTypes"""
        success, response = self.run_test(
            "Get Ports and Vehicle Types",
            "GET",
            "api/calculator/ports", 
            200
        )
        
        if success and isinstance(response, dict):
            ports = response.get('ports', [])
            vehicle_types = response.get('vehicleTypes', [])
            print(f"   🚢 Ports: {len(ports)}, Vehicle Types: {len(vehicle_types)}")
            
            # Check expected ports
            port_codes = [p.get('code') for p in ports]
            expected_ports = ['NJ', 'GA', 'TX', 'CA']
            if all(code in port_codes for code in expected_ports):
                print(f"   ✅ All expected ports available")
                return True
            else:
                print(f"   ⚠️  Missing expected ports. Got: {port_codes}")
        
        return success

def main():
    print("🚗 BIBI Cars CRM - Calculator Engine Backend API Testing")
    print("=" * 60)
    
    tester = BIBICalculatorAPITester()
    
    # Test calculator configuration endpoints
    print("\n⚙️  Testing Calculator Configuration...")
    tester.test_get_active_profile()
    tester.test_get_auction_fee_rules()
    tester.test_get_ports_and_vehicle_types()
    
    # Test core calculation functionality
    print("\n🧮 Testing Core Calculations...")
    tester.test_calculator_sedan_nj_calculation()
    tester.test_calculator_bigsuv_ca_calculation()
    
    # Test hidden fee logic
    print("\n🔒 Testing Hidden Fee Logic...")
    tester.test_calculator_hidden_fee_under_5000()
    tester.test_calculator_hidden_fee_over_5000()
    
    # Test auction fee brackets
    print("\n💸 Testing Auction Fee Brackets...")
    tester.test_calculator_auction_fee_brackets()
    
    # Test quote creation
    print("\n📋 Testing Quote Creation...")
    tester.test_create_quote_with_vin()
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All calculator tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())