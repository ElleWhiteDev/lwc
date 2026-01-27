# Newsletter System Guide

## Overview

The newsletter system integrates with SendGrid for professional email delivery and management. It provides three ways to send newsletters:

1. **Upload HTML File** (Recommended for custom designs)
2. **SendGrid Campaigns** (Stub - for future integration)
3. **Legacy Composer** (Deprecated)

## Features

### 1. Subscriber Management

- **Database**: All subscribers are stored in your PostgreSQL database
- **Sync to SendGrid**: Subscribers can be synced to SendGrid Marketing Contacts
- **Status Tracking**: Active vs. Unsubscribed status
- **Public Signup**: Visitors can subscribe via the homepage form
- **Unsubscribe**: Token-based unsubscribe links in all emails

### 2. Upload & Send HTML Email

**How it works:**
1. Design your newsletter in any HTML editor (e.g., Figma, Canva, Mailchimp editor)
2. Export as HTML file
3. Upload the HTML file in the admin panel
4. Add a subject line
5. Choose recipients (active or all)
6. Send!

**Features:**
- Automatic unsubscribe link injection
- File size display
- Preview before sending
- Supports all HTML/CSS email designs

### 3. SendGrid Campaign Integration (Stub)

**Current Status:** Stubbed for future implementation

**Planned Features:**
- List draft campaigns from SendGrid
- Select and send campaigns
- Sync subscribers to SendGrid contacts
- Use SendGrid's visual editor

**To Complete:**
1. Set up SendGrid Marketing Contacts API
2. Create suppression groups for newsletters
3. Implement campaign scheduling via API

### 4. Suppression Groups (To Be Configured)

**Purpose:** Separate newsletter unsubscribes from transactional emails

**Setup Steps:**
1. Go to SendGrid Dashboard → Email API → Suppressions → Unsubscribe Groups
2. Create a group called "Newsletter"
3. Add the group ID to your environment variables
4. Update the sync function to use the suppression group

## API Endpoints

### Public Endpoints
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe (token-based)

### Admin Endpoints
- `GET /api/newsletter/subscribers` - Get all subscribers
- `POST /api/newsletter/subscribers` - Add subscriber
- `DELETE /api/newsletter/subscribers/:id` - Delete subscriber
- `GET /api/newsletter/subscribers/export` - Export as CSV
- `POST /api/newsletter/send-html` - Send HTML email
- `POST /api/newsletter/subscribers/sync-all` - Sync all to SendGrid
- `GET /api/newsletter/campaigns/drafts` - Get SendGrid campaigns (stub)
- `POST /api/newsletter/campaigns/:id/send` - Send campaign (stub)
- `GET /api/newsletter/suppression-groups` - Get suppression groups
- `POST /api/newsletter/suppression-groups` - Create suppression group

## Environment Variables

```env
SENDGRID_API_KEY=your_api_key_here
SENDGRID_FROM_EMAIL=info@alwcwin.org
SENDGRID_FROM_NAME=A Life Worth Celebrating
SENDGRID_REPLY_TO=alifeworthcelebrating@gmail.com
FRONTEND_URL=https://alwcwin.org
```

## Database Schema

```sql
CREATE TABLE newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  subscribed_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Best Practices

1. **Always test emails** - Send to yourself first
2. **Use HTML email templates** - Design in tools like Mailchimp, then export
3. **Include unsubscribe links** - Automatically added if not present
4. **Sync subscribers regularly** - Keep SendGrid in sync with your database
5. **Monitor deliverability** - Check SendGrid dashboard for bounces/spam reports

## Next Steps

1. ✅ Subscriber management in database
2. ✅ HTML file upload and send
3. ✅ Public subscription form
4. ✅ Unsubscribe functionality
5. ⏳ Set up SendGrid suppression groups
6. ⏳ Complete SendGrid campaign integration
7. ⏳ Add email templates library
8. ⏳ Schedule sends for future dates

## Troubleshooting

**Emails not sending?**
- Check SENDGRID_API_KEY is set correctly
- Verify sender email is verified in SendGrid
- Check SendGrid dashboard for errors

**Subscribers not syncing?**
- Ensure SendGrid API key has Marketing permissions
- Check console logs for API errors
- Verify subscriber email format is valid

**Unsubscribe not working?**
- Check JWT_SECRET is set (used for token generation)
- Verify unsubscribe URL matches FRONTEND_URL
- Check database for status updates

