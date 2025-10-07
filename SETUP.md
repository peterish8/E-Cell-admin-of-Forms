# E-Cell Admin Dashboard Setup Guide

## 🚀 Quick Start

This E-Cell Admin Dashboard provides comprehensive form management and analytics for E-Cell activities.

### Prerequisites

- Node.js 18+ 
- Supabase account
- Git

### 1. Database Setup

1. Create a new Supabase project
2. Run the database migration scripts in order:

```sql
-- First, run the original schema
\i scripts/001_create_forms_schema.sql

-- Then, run the E-Cell enhancements
\i scripts/002_update_schema_for_ecell.sql
```

3. Create an admin user:
```sql
\i scripts/create-admin-user.sql
```

### 2. Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### 4. Access the Dashboard

- Admin Dashboard: `http://localhost:3000/admin`
- Public Forms: `http://localhost:3000/form/[form-id]`

## 📋 Features Implemented

### ✅ Core Features
- **Dynamic Form Builder**: Create forms with drag-and-drop question editor
- **Question Types**: Single choice, Multiple choice, Text input, Email
- **Form Templates**: Pre-built E-Cell specific templates
- **Live Preview**: See how forms look to users
- **Form Status**: Active/Inactive toggle
- **Shareable URLs**: Generate public form links

### ✅ Analytics Dashboard
- **Response Analytics**: Total submissions, completion rates, trends
- **MCQ Visualizations**: Pie charts for single choice, bar charts for multiple choice
- **Student Insights**: Startup vibes, tech interests, team roles, activity preferences
- **Real-time Updates**: Live response counting
- **Export Capabilities**: CSV export ready

### ✅ Admin Management
- **Form CRUD**: Create, read, update, delete forms
- **Question Management**: Add, edit, reorder, delete questions
- **Response Viewing**: Detailed response tables
- **User Authentication**: Supabase Auth integration

### ✅ E-Cell Specific Features
- **Startup Evaluation Forms**: Pre-built templates for E-Cell activities
- **Tech Interest Surveys**: Understand student technology preferences
- **Event Feedback**: Collect post-event feedback
- **Team Role Analysis**: Understand preferred startup roles
- **Activity Preferences**: Plan events based on student interests

## 🎯 Form Templates Available

1. **E-Cell Evaluation 2024**: Comprehensive evaluation with startup vibes, tech interests, team roles
2. **Tech Interest Survey**: Quick survey for technology preferences
3. **Event Feedback Form**: Post-event feedback collection

## 📊 Analytics Insights

### Dashboard Widgets
- 🔥 **Hot Topics**: Most selected interests
- 👥 **Team Composition**: Role distribution analysis  
- 🎯 **Activity Preferences**: Event planning insights
- 🚀 **Startup Readiness**: Interest vs experience correlation

### Chart Types
- **Pie Charts**: For single-choice questions (startup vibes, team roles)
- **Bar Charts**: For multiple-choice questions (tech interests, activities)
- **Line Charts**: Response trends over time
- **Insight Cards**: Key metrics and trends

## 🔧 Customization

### Adding New Question Types
1. Update `EcellQuestion` type in `lib/types.ts`
2. Add rendering logic in `PublicFormRenderer` and `FormPreview`
3. Update `QuestionEditor` with new type option

### Creating New Templates
1. Add template to `lib/form-templates.ts`
2. Define questions with proper E-Cell schema
3. Template will automatically appear in form builder

### Custom Analytics
1. Create new chart components in `components/admin/analytics/`
2. Add to `EnhancedAnalytics` component
3. Use E-Cell color scheme: `#FF8C32`, `#FFA533`, `#FFD233`

## 🎨 Design System

### Colors
- Primary: Orange gradient (`#FF8C32` to `#FFA533`)
- Secondary: Yellow accent (`#FFD233`)
- Success: Green (`#10B981`)
- Warning: Yellow (`#F59E0B`)

### Components
- Built with Radix UI primitives
- Tailwind CSS for styling
- Recharts for data visualization
- Responsive design for mobile/desktop

## 🔒 Security Features

- **Row Level Security**: Supabase RLS policies
- **Admin Authentication**: Protected admin routes
- **Form Permissions**: Users can only manage their own forms
- **Public Access**: Forms only accessible when active

## 📱 Mobile Support

- Responsive admin interface
- Mobile-optimized form rendering
- Touch-friendly interactions
- Optimized chart viewing

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod
```

### Environment Variables for Production
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📈 Usage Examples

### Creating an E-Cell Evaluation Form
1. Go to Admin Dashboard
2. Click "Create Form"
3. Use "E-Cell Evaluation 2024" template
4. Customize questions as needed
5. Set form to Active
6. Share the generated URL

### Analyzing Student Interests
1. Go to Analytics Dashboard
2. Select your form
3. View insights cards for quick overview
4. Examine detailed charts for each question
5. Export data for further analysis

## 🛠 Troubleshooting

### Common Issues
1. **Database Connection**: Check Supabase credentials
2. **RLS Policies**: Ensure admin user has proper permissions
3. **Form Not Loading**: Verify form is set to active
4. **Charts Not Showing**: Check if responses exist for the form

### Support
- Check browser console for errors
- Verify database schema is properly migrated
- Ensure all environment variables are set

This dashboard provides everything needed for comprehensive E-Cell form management and student insights! 🎉