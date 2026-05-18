1. Server-Side Rendering (Express & Mongoose)
•	The Route: Create a GET /onsale-products route.
•	Database Query: Query your database to find all products where the sale is active (e.g., isOnSale: true).
•	EJS Injection: Pass the entire array of these on-sale products directly to your EJS view (onsale.ejs).
•	Ensure the page renders seamlessly inside your established layout structure using the express-ejs-layouts module.
2. HTML/EJS Structure
•	Render all the retrieved products into the HTML DOM inside a specific container (e.g., <div id="product-list">). Each product card should have a common class name.
•	Create a dedicated placeholder section at the bottom of the page for your pagination controls: a "Previous" button, a "Next" button, and a text indicator showing the current page state (e.g., Page 1 of 5).
3. Frontend Pagination Logic (jQuery Only — No Extra API Calls)
•	Write a jQuery script that runs immediately after the DOM loads.
•	Initial State: Hide all product cards by default, and then use jQuery selectors (like .slice()) to show only the first 10 products (index 0 to 9).
•	State Management: Keep track of the current page in a JavaScript variable (starting at page 1). Calculate the total number of pages based on the total number of rendered elements divided by 10.
•	Button Behavior:
o	Next Button: When clicked, hide the currently visible 10 products, increment the page variable, and reveal the next subset of 10 products. Disable or hide this button if the user reaches the final page.
o	Previous Button: When clicked, hide the current batch, decrement the page variable, and reveal the previous subset of 10 products. Disable or hide this button if the user is on the first page.
o	Page Indicator: Dynamically update the text indicator to reflect the current page number whenever a button is clicked.
________________________________________
Expected Deliverables
1.	Express Route & Mongoose Query: A clean controller that fetches all valid products and passes them to the view template.
2.	EJS Layout Integration: The items must render cleanly within the standard site layout.
3.	Pure Client-Side jQuery Script: A script that successfully handles the concealment, revelation, and boundaries of the 10-item chunks without triggering any network requests during page transitions.

