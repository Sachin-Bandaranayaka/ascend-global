# Meta Conversions API Setup Guide

## What is Meta Conversions API?

Meta's Conversions API helps **reduce your Facebook/Instagram advertising costs** by providing Meta with detailed information about what happens to your leads after they're generated. This allows Meta to:

- **Better target** people likely to convert
- **Reduce cost per lead** through improved optimization
- **Increase conversion rates** by showing ads to quality prospects

## Benefits for Your Business

### Cost Reduction
- **Lower CPL (Cost Per Lead)**: Meta optimizes for quality leads, not just any leads
- **Better ROAS**: Higher return on ad spend through improved targeting
- **Reduced wasted spend**: Less money spent on leads that won't convert

### Improved Performance
- **Higher conversion rates**: Meta learns who converts and targets similar people
- **Better lead quality**: Focus on leads more likely to become customers
- **Faster optimization**: Meta's algorithm learns faster with conversion data

## How It Works

1. **Lead Generation**: Someone fills out your Facebook/Instagram lead form
2. **CRM Integration**: Your CRM sends lead status updates to Meta via Conversions API
3. **Machine Learning**: Meta learns from successful conversions
4. **Optimization**: Meta shows ads to people more likely to convert
5. **Cost Reduction**: You pay less for higher-quality leads

## Setup Instructions

### Step 1: Get Your Meta Credentials

1. Go to [Meta Events Manager](https://business.facebook.com/events_manager2)
2. Select your dataset (or create one if you don't have it)
3. Click on "Settings" → "Conversions API"
4. Generate an access token
5. Copy your Dataset ID (15-17 digit number)

### Step 2: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Meta Conversions API Configuration
META_ACCESS_TOKEN=your_access_token_here
META_DATASET_ID=963363252505776
META_TEST_EVENT_CODE=TEST12345
```

### Step 3: Update Database Schema

Run this SQL in your Supabase dashboard:

```sql
-- Add Meta fields to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS meta_lead_id VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS meta_click_id VARCHAR(255);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_meta_lead_id ON leads(meta_lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_meta_click_id ON leads(meta_click_id);
```

### Step 4: Restart Your Application

```bash
npm run dev
```

### Step 5: Test the Integration

1. Go to `/settings/meta-conversions` in your app
2. Click "Send Test Event"
3. Check Meta Events Manager for the test event

## Tracked Events

Your CRM automatically sends these events to Meta:

| Event | When It's Sent | Meta Event Name |
|-------|----------------|-----------------|
| Lead Generated | New lead imported/created | `Lead` |
| Lead Contacted | Status changed to "contacted" | `Contact` |
| Lead Qualified | Status changed to "qualified" | `CompleteRegistration` |
| Lead Converted | Status changed to "converted" | `Purchase` |
| Lead Lost | Status changed to "lost" | `LeadLost` |

## Expected Results

After 7-14 days of data collection, you should see:

- **20-40% reduction** in cost per lead
- **Improved lead quality** and conversion rates
- **Better ad targeting** in Facebook Ads Manager
- **Higher ROAS** from your advertising campaigns

## Troubleshooting

### Common Issues

1. **Events not appearing in Meta Events Manager**
   - Check your access token and dataset ID
   - Verify environment variables are loaded
   - Check browser console for errors

2. **Test event fails**
   - Verify your access token has proper permissions
   - Check that dataset ID is correct
   - Ensure you have the latest API version

3. **No cost reduction after setup**
   - Wait 7-14 days for Meta's algorithm to learn
   - Ensure you have sufficient conversion volume (at least 50 events per week)
   - Check that events are being sent correctly

### Debug Mode

Set `META_TEST_EVENT_CODE` in your environment to see test events in Meta Events Manager without affecting live data.

## Best Practices

1. **Consistent Data**: Ensure lead data is complete (email, phone, name)
2. **Regular Updates**: Update lead status promptly as they progress
3. **Volume**: Aim for at least 50 conversion events per week
4. **Quality**: Focus on meaningful status changes, not just any activity

## Support

For technical issues:
1. Check the browser console for error messages
2. Verify your Meta Events Manager for event delivery
3. Review the setup steps in this guide

For Meta-specific issues:
- Visit [Meta Business Help Center](https://www.facebook.com/business/help)
- Check [Conversions API Documentation](https://developers.facebook.com/docs/marketing-api/conversions-api) 