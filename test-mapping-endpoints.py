#!/usr/bin/env python3
"""
Test script for Mapping Module endpoints
Tests all 31 endpoints across 4 controllers
"""

import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:3000/api/v1"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQG9jdXBhbGxpLmNvbS5iciIsInN1YiI6ImNtaW1kamFuYzAwMDAxNGdkdXBsYjJlNmoiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjQ1ODA3OTcsImV4cCI6MTc2NDU4MTY5N30.fV-BFPRfpZL9lVxoSG5jLe_WPPMmkEcWP4AeQgP0jl4"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

test_results = []

def log_result(test_name: str, success: bool, details: str = ""):
    """Log test result"""
    status = "✅" if success else "❌"
    result = f"{status} {test_name}"
    if details:
        result += f"\n   {details}"
    print(result)
    test_results.append({"test": test_name, "success": success, "details": details})

def test_risk_categories():
    """Test Risk Category endpoints (5 endpoints)"""
    print("\n🔹 TESTING RISK CATEGORIES")

    # 1. List all risk categories (seeded data)
    try:
        r = requests.get(f"{BASE_URL}/mapping/risk-categories", headers=headers)
        categories = r.json()
        log_result("GET /risk-categories", r.status_code == 200, f"Found {len(categories)} categories")
        category_id = categories[0]["id"] if categories else None
    except Exception as e:
        log_result("GET /risk-categories", False, str(e))
        return

    # 2. Get single risk category
    if category_id:
        try:
            r = requests.get(f"{BASE_URL}/mapping/risk-categories/{category_id}", headers=headers)
            log_result("GET /risk-categories/:id", r.status_code == 200, f"Retrieved: {r.json().get('name')}")
        except Exception as e:
            log_result("GET /risk-categories/:id", False, str(e))

    # 3. Create new risk category
    try:
        payload = {
            "name": "Riscos de Teste",
            "color": "#FF5733",
            "icon": "test-icon"
        }
        r = requests.post(f"{BASE_URL}/mapping/risk-categories", headers=headers, json=payload)
        new_category = r.json()
        log_result("POST /risk-categories", r.status_code == 201, f"Created: {new_category.get('id')}")
        test_category_id = new_category.get("id")
    except Exception as e:
        log_result("POST /risk-categories", False, str(e))
        test_category_id = None

    # 4. Update risk category
    if test_category_id:
        try:
            payload = {"name": "Riscos de Teste Atualizado"}
            r = requests.patch(f"{BASE_URL}/mapping/risk-categories/{test_category_id}", headers=headers, json=payload)
            log_result("PATCH /risk-categories/:id", r.status_code == 200, "Updated successfully")
        except Exception as e:
            log_result("PATCH /risk-categories/:id", False, str(e))

    # 5. Delete risk category
    if test_category_id:
        try:
            r = requests.delete(f"{BASE_URL}/mapping/risk-categories/{test_category_id}", headers=headers)
            log_result("DELETE /risk-categories/:id", r.status_code == 200, "Deleted successfully")
        except Exception as e:
            log_result("DELETE /risk-categories/:id", False, str(e))

def test_risks():
    """Test Risk endpoints (5 endpoints)"""
    print("\n🔹 TESTING RISKS")

    # Get a category first
    try:
        r = requests.get(f"{BASE_URL}/mapping/risk-categories", headers=headers)
        categories = r.json()
        category_id = categories[0]["id"] if categories else None
    except:
        category_id = None

    # 1. List all risks
    try:
        r = requests.get(f"{BASE_URL}/mapping/risks", headers=headers)
        risks = r.json()
        log_result("GET /risks", r.status_code == 200, f"Found {len(risks)} risks")
        risk_id = risks[0]["id"] if risks else None
    except Exception as e:
        log_result("GET /risks", False, str(e))
        return

    # 2. Filter risks by type
    try:
        r = requests.get(f"{BASE_URL}/mapping/risks?type=PHYSICAL", headers=headers)
        log_result("GET /risks?type=PHYSICAL", r.status_code == 200, f"Found {len(r.json())} physical risks")
    except Exception as e:
        log_result("GET /risks?type=PHYSICAL", False, str(e))

    # 3. Get single risk
    if risk_id:
        try:
            r = requests.get(f"{BASE_URL}/mapping/risks/{risk_id}", headers=headers)
            log_result("GET /risks/:id", r.status_code == 200, f"Retrieved: {r.json().get('name')}")
        except Exception as e:
            log_result("GET /risks/:id", False, str(e))

    # 4. Create new risk
    if category_id:
        try:
            payload = {
                "categoryId": category_id,
                "type": "PHYSICAL",
                "code": "99.99.999",
                "name": "Risco de Teste",
                "allowsIntensity": True
            }
            r = requests.post(f"{BASE_URL}/mapping/risks", headers=headers, json=payload)
            new_risk = r.json()
            log_result("POST /risks", r.status_code == 201, f"Created: {new_risk.get('id')}")
            test_risk_id = new_risk.get("id")
        except Exception as e:
            log_result("POST /risks", False, str(e))
            test_risk_id = None

        # 5. Delete risk (soft delete)
        if test_risk_id:
            try:
                r = requests.delete(f"{BASE_URL}/mapping/risks/{test_risk_id}", headers=headers)
                log_result("DELETE /risks/:id", r.status_code == 200, "Soft deleted successfully")
            except Exception as e:
                log_result("DELETE /risks/:id", False, str(e))

def test_environments():
    """Test Environment endpoints (8 endpoints)"""
    print("\n🔹 TESTING ENVIRONMENTS")

    # Get a company first
    try:
        r = requests.get(f"{BASE_URL}/companies", headers=headers)
        companies = r.json()
        company_id = companies[0]["id"] if companies else None
    except:
        company_id = None
        log_result("GET /companies (prerequisite)", False, "No company found")
        return

    # Get a risk for environment testing
    try:
        r = requests.get(f"{BASE_URL}/mapping/risks", headers=headers)
        risks = r.json()
        risk_id = risks[0]["id"] if risks else None
    except:
        risk_id = None

    # 1. List all environments
    try:
        r = requests.get(f"{BASE_URL}/mapping/environments", headers=headers)
        envs = r.json()
        log_result("GET /environments", r.status_code == 200, f"Found {len(envs)} environments")
        env_id = envs[0]["id"] if envs else None
    except Exception as e:
        log_result("GET /environments", False, str(e))
        return

    # 2. Filter environments by company
    try:
        r = requests.get(f"{BASE_URL}/mapping/environments?companyId={company_id}", headers=headers)
        log_result("GET /environments?companyId", r.status_code == 200, f"Found {len(r.json())} company environments")
    except Exception as e:
        log_result("GET /environments?companyId", False, str(e))

    # 3. Get single environment
    if env_id:
        try:
            r = requests.get(f"{BASE_URL}/mapping/environments/{env_id}", headers=headers)
            log_result("GET /environments/:id", r.status_code == 200, f"Retrieved: {r.json().get('name')}")
        except Exception as e:
            log_result("GET /environments/:id", False, str(e))

    # 4. Create new environment
    try:
        payload = {
            "companyId": company_id,
            "name": "Ambiente de Teste",
            "locationType": "EMPLOYER_ESTABLISHMENT",
            "registeredInESocial": False
        }
        r = requests.post(f"{BASE_URL}/mapping/environments", headers=headers, json=payload)
        new_env = r.json()
        log_result("POST /environments", r.status_code == 201, f"Created: {new_env.get('id')}")
        test_env_id = new_env.get("id")
    except Exception as e:
        log_result("POST /environments", False, str(e))
        test_env_id = None

    # 5. Update environment
    if test_env_id:
        try:
            payload = {"description": "Ambiente atualizado via teste"}
            r = requests.patch(f"{BASE_URL}/mapping/environments/{test_env_id}", headers=headers, json=payload)
            log_result("PATCH /environments/:id", r.status_code == 200, "Updated successfully")
        except Exception as e:
            log_result("PATCH /environments/:id", False, str(e))

    # 6. Add risk to environment
    if test_env_id and risk_id:
        try:
            payload = {"riskId": risk_id}
            r = requests.post(f"{BASE_URL}/mapping/environments/{test_env_id}/risks", headers=headers, json=payload)
            log_result("POST /environments/:id/risks", r.status_code == 201, "Risk added to environment")
        except Exception as e:
            log_result("POST /environments/:id/risks", False, str(e))

    # 7. Get environment risks
    if test_env_id:
        try:
            r = requests.get(f"{BASE_URL}/mapping/environments/{test_env_id}/risks", headers=headers)
            log_result("GET /environments/:id/risks", r.status_code == 200, f"Found {len(r.json())} risks")
        except Exception as e:
            log_result("GET /environments/:id/risks", False, str(e))

    # 8. Delete environment
    if test_env_id:
        try:
            r = requests.delete(f"{BASE_URL}/mapping/environments/{test_env_id}", headers=headers)
            log_result("DELETE /environments/:id", r.status_code == 200, "Deleted successfully")
        except Exception as e:
            log_result("DELETE /environments/:id", False, str(e))

def test_job_mapping():
    """Test Job Mapping endpoints (13 endpoints)"""
    print("\n🔹 TESTING JOB MAPPING")

    # Get prerequisites
    try:
        r = requests.get(f"{BASE_URL}/companies", headers=headers)
        companies = r.json()
        company_id = companies[0]["id"] if companies else None
    except:
        company_id = None

    try:
        r = requests.get(f"{BASE_URL}/mapping/environments", headers=headers)
        envs = r.json()
        env_id = envs[0]["id"] if envs else None
    except:
        env_id = None

    try:
        r = requests.get(f"{BASE_URL}/mapping/risks", headers=headers)
        risks = r.json()
        risk_id = risks[0]["id"] if risks else None
    except:
        risk_id = None

    # 1. List all jobs
    try:
        r = requests.get(f"{BASE_URL}/mapping/jobs", headers=headers)
        jobs = r.json()
        log_result("GET /jobs", r.status_code == 200, f"Found {len(jobs)} jobs")
    except Exception as e:
        log_result("GET /jobs", False, str(e))
        return

    # 2. Create new job with mapping
    if company_id:
        try:
            payload = {
                "companyId": company_id,
                "title": "Cargo de Teste",
                "cbo": "999999"
            }
            r = requests.post(f"{BASE_URL}/mapping/jobs", headers=headers, json=payload)
            new_job = r.json()
            log_result("POST /jobs", r.status_code == 201, f"Created: {new_job.get('id')}")
            test_job_id = new_job.get("id")
        except Exception as e:
            log_result("POST /jobs", False, str(e))
            test_job_id = None

        if test_job_id:
            # 3. Get single job
            try:
                r = requests.get(f"{BASE_URL}/mapping/jobs/{test_job_id}", headers=headers)
                log_result("GET /jobs/:id", r.status_code == 200, f"Retrieved: {r.json().get('title')}")
            except Exception as e:
                log_result("GET /jobs/:id", False, str(e))

            # 4. Update job
            try:
                payload = {"title": "Cargo de Teste Atualizado"}
                r = requests.patch(f"{BASE_URL}/mapping/jobs/{test_job_id}", headers=headers, json=payload)
                log_result("PATCH /jobs/:id", r.status_code == 200, "Updated successfully")
            except Exception as e:
                log_result("PATCH /jobs/:id", False, str(e))

            # 5. Update job notes
            try:
                payload = {
                    "functionDescription": "Descrição da função",
                    "riskAnalysis": "Análise de riscos"
                }
                r = requests.patch(f"{BASE_URL}/mapping/jobs/{test_job_id}/notes", headers=headers, json=payload)
                log_result("PATCH /jobs/:id/notes", r.status_code == 200, "Notes updated")
            except Exception as e:
                log_result("PATCH /jobs/:id/notes", False, str(e))

            # 6. Get job notes
            try:
                r = requests.get(f"{BASE_URL}/mapping/jobs/{test_job_id}/notes", headers=headers)
                log_result("GET /jobs/:id/notes", r.status_code == 200, "Notes retrieved")
            except Exception as e:
                log_result("GET /jobs/:id/notes", False, str(e))

            # 7. Add environment to job
            if env_id:
                try:
                    payload = {"environmentId": env_id}
                    r = requests.post(f"{BASE_URL}/mapping/jobs/{test_job_id}/environments", headers=headers, json=payload)
                    log_result("POST /jobs/:id/environments", r.status_code == 201, "Environment added")
                except Exception as e:
                    log_result("POST /jobs/:id/environments", False, str(e))

                # 8. Get job environments
                try:
                    r = requests.get(f"{BASE_URL}/mapping/jobs/{test_job_id}/environments", headers=headers)
                    log_result("GET /jobs/:id/environments", r.status_code == 200, f"Found {len(r.json())} environments")
                except Exception as e:
                    log_result("GET /jobs/:id/environments", False, str(e))

            # 9. Add risk to job
            if risk_id:
                try:
                    payload = {"riskId": risk_id}
                    r = requests.post(f"{BASE_URL}/mapping/jobs/{test_job_id}/risks", headers=headers, json=payload)
                    log_result("POST /jobs/:id/risks", r.status_code == 201, "Risk added")
                except Exception as e:
                    log_result("POST /jobs/:id/risks", False, str(e))

                # 10. Get job risks
                try:
                    r = requests.get(f"{BASE_URL}/mapping/jobs/{test_job_id}/risks", headers=headers)
                    log_result("GET /jobs/:id/risks", r.status_code == 200, f"Found {len(r.json())} risks")
                except Exception as e:
                    log_result("GET /jobs/:id/risks", False, str(e))

            # 11. Add exam to job
            try:
                payload = {
                    "examName": "Audiometria",
                    "examType": "ADMISSIONAL",
                    "isRequired": True
                }
                r = requests.post(f"{BASE_URL}/mapping/jobs/{test_job_id}/exams", headers=headers, json=payload)
                log_result("POST /jobs/:id/exams", r.status_code == 201, "Exam added")
            except Exception as e:
                log_result("POST /jobs/:id/exams", False, str(e))

            # 12. Get job exams
            try:
                r = requests.get(f"{BASE_URL}/mapping/jobs/{test_job_id}/exams", headers=headers)
                log_result("GET /jobs/:id/exams", r.status_code == 200, f"Found {len(r.json())} exams")
            except Exception as e:
                log_result("GET /jobs/:id/exams", False, str(e))

            # 13. Delete job
            try:
                r = requests.delete(f"{BASE_URL}/mapping/jobs/{test_job_id}", headers=headers)
                log_result("DELETE /jobs/:id", r.status_code == 200, "Deleted successfully")
            except Exception as e:
                log_result("DELETE /jobs/:id", False, str(e))

def print_summary():
    """Print test summary"""
    total = len(test_results)
    passed = sum(1 for r in test_results if r["success"])
    failed = total - passed

    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    print(f"Total tests: {total}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"Success rate: {(passed/total*100):.1f}%")
    print("="*60)

    if failed > 0:
        print("\n⚠️  Failed tests:")
        for r in test_results:
            if not r["success"]:
                print(f"   - {r['test']}: {r['details']}")

if __name__ == "__main__":
    print("🚀 STARTING MAPPING MODULE TESTS")
    print("="*60)

    test_risk_categories()
    test_risks()
    test_environments()
    test_job_mapping()

    print_summary()
