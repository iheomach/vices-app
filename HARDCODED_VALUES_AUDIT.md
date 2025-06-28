# 🔍 HARDCODED VALUES AUDIT REPORT

## 🚨 **CRITICAL - Security Issues (Fix Immediately)**

### 1. **Insecure SECRET_KEY** 
**Files:** 
- `vices_db/.env` (line 3)
- `vices_db/.env.example` (line 10) 

**Issue:** Using default Django insecure secret key
```python
SECRET_KEY=django-insecure-ni%z2@xb84%6n^y*r=6@786hfy3z56)qrs1rnnvz6a$9l=updv
```

**Fix:** Generate new secure key:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## ⚠️ **HIGH PRIORITY - Personal/Business Data**

### 2. **Personal Username in Database Config**
**Files:**
- `vices_db/.env` (line 7)
- `vices_db/.env.example` (line 3)
- `vices_db/vices_db/settings/base.py` (line 81)
- `vices_db/vices_db/settings/development.py` (line 14)

**Issue:** Hardcoded personal username
```
DB_USER=iheomachukwuomorotionmwan
```

**Fix:** Use environment variable or generic username for examples

### 3. **Business Email Address**
**Files:**
- `vices_db/.env` (lines 14, 30)
- `vices_db/.env.example` (line 17)
- `vices_db/vices_db/settings/base.py` (line 241)
- `src/pages/TermsOfServicePage.tsx` (line 48)
- `src/pages/ContactUsPage.tsx` (line 46)
- `src/pages/PrivacyPolicyPage.tsx` (lines 43, 50)

**Issue:** Business email hardcoded in multiple places
```
myvicesapp@gmail.com
```

**Fix:** Create environment variable `CONTACT_EMAIL`

### 4. **Personal LinkedIn Profile**
**File:** `src/pages/AboutUsPage.tsx` (line 28)
```tsx
<a href="https://linkedin.com/in/richardomor" ...>
```

**Fix:** Move to environment variable `LINKEDIN_PROFILE`

---

## 📧 **MEDIUM PRIORITY - Configuration**

### 5. **SMTP Server Configuration**
**Files:**
- `vices_db/vices_db/settings/production.py` (line 95)
- `vices_db/vices_db/settings/base.py` (line 238)

**Issue:** Hardcoded Gmail SMTP
```python
EMAIL_HOST = 'smtp.gmail.com'
```

**Fix:** Use environment variable `EMAIL_HOST`

### 6. **Mock Test Data in Frontend**
**File:** `src/pages/UserProfile.tsx` (lines 41-46)
```tsx
firstName: user?.first_name || 'Alex',
lastName: user?.last_name || 'Johnson',
email: user?.email || 'alex@example.com',
dateOfBirth: '1990-05-15',
location: 'Calgary, AB',
bio: 'Wellness enthusiast focused on mindful consumption...'
```

**Fix:** Use proper fallback values or loading states

### 7. **Database Name**
**File:** `vices_db/vices_db/settings/development.py` (line 13)
```python
'NAME': os.getenv('DB_NAME', 'vices_backend_sqlite'),
```

**Fix:** Use more generic default name

---

## 💳 **PAYMENT/API KEYS**

### 8. **Stripe Test Keys**
**File:** `.env` (line 8)
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

**Status:** ✅ Already using placeholder - OK

---

## 🌐 **ENVIRONMENT URLS**

### 9. **Localhost URLs** (Development only - OK)
**Files:**
- Multiple files contain localhost URLs
- These are appropriate for development environments

---

## 📱 **APP BRANDING**

### 10. **App Name "VICES"**
**Files:** Multiple frontend files
**Status:** ✅ This is your brand name - keep as is

---

# 🔧 **RECOMMENDED FIXES**

## 1. **Create Comprehensive Environment Variables**

### Backend (.env):
```bash
# Security
SECRET_KEY=your_generated_secure_key_here

# Database  
DB_NAME=vices_production
DB_USER=vices_user
DB_PASSWORD=secure_password
DB_HOST=localhost
DB_PORT=5432

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your_email@domain.com
EMAIL_HOST_PASSWORD=your_app_password
CONTACT_EMAIL=support@yourdomain.com

# Business Info
COMPANY_LINKEDIN=https://linkedin.com/company/yourcompany
SUPPORT_EMAIL=support@yourdomain.com
```

### Frontend (.env):
```bash
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_CONTACT_EMAIL=support@yourdomain.com
REACT_APP_LINKEDIN_PROFILE=https://linkedin.com/company/yourcompany
REACT_APP_SUPPORT_EMAIL=support@yourdomain.com
```

## 2. **Update Code to Use Environment Variables**

### Example fix for contact email:
```tsx
// Instead of hardcoded email
const CONTACT_EMAIL = process.env.REACT_APP_CONTACT_EMAIL || 'support@yourdomain.com';

<a href={`mailto:${CONTACT_EMAIL}`}>
  {CONTACT_EMAIL}
</a>
```

## 3. **Remove Mock Data**

### UserProfile.tsx fix:
```tsx
const [profile, setProfile] = useState<UserProfile>({
  firstName: user?.first_name || '',
  lastName: user?.last_name || '',
  email: user?.email || '',
  dateOfBirth: '',
  location: '',
  bio: '',
  // ... rest with empty defaults
});
```

---

# 🎯 **PRIORITY ACTION ITEMS**

1. **🔥 IMMEDIATE**: Generate new SECRET_KEY
2. **🔥 IMMEDIATE**: Remove personal username from defaults
3. **📧 HIGH**: Create environment variables for business emails
4. **🔧 MEDIUM**: Replace hardcoded SMTP settings
5. **🧹 MEDIUM**: Clean up mock data in UserProfile
6. **🔗 LOW**: Move LinkedIn profile to environment variable

This audit found **10 categories** of hardcoded values, with **3 critical security issues** that should be fixed immediately.
