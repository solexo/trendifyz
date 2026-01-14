const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

const app = express();

// Pinterest Conversions API setup
const PINTEREST_AD_ACCOUNT_ID = '549769757042';
const PINTEREST_ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN_HERE'; // Replace with actual token

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set X-Robots-Tag header
app.use((req, res, next) => {
  res.setHeader('X-Robots-Tag', 'index, follow');
  next();
});

// Products data - Amazon affiliate products
const products = [
  {
    "name": "Hairmax PowerFlex 272 Laser Cap - FDA Cleared Thinning Hair Loss Solution for Men & Women",
    "url": "https://amzn.to/48siT70",
    "image": "https://m.media-amazon.com/images/I/41wCx1fhbQL._SY300_SX300_QL70_FMwebp_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/41wCx1fhbQL._SY300_SX300_QL70_FMwebp_.jpg"
    ],
    "price": "$199.00",
    "category": "Beauty & personal care",
    "review": "This trending laser cap uses FDA-cleared red light therapy to stimulate hair growth. It's comfortable, cordless, and easy to use with a 7-minute treatment time. Perfect for viral hair loss solutions.",
    "pros": ["FDA cleared", "Cordless and flexible design", "Quick 7-minute sessions"],
    "cons": ["Requires consistent use", "Not covered by insurance"],
    "whyBuy": "Ideal for those seeking a non-invasive solution to hair thinning with proven technology.",
    "dealScore": 9.2,
    "editorPick": true
  },
  {
    "name": "Garmin Instinct Solar Rugged Outdoor Watch with GPS, Graphite",
    "url": "https://amzn.to/4pNRZO8",
    "image": "https://m.media-amazon.com/images/I/519pESH--lL._AC_SY300_SX300_QL70_FMwebp_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/519pESH--lL._AC_SY300_SX300_QL70_FMwebp_.jpg"
    ],
    "price": "$299.99",
    "category": "Electronics & Gaming",
    "review": "A rugged smartwatch with solar charging, perfect for outdoor activities. Features built-in sports apps and health monitoring.",
    "pros": ["Solar charging", "Rugged design", "Built-in GPS"],
    "cons": ["Bulky design", "Limited app support"],
    "whyBuy": "Great for adventurers who need reliable tracking without worrying about battery life.",
    "dealScore": 9.5,
    "editorPick": true
  },
  {
    "name": "Hyperice Hypervolt 2 Pro Percussion Massage Gun",
    "url": "https://amzn.to/49SByeE",
    "image": "https://m.media-amazon.com/images/I/61jirA2o7nL._AC_SY300_SX300_QL70_FMwebp_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/61jirA2o7nL._AC_SY300_SX300_QL70_FMwebp_.jpg"
    ],
    "price": "$349.00",
    "category": "Fitness & health tools",
    "review": "A powerful massage gun with quiet operation and multiple speeds. Ideal for relieving muscle soreness and stiffness.",
    "pros": ["Quiet operation", "5 speeds and interchangeable heads", "FSA/HSA eligible"],
    "cons": ["Requires charging", "Heavy for some users"],
    "whyBuy": "Perfect for athletes and anyone needing deep tissue relief at home.",
    "dealScore": 9.0,
    "editorPick": false
  },
  {
    "name": "Ekrin Athletics B37v2 Massage Gun",
    "url": "https://amzn.to/3M60RjA",
    "image": "https://m.media-amazon.com/images/I/61h+YqgodkL._AC_SY300_SX300_QL70_FMwebp_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/61h+YqgodkL._AC_SY300_SX300_QL70_FMwebp_.jpg"
    ],
    "price": "$149.99",
    "category": "Fitness & health tools",
    "review": "High-powered massage gun with brushless motor, 5 speeds, and 4 attachments for deep tissue relief.",
    "pros": ["Brushless motor", "5 speeds", "4 attachments", "Ultra quiet"],
    "cons": ["Pricey", "Heavy for some"],
    "whyBuy": "Ergonomic design for effective pain relief and muscle recovery.",
    "dealScore": 8.8,
    "editorPick": false
  },
  {
    "name": "Compex Sport Elite 3.0 Muscle Stimulator",
    "url": "https://amzn.to/4rxAfbh",
    "image": "https://m.media-amazon.com/images/I/714B214bb6L._AC_SY300_SX300_QL70_FMwebp_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/714B214bb6L._AC_SY300_SX300_QL70_FMwebp_.jpg"
    ],
    "price": "$399.00",
    "category": "Fitness & health tools",
    "review": "Advanced muscle stimulator with multiple programs for performance enhancement and recovery.",
    "pros": ["10 programs", "Wireless", "Rechargeable"],
    "cons": ["Expensive", "Learning curve"],
    "whyBuy": "Ideal for athletes looking to improve muscle performance and recovery.",
    "dealScore": 8.8,
    "editorPick": false
  },
  {
    "name": "OMRON Max Power Relief TENS Unit",
    "url": "https://amzn.to/4rzOA6W",
    "image": "https://m.media-amazon.com/images/I/611Bb4mY5VL._AC_SY300_SX300_QL70_FMwebp_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/611Bb4mY5VL._AC_SY300_SX300_QL70_FMwebp_.jpg"
    ],
    "price": "$49.99",
    "category": "Fitness & health tools",
    "review": "Effective TENS unit for pain relief in various body parts.",
    "pros": ["Drug-free", "Easy to use", "Portable"],
    "cons": ["Batteries not included", "Not for all pain types"],
    "whyBuy": "Great for managing chronic pain without medication.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "Omron Focus TENS Therapy for Knee Unit",
    "url": "https://amzn.to/3MzUIfu",
    "image": "https://m.media-amazon.com/images/I/61BP5EajOkL._AC_SY300_SX300_QL70_FMwebp_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/61BP5EajOkL._AC_SY300_SX300_QL70_FMwebp_.jpg"
    ],
    "price": "$79.99",
    "category": "Fitness & health tools",
    "review": "Wireless TENS unit specifically designed for knee pain relief.",
    "pros": ["Wireless", "Knee-specific", "Sweep waveform"],
    "cons": ["Single use", "Requires prescription in some areas"],
    "whyBuy": "Targeted relief for knee pain sufferers.",
    "dealScore": 8.0,
    "editorPick": false
  },
  {
    "name": "iReliev TENS + EMS Muscle Stimulator",
    "url": "https://amzn.to/48zTpEN",
    "image": "https://m.media-amazon.com/images/I/61VezFVfkqL._AC_SY300_SX300_QL70_FMwebp_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/61VezFVfkqL._AC_SY300_SX300_QL70_FMwebp_.jpg"
    ],
    "price": "$39.99",
    "category": "Fitness & health tools",
    "review": "Versatile TENS and EMS unit with 14 modes for pain relief and muscle recovery.",
    "pros": ["14 therapy modes", "Rechargeable", "Backlit display"],
    "cons": ["May be overwhelming for beginners", "Pads wear out"],
    "whyBuy": "Comprehensive device for both pain management and muscle building.",
    "dealScore": 8.7,
    "editorPick": false
  },
  {
    "name": "AUVON Rechargeable TENS Unit",
    "url": "https://amzn.to/4iyKSXn",
    "image": "https://m.media-amazon.com/images/I/71Vh6zkeETL._AC_SY300_SX300_QL70_FMwebp_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/71Vh6zkeETL._AC_SY300_SX300_QL70_FMwebp_.jpg"
    ],
    "price": "$29.99",
    "category": "Fitness & health tools",
    "review": "Affordable TENS unit with 24 modes and premium electrode pads.",
    "pros": ["24 modes", "Rechargeable", "Premium pads"],
    "cons": ["Basic design", "No EMS"],
    "whyBuy": "Budget-friendly option for effective pain relief.",
    "dealScore": 8.2,
    "editorPick": false
  },
  {
    "name": "BOB AND BRAD C2 Massage Gun",
    "url": "https://amzn.to/3KsRzNS",
    "image": "https://m.media-amazon.com/images/I/711wc7K7QML._AC_SY300_SX300_QL70_FMwebp_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/711wc7K7QML._AC_SY300_SX300_QL70_FMwebp_.jpg"
    ],
    "price": "$199.99",
    "category": "Fitness & health tools",
    "review": "Powerful massage gun with 5 speeds and interchangeable heads, FSA/HSA approved.",
    "pros": ["5 speeds", "Interchangeable heads", "FSA/HSA eligible"],
    "cons": ["Heavy", "Noisy"],
    "whyBuy": "Professional-grade recovery tool for athletes and home use.",
    "dealScore": 9.0,
    "editorPick": true
  },
  {
    "name": "Pure Enrichment PureRelief XL Heating Pad",
    "url": "https://amzn.to/4pIhPD1",
    "image": "https://m.media-amazon.com/images/I/918L2JjRA5L._AC_SY300_SX300_QL70_FMwebp_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/918L2JjRA5L._AC_SY300_SX300_QL70_FMwebp_.jpg"
    ],
    "price": "$39.99",
    "category": "Fitness & health tools",
    "review": "Large heating pad with 6 heat settings and moist heat option for pain relief.",
    "pros": ["Large size", "6 heat settings", "Moist heat"],
    "cons": ["Corded", "Not for all body parts"],
    "whyBuy": "Effective and affordable solution for back pain and cramps.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "Ninja DZ201 Foodi 8 Quart 6-in-1 DualZone 2-Basket Air Fryer",
    "url": "https://amzn.to/48xpLjs",
    "image": "https://m.media-amazon.com/images/I/511+uXaPLlL._AC_SL1001_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/511+uXaPLlL._AC_SL1001_.jpg"
    ],
    "price": "$129.99",
    "category": "Home & kitchen gadgets",
    "review": "Versatile 6-in-1 air fryer with dual baskets for cooking multiple items simultaneously. Features Match Cook technology for perfect results.",
    "pros": ["Dual baskets", "6 cooking functions", "Match Cook technology"],
    "cons": ["Large footprint", "Learning curve for settings"],
    "whyBuy": "Ideal for families needing efficient, healthy cooking options.",
    "dealScore": 9.0,
    "editorPick": false
  },
  {
    "name": "DREAME X40 Ultra Robotic Vacuum with Removable & Liftable Mop",
    "url": "https://amzn.to/3MaGUbn",
    "image": "https://m.media-amazon.com/images/I/715PiEJ-NGL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/715PiEJ-NGL._AC_SL1500_.jpg"
    ],
    "price": "$589.00",
    "category": "Home & kitchen gadgets",
    "review": "Advanced robotic vacuum with powerful suction, self-emptying, and mopping capabilities. Features auto-refill and self-cleaning.",
    "pros": ["12,000Pa suction", "Self-emptying", "Mopping function"],
    "cons": ["Expensive", "Requires app setup"],
    "whyBuy": "Perfect for hands-free home cleaning with advanced features.",
    "dealScore": 8.8,
    "editorPick": true
  },
  {
    "name": "Mini Portable Charger for iPhone,Upgraded 5000mAh PD Fast Charging Battery Pack,LCD Display Cute Power Bank Portable Phone Charger for iPhone 14/14 Pro Max/13/13 Pro/12 Pro/11/XS/XR/X/8/7/6-Black",
    "url": "https://amzn.to/445upE9",
    "image": "https://m.media-amazon.com/images/I/61vSdGQE9iL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/61vSdGQE9iL._AC_SL1500_.jpg"
    ],
    "price": "MAD 380.85",
    "category": "Electronics & Gaming",
    "review": "Compact power bank with fast charging and LCD display for iPhone compatibility.",
    "pros": ["Fast charging", "LCD display", "Compact design"],
    "cons": ["Limited capacity", "iPhone specific"],
    "whyBuy": "Convenient portable charging for iPhone users on the go.",
    "dealScore": 8.0,
    "editorPick": false
  },
  {
    "name": "JLab Go Air Pop+ True Wireless Earbuds, in Ear Headphones, Bluetooth Earphones, 35H Playtime Ear Buds, Bluetooth Earbuds with Microphone, USB-C Charging Case, Dual Connect, EQ3 Sound, Rose",
    "url": "https://amzn.to/4rzapnb",
    "image": "https://m.media-amazon.com/images/I/71QuwOIaNAL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/71QuwOIaNAL._AC_SL1500_.jpg"
    ],
    "price": "$24.99",
    "category": "Electronics & Gaming",
    "review": "Affordable true wireless earbuds with long battery life and EQ3 sound customization.",
    "pros": ["35H playtime", "Dual connect", "EQ3 sound"],
    "cons": ["Basic build", "No noise cancellation"],
    "whyBuy": "Great budget option for wireless audio with decent features.",
    "dealScore": 8.2,
    "editorPick": false
  },
  {
    "name": "Amazon eGift Card - Seasonal - (Instant Email or Text Delivery)",
    "url": "https://amzn.to/3XwdUNK",
    "image": "https://m.media-amazon.com/images/I/61BQ1p4gFNL._SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/61BQ1p4gFNL._SL1500_.jpg"
    ],
    "price": "MAD461.75",
    "category": "Gift cards",
    "review": "Instant delivery Amazon gift card for shopping on the platform.",
    "pros": ["Instant delivery", "Flexible use", "Seasonal design"],
    "cons": ["Not physical", "Value dependent"],
    "whyBuy": "Perfect for gifting Amazon purchases without shipping.",
    "dealScore": 9.5,
    "editorPick": false
  },
  {
    "name": "Squishmallows Original Bluey 10-Inch Bandit HugMees - Medium-Sized Ultrasoft Official Jazwares Plush",
    "url": "https://amzn.to/48ttSNw",
    "image": "https://m.media-amazon.com/images/I/71oKg-HlWhL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/71oKg-HlWhL._AC_SL1500_.jpg"
    ],
    "price": "MAD138.43",
    "category": "Toys & games",
    "review": "Soft and cuddly plush toy from the Bluey series, perfect for kids.",
    "pros": ["Ultrasoft", "Official licensed", "Huggable"],
    "cons": ["Medium size", "Collectible focus"],
    "whyBuy": "Adorable companion for Bluey fans.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "MACKENZIE-CHILDS Enamel Tea Kettle, Stylish Tea Kettle for Stovetop, Black-and-White Courtly Check, 2 Quarts",
    "url": "https://amzn.to/48xrB3Q",
    "image": "https://m.media-amazon.com/images/I/71aukFrhT5L._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/71aukFrhT5L._AC_SL1500_.jpg"
    ],
    "price": "$28.99",
    "category": "Home & kitchen gadgets",
    "review": "Stylish enamel tea kettle with classic check pattern for stovetop use.",
    "pros": ["Stylish design", "Durable enamel", "2 quart capacity"],
    "cons": ["Stovetop only", "Requires care"],
    "whyBuy": "Elegant addition to your kitchen tea-making routine.",
    "dealScore": 8.0,
    "editorPick": false
  },
  {
    "name": "Toniebox 1 Audio Player Starter Set with Playtime Puppy - Listen, Learn, and Play with One Huggable Little Box - Green",
    "url": "https://amzn.to/49P2ZWH",
    "image": "https://m.media-amazon.com/images/I/81cSkQZkQQL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/81cSkQZkQQL._AC_SL1500_.jpg"
    ],
    "price": "$79.99",
    "category": "Electronics & Gaming",
    "review": "Interactive audio player for kids with stories and music, comes with a plush character.",
    "pros": ["Educational content", "Huggable design", "Easy to use"],
    "cons": ["Requires Tonies", "Battery operated"],
    "whyBuy": "Engaging way for children to enjoy audio content.",
    "dealScore": 8.7,
    "editorPick": false
  },
  {
    "name": "SteelSeries Arctis Nova 1 Multi-System Gaming Headset — Hi-Fi Drivers — 360° Spatial Audio — Comfort Design — Durable — Ultra Lightweight — Noise-Cancelling Mic — PC, PS5/PS4, Switch, Xbox - Black",
    "url": "https://amzn.to/4pOXNHa",
    "image": "https://m.media-amazon.com/images/I/71pY4rbIg0L._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/71pY4rbIg0L._AC_SL1500_.jpg"
    ],
    "price": "MAD360.07",
    "category": "Electronics & Gaming",
    "review": "Multi-platform gaming headset with spatial audio and noise-cancelling mic.",
    "pros": ["360° spatial audio", "Noise-cancelling mic", "Multi-system compatibility"],
    "cons": ["Pricey", "Requires setup"],
    "whyBuy": "Excellent for immersive gaming across platforms.",
    "dealScore": 9.0,
    "editorPick": false
  },
  {
    "name": "Beats Solo 4 - Wireless On-Ear Bluetooth Headphones, Up to 50-Hour Battery Life, Ultra-Lightweight Comfort, Powerful and Balanced Sound, Apple & Android Compatible - Amazon Exclusive Metallic Pink",
    "url": "https://amzn.to/3Mls7KN",
    "image": "https://m.media-amazon.com/images/I/51kJvfwJSWL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/51kJvfwJSWL._AC_SL1500_.jpg"
    ],
    "price": "Price not available",
    "category": "Electronics & Gaming",
    "review": "Wireless on-ear headphones with long battery life and balanced sound.",
    "pros": ["50H battery", "Ultra-lightweight", "Balanced sound"],
    "cons": ["On-ear design", "Price"],
    "whyBuy": "Comfortable and reliable audio for daily use.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "Sony WH-1000XM6 The Best Noise Canceling Wireless Headphones, HD NC Processor QN3, 12 Microphones, Adaptive NC Optimizer, Mastered by Engineers, Studio-Quality, 30-Hour Battery, Black",
    "url": "https://amzn.to/3Xwe5bS",
    "image": "https://m.media-amazon.com/images/I/61nGlYFDZNL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/61nGlYFDZNL._AC_SL1500_.jpg"
    ],
    "price": "$428.00",
    "category": "Electronics & Gaming",
    "review": "Premium noise-cancelling headphones with advanced processors and long battery life.",
    "pros": ["HD noise cancellation", "30H battery", "Studio-quality sound"],
    "cons": ["Expensive", "Bulky"],
    "whyBuy": "Top-tier audio experience for music lovers and travelers.",
    "dealScore": 9.5,
    "editorPick": true
  },
  {
    "name": "Spin Master Games, Tetris: The Board Game, Play The Classic Puzzle Game Tetris in Real Life, Multiplayer Head-to-Head Puzzle Challenge, 2-4 Players, Stocking Stuffer Gift Ideas for Ages 8 & Up",
    "url": "https://amzn.to/3KBhNOo",
    "image": "https://m.media-amazon.com/images/I/810fUgglvzL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/810fUgglvzL._AC_SL1500_.jpg"
    ],
    "price": "$21.97",
    "category": "Toys & games",
    "review": "Physical board game version of the classic Tetris puzzle game for multiplayer fun.",
    "pros": ["Classic gameplay", "Multiplayer", "Easy to learn"],
    "cons": ["Ages 8+", "Strategy required"],
    "whyBuy": "Nostalgic and engaging puzzle game for families.",
    "dealScore": 8.0,
    "editorPick": false
  },
  {
    "name": "Burt's Bees Christmas Gifts - Face Mask Bundle Set, Hydrating Watermelon, Calming Rose, & Refreshing Cucumber, Face Sheet Masks for Single Use Skin Care, 99% Natural Origin, 3 Count, 0.33oz Each",
    "url": "https://amzn.to/4pfNOuk",
    "image": "https://m.media-amazon.com/images/I/81e4RHMgi+L._SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/81e4RHMgi+L._SL1500_.jpg"
    ],
    "price": "$9.49",
    "category": "Beauty & personal care",
    "review": "Natural face mask bundle with hydrating and calming options.",
    "pros": ["99% natural", "Variety of scents", "Single use"],
    "cons": ["Limited quantity", "Seasonal"],
    "whyBuy": "Gentle and effective skincare for holiday pampering.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "The Mysteries of the Universe: Discover the best-kept secrets of space (DK Children's Anthologies)",
    "url": "https://amzn.to/3Xzj1wv",
    "image": "https://m.media-amazon.com/images/I/91cEqxAsRnL._SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/91cEqxAsRnL._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71LA1kEm7zL._AC_SF480,480_.jpg",
      "https://m.media-amazon.com/images/I/71gKP0BVgbL._AC_SF480,480_.jpg"
    ],
    "price": "Price not available",
    "category": "Books",
    "review": "Children's book exploring the secrets of the universe with engaging illustrations.",
    "pros": ["Educational", "Engaging", "Illustrated"],
    "cons": ["Children's focus", "Not in-depth"],
    "whyBuy": "Fascinating introduction to space for young readers.",
    "dealScore": 8.0,
    "editorPick": false
  },
  {
    "name": "Bose New QuietComfort Ultra Earbuds (2nd Gen) - Wireless Noise Cancelling Earbuds with Mic, Immersive Audio, USB-C Charging, Up to 6 Hours Battery, IPX4 Rating, Black",
    "url": "https://amzn.to/3XA6wki",
    "image": "https://m.media-amazon.com/images/I/513LCPDEWKL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/513LCPDEWKL._AC_SL1500_.jpg"
    ],
    "price": "$79.99",
    "category": "Electronics & Gaming",
    "review": "Wireless noise-cancelling earbuds with immersive audio and water resistance.",
    "pros": ["Immersive audio", "Noise cancelling", "IPX4 rating"],
    "cons": ["Battery life", "Price"],
    "whyBuy": "High-quality wireless audio for active lifestyles.",
    "dealScore": 9.0,
    "editorPick": false
  },
  {
    "name": "Dr.Althea 345 Relief Cream | Moisturizer for Soothing Recovery and Blemish Care with PDRN & Niacinamide | Korean Vegan Skin Care for All Skin Types, 1.69 Fl Oz (Ver.2 - Pack of 1)",
    "url": "https://amzn.to/4ouq6ta",
    "image": "https://m.media-amazon.com/images/I/518gliDrI7L._SL1080_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/518gliDrI7L._SL1080_.jpg"
    ],
    "price": "$21.60",
    "category": "Beauty & personal care",
    "review": "Korean skincare cream with PDRN and niacinamide for soothing and blemish care.",
    "pros": ["Vegan and natural", "Effective for recovery", "Suitable for all skin types"],
    "cons": ["Small size", "Price"],
    "whyBuy": "Gentle and effective skincare for blemish-prone skin.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "Razer BlackShark V2 X Gaming Headset: 7.1 Surround Sound - 50mm Drivers - Memory Foam Cushion - For PC, PS4, PS5, Switch - 3.5mm Audio Jack - Black",
    "url": "https://amzn.to/48j7Pug",
    "image": "https://m.media-amazon.com/images/I/51FRJHB7XOL._AC_SL1001_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/51FRJHB7XOL._AC_SL1001_.jpg"
    ],
    "price": "$34.84",
    "category": "Electronics & Gaming",
    "review": "Affordable gaming headset with 7.1 surround sound and comfortable memory foam.",
    "pros": ["7.1 surround sound", "Memory foam cushion", "Multi-platform support"],
    "cons": ["Basic design", "No wireless"],
    "whyBuy": "Great entry-level gaming audio for multiple consoles.",
    "dealScore": 8.0,
    "editorPick": false
  },
  {
    "name": "Yankee Candle Balsam & Cedar, Holiday Scented Candle, 22oz Large Jar with up to 150 Hour Burn Time, Giftable",
    "url": "https://amzn.to/4os1Jwp",
    "image": "https://m.media-amazon.com/images/I/71Z42Yzlc5L._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/71Z42Yzlc5L._AC_SL1500_.jpg"
    ],
    "price": "MAD 221.33",
    "category": "Home & kitchen gadgets",
    "review": "Large holiday-scented candle with long burn time, perfect for gifting.",
    "pros": ["Long burn time", "Festive scent", "Giftable"],
    "cons": ["Strong scent", "Jar size"],
    "whyBuy": "Cozy holiday ambiance for your home.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "Meta Quest 3S 128GB | VR Headset — Thirty-Three Percent More Memory — 2X Graphical Processing Power — Virtual Reality Without Wires — Exclusive Gorilla Tag Bundle and Instant Access to 40+ Games",
    "url": "https://amzn.to/4pJ5luP",
    "image": "https://m.media-amazon.com/images/I/61Y1ovY0vVL._SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/61Y1ovY0vVL._SL1500_.jpg"
    ],
    "price": "$1,068.99",
    "category": "Electronics & Gaming",
    "review": "Advanced VR headset with improved memory and graphics, wireless and bundle included.",
    "pros": ["Wireless VR", "Exclusive bundle", "40+ games"],
    "cons": ["Expensive", "Requires space"],
    "whyBuy": "Immersive virtual reality experience with great value.",
    "dealScore": 9.0,
    "editorPick": true
  },
  {
    "name": "Meta Quest 3 512GB | VR Headset — Thirty Percent Sharper Resolution — 2X Graphical Processing Power — Virtual Reality Without Wires — Access to 40+ Games with a 3-Month Trial of Meta Horizon+ Included",
    "url": "https://amzn.to/4pgDxhK",
    "image": "https://m.media-amazon.com/images/I/51dGbP0XTnL._SL1100_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/51dGbP0XTnL._SL1100_.jpg"
    ],
    "price": "MAD 7,609.35",
    "category": "Electronics & Gaming",
    "review": "High-end VR headset with sharper resolution and extensive game access.",
    "pros": ["Sharper resolution", "Wireless", "Horizon+ trial"],
    "cons": ["High price", "Learning curve"],
    "whyBuy": "Ultimate VR gaming and social experience.",
    "dealScore": 9.2,
    "editorPick": true
  },
  {
    "name": "Yankee Candle Spiced Pumpkin, Thanksgiving Scented Candle, 22oz Large Jar with up to 150 Hour Burn Time, Giftable",
    "url": "https://amzn.to/4arLz2w",
    "image": "https://m.media-amazon.com/images/I/71fOZVsj4XL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/71fOZVsj4XL._AC_SL1500_.jpg"
    ],
    "price": "MAD 190.38",
    "category": "Home & kitchen gadgets",
    "review": "Thanksgiving-themed candle with spiced pumpkin scent and long burn time.",
    "pros": ["Festive scent", "150H burn time", "Large jar"],
    "cons": ["Seasonal", "Scent preference"],
    "whyBuy": "Perfect for fall and holiday decorating.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "Owala FreeSip Insulated Stainless Steel Water Bottle with Straw, BPA-Free Sports Water Bottle, Great for Travel, 24 Oz, Daybreak",
    "url": "https://amzn.to/4arLvQk",
    "image": "https://m.media-amazon.com/images/I/51SbWPkLSRL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/51SbWPkLSRL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/S/al-na-9d5791cf-3faf/650b4434-94c6-4662-8718-db4d09ee93bf._CR0,192,1600,837_SX460_CB1169409_QL70_.jpg",
      "https://m.media-amazon.com/images/S/al-na-9d5791cf-3faf/2674c122-c766-4e98-a38c-69935e7d1e95._CR0,0,500,500_AC_SX96_SY48_CB1169409_QL70_.jpg"
    ],
    "price": "MAD276.96",
    "category": "Home & kitchen gadgets",
    "review": "Insulated water bottle with straw for easy drinking, great for travel.",
    "pros": ["Insulated", "BPA-free", "24 oz capacity"],
    "cons": ["Straw maintenance", "Price"],
    "whyBuy": "Convenient and leak-proof hydration on the go.",
    "dealScore": 8.7,
    "editorPick": false
  },
  {
    "name": "Kerastase Nutritive 8H Magic Night Serum - Overnight Treatment for Dry Hair, Enhances Shine, With Plant-Based Proteins",
    "url": "https://amzn.to/4iJDFnl",
    "image": "https://m.media-amazon.com/images/I/61TNX4m8WyL._SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/61TNX4m8WyL._SL1500_.jpg"
    ],
    "price": "MAD 419.04",
    "category": "Beauty & personal care",
    "review": "Overnight hair serum with plant-based proteins for nourishment and shine.",
    "pros": ["Overnight treatment", "Enhances shine", "Plant-based"],
    "cons": ["Pricey", "Requires consistent use"],
    "whyBuy": "Transform dry hair with professional-grade care.",
    "dealScore": 8.8,
    "editorPick": false
  },
  {
    "name": "Anker Prime Power Bank, 26,250mAh 3-Port Portable Charger with 300W Max Output, Two-Way Charging, TSA-Approved, App Control, for MacBook, iPhone 17/16 Series, and More (Base Not Included)",
    "url": "https://amzn.to/48gBvrV",
    "image": "https://m.media-amazon.com/images/I/71bHgoLEylL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/71bHgoLEylL._AC_SL1500_.jpg"
    ],
    "price": "$39.09",
    "category": "Electronics & Gaming",
    "review": "High-capacity power bank with fast charging and app control.",
    "pros": ["26,250mAh capacity", "300W output", "App control"],
    "cons": ["Size", "Price"],
    "whyBuy": "Reliable power for multiple devices on the go.",
    "dealScore": 9.0,
    "editorPick": false
  },
  {
    "name": "e.l.f. Glow Reviver Melting Lip Balm, Hydrating Tinted Lip Balm For A Glossy Finish & Soft, Supple Lips, Vegan & Cruelty-Free, Cotton Candy Crush",
    "url": "https://amzn.to/4izWWYb",
    "image": "https://m.media-amazon.com/images/I/5158ImJx-cL._SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/5158ImJx-cL._SL1500_.jpg"
    ],
    "price": "$9.00",
    "category": "Beauty & personal care",
    "review": "Vegan tinted lip balm with hydrating formula for glossy lips.",
    "pros": ["Vegan and cruelty-free", "Hydrating", "Tinted"],
    "cons": ["Subtle tint", "Melting texture"],
    "whyBuy": "Affordable and effective lip care with a fun color.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "Spin Master Games, Tetris: The Board Game, Play The Classic Puzzle Game Tetris in Real Life, Multiplayer Head-to-Head Puzzle Challenge, 2-4 Players, Stocking Stuffer Gift Ideas for Ages 8 & Up",
    "url": "https://amzn.to/4izILTb",
    "image": "https://m.media-amazon.com/images/I/810fUgglvzL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/810fUgglvzL._AC_SL1500_.jpg"
    ],
    "price": "$21.97",
    "category": "Toys & games",
    "review": "Board game adaptation of Tetris for multiplayer fun.",
    "pros": ["Classic gameplay", "Multiplayer", "Ages 8+"],
    "cons": ["Strategy required", "Limited replay"],
    "whyBuy": "Nostalgic puzzle game for family entertainment.",
    "dealScore": 8.0,
    "editorPick": false
  },
  {
    "name": "Bose New QuietComfort Ultra Earbuds (2nd Gen) - Wireless Noise Cancelling Earbuds with Mic, Immersive Audio, USB-C Charging, Up to 6 Hours Battery, IPX4 Rating, Black",
    "url": "https://amzn.to/48xs5qG",
    "image": "https://m.media-amazon.com/images/I/513LCPDEWKL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/513LCPDEWKL._AC_SL1500_.jpg"
    ],
    "price": "$79.99",
    "category": "Electronics & Gaming",
    "review": "Second-gen noise-cancelling earbuds with immersive audio.",
    "pros": ["Immersive audio", "Noise cancelling", "IPX4"],
    "cons": ["Battery life", "Fit"],
    "whyBuy": "Premium wireless audio with excellent sound quality.",
    "dealScore": 9.0,
    "editorPick": false
  },
  {
    "name": "Estée Lauder Fragrance Treasures Travel Size Perfume Gift Set | Includes Beautiful Magnolia, Bronze Goddess, Beautiful & Pleasures | Perfumes for Women",
    "url": "https://amzn.to/48xsb1w",
    "image": "https://m.media-amazon.com/images/I/51xuR3N-wFL._SL1000_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/51xuR3N-wFL._SL1000_.jpg"
    ],
    "price": "$21.99",
    "category": "Beauty & personal care",
    "review": "Travel-sized perfume set from Estée Lauder with popular scents.",
    "pros": ["Travel size", "Iconic scents", "Gift set"],
    "cons": ["Small bottles", "Price"],
    "whyBuy": "Luxury fragrances in a convenient travel format.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "Pokémon TCG: Mega Evolution—Phantasmal Flames Elite Trainer Box",
    "url": "https://amzn.to/4oxSDOD",
    "image": "https://m.media-amazon.com/images/I/810uEzv7stL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/810uEzv7stL._AC_SL1500_.jpg"
    ],
    "price": "$112.95",
    "category": "Toys & games",
    "review": "Elite trainer box for Pokémon Trading Card Game with themed cards.",
    "pros": ["Themed cards", "Collectible", "High quality"],
    "cons": ["Expensive", "For collectors"],
    "whyBuy": "Expand your Pokémon collection with premium cards.",
    "dealScore": 8.7,
    "editorPick": false
  },
  {
    "name": "Beats Studio Pro - Premium Wireless Over-Ear Headphones- Up to 40-Hour Battery Life, Active Noise Cancelling, USB-C Lossless Audio, Apple & Android Compatible - Amazon Exclusive Sand Gray",
    "url": "https://amzn.to/3Y5oLya",
    "image": "https://m.media-amazon.com/images/I/61c8vBJoCmL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/61c8vBJoCmL._AC_SL1500_.jpg"
    ],
    "price": "Price not available",
    "category": "Electronics & Gaming",
    "review": "Premium over-ear headphones with noise cancelling and long battery life.",
    "pros": ["40H battery", "Noise cancelling", "Lossless audio"],
    "cons": ["Price", "Over-ear design"],
    "whyBuy": "High-fidelity audio for music enthusiasts.",
    "dealScore": 9.0,
    "editorPick": false
  },
  {
    "name": "JrTrack 5 Kids Smart Watch by Cosmo | Best Kid-Safe Phone Watch | Precision Real-Time GPS Tracking | Call, Text, Activity, School Settings | Spotify Music | Parental Controls | SOS & Safety Alerts",
    "url": "https://amzn.to/4atD1bt",
    "image": "https://m.media-amazon.com/images/I/61KRlQe3CzL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/61KRlQe3CzL._AC_SL1500_.jpg"
    ],
    "price": "$74.99",
    "category": "Electronics & Gaming",
    "review": "Kid-safe smartwatch with GPS tracking and parental controls.",
    "pros": ["GPS tracking", "Parental controls", "SOS alerts"],
    "cons": ["Limited features", "Subscription"],
    "whyBuy": "Peace of mind for parents with active kids.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "Toniebox 2 Audio Player Starter Set for Kids 1+ with Playtime Puppy - Cloud Pink",
    "url": "https://amzn.to/49TDEeg",
    "image": "https://m.media-amazon.com/images/I/71VMVTWY9aL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/71VMVTWY9aL._AC_SL1500_.jpg"
    ],
    "price": "$139.99",
    "category": "Electronics & Gaming",
    "review": "Audio player for kids with interactive stories and plush character.",
    "pros": ["Educational", "Interactive", "For ages 1+"],
    "cons": ["Requires Tonies", "Price"],
    "whyBuy": "Engaging audio learning for young children.",
    "dealScore": 8.7,
    "editorPick": false
  },
  {
    "name": "Solar Charger Power Bank 20,000mAh Portable Wireless Charger, Fast Charging External Battery Bank with 6 Outputs for Cell Phones,Portable Solar Panel with Dual Flashlight for Camping",
    "url": "https://amzn.to/3Y5oMSK",
    "image": "https://m.media-amazon.com/images/I/71kASEhMSRL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/71kASEhMSRL._AC_SL1500_.jpg"
    ],
    "price": "$19.94",
    "category": "Electronics & Gaming",
    "review": "Solar-powered charger with multiple outputs and flashlight for outdoor use.",
    "pros": ["Solar powered", "Multiple outputs", "Flashlight"],
    "cons": ["Charging time", "Size"],
    "whyBuy": "Sustainable power for camping and emergencies.",
    "dealScore": 8.0,
    "editorPick": false
  },
  {
    "name": "Magnetic Portable Charger, 10000mAh Power Bank, 20W Fast Charging for Magsafe Battery Pack, Travel Essential Wireless Charger Compatible with iPhone 17/16/15/14/13/12 Pro/Max/Air/Plus Series, Samsung",
    "url": "https://amzn.to/3Y5ZDY4",
    "image": "https://m.media-amazon.com/images/I/61HMfdzoBXL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/61HMfdzoBXL._AC_SL1500_.jpg"
    ],
    "price": "$13.99",
    "category": "Electronics & Gaming",
    "review": "Magnetic wireless charger compatible with MagSafe and various devices.",
    "pros": ["Magnetic attachment", "Fast charging", "Compatible"],
    "cons": ["Capacity", "Wireless only"],
    "whyBuy": "Convenient charging for modern smartphones.",
    "dealScore": 8.2,
    "editorPick": false
  },
  {
    "name": "LEGO Minecraft The TNT Jungle House Kids Toy for Pretend Play - Collectible Minecraft Toy - Building Set for Boys and Girls 8+ - Gift Idea for Birthdays and Video Game Fans - 21275",
    "url": "https://amzn.to/48OfIb2",
    "image": "https://m.media-amazon.com/images/I/81vT4zxUUYL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/81vT4zxUUYL._AC_SL1500_.jpg"
    ],
    "price": "$21.65",
    "category": "Toys & games",
    "review": "LEGO building set themed around Minecraft TNT Jungle House.",
    "pros": ["Creative building", "Minecraft theme", "Ages 8+"],
    "cons": ["Piece count", "Price"],
    "whyBuy": "Fun building experience for Minecraft fans.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "Tonies Elphaba Audio Toy Figurine from Wicked Part One",
    "url": "https://amzn.to/4ryxw1h",
    "image": "https://m.media-amazon.com/images/I/71kpjiyZeDL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/71kpjiyZeDL._AC_SL1500_.jpg"
    ],
    "price": "$19.99",
    "category": "Toys & games",
    "review": "Audio figurine of Elphaba from Wicked for storytelling.",
    "pros": ["Themed audio", "Collectible", "Interactive"],
    "cons": ["Requires player", "Single story"],
    "whyBuy": "Magical audio experience for Wicked fans.",
    "dealScore": 8.0,
    "editorPick": false
  },
  {
    "name": "GOLREX Noise Cancelling Ear Buds Wireless Earbuds Bluetooth Headphones with 80H Playtime, Dual LED Display, Wireless Charging Case, Over-Ear Hooks Earphones for Sports Running Gym Workout Black",
    "url": "https://amzn.to/3Y1cKKa",
    "image": "https://m.media-amazon.com/images/I/71IviTZUf8L._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/71IviTZUf8L._AC_SL1500_.jpg"
    ],
    "price": "$89.99",
    "category": "Electronics & Gaming",
    "review": "Wireless earbuds with noise cancelling and long battery for workouts.",
    "pros": ["80H playtime", "Noise cancelling", "Sports hooks"],
    "cons": ["Fit", "Sound quality"],
    "whyBuy": "Reliable audio for active lifestyles.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "Wireless Earbuds, Bluetooth 5.4 Ear Buds with Smart Touchscreen Case, ENC Noise Cancelling Headphones with 48H Playtime, Bass Stereo Sound, Compatible with iPhone Air/17/16/15/14/Android, Pad",
    "url": "https://amzn.to/48lYgcs",
    "image": "https://m.media-amazon.com/images/I/615FBxRtrDL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/615FBxRtrDL._AC_SL1500_.jpg"
    ],
    "price": "$22.99",
    "category": "Electronics & Gaming",
    "review": "Affordable wireless earbuds with touchscreen case and noise cancelling.",
    "pros": ["48H playtime", "ENC noise cancelling", "Touchscreen case"],
    "cons": ["Basic features", "Fit"],
    "whyBuy": "Budget-friendly wireless audio with smart features.",
    "dealScore": 8.0,
    "editorPick": false
  },
  {
    "name": "LEGO Minecraft The TNT Jungle House Kids Toy for Pretend Play - Collectible Minecraft Toy - Building Set for Boys and Girls 8+ - Gift Idea for Birthdays and Video Game Fans - 21275",
    "url": "https://amzn.to/4rEO6ge",
    "image": "https://m.media-amazon.com/images/I/81vT4zxUUYL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/81vT4zxUUYL._AC_SL1500_.jpg"
    ],
    "price": "$36.99",
    "category": "Toys & games",
    "review": "LEGO building set themed around Minecraft TNT Jungle House.",
    "pros": ["Creative building", "Minecraft theme", "Ages 8+"],
    "cons": ["Piece count", "Price"],
    "whyBuy": "Fun building experience for Minecraft fans.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "Upgraded Antibacterial Magnetic Tiles - 106 PCS Magnet Building Blocks for Kids, 3D STEM Sensory Toys | Inhibits Bacterial Growth for Safe Play | Educational Construction Set & Xmas Gift",
    "url": "https://amzn.to/48NZ8In",
    "image": "https://m.media-amazon.com/images/I/91CqC8oJ8yL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/91CqC8oJ8yL._AC_SL1500_.jpg"
    ],
    "price": "$25.64",
    "category": "Toys & games",
    "review": "Antibacterial magnetic tiles for STEM learning and safe play.",
    "pros": ["Antibacterial", "106 pieces", "STEM educational"],
    "cons": ["Magnet strength", "Age range"],
    "whyBuy": "Safe and educational building toy for kids.",
    "dealScore": 8.7,
    "editorPick": false
  },
  {
    "name": "Tatcha Dewy Skin & Lips Hydrating Ritual Set, Travel Rice Wash, Full Size Dewy Skin Cream, Wisteria Lip Mask ($119 Value)",
    "url": "https://amzn.to/4oyHzAW",
    "image": "https://m.media-amazon.com/images/I/61OsALSXqGL._SL1290_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/61OsALSXqGL._SL1290_.jpg"
    ],
    "price": "$83.00",
    "category": "Beauty & personal care",
    "review": "Hydrating skincare set with rice wash, cream, and lip mask.",
    "pros": ["Full size products", "Natural ingredients", "Value pack"],
    "cons": ["Price", "Travel size wash"],
    "whyBuy": "Complete dewy skin ritual at a great value.",
    "dealScore": 9.0,
    "editorPick": false
  },
  {
    "name": "Pokémon Legends: Arceus - US Version",
    "url": "https://amzn.to/48Og2Xi",
    "image": "https://m.media-amazon.com/images/I/71bhNf8QiOS._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/71bhNf8QiOS._AC_SL1500_.jpg"
    ],
    "price": "$56.99",
    "category": "Toys & games",
    "review": "Pokémon RPG game for Nintendo Switch.",
    "pros": ["Open world", "Pokémon catching", "Story mode"],
    "cons": ["Graphics", "Controls"],
    "whyBuy": "Immersive Pokémon adventure for fans.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "The Legend of Zelda: Tears of the Kingdom - Nintendo Switch (US Version)",
    "url": "https://amzn.to/4pJhLD1",
    "image": "https://m.media-amazon.com/images/I/81o5QpJ7aVL._SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/81o5QpJ7aVL._SL1500_.jpg"
    ],
    "price": "MAD 237.23",
    "category": "Toys & games",
    "review": "Epic sequel to Breath of the Wild with new mechanics.",
    "pros": ["Open world exploration", "Physics-based puzzles", "Story"],
    "cons": ["Learning curve", "Price"],
    "whyBuy": "Masterpiece of gaming with endless possibilities.",
    "dealScore": 9.5,
    "editorPick": true
  },
  {
    "name": "Nintendo Switch Sports - Nintendo Switch",
    "url": "https://amzn.to/4rtM02p",
    "image": "https://m.media-amazon.com/images/I/71S+8b+fIPL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/71S+8b+fIPL._AC_SL1500_.jpg"
    ],
    "price": "$49.50",
    "category": "Toys & games",
    "review": "Sports simulation game for Nintendo Switch with motion controls.",
    "pros": ["Motion controls", "Variety of sports", "Multiplayer"],
    "cons": ["Requires space", "Accuracy"],
    "whyBuy": "Fun and active gaming experience.",
    "dealScore": 8.0,
    "editorPick": false
  },
  {
    "name": "Nintendo Switch™ with Neon Blue and Neon Red Joy‑Con™",
    "url": "https://amzn.to/3Xxi2gf",
    "image": "https://m.media-amazon.com/images/I/71wpE+ZIehL._SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/71wpE+ZIehL._SL1500_.jpg"
    ],
    "price": "MAD1,893.18",
    "category": "Electronics & Gaming",
    "review": "Versatile hybrid gaming console with colorful Joy-Con.",
    "pros": ["Portable and dockable", "Wide game library", "Multiplayer"],
    "cons": ["Battery life", "Screen size"],
    "whyBuy": "Ultimate gaming platform for all ages.",
    "dealScore": 9.0,
    "editorPick": true
  },
  {
    "name": "Mario Party Superstars - US Version",
    "url": "https://amzn.to/4ovb3iQ",
    "image": "https://m.media-amazon.com/images/I/91LqNrkm6cL._SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/91LqNrkm6cL._SL1500_.jpg"
    ],
    "price": "MAD489.36",
    "category": "Toys & games",
    "review": "Party game with classic Mario Party boards and mini-games.",
    "pros": ["Classic boards", "Mini-games", "Multiplayer"],
    "cons": ["Repetitive", "Luck-based"],
    "whyBuy": "Nostalgic party fun for Mario fans.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "Sonic Mania + Team Sonic Racing Double Pack - Nintendo Switch",
    "url": "https://amzn.to/4pOYIY8",
    "image": "https://m.media-amazon.com/images/I/71mrzIeK5CL._SL1020_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/71mrzIeK5CL._SL1020_.jpg"
    ],
    "price": "MAD256.36",
    "category": "Toys & games",
    "review": "Double pack with Sonic Mania and Team Sonic Racing.",
    "pros": ["Retro platformer", "Racing game", "Value pack"],
    "cons": ["Graphics", "Controls"],
    "whyBuy": "Sonic classics in one affordable package.",
    "dealScore": 8.7,
    "editorPick": false
  },
  {
    "name": "Sonic X Shadow Generations - Nintendo Switch",
    "url": "https://amzn.to/3Xxi7k3",
    "image": "https://m.media-amazon.com/images/I/71Cgu-PiP6L._SL1499_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/71Cgu-PiP6L._SL1499_.jpg"
    ],
    "price": "$34.99",
    "category": "Toys & games",
    "review": "Sonic game featuring Shadow with modern and classic gameplay.",
    "pros": ["Dual gameplay styles", "Sonic lore", "Fast-paced"],
    "cons": ["Short length", "Price"],
    "whyBuy": "Exciting Sonic adventure with Shadow.",
    "dealScore": 8.0,
    "editorPick": false
  },
  {
    "name": "Star Wars: Heritage Pack - Nintendo Switch",
    "url": "https://amzn.to/4pJhMXB",
    "image": "https://m.media-amazon.com/images/I/71zo4HRQLyL._SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/71zo4HRQLyL._SL1500_.jpg"
    ],
    "price": "MAD359.24",
    "category": "Toys & games",
    "review": "Star Wars game pack for Nintendo Switch.",
    "pros": ["Star Wars universe", "Multiple games", "Value"],
    "cons": ["Varied quality", "Age"],
    "whyBuy": "Star Wars gaming collection for fans.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "PlayStation®5 Digital Edition (slim)",
    "url": "https://amzn.to/441yPfg",
    "image": "https://m.media-amazon.com/images/I/51fM0CKG+HL._SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/51fM0CKG+HL._SL1500_.jpg"
    ],
    "price": "MAD259.60",
    "category": "Electronics & Gaming",
    "review": "Slim digital edition of PS5 without disc drive.",
    "pros": ["Powerful hardware", "Digital library", "Slim design"],
    "cons": ["No disc drive", "Price"],
    "whyBuy": "Next-gen gaming without physical media.",
    "dealScore": 9.0,
    "editorPick": true
  },
  {
    "name": "Nintendo Joy-Con 2 (L)/(R) Light Blue/Light Red",
    "url": "https://amzn.to/4ovmTK0",
    "image": "https://m.media-amazon.com/images/I/61ieehjfCaL._SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/61ieehjfCaL._SL1500_.jpg"
    ],
    "price": "MAD 161.81",
    "category": "Electronics & Gaming",
    "review": "Replacement Joy-Con controllers for Nintendo Switch.",
    "pros": ["Motion controls", "Colorful", "Compatible"],
    "cons": ["Drift issues", "Price"],
    "whyBuy": "Essential for Switch multiplayer gaming.",
    "dealScore": 8.0,
    "editorPick": false
  },
  {
    "name": "Smart Watch for Men Women, 1.85\" HD Fitness Tracker with Bluetooth Calls, 120+ Sport Modes Fitness Watch, Fitness Tracker 24/7 Heart Rate/Sleep Monitor, IP68 Waterproof, Smartwatch for Android/iPhone",
    "url": "https://amzn.to/3Y2ai67",
    "image": "https://m.media-amazon.com/images/I/617yyHEF+AL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/617yyHEF+AL._AC_SL1500_.jpg"
    ],
    "price": "MAD230.78",
    "category": "Electronics & Gaming",
    "review": "Fitness smartwatch with heart rate monitoring and sport modes.",
    "pros": ["120+ sport modes", "Heart rate monitor", "IP68 waterproof"],
    "cons": ["Battery life", "App compatibility"],
    "whyBuy": "Comprehensive fitness tracking for active users.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "Wireless Mechanical Keyboard,Gasket Mounted with Creamy Sound,Bluetooth/2.4GHz/USB-C,Custom Hot Swappable,RGB Backlit,75% Compact Layout for Gaming/Typing/Win/Mac/PC (Retro Beige,Linear Switch)",
    "url": "https://amzn.to/443sShK",
    "image": "https://m.media-amazon.com/images/I/61YdGCfiwEL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/61YdGCfiwEL._AC_SL1500_.jpg"
    ],
    "price": "MAD369.31",
    "category": "Electronics & Gaming",
    "review": "Custom mechanical keyboard with gasket mount and RGB lighting.",
    "pros": ["Hot swappable", "RGB backlit", "Creamy sound"],
    "cons": ["Price", "Learning curve"],
    "whyBuy": "Premium typing and gaming experience.",
    "dealScore": 9.0,
    "editorPick": false
  },
  {
    "name": "Portable Bluetooth Speaker x Stocking Stuffers, Bluetooth 5.4 Speaker, 30W Dual Speaker, 2.0 Channel, Deep Bass, 30H Playtime, Colorful RGB Lights, IPX7 Waterproof, White Elephant Gifts for Adults",
    "url": "https://amzn.to/44FAx67",
    "image": "https://m.media-amazon.com/images/I/81CeFNv8L6L._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/81CeFNv8L6L._AC_SL1500_.jpg"
    ],
    "price": "MAD276.96",
    "category": "Electronics & Gaming",
    "review": "Portable Bluetooth speaker with deep bass and RGB lights.",
    "pros": ["30W power", "Deep bass", "IPX7 waterproof"],
    "cons": ["Size", "Battery"],
    "whyBuy": "Fun and portable audio for parties and outdoors.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "Tonies The Lorax Audio Toy Figurine from Dr. Seuss",
    "url": "https://amzn.to/4aqfyYC",
    "image": "https://m.media-amazon.com/images/I/815uCdto1DL._AC_SL1500_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/815uCdto1DL._AC_SL1500_.jpg"
    ],
    "price": "$19.99",
    "category": "Toys & games",
    "review": "Audio figurine for playing The Lorax story.",
    "pros": ["Educational", "Dr. Seuss story", "Interactive"],
    "cons": ["Requires player", "Single story"],
    "whyBuy": "Engaging way to enjoy classic children's literature.",
    "dealScore": 8.0,
    "editorPick": false
  },
  {
    "name": "TheraGun Prime Massage Gun by Therabody",
    "url": "https://amzn.to/4rxA6EL",
    "image": "https://m.media-amazon.com/images/I/71d+MDU8ylL._AC_SY300_SX300_QL70_FMwebp_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/71d+MDU8ylL._AC_SY300_SX300_QL70_FMwebp_.jpg"
    ],
    "price": "$399.00",
    "category": "Fitness & health tools",
    "review": "Powerful deep tissue massage gun for reliable recovery and pain relief.",
    "pros": ["Deep tissue relief", "Durable design", "Multiple attachments"],
    "cons": ["Expensive", "Heavy"],
    "whyBuy": "Ideal for serious athletes needing professional-grade recovery tools.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "Keurig K-Mini Mate Single Serve Coffee Maker – Ultra-Compact 4” Width, Travel Mug Friendly, Ideal Holiday Gift for Small Spaces, Black",
    "url": "https://www.amazon.com/Keurig-K-Mini-Single-Serve-Coffee/dp/B0FMTSRKYL/ref=zg_bsnr_c_home-garden_d_sccl_3/136-9393038-1765419?pd_rd_w=kNVFv&content-id=amzn1.sym.fef9af56-6177-46e9-8710-a5293a68dd39&pf_rd_p=fef9af56-6177-46e9-8710-a5293a68dd39&pf_rd_r=HAKD5VDZC7ZQE40515B0&pd_rd_wg=xCzXZ&pd_rd_r=d647c7a8-c15a-4a14-a38a-e13c5ccfdcf3&pd_rd_i=B0FMTSRKYL&th=1",
    "image": "https://m.media-amazon.com/images/I/618D34n8gLL._AC_SY300_SX300_QL70_FMwebp_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/618D34n8gLL._AC_SY300_SX300_QL70_FMwebp_.jpg"
    ],
    "price": "$79.99",
    "category": "Home & kitchen gadgets",
    "review": "Compact single-serve coffee maker perfect for small spaces and travel. Brews coffee quickly with K-Cup pods.",
    "pros": ["Ultra-compact design", "Travel mug friendly", "Quick brewing"],
    "cons": ["Requires K-Cup pods", "Limited to single serve"],
    "whyBuy": "Ideal for coffee lovers with limited space or on the go.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "Upgraded Ai Smart Glasses with Camera, 800w Anti-Shake Camera Glasses, Real-Time Translation, Ai Object Recognition, Voice Assistant, Blue Light Glasses Suitable for Business, Travel and Outdoor Use",
    "url": "https://amzn.to/4rKOOZ6",
    "image": "https://m.media-amazon.com/images/I/61z+M3EiChL._AC_SY300_SX300_QL70_FMwebp_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/61z+M3EiChL._AC_SY300_SX300_QL70_FMwebp_.jpg",
      "https://m.media-amazon.com/images/I/61z+M3EiChL._AC_SL1500_.jpg"
    ],
    "price": "Price not available",
    "category": "Electronics & Gaming",
    "review": "Advanced smart glasses featuring an 800w anti-shake camera, real-time translation, AI object recognition, voice assistant, and blue light protection. Ideal for business, travel, and outdoor activities.",
    "pros": ["Anti-shake camera", "Real-time translation", "AI object recognition", "Voice assistant", "Blue light protection"],
    "cons": ["Price not available", "May require learning curve"],
    "whyBuy": "Perfect for tech-savvy individuals needing hands-free assistance, translation, and recording capabilities on the go.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "Nutrafol Women's Balance Hair Growth Supplements, Ages 45 and Up, Clinically Proven for Visibly Thicker Hair and Scalp Coverage, Dermatologist Recommended - 1 Month Supply",
    "url": "https://www.amazon.com/Nutrafol-Supplements-Clinically-Dermatologist-Recommended/dp/B07QZ5CTTF/ref=sr_1_2_sspa?crid=2WCFVX508AVYZ&dib=eyJ2IjoiMSJ9.jmhc7mbmoxQezFum9AgeTkRn4SnKJoqM5EeckpWbJhGeELJrn5luSQWMAo0qd0exvtu8dfNFH3wzjHk26VEmHxihiKnSkeeNFLMaNdrwmuiOVihMHiYlTqM3TeDd4_wo-vjd34PrON5o10RgybGmsfQNYVnz8uNmjm12wZVmKM51X8_fZcKX3z_5bZ1qXaEmwH9VydIZRwygIFLAFUjPYbjzEx2VyppfFTpsaFwVGbWFE8r6L8EYUS36M-gRZ8MIlQ2ks466ZtG1qMmDhu7z3Ztm4m1GsvmdlAnoMIdq-KY.7fsDL0m0o7e94bnQPMhJnpTz7r9Vrl3Dtp2o2UXkSQw&dib_tag=se&keywords=hair&qid=1765219861&sprefix=hair%2Caps%2C943&sr=8-2-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1",
    "image": "https://m.media-amazon.com/images/I/311NWArnJkL._SX342_SY445_QL70_FMwebp_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/311NWArnJkL._SX342_SY445_QL70_FMwebp_.jpg",
      "https://m.media-amazon.com/images/I/71x3lKqI-cL._SL1500_.jpg"
    ],
    "price": "Price not available",
    "category": "Beauty & personal care",
    "review": "Clinically proven hair growth supplements for women 45 and up, designed to promote visibly thicker hair and scalp coverage. Dermatologist recommended for natural hair health.",
    "pros": ["Clinically proven", "Dermatologist recommended", "Natural ingredients"],
    "cons": ["Price not available", "Requires consistent use"],
    "whyBuy": "Ideal for women seeking effective, science-backed solutions for hair thinning and growth.",
    "dealScore": 8.5,
    "editorPick": false
  },
  {
    "name": "Dove Brown Sugar and Coconut Butter Body Scrub Exfoliates and Deeply Nourishes for Smooth, Radiant Skin 15 oz",
    "url": "https://www.amazon.com/Dove-Coconut-Exfoliates-Nourishes-Radiant/dp/B0DNTZTS1L/ref=hw_25_a_dag_g_6abb?pf_rd_p=b739da0f-9af7-41e3-addc-20654cc36ecc&pf_rd_r=ZQC29BF9T66YW91P9W3Y&sr=1-7-969f4cb0-824d-4648-acec-369c6cfab238&th=1",
    "image": "https://m.media-amazon.com/images/I/61xkCi4ZerL._SY300_SX300_QL70_FMwebp_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/61xkCi4ZerL._SY300_SX300_QL70_FMwebp_.jpg",
      "https://m.media-amazon.com/images/I/71mPN1QlerL._SL1500_.jpg"
    ],
    "price": "Price not available",
    "category": "Beauty & personal care",
    "review": "A gentle body scrub with brown sugar and coconut butter that exfoliates and nourishes the skin for a smooth, radiant finish.",
    "pros": ["Gentle exfoliation", "Nourishing ingredients", "Pleasant scent"],
    "cons": ["Price not available", "May not be suitable for sensitive skin"],
    "whyBuy": "Perfect for achieving soft, glowing skin with natural ingredients.",
    "dealScore": 8.0,
    "editorPick": false
  },
  {
    "name": "Meta Quest 3S 128GB | VR Headset — Thirty-Three Percent More Memory — 2X Graphical Processing Power — Virtual Reality Without Wires — Exclusive Gorilla Tag Bundle and Instant Access to 40+ Games",
    "url": "https://www.amazon.com/Meta-Quest-128GB-Cardboard-Exclusive-Oculus/dp/B0F2GYMC8H?pf_rd_p=2b46bcf8-ad8c-4e4b-bb3e-d4146d83a21c&pf_rd_r=70274V03QGVN3C78EW0Y&sr=1-7-969f4cb0-824d-4648-acec-369c6cfab238&th=1&linkCode=sl1&tag=dealcentra075-20&linkId=561c25ca1d7b8a0711be12d529886650&language=en_US&ref_=as_li_ss_tl",
    "image": "https://m.media-amazon.com/images/I/41f5-TBS-7L._SX342_SY445_QL70_FMwebp_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/41f5-TBS-7L._SX342_SY445_QL70_FMwebp_.jpg",
      "https://m.media-amazon.com/images/I/61Y1ovY0vVL._SL1500_.jpg"
    ],
    "price": "Price not available",
    "category": "Electronics & Gaming",
    "review": "Advanced VR headset with improved memory and graphics, wireless and bundle included for immersive gaming.",
    "pros": ["Wireless VR", "Exclusive bundle", "40+ games"],
    "cons": ["Price not available", "Requires space"],
    "whyBuy": "Great entry-level VR experience with plenty of content.",
    "dealScore": 9.0,
    "editorPick": false
  },
  {
    "name": "ANUA Heartleaf Quercetinol Pore Deep Cleansing Foam, Facial Cleanser, for Double Cleansing, BHA, Hyaluronic Acid, Glycerin, Face Wash, Blackhead Remover, Korean Skincare (150ml/5.07 fl.oz.)",
    "url": "https://amzn.to/3YNXGjm",
    "image": "https://m.media-amazon.com/images/I/31+iZsiR-5L._SY300_SX300_QL70_FMwebp_.jpg",
    "images": [
      "https://m.media-amazon.com/images/I/31+iZsiR-5L._SY300_SX300_QL70_FMwebp_.jpg",
      "https://m.media-amazon.com/images/I/51Kpw2r-pIL._SL1000_.jpg"
    ],
    "price": "Price not available",
    "category": "Beauty & personal care",
    "review": "A gentle yet effective facial cleanser with BHA for deep pore cleansing, suitable for double cleansing routine.",
    "pros": ["Contains BHA for exfoliation", "Hyaluronic acid for hydration", "Korean skincare quality"],
    "cons": ["Price not available", "May be too gentle for some"],
    "whyBuy": "Ideal for those looking for a natural, effective cleanser to remove blackheads and deep clean pores.",
    "dealScore": 8.5,
    "editorPick": false
  }
];

// Routes
app.get('/', (req, res) => {
  const baseUrl = process.env.BASE_URL || 'https://trendifyz.vercel.app';
  const canonicalUrl = baseUrl + req.originalUrl;
  const title = 'Trendifyz - Discover the latest trends and unbeatable deals!';
  const description = 'Discover amazing deals on electronics, home gadgets, beauty products, fitness tools, and more at Trendifyz. Shop the best Amazon affiliate products with reviews and ratings.';
  const keywords = 'deals, amazon, electronics, gaming, home, kitchen, gadgets, beauty, personal care, fitness, health, baby products, discounts';
  res.render('index', { products, currentCategory: null, title, description, keywords, canonicalUrl, baseUrl });
});

app.get('/category/:category', (req, res) => {
  const category = req.params.category.replace(/-/g, ' '); // Handle URL encoding
  const filteredProducts = products.filter(product => product.category.toLowerCase() === category.toLowerCase());
  const baseUrl = process.env.BASE_URL || 'https://trendifyz.vercel.app';
  const canonicalUrl = baseUrl + req.originalUrl;
  const title = `Trendifyz - ${category}`;
  const description = `Find the best deals in ${category} at Trendifyz. Explore top-rated products with reviews, pros, cons, and deal scores.`;
  const keywords = 'deals, amazon, electronics, gaming, home, kitchen, gadgets, beauty, personal care, fitness, health, baby products, discounts';
  res.render('index', { products: filteredProducts, currentCategory: category, title, description, keywords, canonicalUrl, baseUrl });
});

app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'blog.html'));
});

// Export for Vercel
module.exports = app;

// Export products for other scripts
module.exports.products = products;

// For local development
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}