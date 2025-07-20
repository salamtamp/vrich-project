


Step to matching Keyword


### Keyword Matching and Order Processing Workflow

1. **Activate Campaign**

   * Ensure the campaign is set to active status.

2. **Customer Interaction**

   * User sends a message to Facebook Inbox or comments on a post.

3. **Store Message**

   * Save the incoming message to the database.

4. **Retrieve Active Campaign**

   * Fetch the currently active campaign.

5. **Fetch Keyword List**

   * Get the list of keywords associated with campaign products.

6. **Keyword Matching**

   * If a message matches a keyword:

     1. **Create Order** (if it doesn't already exist for the given `profile_id` and `campaign_id`).
     2. **Create or Update Order Products**

        * Add or update `orders_products` (only update if the same `profile_id` and `campaign_product_id` exist and the quantity is below the max limit).

7. **Admin Order Confirmation**

   * Admin reviews and confirms the order via the UI.

     1. Update the order status.
     2. Send a notification to the Facebook Inbox including a summary and a form link.
     3. Create a campaign notification record.

8. **Customer Completes Form**

   * Customer fills out the form and uploads payment slip, then submits it.

9. **Update Order Status**

   * System updates the order status based on form submission.

10. **Admin Confirms Payment & Adds Shipping Info**

    * Admin confirms payment, updates shipping details.

      1. Send a final notification to the Facebook Inbox with order status and tracking number.

---

Let me know if you'd like a diagram or flowchart version as well.
