import http from "k6/http";
import { check } from "k6";

// Configuration
export let options = {
  stages: [
    { duration: "10s", target: 50 }, // Ramp up to 50 users over 10 seconds
    { duration: "50s", target: 100 }, // Stay at 100 users for 50 seconds
    { duration: "10s", target: 0 }, // Ramp down to 0 users over 10 seconds
  ],
  thresholds: {
    http_req_duration: ["p(95)<200"], // 95% of requests must be below 200ms
    http_req_failed: ["rate<0.1"], // Error rate must be below 10%
  },
};

// Test configuration
const BASE_URL = "http://localhost:3000";
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE1MGI2YzJmLTU3MDItNGVkYy1hOWI4LTJjOTBlNDNlMDViZiIsImlhdCI6MTc1MTczMjQ2OSwiZXhwIjoxNzUxNzM2MDY5fQ.AUToVb6yd7KWJ91UnFnfhzPzYGGNNCEbF5cU2vcMpHk";

// Headers
const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

export default function () {
  // Make GET request to categories endpoint
  let response = http.get(`${BASE_URL}/api/categories`, {
    headers: headers,
  });

  // Checks
  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 200ms": (r) => r.timings.duration < 200,
    "has response body": (r) => r.body.length > 0,
  });

  // Optional: Add small delay between requests to simulate real user behavior
  // sleep(1);
}

// Setup function (runs once before test)
export function setup() {
  console.log("Starting performance test for Categories API");
  console.log("Target: 95th percentile response time < 200ms");
}

// Teardown function (runs once after test)
export function teardown() {
  console.log("Performance test completed");
}
