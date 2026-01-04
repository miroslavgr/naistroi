import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();

// 1. GENERATE FEED FUNCTION (Universal Product Feed)
export const generateProductFeed = onRequest(
  { region: "us-central1" },
  async (req, res) => {
    try {
      const productsSnapshot = await admin.firestore().collection("products").get();
      
      // TSV Header
      let tsv = "id\ttitle\tdescription\tlink\timage_link\tavailability\tprice\tbrand\tcondition\tgoogle_product_category\n";
      
      productsSnapshot.forEach(doc => {
        const p = doc.data();
        const price = `${p.price} BGN`;
        const availability = p.stock > 0 ? "in stock" : "out of stock";
        const link = `https://naistroi.com/product/${doc.id}`; 
        
        const desc = (p.description || "No description").replace(/[\t\n\r]/g, " ");
        const title = (p.name || "Untitled").replace(/[\t\n\r]/g, " ");
        const brand = (p.brand || "Naistroi").replace(/[\t\n\r]/g, " ");

        tsv += `${doc.id}\t${title}\t${desc}\t${link}\t${p.image}\t${availability}\t${price}\t${brand}\tnew\t632\n`;
      });

      res.header("Content-Type", "text/tab-separated-values");
      res.status(200).send(tsv);
    } catch (error) {
      console.error("Error generating feed:", error);
      res.status(500).send("Error generating feed");
    }
  }
);

// 2. GENERATE GOOGLE ADS KEYWORDS (CSV for Import)
export const generateGoogleAdsKeywords = onRequest(
  { region: "us-central1" },
  async (req, res) => {
    try {
      const productsSnapshot = await admin.firestore().collection("products").get();
      
      // CSV Header for Google Ads Editor
      // Columns: Campaign, Ad Group, Keyword, Criterion Type
      let csv = "Campaign,Ad Group,Keyword,Criterion Type\n";
      
      productsSnapshot.forEach(doc => {
        const p = doc.data();
        // Clean the name to be safe for CSV (remove commas)
        const rawName = p.name || "";
        const cleanName = rawName.replace(/[",]/g, "").trim();
        
        if (!cleanName) return;

        const campaign = "Naistroi Products";
        const adGroup = cleanName; // One Ad Group per product for high relevance

        // List of keywords to generate for this product - ONLY the product name
        const keywords = [
          cleanName
        ];

        // Add each keyword to the CSV with "Phrase" match type (safer than Broad)
        keywords.forEach(kw => {
             csv += `${campaign},${adGroup},${kw},Phrase\n`;
        });
      });

      // Force download as a CSV file
      res.header("Content-Type", "text/csv; charset=utf-8");
      res.header("Content-Disposition", "attachment; filename=google_ads_keywords.csv");
      res.status(200).send(csv);
    } catch (error) {
      console.error("Error generating keywords CSV:", error);
      res.status(500).send("Error generating keywords CSV");
    }
  }
);
