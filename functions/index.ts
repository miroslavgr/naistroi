import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { google } from "googleapis";

admin.initializeApp();

// Load your service account key file (save this file in your functions folder)
const key = require("./service-account-key.json");

const content = google.content("v2.1");

// Authenticate with Google
const authClient = new google.auth.JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: ["https://www.googleapis.com/auth/content"],
});

export const syncProductToMerchantCenter = functions.firestore
  .document("products/{productId}")
  .onWrite(async (change, context) => {
    const productId = context.params.productId;
    const product = change.after.exists ? change.after.data() : null;

    await authClient.authorize();

    // 1. DELETE if the product was removed from Firestore
    if (!product) {
      console.log(`Deleting product ${productId} from Merchant Center`);
      await content.products.delete({
        auth: authClient,
        merchantId: "YOUR_MERCHANT_ID", // Replace with your MC ID
        productId: `online:bg:BG:${productId}`, // Format: channel:language:country:id
      });
      return;
    }

    // 2. INSERT/UPDATE if product exists
    const offer = {
      offerId: productId,
      title: product.name,
      description: product.description || "No description",
      link: `https://your-site.com/product/${productId}`,
      imageLink: product.image,
      contentLanguage: "bg",
      targetCountry: "BG",
      feedLabel: "BG",
      channel: "online",
      availability: product.stock > 0 ? "in stock" : "out of stock",
      price: {
        value: product.price,
        currency: "BGN", // Use BGN for Bulgaria
      },
      condition: "new",
      // Map your categories here if needed
      googleProductCategory: "Hardware > Building Materials", 
    };

    console.log(`Uploading product ${productId} to Merchant Center`);
    await content.products.insert({
      auth: authClient,
      merchantId: "YOUR_MERCHANT_ID",
      requestBody: offer,
    });
  });