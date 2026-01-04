"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGoogleAdsKeywords = exports.generateProductFeed = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
// 1. GENERATE FEED FUNCTION (Universal Product Feed)
exports.generateProductFeed = (0, https_1.onRequest)({ region: "us-central1" }, async (req, res) => {
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
    }
    catch (error) {
        console.error("Error generating feed:", error);
        res.status(500).send("Error generating feed");
    }
});
// 2. GENERATE GOOGLE ADS KEYWORDS (CSV for Import)
exports.generateGoogleAdsKeywords = (0, https_1.onRequest)({ region: "us-central1" }, async (req, res) => {
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
            if (!cleanName)
                return;
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
    }
    catch (error) {
        console.error("Error generating keywords CSV:", error);
        res.status(500).send("Error generating keywords CSV");
    }
});
//# sourceMappingURL=index.js.map