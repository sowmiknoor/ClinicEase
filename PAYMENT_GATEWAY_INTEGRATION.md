# Payment Gateway Integration Guide

## Overview
ClinicEase now supports integrated payment gateway functionality that redirects patients to their chosen payment method's app or website when processing payments.

## Supported Payment Methods

### Mobile Wallets (Bangladesh)
1. **bKash** - Leading mobile financial service
2. **Nagad** - Government-backed mobile wallet
3. **Rocket** - DBBL mobile banking service

### Card Payments
4. **MasterCard** - International card payment
5. **Visa** - International card payment

### Cash Payment
6. **Cash** - Pay at clinic counter

## How It Works

### 1. Patient Flow
```
Patient selects "Pay Now" → Chooses payment method → Clicks "Process Payment"
    ↓
System detects device (Mobile/Desktop)
    ↓
Mobile: Tries deep link → Opens payment app → Falls back to mobile web
Desktop: Opens payment gateway in new tab
    ↓
Confirmation dialog → Complete payment → Return to ClinicEase
    ↓
Invoice marked as "Paid" with transaction details
```

### 2. Deep Link Technology
For mobile devices, the system attempts to open the native payment app using deep links:
- **bKash**: `bkash://payment`
- **Nagad**: `nagad://payment`
- **Rocket**: `rocket://payment`

If the app is not installed, it automatically falls back to the mobile web version after 1.5 seconds.

### 3. Payment Parameters
When redirecting to payment gateways, the following information is passed:
- **amount**: Invoice amount (BDT)
- **invoice**: Invoice ID for reference
- **merchant**: "ClinicEase"
- **callback**: Return URL after payment

## Features

### Visual Enhancements
✅ **Payment badges** indicating method type (Mobile Wallet, Card Payment, Pay at Clinic)
✅ **Color-coded icons** matching brand colors:
   - bKash: Pink (#E2136E)
   - Nagad: Red (#EE4024)
   - Rocket: Purple (#8B3A9C)

✅ **Responsive grid layout** for payment options
✅ **Dark mode support** for all payment UI elements

### User Experience
✅ **Confirmation dialog** before redirecting to payment gateway
✅ **Payment details** displayed (Amount, Invoice ID)
✅ **Device detection** for optimal payment flow
✅ **Transaction ID tracking** (optional manual entry)
✅ **Automatic transaction ID** generation if not provided

## Technical Implementation

### Frontend (Billing.jsx)
```javascript
const processPayment = async () => {
  // Payment gateway configuration
  const paymentGateways = {
    'bKash': { deepLink, webUrl, mobileUrl },
    'Nagad': { deepLink, webUrl, mobileUrl },
    'Rocket': { deepLink, webUrl, mobileUrl }
  };

  // Device detection
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Open payment gateway based on device
  if (isMobile) {
    // Try deep link first, then fallback to mobile web
  } else {
    // Open web URL in new tab
  }

  // Update invoice status after confirmation
}
```

### Payment Options UI
```jsx
<label className="payment-option">
  <input type="radio" name="payment" value="bKash" />
  <div className="option-content">
    <span className="option-icon">📱</span>
    <span className="option-name">bKash</span>
    <span className="option-badge">Mobile Wallet</span>
  </div>
</label>
```

### Styling (Billing.css)
- Modern card-based layout with hover effects
- Selected state with gradient background
- Badge styling for payment type indicators
- Full dark mode compatibility

## Testing Scenarios

### Mobile Testing
1. **With App Installed**
   - Select payment method
   - Click "Process Payment"
   - Should open native app immediately
   - Complete payment in app
   - Return to ClinicEase

2. **Without App Installed**
   - Select payment method
   - Click "Process Payment"
   - Brief pause (1.5s)
   - Opens mobile web version in browser
   - Complete payment
   - Return to ClinicEase

### Desktop Testing
1. **All Payment Methods**
   - Select payment method
   - Click "Process Payment"
   - Opens payment gateway in new tab
   - Complete payment
   - Confirm in ClinicEase dialog
   - Invoice updated

### Transaction Recording
- All payments record:
  - Payment method
  - Transaction ID (auto-generated or manual)
  - Payment date (ISO format)
  - Invoice status updated to "paid"

## Security Considerations

### Current Implementation
- Payment gateway URLs are opened in secure context
- Transaction IDs tracked for reconciliation
- Invoice status updates after user confirmation
- No sensitive payment data stored locally

### Recommended Enhancements
1. **Webhook Integration**: Receive automatic payment confirmations from gateways
2. **Digital Signatures**: Verify payment authenticity
3. **Encryption**: Secure payment parameters
4. **Rate Limiting**: Prevent payment abuse
5. **Payment Gateway API**: Direct integration with official APIs

## Future Improvements

### Phase 1 - Enhanced Integration
- [ ] Official bKash Merchant API integration
- [ ] Nagad Payment Gateway API integration
- [ ] SSL Commerz integration for card payments
- [ ] Automatic payment verification via webhooks

### Phase 2 - Advanced Features
- [ ] Partial payment support
- [ ] Recurring payment/subscription billing
- [ ] Payment reminders and notifications
- [ ] Payment history and receipts
- [ ] Refund processing system

### Phase 3 - International Support
- [ ] PayPal integration
- [ ] Stripe integration
- [ ] Multi-currency support
- [ ] International card processing

## Troubleshooting

### Common Issues

**Issue**: Payment app doesn't open
- **Solution**: Ensure app is installed, or use web fallback

**Issue**: Payment gateway URL not opening
- **Solution**: Check popup blocker settings in browser

**Issue**: Invoice not updating after payment
- **Solution**: Manually confirm in dialog after completing payment

**Issue**: Transaction ID missing
- **Solution**: System auto-generates ID if not provided

## Configuration

### Payment Gateway URLs
Update URLs in `Billing.jsx` if official merchant URLs are obtained:

```javascript
const paymentGateways = {
  'bKash': {
    deepLink: 'bkash://payment',
    webUrl: 'YOUR_BKASH_MERCHANT_URL',
    mobileUrl: 'YOUR_BKASH_MOBILE_URL'
  },
  // ... other gateways
};
```

### Testing URLs
For development/testing:
- Use sandbox/test URLs provided by payment providers
- Obtain merchant credentials from respective services
- Configure callback URLs to point to development server

## Support

For payment gateway integration support:
1. Contact respective payment service providers for merchant accounts
2. Refer to official API documentation
3. Test thoroughly in sandbox environment before production

---

**Last Updated**: January 2026  
**Version**: 1.0  
**Status**: Implemented - Ready for merchant account integration
