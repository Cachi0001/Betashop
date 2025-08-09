# Payment Flow Documentation - Shop Naija

## How Admins Receive Payments

### Current Implementation (Direct Paystack Integration)

**How it works:**
1. **Customer Payment**: Customer pays through Paystack checkout
2. **Paystack Processing**: Paystack processes the payment and collects funds
3. **Admin Bank Account**: Funds are transferred directly to the admin's connected Paystack account
4. **Automatic Settlement**: Paystack automatically settles funds to admin's bank account (usually within 24-48 hours)

### Payment Flow Steps:

1. **Order Creation**:
   - Customer completes checkout
   - Order is created with `payment_status: 'pending'`
   - Paystack payment is initialized

2. **Payment Processing**:
   - Customer is redirected to Paystack
   - Customer completes payment
   - Paystack processes the transaction

3. **Payment Verification**:
   - System verifies payment with Paystack API
   - Order status updated to `payment_status: 'successful'`
   - Stock is automatically reduced
   - Admin receives notification

4. **Fund Settlement**:
   - Paystack automatically transfers funds to admin's bank account
   - Settlement happens according to Paystack's schedule (usually T+1 or T+2)
   - Admin receives settlement notification from Paystack

### Admin Setup Requirements:

For admins to receive payments, they need to:

1. **Paystack Account**: Create a Paystack business account
2. **Bank Account**: Link their bank account to Paystack
3. **KYC Verification**: Complete Know Your Customer verification
4. **Settlement Schedule**: Configure automatic settlement preferences

### Current System Benefits:

- **Direct Payments**: No intermediary holding funds
- **Automatic Settlement**: Funds transferred automatically
- **Paystack Security**: Industry-standard payment security
- **Real-time Tracking**: Order and payment status tracking
- **Webhook Support**: Automatic status updates

### Revenue Calculation:

The system tracks:
- Total orders per admin
- Successful payments
- Revenue calculations in admin dashboard
- Customer payment history

### Important Notes:

1. **Test vs Live**: Currently using test keys - switch to live keys for production
2. **Webhook Setup**: Ensure webhook URL is configured in Paystack dashboard
3. **Settlement**: Admins receive funds directly from Paystack, not from our platform
4. **Commission**: If platform commission is needed, implement split payments

### Next Steps for Production:

1. Switch to live Paystack keys
2. Configure webhook endpoints
3. Set up split payments if platform commission is required
4. Implement admin onboarding for Paystack account setup