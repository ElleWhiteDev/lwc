const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_API_BASE = "https://api.sendgrid.com/v3";

/**
 * Sync a subscriber to SendGrid Marketing Contacts
 * @param {string} email - Subscriber email
 * @param {string} name - Subscriber name (optional)
 * @param {string} status - Subscription status ('active' or 'unsubscribed')
 */
export async function syncContactToSendGrid(email, name = "", status = "active") {
  try {
    const contact = {
      email,
      first_name: name || "",
    };

    // Add to suppression group if unsubscribed
    if (status === "unsubscribed") {
      // TODO: Add to suppression group when configured
      console.log(`Contact ${email} is unsubscribed - will add to suppression group when configured`);
      return { success: true, message: "Contact marked as unsubscribed (suppression group not yet configured)" };
    }

    const response = await fetch(`${SENDGRID_API_BASE}/marketing/contacts`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contacts: [contact],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("SendGrid API error:", data);
      throw new Error(data.errors?.[0]?.message || "Failed to sync contact to SendGrid");
    }

    console.log(`✅ Contact ${email} synced to SendGrid`);
    return { success: true, data };
  } catch (error) {
    console.error("Error syncing contact to SendGrid:", error);
    throw error;
  }
}

/**
 * Get all draft campaigns from SendGrid
 * @returns {Array} List of draft campaigns
 */
export async function getDraftCampaigns() {
  try {
    const response = await fetch(`${SENDGRID_API_BASE}/marketing/singlesends?status=draft`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("SendGrid API error:", data);
      throw new Error("Failed to fetch draft campaigns from SendGrid");
    }

    return data.result || [];
  } catch (error) {
    console.error("Error fetching draft campaigns:", error);
    throw error;
  }
}

/**
 * Send a campaign to a list of contacts
 * @param {string} campaignId - SendGrid campaign ID
 * @param {Array} emails - List of email addresses to send to
 */
export async function sendCampaign(campaignId, emails = []) {
  try {
    // TODO: This is a stub - SendGrid's Single Send API requires scheduling
    // For now, we'll return a message indicating this needs to be done in SendGrid UI
    console.log(`Campaign ${campaignId} ready to send to ${emails.length} recipients`);
    console.log("Note: Campaign sending must be scheduled via SendGrid UI or API");
    
    return {
      success: true,
      message: "Campaign prepared. Please schedule send in SendGrid dashboard.",
      campaignId,
      recipientCount: emails.length,
    };
  } catch (error) {
    console.error("Error preparing campaign:", error);
    throw error;
  }
}

/**
 * Create a suppression group for newsletters
 * @param {string} name - Group name
 * @param {string} description - Group description
 */
export async function createSuppressionGroup(name, description) {
  try {
    const response = await fetch(`${SENDGRID_API_BASE}/asm/groups`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("SendGrid API error:", data);
      throw new Error("Failed to create suppression group");
    }

    console.log(`✅ Suppression group created: ${name} (ID: ${data.id})`);
    return data;
  } catch (error) {
    console.error("Error creating suppression group:", error);
    throw error;
  }
}

/**
 * Get all suppression groups
 */
export async function getSuppressionGroups() {
  try {
    const response = await fetch(`${SENDGRID_API_BASE}/asm/groups`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("SendGrid API error:", data);
      throw new Error("Failed to fetch suppression groups");
    }

    return data;
  } catch (error) {
    console.error("Error fetching suppression groups:", error);
    throw error;
  }
}
