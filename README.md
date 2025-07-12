# Ascend Global Business Management System

A comprehensive business management system designed for lead-to-order businesses using Facebook advertising. This system helps track leads, manage orders, monitor expenses, and calculate profitability.

## Features

### 🎯 Lead Management
- Track Facebook leads and their conversion rates
- Monitor lead costs and ROI
- Manage lead status (new, contacted, qualified, converted, lost)
- Link leads to customers and orders

### 📦 Order Management
- Create and track orders from leads
- Manage order status (pending, processing, shipped, delivered, cancelled)
- Track shipping information and courier services
- Generate automatic order numbers
- Calculate order profitability

### 👥 Customer Relationship Management (CRM)
- Store customer information and contact details
- Track customer order history and spending
- Identify returning customers
- Manage customer notes and preferences

### 💰 Expense Tracking
- Track all business expenses by category:
  - **Packaging**: Boxes, bubble wrap, tape, etc.
  - **Salary**: Order processing compensation
  - **Printing**: Invoice and label printing costs
  - **Return Shipping**: Cost of return orders
  - **Lead Cost**: Facebook advertising spend
  - **Other**: Utilities, office expenses, etc.
- Link expenses to specific orders or leads
- Upload receipt images for documentation

### 📊 Financial Analytics
- Real-time profit/loss calculations
- Lead conversion rate tracking
- Monthly revenue and expense reports
- Profit margin analysis
- Customer lifetime value metrics

### 🔄 Returns Management
- Track return requests and processing
- Calculate return shipping costs
- Manage refund amounts
- Monitor return reasons and product conditions

### 📈 Dashboard & Reporting
- Real-time business metrics
- Daily, weekly, and monthly reports
- Key performance indicators (KPIs)
- Expense breakdowns by category
- Customer insights and trends

## Technology Stack

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, Authentication, Real-time)
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## Database Schema

The system uses a comprehensive PostgreSQL schema with the following main tables:

- `customers` - Customer information and CRM data
- `leads` - Facebook leads and conversion tracking
- `products` - Product catalog and inventory
- `orders` - Order management and tracking
- `order_items` - Individual items within orders
- `purchase_invoices` - Supplier invoices for product purchases
- `expenses` - All business expenses by category
- `returns` - Return order management
- `return_items` - Items within return orders

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- A Supabase account
- Git

### 2. Clone the Repository
```bash
git clone <repository-url>
cd ascend-global
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Set Up the Database

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `database-schema.sql` and execute it
3. This will create all necessary tables, indexes, triggers, and sample data

### 6. Configure Row Level Security (RLS)

The database schema includes RLS policies. You may need to adjust these based on your authentication requirements:

- For development: The current policies allow all authenticated users to access all data
- For production: Consider implementing user-specific policies

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 8. Build for Production

```bash
npm run build
npm start
```

## Usage Guide

### Getting Started

1. **Set up Products**: Add your product catalog with cost and selling prices
2. **Import Leads**: Add Facebook leads with their acquisition costs
3. **Create Orders**: Convert leads to orders and track fulfillment
4. **Track Expenses**: Record all business expenses by category
5. **Monitor Profitability**: Use the dashboard to track performance

### Key Workflows

#### Lead to Order Process
1. Import lead from Facebook with acquisition cost
2. Contact and qualify the lead
3. Create order from qualified lead
4. Process and ship order
5. Track delivery and customer satisfaction

#### Expense Management
1. Record all expenses as they occur
2. Categorize expenses properly
3. Link order-specific expenses to orders
4. Upload receipts for documentation
5. Monitor expense trends and budgets

#### Financial Reporting
1. Daily revenue and expense tracking
2. Monthly profit/loss calculations
3. Lead conversion rate analysis
4. Customer lifetime value assessment
5. Product profitability analysis

## Key Features Explained

### Automatic Calculations
- **Customer Stats**: Total orders and spending are automatically calculated
- **Order Numbers**: Generated automatically with date-based format
- **Profit Margins**: Calculated in real-time based on revenue and expenses
- **Lead Conversion**: Tracked automatically when leads become orders

### Expense Categories
- **Packaging**: All packaging materials and supplies
- **Salary**: Compensation for order processing (calculated per order)
- **Printing**: Invoice printing and shipping labels
- **Return Shipping**: Costs associated with product returns
- **Lead Cost**: Facebook advertising and lead generation expenses
- **Other**: Utilities, office expenses, and miscellaneous costs

### Business Intelligence
- Track which leads convert to orders
- Monitor customer repeat purchase rates
- Analyze seasonal trends and patterns
- Identify most profitable products and customers
- Calculate true cost per acquisition including all expenses

## Customization

### Adding New Expense Types
1. Update the `expense_type` enum in the database
2. Add the new type to the TypeScript types in `lib/types.ts`
3. Update the UI components to handle the new type

### Modifying Order Statuses
1. Update the `order_status` enum in the database
2. Modify the TypeScript types
3. Update the UI status indicators and filters

### Adding Custom Fields
1. Add columns to the relevant database tables
2. Update the TypeScript interfaces
3. Modify the forms and display components

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support and questions:
- Check the documentation
- Review the database schema
- Examine the TypeScript types for data structures
- Look at the mock data in components for examples

## License

This project is licensed under the MIT License.

---

Built with ❤️ for businesses that want to track every aspect of their lead-to-order operations and maximize profitability.
