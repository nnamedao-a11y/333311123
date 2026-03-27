#!/usr/bin/env python3
"""
BIBI Cars CRM - Deals System v2.0 Backend Testing
Tests all deal-related API endpoints and functionality
"""

import requests
import sys
import json
from datetime import datetime

class DealsAPITester:
    def __init__(self, base_url="https://a11y-audit-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_deal_id = None

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

    def test_quote_scenario_change(self):
        """Test PATCH /api/calculator/quote/:id/scenario - Quote History System"""
        self.log("\n=== TESTING QUOTE SCENARIO CHANGE ===")
        
        if not self.quote_id:
            self.log("❌ No quote ID available for scenario change test")
            return False
        
        # Test changing scenario to minimum
        success, response = self.run_test(
            "Change Quote Scenario to Minimum",
            "PATCH",
            f"calculator/quote/{self.quote_id}/scenario",
            200,
            data={"selectedScenario": "minimum"}
        )
        
        if success:
            if 'selectedScenario' in response and response['selectedScenario'] == 'minimum':
                self.log("✅ Quote scenario changed to minimum successfully")
                if 'finalPrice' in response:
                    self.log(f"   Final price updated to: ${response['finalPrice']}")
            else:
                self.log("❌ Scenario change response missing expected fields")
                return False
        else:
            return False
        
        # Test changing scenario to aggressive
        success, response = self.run_test(
            "Change Quote Scenario to Aggressive",
            "PATCH",
            f"calculator/quote/{self.quote_id}/scenario",
            200,
            data={"selectedScenario": "aggressive"}
        )
        
        if success:
            if 'selectedScenario' in response and response['selectedScenario'] == 'aggressive':
                self.log("✅ Quote scenario changed to aggressive successfully")
                if 'finalPrice' in response:
                    self.log(f"   Final price updated to: ${response['finalPrice']}")
                return True
            else:
                self.log("❌ Scenario change response missing expected fields")
                return False
        return False

    def test_quotes_by_lead(self):
        """Test GET /api/calculator/quotes?leadId= - Quote History System"""
        self.log("\n=== TESTING QUOTES BY LEAD ===")
        
        if not self.token:
            self.log("❌ No token available for quotes by lead test")
            return False
        
        # First get a lead ID from leads API
        success, leads_response = self.run_test(
            "Get Leads for Quote History Test",
            "GET",
            "leads",
            200
        )
        
        if not success or not leads_response.get('data'):
            self.log("❌ No leads available for quote history test")
            return False
        
        leads = leads_response['data']
        if not leads:
            self.log("❌ No leads found for quote history test")
            return False
        
        lead_id = leads[0].get('id')
        if not lead_id:
            self.log("❌ No lead ID found for quote history test")
            return False
        
        # Test getting quotes by lead ID
        success, response = self.run_test(
            "Get Quotes by Lead ID",
            "GET",
            f"calculator/quotes?leadId={lead_id}",
            200
        )
        
        if success:
            quotes = response if isinstance(response, list) else []
            self.log(f"✅ Found {len(quotes)} quotes for lead {lead_id}")
            
            # Check quote structure for Quote History System features
            for quote in quotes[:2]:  # Check first 2 quotes
                if 'scenarios' in quote:
                    scenarios = quote['scenarios']
                    if 'minimum' in scenarios and 'recommended' in scenarios and 'aggressive' in scenarios:
                        self.log(f"✅ Quote {quote.get('_id', 'N/A')} has all scenario pricing: min=${scenarios['minimum']}, rec=${scenarios['recommended']}, agg=${scenarios['aggressive']}")
                    else:
                        self.log(f"❌ Quote {quote.get('_id', 'N/A')} missing scenario pricing")
                
                if 'selectedScenario' in quote:
                    self.log(f"✅ Quote {quote.get('_id', 'N/A')} has selected scenario: {quote['selectedScenario']}")
                else:
                    self.log(f"❌ Quote {quote.get('_id', 'N/A')} missing selectedScenario")
                
                if 'history' in quote and isinstance(quote['history'], list):
                    self.log(f"✅ Quote {quote.get('_id', 'N/A')} has audit history with {len(quote['history'])} entries")
                else:
                    self.log(f"❌ Quote {quote.get('_id', 'N/A')} missing audit history")
            
            return True
        return False

    def test_quotes_by_vin(self):
        """Test GET /api/calculator/quotes?vin= - Quote History System"""
        self.log("\n=== TESTING QUOTES BY VIN ===")
        
        if not self.token:
            self.log("❌ No token available for quotes by VIN test")
            return False
        
        test_vin = "1HGBH41JXMN109186"
        
        # Test getting quotes by VIN
        success, response = self.run_test(
            "Get Quotes by VIN",
            "GET",
            f"calculator/quotes?vin={test_vin}",
            200
        )
        
        if success:
            quotes = response if isinstance(response, list) else []
            self.log(f"✅ Found {len(quotes)} quotes for VIN {test_vin}")
            
            # Check quote structure for Quote History System features
            for quote in quotes[:2]:  # Check first 2 quotes
                if 'quoteNumber' in quote:
                    self.log(f"✅ Quote {quote['quoteNumber']} found for VIN")
                
                if 'scenarios' in quote and 'selectedScenario' in quote:
                    selected_price = quote['scenarios'].get(quote['selectedScenario'], 'N/A')
                    self.log(f"✅ Quote {quote.get('quoteNumber', 'N/A')} scenario: {quote['selectedScenario']} = ${selected_price}")
            
            return True
        return False

    def test_quote_audit_history(self):
        """Test quote audit history functionality"""
        self.log("\n=== TESTING QUOTE AUDIT HISTORY ===")
        
        if not self.quote_id:
            self.log("❌ No quote ID available for audit history test")
            return False
        
        # Get the quote to check its history
        success, response = self.run_test(
            "Get Quote for History Check",
            "GET",
            f"calculator/quote/{self.quote_id}",
            200
        )
        
        if success:
            if 'history' in response and isinstance(response['history'], list):
                history = response['history']
                self.log(f"✅ Quote has audit history with {len(history)} entries")
                
                # Check history entries structure
                for entry in history:
                    if 'action' in entry and 'timestamp' in entry:
                        self.log(f"   History entry: {entry['action']} at {entry['timestamp']}")
                    else:
                        self.log(f"❌ Invalid history entry structure: {entry}")
                        return False
                
                # Check if scenario changes are tracked
                scenario_changes = [h for h in history if h.get('action') == 'scenario_changed']
                if scenario_changes:
                    self.log(f"✅ Found {len(scenario_changes)} scenario change entries in audit history")
                    for change in scenario_changes:
                        if 'oldValue' in change and 'newValue' in change:
                            self.log(f"   Scenario changed from {change['oldValue']} to {change['newValue']}")
                
                return True
            else:
                self.log("❌ Quote missing audit history")
                return False
        return False

    def test_manager_price_override(self):
        """Test PATCH /api/calculator/quote/:id/override - Manager Price Override"""
        self.log("\n=== TESTING MANAGER PRICE OVERRIDE ===")
        
        if not self.quote_id:
            self.log("❌ No quote ID available for manager price override test")
            return False
        
        # First get the current quote to see original price
        success, quote_response = self.run_test(
            "Get Quote for Override Test",
            "GET",
            f"calculator/quote/{self.quote_id}",
            200
        )
        
        if not success:
            return False
        
        original_price = quote_response.get('finalPrice') or quote_response.get('visibleTotal', 15000)
        new_price = original_price + 1000  # Override with +$1000
        
        # Test manager price override
        override_data = {
            "newPrice": new_price,
            "reason": "client_negotiation",
            "managerId": "test_manager_001",
            "managerName": "Test Manager"
        }
        
        success, response = self.run_test(
            "Manager Price Override",
            "PATCH",
            f"calculator/quote/{self.quote_id}/override",
            200,
            data=override_data
        )
        
        if success:
            if 'quote' in response and 'override' in response:
                override_info = response['override']
                self.log(f"✅ Price override successful: ${override_info.get('oldPrice')} → ${override_info.get('newPrice')}")
                self.log(f"   Reason: {override_info.get('reason')}")
                self.log(f"   Manager: {override_info.get('managerName')}")
                self.log(f"   Price diff: ${override_info.get('priceDiff')}")
                self.log(f"   Percent change: {override_info.get('percentChange')}%")
                self.log(f"   Margin change: ${override_info.get('marginChange')}")
                return True
            else:
                self.log("❌ Override response missing expected fields")
                return False
        return False

    def test_quote_audit_api(self):
        """Test GET /api/calculator/quote/:id/audit - Quote Audit History API"""
        self.log("\n=== TESTING QUOTE AUDIT API ===")
        
        if not self.quote_id:
            self.log("❌ No quote ID available for audit API test")
            return False
        
        success, response = self.run_test(
            "Get Quote Audit History",
            "GET",
            f"calculator/quote/{self.quote_id}/audit",
            200
        )
        
        if success:
            if 'quoteNumber' in response and 'history' in response:
                self.log(f"✅ Audit API working - Quote: {response['quoteNumber']}")
                self.log(f"   Current price: ${response.get('currentPrice')}")
                self.log(f"   Selected scenario: {response.get('selectedScenario')}")
                
                history = response['history']
                self.log(f"   History entries: {len(history)}")
                
                # Check for manager override entries
                override_entries = [h for h in history if h.get('action') == 'manager_price_override']
                if override_entries:
                    self.log(f"✅ Found {len(override_entries)} manager override entries")
                    for entry in override_entries:
                        if 'newValue' in entry:
                            new_val = entry['newValue']
                            self.log(f"   Override: ${new_val.get('price')} (reason: {new_val.get('reason')})")
                
                # Check summary
                if 'summary' in response:
                    summary = response['summary']
                    self.log(f"   Summary - Total changes: {summary.get('totalChanges')}, Price overrides: {summary.get('priceOverrides')}")
                
                return True
            else:
                self.log("❌ Audit API response missing expected fields")
                return False
        return False

    def test_manager_analytics(self):
        """Test GET /api/calculator/admin/manager-analytics - Manager Override Analytics"""
        self.log("\n=== TESTING MANAGER ANALYTICS ===")
        
        if not self.token:
            self.log("❌ No token available for manager analytics test")
            return False
        
        success, response = self.run_test(
            "Get Manager Override Analytics",
            "GET",
            "calculator/admin/manager-analytics",
            200
        )
        
        if success:
            if 'period' in response and 'byManager' in response:
                self.log(f"✅ Manager analytics working - Period: {response['period']}")
                self.log(f"   Total overrides in period: {response.get('totalOverridesInPeriod', 0)}")
                self.log(f"   Total margin impact: ${response.get('totalMarginImpact', 0)}")
                
                managers = response['byManager']
                self.log(f"   Managers with overrides: {len(managers)}")
                
                for manager in managers[:3]:  # Show first 3 managers
                    self.log(f"   Manager {manager.get('managerName', 'Unknown')}: {manager.get('totalOverrides')} overrides, avg change: {manager.get('avgPercentChange')}%")
                
                return True
            else:
                self.log("❌ Manager analytics response missing expected fields")
                return False
        return False

    def test_revert_to_scenario(self):
        """Test PATCH /api/calculator/quote/:id/revert - Revert to Scenario"""
        self.log("\n=== TESTING REVERT TO SCENARIO ===")
        
        if not self.quote_id:
            self.log("❌ No quote ID available for revert test")
            return False
        
        revert_data = {
            "scenario": "recommended",
            "managerId": "test_manager_001"
        }
        
        success, response = self.run_test(
            "Revert to Scenario Price",
            "PATCH",
            f"calculator/quote/{self.quote_id}/revert",
            200,
            data=revert_data
        )
        
        if success:
            if 'finalPrice' in response and 'selectedScenario' in response:
                self.log(f"✅ Revert successful - Final price: ${response['finalPrice']}")
                self.log(f"   Selected scenario: {response['selectedScenario']}")
                return True
            else:
                self.log("❌ Revert response missing expected fields")
                return False
        return False

    def test_vin_intelligence_flow(self):
        """Test full VIN Intelligence flow with test VINs"""
        self.log("\n=== TESTING VIN INTELLIGENCE FLOW ===")
        
        test_vins = [
            {"vin": "WBA3B3C50EF123456", "expected_price": 8500, "make": "BMW"},
            {"vin": "1HGCV1F34KA000001", "expected_price": 12500, "make": "Honda"}
        ]
        
        for test_vin in test_vins:
            self.log(f"\n--- Testing VIN: {test_vin['vin']} ({test_vin['make']}) ---")
            
            # Create quote with test VIN
            quote_data = {
                "price": test_vin['expected_price'],
                "port": "NJ",
                "vehicleType": "sedan",
                "vin": test_vin['vin'],
                "vehicleTitle": f"{test_vin['make']} Test Vehicle"
            }
            
            success, response = self.run_test(
                f"Create Quote for {test_vin['make']} VIN",
                "POST",
                "calculator/quote",
                201,
                data=quote_data
            )
            
            if success:
                if 'quote' in response and 'id' in response['quote']:
                    vin_quote_id = response['quote']['id']
                    self.log(f"✅ Quote created for {test_vin['make']} VIN: {vin_quote_id}")
                    
                    # Test manager override on this quote
                    override_data = {
                        "newPrice": test_vin['expected_price'] + 500,
                        "reason": "competitive_pricing",
                        "managerId": "test_manager_002",
                        "managerName": "VIN Test Manager"
                    }
                    
                    success, override_response = self.run_test(
                        f"Override Price for {test_vin['make']} VIN",
                        "PATCH",
                        f"calculator/quote/{vin_quote_id}/override",
                        200,
                        data=override_data
                    )
                    
                    if success:
                        self.log(f"✅ Price override successful for {test_vin['make']} VIN")
                    else:
                        self.log(f"❌ Price override failed for {test_vin['make']} VIN")
                        return False
                else:
                    self.log(f"❌ Quote creation failed for {test_vin['make']} VIN")
                    return False
            else:
                self.log(f"❌ Quote creation failed for {test_vin['make']} VIN")
                return False
        
        return True

    def test_quote_analytics_overview(self):
        """Test Quote Analytics Overview endpoint"""
        self.log("\n=== TESTING QUOTE ANALYTICS OVERVIEW ===")
        
        if not self.token:
            self.log("❌ No token available for quote analytics test")
            return False
        
        success, response = self.run_test(
            "Get Quote Analytics Overview",
            "GET",
            "admin/quote-analytics/overview",
            200
        )
        
        if success:
            required_fields = ['totalQuotes', 'conversionRate', 'estimatedMargin', 'totalVisibleRevenue']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                self.log(f"✅ Overview data: {response['totalQuotes']} quotes, {response['conversionRate']}% conversion")
                self.log(f"   Revenue: ${response['totalVisibleRevenue']}, Margin: ${response['estimatedMargin']}")
                return True
            else:
                self.log(f"❌ Missing fields in overview: {missing_fields}")
                return False
        return False

    def test_quote_analytics_scenarios(self):
        """Test Quote Analytics Scenarios endpoint"""
        self.log("\n=== TESTING QUOTE ANALYTICS SCENARIOS ===")
        
        if not self.token:
            self.log("❌ No token available for scenarios analytics test")
            return False
        
        success, response = self.run_test(
            "Get Quote Analytics Scenarios",
            "GET",
            "admin/quote-analytics/scenarios",
            200
        )
        
        if success:
            if isinstance(response, list):
                self.log(f"✅ Found {len(response)} scenario performance records")
                for scenario in response[:3]:  # Check first 3
                    if 'scenario' in scenario and 'count' in scenario and 'conversionRate' in scenario:
                        self.log(f"   {scenario['scenario']}: {scenario['count']} quotes, {scenario['conversionRate']}% conversion")
                    else:
                        self.log("❌ Invalid scenario data structure")
                        return False
                return True
            else:
                self.log("❌ Scenarios response is not a list")
                return False
        return False

    def test_quote_analytics_managers(self):
        """Test Quote Analytics Managers endpoint"""
        self.log("\n=== TESTING QUOTE ANALYTICS MANAGERS ===")
        
        if not self.token:
            self.log("❌ No token available for managers analytics test")
            return False
        
        success, response = self.run_test(
            "Get Quote Analytics Managers",
            "GET",
            "admin/quote-analytics/managers",
            200
        )
        
        if success:
            if isinstance(response, list):
                self.log(f"✅ Found {len(response)} manager performance records")
                for manager in response[:3]:  # Check first 3
                    if 'managerId' in manager and 'totalQuotes' in manager:
                        name = manager.get('managerName', manager['managerId'])
                        self.log(f"   {name}: {manager['totalQuotes']} quotes, {manager.get('conversionRate', 0)}% conversion")
                        if 'overridesCount' in manager:
                            self.log(f"     Overrides: {manager['overridesCount']}, Lost: ${manager.get('revenueLostByOverride', 0)}")
                    else:
                        self.log("❌ Invalid manager data structure")
                        return False
                return True
            else:
                self.log("❌ Managers response is not a list")
                return False
        return False

    def test_quote_analytics_sources(self):
        """Test Quote Analytics Sources endpoint"""
        self.log("\n=== TESTING QUOTE ANALYTICS SOURCES ===")
        
        if not self.token:
            self.log("❌ No token available for sources analytics test")
            return False
        
        success, response = self.run_test(
            "Get Quote Analytics Sources",
            "GET",
            "admin/quote-analytics/sources",
            200
        )
        
        if success:
            if isinstance(response, list):
                self.log(f"✅ Found {len(response)} source performance records")
                for source in response[:3]:  # Check first 3
                    if 'source' in source and 'totalQuotes' in source:
                        self.log(f"   {source['source']}: {source['totalQuotes']} quotes, {source.get('conversionRate', 0)}% conversion")
                        self.log(f"     Revenue: ${source.get('totalVisibleRevenue', 0)}, Margin: ${source.get('estimatedMargin', 0)}")
                    else:
                        self.log("❌ Invalid source data structure")
                        return False
                return True
            else:
                self.log("❌ Sources response is not a list")
                return False
        return False

    def test_quote_analytics_timeline(self):
        """Test Quote Analytics Timeline endpoint"""
        self.log("\n=== TESTING QUOTE ANALYTICS TIMELINE ===")
        
        if not self.token:
            self.log("❌ No token available for timeline analytics test")
            return False
        
        success, response = self.run_test(
            "Get Quote Analytics Timeline",
            "GET",
            "admin/quote-analytics/timeline",
            200
        )
        
        if success:
            if isinstance(response, list):
                self.log(f"✅ Found {len(response)} timeline data points")
                for point in response[:3]:  # Check first 3
                    if 'date' in point and 'totalQuotes' in point:
                        self.log(f"   {point['date']}: {point['totalQuotes']} quotes, margin: ${point.get('totalMargin', 0)}")
                    else:
                        self.log("❌ Invalid timeline data structure")
                        return False
                return True
            else:
                self.log("❌ Timeline response is not a list")
                return False
        return False

    def test_quote_analytics_full_dashboard(self):
        """Test Quote Analytics Full Dashboard endpoint"""
        self.log("\n=== TESTING QUOTE ANALYTICS FULL DASHBOARD ===")
        
        if not self.token:
            self.log("❌ No token available for full dashboard test")
            return False
        
        success, response = self.run_test(
            "Get Quote Analytics Full Dashboard",
            "GET",
            "admin/quote-analytics",
            200
        )
        
        if success:
            required_sections = ['overview', 'scenarios', 'managers', 'sources', 'timeline', 'lostRevenue']
            missing_sections = [section for section in required_sections if section not in response]
            
            if not missing_sections:
                self.log("✅ Full dashboard contains all required sections")
                self.log(f"   Overview: {response['overview'].get('totalQuotes', 0)} quotes")
                self.log(f"   Scenarios: {len(response['scenarios'])} records")
                self.log(f"   Managers: {len(response['managers'])} records")
                self.log(f"   Sources: {len(response['sources'])} records")
                self.log(f"   Timeline: {len(response['timeline'])} data points")
                self.log(f"   Lost Revenue: ${response['lostRevenue'].get('totalLostRevenue', 0)}")
                return True
            else:
                self.log(f"❌ Missing sections in dashboard: {missing_sections}")
                return False
        return False

    def test_admin_login(self):
        """Test admin login and get token"""
        self.log("🔐 Testing Admin Authentication...")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            201,  # Changed from 200 to 201
            data={"email": "admin@crm.com", "password": "admin123"}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.log(f"   Token obtained: {self.token[:20]}...")
            return True
        elif success and 'token' in response:
            self.token = response['token']
            self.log(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_deals_list(self):
        """Test GET /api/deals"""
        success, response = self.run_test(
            "List Deals",
            "GET",
            "deals",
            200
        )
        if success:
            deals_count = len(response.get('data', []))
            self.log(f"   Found {deals_count} deals")
        return success

    def test_deals_stats(self):
        """Test GET /api/deals/stats"""
        success, response = self.run_test(
            "Deals Statistics",
            "GET",
            "deals/stats",
            200
        )
        if success:
            self.log(f"   Total deals: {response.get('total', 0)}")
            self.log(f"   Total value: ${response.get('totalValue', 0)}")
            self.log(f"   Completed: {response.get('completedDeals', 0)}")
            self.log(f"   Cancelled: {response.get('cancelledDeals', 0)}")
        return success

    def test_pipeline_analytics(self):
        """Test GET /api/deals/pipeline-analytics"""
        success, response = self.run_test(
            "Pipeline Analytics",
            "GET",
            "deals/pipeline-analytics",
            200
        )
        if success:
            funnel = response.get('funnel', {})
            self.log(f"   Funnel: {funnel.get('quotes', 0)} quotes → {funnel.get('leads', 0)} leads → {funnel.get('deals', 0)} deals → {funnel.get('completed', 0)} completed")
            self.log(f"   Completion rate: {funnel.get('dealCompletionRate', 0)}%")
        return success

    def test_create_deal(self):
        """Test POST /api/deals"""
        deal_data = {
            "title": f"Test Deal {datetime.now().strftime('%H%M%S')}",
            "clientPrice": 25000,
            "internalCost": 22000,
            "purchasePrice": 20000,
            "vin": "TEST123456789",
            "vehiclePlaceholder": "Test BMW X5 2022",
            "description": "Test deal for API testing"
        }
        
        success, response = self.run_test(
            "Create Deal",
            "POST",
            "deals",
            201,
            data=deal_data
        )
        
        if success and 'id' in response:
            self.created_deal_id = response['id']
            self.log(f"   Created deal ID: {self.created_deal_id}")
        
        return success

    def test_get_deal_by_id(self):
        """Test GET /api/deals/:id"""
        if not self.created_deal_id:
            self.log("❌ No deal ID available for testing")
            return False
            
        success, response = self.run_test(
            "Get Deal by ID",
            "GET",
            f"deals/{self.created_deal_id}",
            200
        )
        
        if success:
            self.log(f"   Deal title: {response.get('title', 'N/A')}")
            self.log(f"   Status: {response.get('status', 'N/A')}")
            self.log(f"   Client price: ${response.get('clientPrice', 0)}")
        
        return success

    def test_update_deal_status(self):
        """Test PATCH /api/deals/:id/status"""
        if not self.created_deal_id:
            self.log("❌ No deal ID available for testing")
            return False
            
        # Test valid status transition: new → negotiation
        success, response = self.run_test(
            "Update Deal Status (new → negotiation)",
            "PATCH",
            f"deals/{self.created_deal_id}/status",
            200,
            data={"status": "negotiation", "notes": "Started negotiations"}
        )
        
        if success:
            self.log(f"   Updated status: {response.get('status', 'N/A')}")
        
        return success

    def test_update_deal_finance(self):
        """Test PATCH /api/deals/:id/finance"""
        if not self.created_deal_id:
            self.log("❌ No deal ID available for testing")
            return False
            
        finance_data = {
            "realCost": 21500,
            "realRevenue": 24500
        }
        
        success, response = self.run_test(
            "Update Deal Finance",
            "PATCH",
            f"deals/{self.created_deal_id}/finance",
            200,
            data=finance_data
        )
        
        if success:
            self.log(f"   Real cost: ${response.get('realCost', 0)}")
            self.log(f"   Real revenue: ${response.get('realRevenue', 0)}")
            self.log(f"   Real profit: ${response.get('realProfit', 0)}")
        
        return success

    def test_invalid_status_transition(self):
        """Test invalid status transition"""
        if not self.created_deal_id:
            self.log("❌ No deal ID available for testing")
            return False
            
        # Try invalid transition: negotiation → completed (should fail)
        success, response = self.run_test(
            "Invalid Status Transition (negotiation → completed)",
            "PATCH",
            f"deals/{self.created_deal_id}/status",
            400,  # Expecting bad request
            data={"status": "completed"}
        )
        
        return success

    def test_complete_deal_workflow(self):
        """Test complete deal status workflow"""
        if not self.created_deal_id:
            self.log("❌ No deal ID available for testing")
            return False
            
        # Test valid workflow: negotiation → waiting_deposit → deposit_paid → purchased → in_delivery → completed
        workflow_steps = [
            ("waiting_deposit", "Waiting for deposit"),
            ("deposit_paid", "Deposit received"),
            ("purchased", "Vehicle purchased"),
            ("in_delivery", "In delivery"),
            ("completed", "Deal completed")
        ]
        
        all_passed = True
        for status, notes in workflow_steps:
            success, response = self.run_test(
                f"Status Transition → {status}",
                "PATCH",
                f"deals/{self.created_deal_id}/status",
                200,
                data={"status": status, "notes": notes}
            )
            if not success:
                all_passed = False
                break
            self.log(f"   Status updated to: {response.get('status', 'N/A')}")
        
        return all_passed

    def test_create_deal_from_lead(self):
        """Test POST /api/deals/from-lead (if lead exists)"""
        # This test might fail if no leads exist, which is expected
        test_data = {
            "leadId": "test-lead-id",
            "notes": "Created from test lead"
        }
        
        success, response = self.run_test(
            "Create Deal from Lead",
            "POST",
            "deals/from-lead",
            404,  # Expecting not found since test lead doesn't exist
            data=test_data
        )
        
        # This test passes if we get expected 404 (lead not found)
        return success

    def run_all_tests(self):
        """Run all backend tests"""
        self.log("🚀 Starting BIBI Cars CRM - Deals System v2.0 Backend Testing")
        self.log(f"   Base URL: {self.base_url}")
        
        # Test sequence
        tests = [
            ("Admin Authentication", self.test_admin_login),
            ("List Deals", self.test_deals_list),
            ("Deals Statistics", self.test_deals_stats),
            ("Pipeline Analytics", self.test_pipeline_analytics),
            ("Create Deal", self.test_create_deal),
            ("Get Deal by ID", self.test_get_deal_by_id),
            ("Update Deal Status", self.test_update_deal_status),
            ("Update Deal Finance", self.test_update_deal_finance),
            ("Invalid Status Transition", self.test_invalid_status_transition),
            ("Complete Deal Workflow", self.test_complete_deal_workflow),
            ("Create Deal from Lead", self.test_create_deal_from_lead),
        ]
        
        failed_tests = []
        
        for test_name, test_func in tests:
            try:
                if not test_func():
                    failed_tests.append(test_name)
            except Exception as e:
                self.log(f"❌ {test_name} failed with exception: {str(e)}")
                failed_tests.append(test_name)
        
        # Final results
        self.log(f"\n📊 FINAL RESULTS")
        self.log(f"   Tests run: {self.tests_run}")
        self.log(f"   Tests passed: {self.tests_passed}")
        self.log(f"   Tests failed: {self.tests_run - self.tests_passed}")
        self.log(f"   Success rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        
        if failed_tests:
            self.log(f"\n❌ Failed tests: {', '.join(failed_tests)}")
            return False
        else:
            self.log("\n✅ All tests passed!")
            return True

def main():
    """Main test runner"""
    tester = DealsAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())