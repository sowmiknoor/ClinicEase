# 🚀 ClinicEase - Quick Start Guide
**Everything you need to run and test your application**

---

## ⚡ Quick Commands

### Start Backend Server:
```bash
cd /Users/sowmiknoor/Desktop/ClinicEase/backend
npm run dev
```
**Backend URL:** `http://localhost:5001`

### Start Frontend Server:
```bash
cd /Users/sowmiknoor/Desktop/ClinicEase/frontend
npm run dev
```
**Frontend URL:** `http://localhost:5173`

### Start Both (use separate terminals):
```bash
# Terminal 1 - Backend
cd /Users/sowmiknoor/Desktop/ClinicEase/backend && npm run dev

# Terminal 2 - Frontend  
cd /Users/sowmiknoor/Desktop/ClinicEase/frontend && npm run dev
```

---

## 👥 Test Accounts

### Patient Account:
- **Email:** `patient@test.com`
- **Password:** `test123`
- **Features:** Medications, Appointments, Billing, Forum

### Doctor Account:
- **Email:** `doctor@test.com`
- **Password:** `test123`
- **Features:** Patient Management, Prescriptions, Home Visits, Invoices

### Admin Account:
- **Email:** `admin@test.com`
- **Password:** `test123`
- **Features:** User Management, System Analytics, Full Access

---

## 🎨 Test Dark Mode

1. Login with any account
2. Go to **Settings** page
3. Toggle **Dark Mode** switch
4. Navigate to different pages
5. Verify dark theme persists

**Expected:** Background dark, text light, all pages readable

---

## 🌐 Test Language Switching

1. Login with any account
2. Click **Language Toggle** button in header (🌐)
3. Switch between **English** and **Bengali**
4. Navigate to different pages
5. Verify language persists after refresh

---

## 💳 Test Payment System

1. Login as **Doctor** or **Admin**
2. Go to **Billing** page
3. Create an invoice for a patient
4. Logout and login as **Patient**
5. Go to **Billing** page
6. Click **Pay Now** on unpaid invoice
7. Select payment method (**bKash**, **Nagad**, or **Rocket**)
8. Click **Process Payment**
9. Verify redirect dialog appears
10. Confirm payment
11. Verify invoice status changes to **Paid**
12. Click **Download PDF**
13. Verify PDF shows doctor name in "BILLED TO"

---

## 💊 Test Medication Management

1. Login as **Patient**
2. Go to **Medication Reminders** page
3. Search for medicine (e.g., "Napa", "Para")
4. Select from autocomplete
5. Fill in dosage, frequency, times
6. Add medication
7. View in list
8. Mark dose as taken
9. Verify adherence rate updates
10. Toggle active/inactive
11. Delete medication

---

## 📅 Test Appointments

### Home Visits:
1. Login as **Patient**
2. Go to **Home Visits** page
3. Fill request form
4. Select doctor and date/time
5. Add complete address
6. Submit request
7. Logout and login as **Doctor**
8. View pending requests
9. Approve or reject

### Teleconsultation:
1. Login as **Patient**
2. Go to **TeleConsultation** page
3. Select doctor and date/time
4. Add symptoms/notes
5. Submit request
6. Logout and login as **Doctor**
7. View and manage requests

---

## 📝 Test Medical Records

### Prescriptions:
1. Login as **Doctor**
2. Go to **Prescriptions** page
3. Click **Create Prescription**
4. Select patient
5. Add medications and instructions
6. Submit
7. Logout and login as **Patient**
8. View prescriptions in **Medical Records**

### Lab Tests:
1. Login as **Doctor**
2. Go to **Lab Tests** page
3. Order test for patient
4. Logout and login as **Patient**
5. View lab test orders

---

## 💬 Test Communication

### Messaging:
1. Login as **Patient**
2. Go to **Messages** page
3. Select a doctor
4. Send message
5. Logout and login as **Doctor**
6. Check messages
7. Reply to patient

### Community Forum:
1. Login with any account
2. Go to **Community Forum**
3. Create a new post
4. Add title, content, category
5. Submit post
6. Like/comment on other posts
7. Login as **Doctor** or **Admin**
8. Test hide/pin functionality

---

## 🔍 Test All Pages

Visit each page and verify:
- ✅ Loads without errors
- ✅ Responsive on mobile/tablet/desktop
- ✅ Dark mode works correctly
- ✅ Language switching works
- ✅ All buttons functional
- ✅ Forms validate properly
- ✅ Data displays correctly

### Page List:
1. Dashboard
2. Symptom Checker
3. Medication Reminders
4. Request Appointment
5. Home Visits
6. TeleConsultation
7. Prescriptions
8. Lab Tests
9. Medical Records
10. Billing
11. Messages
12. Community Forum
13. Health Tips
14. Research Papers
15. Doctors List
16. Profile
17. Settings
18. Admin Dashboard (admin only)

---

## 🐛 Common Issues & Solutions

### Issue: Can't login
**Solution:** 
- Verify backend is running on port 5001
- Check MongoDB is running
- Verify credentials are correct

### Issue: Dark mode not working
**Solution:**
- Go to Settings and toggle dark mode
- Refresh page
- Check browser console for errors

### Issue: Payment redirect not working
**Solution:**
- This is expected - URLs are placeholders
- Need merchant accounts from bKash/Nagad
- Payment status will still update

### Issue: Medicine search not working
**Solution:**
- Verify backend has medicine database
- Check `/backend/data/medicineDatabase.js`
- Try common medicines: "Napa", "Para", "Ace"

### Issue: Page not responsive on mobile
**Solution:**
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
- Clear browser cache
- Check CSS files loaded

---

## 📊 Quick Feature Access

### For Patients:
- **Medications:** Dashboard → Medication Reminders
- **Appointments:** Dashboard → Request Appointment
- **Bills:** Dashboard → Billing
- **Messages:** Dashboard → Messages
- **Records:** Dashboard → Medical Records

### For Doctors:
- **Patients:** Dashboard → (view patient list in various sections)
- **Prescriptions:** Dashboard → Prescriptions → Create New
- **Invoices:** Dashboard → Billing → Create Invoice
- **Home Visits:** Dashboard → Home Visits
- **Profile:** Dashboard → Profile → Edit Profile

### For Admins:
- **Users:** Dashboard → Admin Dashboard
- **Analytics:** Dashboard → Admin Dashboard
- **Moderation:** Community Forum → Hide/Pin posts
- **Billing:** Dashboard → Billing (all invoices)

---

## 🎯 Key Testing Scenarios

### Scenario 1: New Patient Journey
1. Register as patient
2. Login
3. Enable dark mode
4. Add medications
5. Book home visit
6. View prescriptions
7. Pay invoice

### Scenario 2: Doctor Workflow
1. Login as doctor
2. Complete profile
3. View home visit requests
4. Approve visit
5. Create prescription
6. Generate invoice
7. Check messages

### Scenario 3: Admin Tasks
1. Login as admin
2. View system stats
3. Check all users
4. Moderate forum
5. Review billing
6. Access all features

---

## 📱 Mobile Testing Steps

1. **Resize browser window** to mobile size (375x667)
2. **Verify hamburger menu** appears
3. **Test navigation** via sidebar
4. **Check forms** are usable
5. **Test scrolling** works smoothly
6. **Verify buttons** are large enough (44px+)
7. **Test dark mode** on mobile
8. **Check all pages** are responsive

---

## 🎨 Visual Verification

### Light Mode Should Show:
- White/light gray backgrounds
- Dark text (readable)
- Blue primary color
- Subtle shadows
- Clear borders

### Dark Mode Should Show:
- Dark backgrounds (#0f172a)
- Light text (#f1f5f9)
- Lighter primary color
- Enhanced shadows
- Visible borders

---

## ✅ Final Checklist Before Demo

- [ ] Backend server running
- [ ] Frontend server running
- [ ] MongoDB connected
- [ ] Test accounts working
- [ ] Dark mode functional
- [ ] Language toggle working
- [ ] All pages load
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Payment system tested
- [ ] All features demonstrated

---

## 🎊 You're All Set!

**Your ClinicEase application is ready to use and demonstrate.**

### What You Have:
✅ Full-featured healthcare platform  
✅ 3 user roles (Patient, Doctor, Admin)  
✅ 18+ major features  
✅ Dark mode support  
✅ Multi-language  
✅ Payment integration  
✅ Professional UI/UX  
✅ Comprehensive documentation  

### Next Steps:
1. Start both servers
2. Run through test scenarios
3. Show to stakeholders
4. Gather feedback
5. Deploy to production

---

**🏥 ClinicEase - Your Health, Simplified ✨**

**Need Help?** Check:
- `PROJECT_COMPLETION_SUMMARY.md` - Full overview
- `QA_TESTING_GUIDE.md` - Detailed testing
- `COMPREHENSIVE_AUDIT_REPORT.md` - Audit results

**Questions?** All documentation is in:
`/Users/sowmiknoor/Desktop/ClinicEase/*.md`
