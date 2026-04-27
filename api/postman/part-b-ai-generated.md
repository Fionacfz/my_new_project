# Part B — AI-Generated Endpoint Automation

**Endpoint automated:** `GET /booking/:id` (GetBooking)  
**AI Tool used:** Claude (claude-sonnet-4-6)  
**Prompt given to AI:**
> "Write Postman test scripts for the GET /booking/:id endpoint of the Restful Booker API at https://restful-booker.herokuapp.com. The endpoint returns a JSON booking object with fields: firstname, lastname, totalprice, depositpaid, bookingdates (checkin/checkout), additionalneeds. Include positive and negative tests."

---

## Raw AI Output

The following JSON was produced directly by the AI with no modifications:

```json
{
  "name": "GetBooking",
  "item": [
    {
      "name": "GetBooking - success",
      "event": [{
        "listen": "test",
        "script": {
          "exec": [
            "pm.test('Status is 200', () => { pm.response.to.have.status(200); });",
            "pm.test('Response has booking fields', () => {",
            "    const b = pm.response.json();",
            "    pm.expect(b).to.have.property('firstname');",
            "    pm.expect(b).to.have.property('lastname');",
            "    pm.expect(b).to.have.property('totalprice');",
            "});",
            "pm.test('Response time is acceptable', () => {",
            "    pm.expect(pm.response.responseTime).to.be.below(2000);",
            "});"
          ]
        }
      }],
      "request": {
        "method": "GET",
        "url": "https://restful-booker.herokuapp.com/booking/1"
      }
    },
    {
      "name": "GetBooking - not found",
      "event": [{
        "listen": "test",
        "script": {
          "exec": [
            "pm.test('Status is 404', () => { pm.response.to.have.status(404); });"
          ]
        }
      }],
      "request": {
        "method": "GET",
        "url": "https://restful-booker.herokuapp.com/booking/99999"
      }
    }
  ]
}
```

---

## Annotated Corrections & Improvements

The raw output was functional but had **8 issues** that were corrected before inclusion in the final collection. Each is annotated below.

---

### Issue 1 — Hardcoded booking ID is fragile

**AI output:**
```json
"url": "https://restful-booker.herokuapp.com/booking/1"
```

**Problem:** Booking ID `1` is an assumption — it may have been deleted or may not exist on the live server. Tests that depend on pre-existing data are not repeatable.

**Fix:** Added a `[Setup]` request that calls `POST /booking` to create a known booking first, stores the returned `bookingid` in `{{testBookingId}}`, and the test uses that dynamic variable. This is the `[Setup]` pattern used throughout the collection.

```json
"url": "{{baseUrl}}/booking/{{testBookingId}}"
```

---

### Issue 2 — Hardcoded base URL

**AI output:**
```
"url": "https://restful-booker.herokuapp.com/booking/1"
```

**Problem:** Hardcoding the URL makes the collection non-portable. Switching environments (staging, local) would require editing every request.

**Fix:** Replaced with `{{baseUrl}}` collection variable, consistent with the rest of the suite.

---

### Issue 3 — Field presence check is incomplete and doesn't validate values

**AI output:**
```js
pm.expect(b).to.have.property('firstname');
pm.expect(b).to.have.property('lastname');
pm.expect(b).to.have.property('totalprice');
```

**Problem:** Only 3 of 6 fields are checked, and none of the values are asserted. A response that returned the wrong data would still pass.

**Fix:** Used `have.all.keys` to assert all required fields at once, and added value assertions by comparing against what was submitted in the `[Setup]` request:

```js
pm.test('All required fields are present', () => {
    pm.expect(b).to.have.all.keys(
        'firstname','lastname','totalprice','depositpaid','bookingdates','additionalneeds'
    );
});
pm.test('Booking fields match what was created', () => {
    pm.expect(b.firstname).to.equal('GetTest');
    pm.expect(b.totalprice).to.equal(150);
    pm.expect(b.depositpaid).to.equal(true);
    pm.expect(b.bookingdates.checkin).to.equal('2025-06-01');
    pm.expect(b.additionalneeds).to.equal('Breakfast');
});
```

---

### Issue 4 — No test data cleanup

**AI output:** *(no cleanup)*

**Problem:** The `[Setup]` booking created for the test is left in the database permanently, polluting the environment for every subsequent run.

**Fix:** Added a `pm.sendRequest` DELETE call inside the test script to clean up after assertion:

```js
pm.sendRequest({
    url: pm.collectionVariables.get('baseUrl') + '/booking/' + pm.environment.get('testBookingId'),
    method: 'DELETE',
    header: [{ key: 'Cookie', value: 'token=' + pm.environment.get('token') }]
}, () => {});
```

---

### Issue 5 — Missing `Accept: application/json` header

**AI output:** *(no headers)*

**Problem:** Without an `Accept` header, the server may return XML instead of JSON. This would cause `pm.response.json()` to throw an error and silently fail all assertions that follow.

**Fix:** Added the `Accept: application/json` header to all GET requests in this folder.

---

### Issue 6 — Non-existent ID `99999` is not safe

**AI output:**
```
"url": ".../booking/99999"
```

**Problem:** In a heavily used environment, booking ID 99999 could legitimately exist, causing a false pass on the 404 test.

**Fix:** Changed to `999999999` — a value high enough to be safely outside any realistic ID range.

---

### Issue 7 — Missing edge case: string (non-numeric) ID

**AI output:** *(only tested numeric non-existent ID)*

**Problem:** Sending a non-numeric path segment like `/booking/notanid` is a separate code path on the server and should be tested independently.

**Fix:** Added test `RB-G-003 GetBooking — string ID returns 404` to cover this case.

---

### Issue 8 — Missing XML response test

**AI output:** *(no content negotiation test)*

**Problem:** The Restful Booker API supports `Accept: application/xml`, which returns the booking as an XML document. This behaviour is not tested.

**Fix:** Added `RB-G-004 GetBooking — Accept XML returns valid XML`, which sets `Accept: application/xml` and asserts the response body contains `<booking>` and `<firstname>`.

---

## Final Corrected Version

The corrected tests are implemented in the `GetBooking` folder of `restful-booker.collection.json` as requests `RB-G-001` through `RB-G-004`. All 8 issues above are resolved there.

| Test | What it covers |
|---|---|
| `RB-G-001` | Happy path — creates a booking, GETs it, asserts all fields and values, cleans up |
| `RB-G-002` | Negative — numeric ID that does not exist returns 404 |
| `RB-G-003` | Negative — non-numeric ID returns 404 |
| `RB-G-004` | Edge case — XML content negotiation returns valid XML |
