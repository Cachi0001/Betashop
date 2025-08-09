# Betashop E-Commerce Platform

A modern e-commerce platform with 3D product visualization, guest checkout, and multi-vendor support.

## Features

- **3D Product Visualization**: Interactive 3D models using Three.js
- **Guest Checkout**: No account required for purchases
- **Multi-vendor Support**: Admins can register and sell products
- **Automated Payments**: Direct bank transfers via Paystack
- **Real-time Updates**: Live inventory and order status
- **Responsive Design**: Works on desktop and mobile
- **2x2 Product Grid**: Optimized product layout
- **Push Notifications**: Order updates via Firebase

## Technology Stack

### Backend
- **Node.js** with Express.js
- **Supabase** (PostgreSQL with real-time features)
- **Paystack** for payment processing
- **Cloudinary** for image management
- **Firebase** for push notifications
- **JWT** for authentication

### Frontend
- **React.js** with hooks and Redux
- **Three.js** for 3D visualization
- **Tailwind CSS** for styling
- **Vite** for build tooling

## Project Structure

```
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── controllers/     # Request handlers (max 100 lines each)
│   │   ├── services/        # Business logic (max 100 lines each)
│   │   ├── middleware/      # Custom middleware (max 100 lines each)
│   │   ├── routes/          # Route definitions (max 100 lines each)
│   │   ├── utils/           # Utility functions (max 100 lines each)
│   │   └── config/          # Configuration files (max 100 lines each)
│   ├── app.js              # Express app setup
│   └── server.js           # Server startup
├── frontend/               # React.js frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── store/          # Redux store and slices
│   │   ├── services/       # API services
│   │   └── hooks/          # Custom hooks
│   └── public/
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase account
- Paystack account (Nigerian payment processor)
- Cloudinary account
- Firebase account

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your actual credentials:
   ```env
   # Database
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Paystack
   PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   PAYSTACK_SECRET_KEY=your_paystack_secret_key

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Firebase
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY=your_firebase_private_key

   # App
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Update environment variables in `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. Start the development server:
   ```bash
   pnpm run dev --host
   ```

### Database Setup

1. Create the following tables in your Supabase database:

```sql
-- Admins table
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    business_name VARCHAR(255),
    business_type VARCHAR(100),
    address JSONB,
    bank_details JSONB NOT NULL,
    paystack_recipient_code VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    attribute_schema JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admins(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) NOT NULL,
    admin_price DECIMAL(10,2) NOT NULL,
    customer_price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    attributes JSONB DEFAULT '{}',
    images JSONB DEFAULT '[]',
    model_3d_url VARCHAR(500),
    location JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    shipping_address JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    payment_reference VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    admin_id UUID REFERENCES admins(id) NOT NULL,
    quantity INTEGER NOT NULL,
    customer_price DECIMAL(10,2) NOT NULL,
    admin_price DECIMAL(10,2) NOT NULL,
    platform_commission DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transfers table
CREATE TABLE transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    admin_id UUID REFERENCES admins(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paystack_transfer_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    transfer_reference VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment transactions table for detailed payment tracking
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    admin_id UUID REFERENCES admins(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    admin_earnings DECIMAL(10,2) NOT NULL,
    platform_commission DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    paystack_reference VARCHAR(255),
    transfer_reference VARCHAR(255),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin earnings summary table
CREATE TABLE admin_earnings_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admins(id) NOT NULL UNIQUE,
    total_sales DECIMAL(10,2) DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    total_commission_paid DECIMAL(10,2) DEFAULT 0,
    pending_earnings DECIMAL(10,2) DEFAULT 0,
    completed_transfers DECIMAL(10,2) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### Authentication
- `POST /api/auth/owner-register` - Admin registration
- `POST /api/auth/login` - Admin login
- `GET /api/auth/profile` - Get admin profile

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category (admin only)

### Orders
- `GET /api/orders/:id` - Get order details
- `GET /api/orders` - List orders (admin only)
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Payments
- `POST /api/payments/initialize` - Initialize payment
- `GET /api/payments/verify/:reference` - Verify payment
- `POST /api/payments/webhook` - Paystack webhook

### Admin Earnings
- `GET /api/admin/earnings` - Get admin earnings and transactions
- `POST /api/admin/payouts` - Process pending payouts
- `GET /api/admin/products/location` - Get location-based products

## Business Model

- **Commission Structure**: 7% platform fee, 93% goes to admin
- **Direct Transfers**: Admins receive payments directly to their bank accounts
- **Guest Checkout**: Customers can purchase without creating accounts
- **Multi-vendor**: Multiple admins can sell on the platform

## Code Quality Standards

- **100-line limit**: Every file must contain no more than 100 lines
- **Modular design**: Each component serves a specific purpose
- **Error handling**: Comprehensive error handling throughout
- **Security**: JWT authentication, input validation, CORS protection

## Deployment

### Backend Deployment
1. Set up production environment variables
2. Deploy to your preferred hosting service (Heroku, Railway, etc.)
3. Configure Supabase for production
4. Set up Paystack webhooks

### Frontend Deployment
1. Build the production bundle:
   ```bash
   pnpm run build
   ```
2. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)
3. Update API base URL for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the 100-line limit per file
4. Add tests for new features
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@example.com or create an issue in the repository.

