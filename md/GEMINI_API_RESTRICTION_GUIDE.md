# Gemini API Key Restriction Guide (Domain-Only Referrer)

This guide shows you how to lock your **Gemini API Key** in Google Cloud Console / Google AI Studio so that only your domain can make requests with it.

If any third party attempts to steal your key and use it from curl, Postman, or their own website, Google will immediately reject the request with `403 Forbidden: Request originated from unauthorized website`.

---

## 1. Quick Step-by-Step Instructions

### Step 1: Open Google Cloud Console Credentials
1. Go to [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials).
2. Select the project where your Gemini API Key was generated (e.g., your Firebase or Google AI project).

---

### Step 2: Select Your Gemini API Key
1. Under **API Keys**, locate the key used by your portfolio (starts with `AIzaSy...`).
2. Click on the key name or the **Edit (pencil icon)** button.

---

### Step 3: Configure "Application Restrictions" (HTTP Referrers)
1. Under the **Application restrictions** section, select:
   - **Websites (HTTP referrers)**
2. In the **Website restrictions** list, click **+ Add**:
   Add the following patterns (replace `yourdomain.com` with your live domain or Firebase Hosting domain):

   ```text
   https://aritsiaserlet.web.app/*
   https://aritsiaserlet.firebaseapp.com/*
   https://yourdomain.com/*
   http://localhost:*
   http://127.0.0.1:*
   ```

   > [!NOTE]
   > The trailing `/*` is mandatory so that all subpaths and query parameters on your website are allowed.
   > The `http://localhost:*` pattern allows you to test AI features during local development.

---

### Step 4: Configure "API Restrictions" (Scope Lockdown)
1. Scroll down to the **API restrictions** section.
2. Select **Restrict key**.
3. In the dropdown, check **ONLY**:
   - **Generative Language API**
4. This ensures that even if something goes wrong, the key cannot be used to invoke Google Cloud Compute, Storage, BigQuery, or other paid Google Cloud services.

---

### Step 5: Save and Verify
1. Click **Save** at the bottom of the page.
2. Changes take effect in **1 to 5 minutes** across Google's edge servers.

---

## 2. Testing the Restriction

You can verify that the restriction is active by running a test request from your terminal:

```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

- **Expected Response**:
  ```json
  {
    "error": {
      "code": 403,
      "message": "Requests from this referrer <empty> are blocked.",
      "status": "PERMISSION_DENIED"
    }
  }
  ```
- **From your browser** (on your allowed domain):
  The request will succeed with `200 OK` because the browser automatically sends the matching `Referer` header.
