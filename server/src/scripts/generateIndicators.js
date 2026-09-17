// Script to generate a comprehensive, clinically-grounded & lifestyle-grounded set of 400+ indicators
// covering Physical, Hormonal, Behavioral, Emotional, Social, Aesthetic, Sensory, Appetite/Cravings,
// Sleep, Cognitive, and Physiological markers for both Period (luteal/menstrual) and Ovulation (follicular/ovulatory).

const fs = require('fs');
const path = require('path');

const indicators = [];
const seen = new Set();

function add(name, phase, weight) {
    const cleanName = name.trim();
    if (!seen.has(cleanName.toLowerCase())) {
        seen.add(cleanName.toLowerCase());
        indicators.push({ metric_name: cleanName, phase_association: phase, mathematical_weight: weight });
    }
}

// -------------------------------------------------------------
// 1. ORIGINAL CORE INDICATORS (preserved)
// -------------------------------------------------------------
add('Overcoat', 'period', 9.0);
add('Heating Pad Use', 'period', 8.0);
add('Chocolate Craving', 'period', 5.0);
add('Irritability', 'period', 4.0);
add('Bloating', 'period', 6.0);
add('Comfort Food Order', 'period', 3.0);
add('Sweatpants', 'period', 5.0);
add('Acne Flare-Up', 'period', 3.5);

add('Mini Skirt', 'ovulation', 9.0);
add('Increased Flirtatiousness', 'ovulation', 7.5);
add('Heightened Libido', 'ovulation', 8.5);
add('Extra Makeup Effort', 'ovulation', 5.0);
add('New Outfit Purchase', 'ovulation', 4.5);
add('Increased Sociability', 'ovulation', 4.0);
add('Perfume Use', 'ovulation', 3.0);
add('High Energy Level', 'ovulation', 3.5);

// -------------------------------------------------------------
// 2. BIOLOGICAL & PHYSIOLOGICAL MARKERS (PERIOD / MENSTRUAL / LUTEAL)
// -------------------------------------------------------------
const periodPhysical = [
    ['Menstrual Flow (Active Bleeding)', 9.5],
    ['Tampon / Pad Usage', 9.5],
    ['Menstrual Cup Insertion', 9.5],
    ['Period Underwear Worn', 9.0],
    ['Pelvic Uterine Cramping', 8.5],
    ['Lower Back Ache (Dull / Radiating)', 7.5],
    ['Inner Thigh Aching / Heaviness', 6.5],
    ['Basal Body Temperature Drop', 7.0],
    ['Breast Soreness & Tenderness', 7.0],
    ['Breast Swelling / Heaviness', 6.5],
    ['Fluid Retention & Swollen Fingers', 6.0],
    ['Water Weight Gain (1-3 lbs)', 5.5],
    ['Puffy Eyelids / Facial Water Retention', 5.0],
    ['Abdominal Distension / Bloat', 6.5],
    ['Gastrointestinal Sluggishness / Constipation', 5.5],
    ['Pre-flow Loose Stools / Diarrhea', 7.0],
    ['Frequent Urination (Prostaglandin Effect)', 5.5],
    ['Deep Pelvic Fullness / Pressure', 6.5],
    ['Restless Legs Syndrome Flare', 5.0],
    ['Muscle Stiffness & Sore Joints', 5.5],
    ['Migraine (Catamenial / Hormonal)', 7.5],
    ['Tension Headache (Forehead/Neck)', 6.0],
    ['Extreme Physical Lethargy', 6.5],
    ['Cold Intolerance / Chills', 6.0],
    ['Night Sweats / Hot Flashes (Luteal)', 6.0],
    ['Skin Greasiness / Sebum Spike', 5.5],
    ['Chin & Jawline Cystic Breakouts', 6.5],
    ['Greasy Hair / Rapid Scalp Oiliness', 5.0],
    ['Increased Hair Shedding', 4.5],
    ['Lower Physical Stamina', 5.5],
    ['Elevated Resting Heart Rate (Late Luteal)', 5.0],
    ['Dizziness / Orthostatic Lightheadedness', 5.5],
    ['Vaginal Dryness / Low Discharge', 6.0],
    ['Dark Brown Spotting (Pre/Post Menses)', 8.5],
    ['Sensitivity to Pain / Lower Pain Threshold', 5.5],
    ['Sinus Congestion (Hormonal Rhinitis)', 4.0],
    ['Nausea / Queasy Stomach (Prostaglandin)', 6.0]
];
periodPhysical.forEach(([n, w]) => add(n, 'period', w));

// -------------------------------------------------------------
// 3. BIOLOGICAL & PHYSIOLOGICAL MARKERS (OVULATION / FOLLICULAR)
// -------------------------------------------------------------
const ovulationPhysical = [
    ['Egg White Cervical Mucus (EWCM)', 9.5],
    ['Positive LH Ovulation Surge Test', 9.5],
    ['Mittelschmerz (One-sided Ovary Twinge)', 8.5],
    ['High, Soft, Open Cervix (SHOW Sign)', 8.5],
    ['Basal Body Temperature Nadir (Pre-ovulation Dip)', 8.0],
    ['Ovulation Spotting (Pink/Light Brown)', 8.0],
    ['Heightened Olfactory Sensitivity', 5.5],
    ['Enhanced Skin Glow / Luminosity', 6.0],
    ['Clear Blemish-Free Complexion', 5.5],
    ['Slightly Rosier Facial Flush', 5.0],
    ['Symmetrical Facial Attractiveness Peak', 5.5],
    ['Plumper Lip Appearance', 4.5],
    ['Higher-Pitched Vocal Tone', 5.5],
    ['Peak Physical Strength / PR Lift in Gym', 6.5],
    ['Higher Cardiovascular Endurance', 6.0],
    ['Lower Resting Heart Rate (Follicular)', 5.0],
    ['Decreased Appetite / Natural Fasting Ease', 5.5],
    ['Quick Muscle Recovery', 5.0],
    ['Naturally Moist & Lubricated Vagina', 7.5],
    ['Heightened Tactile Sensitivity', 6.0],
    ['Reduced Sensitivity to Cold', 5.0],
    ['Leaner Waist Definition', 5.0],
    ['Faster Reflexes & Coordination', 5.0]
];
ovulationPhysical.forEach(([n, w]) => add(n, 'ovulation', w));

// -------------------------------------------------------------
// 4. BEHAVIORAL, SOCIAL & PSYCHOLOGICAL (PERIOD / LUTEAL)
// -------------------------------------------------------------
const periodPsych = [
    ['Social Withdrawal / Canceling Plans', 7.0],
    ['Staying In Bed / Duvet Day', 7.5],
    ['Binge-Watching Comfort TV Series', 5.5],
    ['Irritability with Partner / Loved Ones', 6.0],
    ['Low Patience / Short Fuse', 5.5],
    ['Overthinking Past Regrets / Rumination', 5.0],
    ['Crying Over Trivial / Emotional Triggers', 6.5],
    ['Heightened Anxiety / Impending Dread', 6.0],
    ['Rejection Sensitive Dysphoria Flare', 5.5],
    ['Brain Fog / Forgetfulness', 5.5],
    ['Difficulty Concentrating on Work', 5.5],
    ['Imposter Syndrome Spike', 4.5],
    ['Zero Sexual Desire / Aversion to Touch', 7.5],
    ['Need for Solitude & Quiet Environments', 6.0],
    ['Overwhelmed by Noise & Bright Lights', 5.0],
    ['Nesting & Reorganizing Drawers/Closets', 4.5],
    ['Excessive Online Shopping for Cozy Items', 4.0],
    ['Postponing Tough Conversations', 5.0],
    ['Self-Critical Mirror Viewing', 5.0],
    ['Emotional Vulnerability / Seeking Reassurance', 5.5]
];
periodPsych.forEach(([n, w]) => add(n, 'period', w));

// -------------------------------------------------------------
// 5. BEHAVIORAL, SOCIAL & PSYCHOLOGICAL (OVULATION / FOLLICULAR)
// -------------------------------------------------------------
const ovulationPsych = [
    ['Spontaneous Social Organizing / Group Host', 6.5],
    ['Initiating Flirty Text Conversations', 7.5],
    ['High Confidence in Professional Meetings', 6.0],
    ['Feeling Unapologetically Attractive', 7.0],
    ['High Risk Tolerance & Adventurous Spirit', 5.5],
    ['Desire to Go Dancing / Nightclubs / Bars', 7.0],
    ['Intense Daydreaming About Romance / Intimacy', 7.5],
    ['Initiating Sex with Partner', 8.5],
    ['Seeking Novel Experiences / Spontaneous Outings', 6.0],
    ['Talkative / Fast Speech Flow & Eloquence', 5.5],
    ['High Empathy & Easy Bonding with Strangers', 5.0],
    ['Optimistic Future-Oriented Mindset', 5.5],
    ['Creative Work Breakthroughs / Ideas Boom', 5.5],
    ['Willingness to Try Risky Fashion Choices', 6.5],
    ['Strong Assertiveness & Direct Communication', 5.5],
    ['Desire for Physical Closeness & Hugs', 6.0],
    ['Posting Active Photos / Selfies Online', 6.5],
    ['Browsing Dating Apps / Swiping Actively', 7.0]
];
ovulationPsych.forEach(([n, w]) => add(n, 'ovulation', w));

// -------------------------------------------------------------
// 6. WARDROBE & AESTHETIC CHOICES (PERIOD / LUTEAL)
// -------------------------------------------------------------
const periodWardrobe = [
    ['Wearing Baggy Oversized Hoodie', 6.5],
    ['Elastic Waistband Pants Only', 7.0],
    ['Thick Woolen Socks / Slippers All Day', 6.0],
    ['Wearing Dark Bottoms (Black / Navy Pants)', 7.0],
    ['Boyfriend Cut / Loose Jeans', 6.0],
    ['No-Wire Bralette / Going Braless', 6.5],
    ['Hair Thrown Into Messy Bun', 5.5],
    ['Zero Makeup / Bare Face Routine', 6.0],
    ['Layered Knits & Cardigans', 5.5],
    ['Comfortable Flats or Slip-On UGGs', 6.0],
    ['Avoiding Form-Fitting Dresses', 6.5],
    ['Wearing Old High-Waist Cotton Briefs', 7.5],
    ['Carrying Extra Heavy-Duty Handbag (Supplies)', 5.0],
    ['Choosing Subdued / Neutral / Black Colors', 5.0],
    ['Refusing Stiff Denim or Belts', 6.5]
];
periodWardrobe.forEach(([n, w]) => add(n, 'period', w));

// -------------------------------------------------------------
// 7. WARDROBE & AESTHETIC CHOICES (OVULATION / FOLLICULAR)
// -------------------------------------------------------------
const ovulationWardrobe = [
    ['Form-Fitting Bodycon Dress', 8.5],
    ['Plunging Neckline / Backless Top', 8.0],
    ['Lace or Satin Lingerie Selection', 8.5],
    ['Push-Up / Underwire Balconette Bra', 7.0],
    ['High Heels / Strappy Stilettos', 7.5],
    ['Vibrant Red / Pink / Bright Colors', 6.5],
    ['Fresh Blowout / Styled Hair', 6.0],
    ['Full Glam Makeup & Bold Lip Color', 6.5],
    ['Prominent Jewelry / Gold Hoops / Bangles', 5.5],
    ['Shaved Legs & Fresh Body Exfoliation', 6.5],
    ['Floral / Musky Seductive Fragrance', 6.5],
    ['Fitted Crop Top & High-Rise Slacks', 7.0],
    ['Open-Front Sheer Blouse', 7.5],
    ['Showing Midriff / Shoulder Exposure', 7.0],
    ['Designer Bag Out for Evening', 5.5]
];
ovulationWardrobe.forEach(([n, w]) => add(n, 'ovulation', w));

// -------------------------------------------------------------
// 8. APPETITE, DIETARY & CRAVINGS (PERIOD / LUTEAL)
// -------------------------------------------------------------
const periodDiet = [
    ['Craving Salty Chips / Crisps', 6.0],
    ['Carbohydrate Binge (Pasta / Pizza / Bread)', 6.5],
    ['Craving Red Meat / Burger / Steak (Iron Need)', 6.5],
    ['Late Night Sweet Tooth / Ice Cream', 6.0],
    ['Hot Herbal Tea (Chamomile / Peppermint / Ginger)', 5.5],
    ['Large Hot Broth / Ramen / Stew', 5.5],
    ['Sipping Warm Water / Hot Lemon Water', 5.0],
    ['Intense Sugar Craving Mid-Afternoon', 5.5],
    ['Extra Shot of Espresso (Fighting Fatigue)', 5.5],
    ['Mindless Grazing Every 2 Hours', 6.0],
    ['Bloat Discomfort After Normal Meal', 6.0],
    ['Craving Cheese / Dairy Comfort Foods', 5.5],
    ['Alcohol Intolerance / Instant Hangover', 5.5],
    ['Skipping Cold Salads / Aversion to Raw Food', 5.0],
    ['Electrolyte Drink / Coconut Water Restock', 5.0]
];
periodDiet.forEach(([n, w]) => add(n, 'period', w));

// -------------------------------------------------------------
// 9. APPETITE, DIETARY & CRAVINGS (OVULATION / FOLLICULAR)
// -------------------------------------------------------------
const ovulationDiet = [
    ['Light Fresh Salad Craving', 5.5],
    ['Cold Pressed Green Juice / Smoothie', 5.5],
    ['Naturally Modest Portion Sizes (Full Quickly)', 6.0],
    ['Zero Interest in Heavy Carbs', 5.0],
    ['Craving Seafood / Sushi / Raw Oysters', 5.5],
    ['Enjoying Cocktails / Wine in Social Setting', 6.0],
    ['High Alcohol Tolerance', 5.5],
    ['High Hydration Drive (Drinking Lots of Cold Water)', 5.0],
    ['Intermittent Fasting Completed Effortlessly', 6.0],
    ['Craving Citrus / Crisp Apples / Berries', 4.5],
    ['Spicy Food Appetite (Jalapenos / Wasabi)', 5.0],
    ['Mindful Clean Eating Preference', 5.0]
];
ovulationDiet.forEach(([n, w]) => add(n, 'ovulation', w));

// -------------------------------------------------------------
// 10. SLEEP & ENERGY DYNAMICS (PERIOD / LUTEAL)
// -------------------------------------------------------------
const periodSleep = [
    ['10+ Hours Sleep & Still Exhausted', 7.0],
    ['Afternoon Power Nap Requirement (1-2 hr)', 6.5],
    ['Tossing & Turning in Bed / Luteal Insomnia', 6.0],
    ['Vivid Anxious Dreams / Nightmares', 5.5],
    ['Waking Up Heavy-Limbed / Sore', 6.0],
    ['Difficulty Getting Out of Bed in Morning', 6.5],
    ['Yawning Repeatedly Mid-Morning', 5.0],
    ['Snoozing Alarm 3+ Times', 5.5],
    ['Early Evening Bedtime (Before 9 PM)', 6.5],
    ['Restless Fragmented Sleep Quality', 6.0]
];
periodSleep.forEach(([n, w]) => add(n, 'period', w));

// -------------------------------------------------------------
// 11. SLEEP & ENERGY DYNAMICS (OVULATION / FOLLICULAR)
// -------------------------------------------------------------
const ovulationSleep = [
    ['Waking Early (6 AM) Feeling Fully Refreshed', 6.5],
    ['Surplus Energy on 6 Hours Sleep', 6.0],
    ['No Midday Slump or Crash', 5.5],
    ['Late Night Socializing Without Fatigue', 6.5],
    ['Morning Workout Completed with Enthusiasm', 6.5],
    ['Restful Deep Stage Sleep', 5.5],
    ['Fast Falling Asleep (<10 Minutes)', 5.0],
    ['Zero Daytime Napping Desired', 5.0],
    ['Bouncing Out of Bed with Alarm', 5.5]
];
ovulationSleep.forEach(([n, w]) => add(n, 'ovulation', w));

// -------------------------------------------------------------
// 12. EXPANSIVE LIFE & WORK ACTIVITIES (PERIOD)
// -------------------------------------------------------------
const periodActivities = [
    ['Hot Epsom Salt Bath with Candles', 7.0],
    ['Postponing Gym / Exercise Class', 6.5],
    ['Gentle Restorative Yin Yoga Only', 6.0],
    ['Curling Up with a Book on Sofa', 5.5],
    ['Putting Phone on Do Not Disturb', 6.0],
    ['Ordering Delivery to Avoid Leaving House', 6.0],
    ['Using Acupressure Mat for Pain Relief', 6.0],
    ['Applying Magnesium Oil to Calves & Belly', 5.5],
    ['Wearing Loose Cotton Robe for Hours', 5.5],
    ['Turning Down Dinner Party Invitations', 6.5],
    ['Deep Organizing Old Photos / Sentimental Items', 4.5],
    ['Writing in Journal About Frustrations', 5.0],
    ['Lighting Heavy Scented Comfort Candles', 4.5],
    ['Drinking Hot Raspberry Leaf Tea', 6.0],
    ['Booking a Deep Tissue / Remedial Massage', 5.5],
    ['Using TENS Unit for Cramp Relief', 8.0]
];
periodActivities.forEach(([n, w]) => add(n, 'period', w));

// -------------------------------------------------------------
// 13. EXPANSIVE LIFE & WORK ACTIVITIES (OVULATION)
// -------------------------------------------------------------
const ovulationActivities = [
    ['HIIT / Heavy Weight Training Session', 6.5],
    ['Booking Waxing / Hair Removal Appointment', 7.5],
    ['Booking Hair Stylist Salon Appointment', 6.5],
    ['Purchasing New Lingerie / Underwear Set', 8.0],
    ['Shopping for High-End Cosmetics / Lip Gloss', 6.0],
    ['Attending Live Music Concert / Festival', 6.5],
    ['Hosting Dinner Party or Drinks Event', 6.5],
    ['Accepting Last-Minute Weekend Trip / Getaway', 6.5],
    ['Taking Extra Selfies & Updating Dating Bio', 7.5],
    ['Flirting with Barista / Bartender / Stranger', 7.5],
    ['Prolonged Eye Contact with Attractive People', 7.0],
    ['Booking Spa / Facial Treatment', 5.5],
    ['Dancing Seductively in Living Room / Mirror', 7.0],
    ['Pitching Bold Idea at Work Presentation', 6.0],
    ['Trying a New Daring Workout / Pole / Dance Class', 6.5],
    ['Spritzing Fragrance on Pulse Points Multiple Times', 6.0]
];
ovulationActivities.forEach(([n, w]) => add(n, 'ovulation', w));

// -------------------------------------------------------------
// 14. GRANULAR COMBINATORIAL ANCHORS (To reach 400+ distinct clinical & lifestyle indicators)
// -------------------------------------------------------------
// Generate specific body, mood, habit, craving, and environmental combos
const painLocations = ['Lower Abdomen', 'Sacrum', 'Inner Thighs', 'Hip Joints', 'Groin', 'Right Ovary Area', 'Left Ovary Area'];
painLocations.forEach((loc) => {
    if (loc.includes('Ovary')) {
        add(`Sharp Transient Pain in ${loc} (Ovulatory Twinge)`, 'ovulation', 8.0);
        add(`Ache & Throbbing in ${loc} (Follicle Growth)`, 'ovulation', 7.5);
    } else {
        add(`Spasmodic Cramps in ${loc}`, 'period', 7.5);
        add(`Dull Constant Ache in ${loc}`, 'period', 6.5);
        add(`Radiating Tension in ${loc}`, 'period', 6.0);
    }
});

const cravingsPeriod = [
    'Dark Chocolate (70%+)', 'Milk Chocolate Bar', 'Chocolate Chip Cookies',
    'Brownies', 'Hot Cocoa with Marshmallows', 'Sea Salt Potato Chips',
    'French Fries with Extra Salt', 'Cheesy Pizza Slices', 'Macaroni and Cheese',
    'Creamy Fettuccine Alfredo', 'Warm Buttered Toast', 'Buttery Croissant',
    'Peanut Butter by the Spoonful', 'Warm Cinnamon Buns', 'Spicy Buffalo Wings'
];
cravingsPeriod.forEach((c) => add(`Intense Craving: ${c}`, 'period', 5.5));

const cravingsOvulation = [
    'Fresh Watermelon Wedges', 'Crisp Cucumber & Lemon Water', 'Açaí Bowl with Berries',
    'Fresh Avocado Toast with Sprouts', 'Chilled Shrimp Cocktail', 'Crisp Mixed Greens Salad',
    'Green Tart Apples', 'Chilled Sparkling Water', 'Fresh Coconut Water'
];
cravingsOvulation.forEach((c) => add(`Preference for Light Refreshment: ${c}`, 'ovulation', 5.0));

const moodStatesPeriod = [
    'Sudden Tearfulness Over Movies/Ads', 'Heightened Criticism of Romantic Partner',
    'Impatience with Slow Drivers/Lines', 'Overwhelming Need to Clean Home Alone',
    'Sense of Despair That Passes in 48 Hours', 'Sudden Dismay Looking in Mirror',
    'Feelings of Loneliness Despite Friends Nearby', 'Hyper-Awareness of Flaws',
    'Refusal to Compromise on Small Matters', 'Reluctance to Answer Phone Calls',
    'Desire to Hide Under Heavy Blankets', 'Guilt Over Decreased Productivity',
    'Craving Unconditional Affection Without Talking', 'Sudden Nostalgia for the Past'
];
moodStatesPeriod.forEach((m) => add(`Emotional Pattern: ${m}`, 'period', 5.5));

const moodStatesOvulation = [
    'Magnetic Charisma & Effortless Humor', 'Feeling Desirable & Radiant',
    'Warm Affection & Generosity Toward Others', 'Eagerness to Meet New Acquaintances',
    'Deep Sexual Arousal from Casual Touches', 'Empowered Decision-Making in Career',
    'Euphoric Appreciation for Music & Art', 'Feeling Centered, Capable & Grounded',
    'Playful Banter & Teasing in Conversation', 'Optimistic Ambition for Long-Term Goals',
    'Feeling Unbothered by Prior Stressors', 'Spontaneous Gratitude for Life'
];
moodStatesOvulation.forEach((m) => add(`Emotional Pattern: ${m}`, 'ovulation', 6.0));

const wardrobePeriodDetailed = [
    'Flannel Pajama Bottoms Outdoors', 'Dark Stretchy Leggings (Non-Constricting)',
    'Oversized Knitted Wool Sweater', 'No Jewelry / Removed All Rings Due to Swelling',
    'Flat Walking Sneakers (Zero Heel)', 'High-Waist Seamless Black Shorts',
    'Dark Terrycloth Bathrobe Worn All Morning', 'Slip-on Clogs or Slides',
    'Unbuttoned Top Button of Pants', 'Loose T-Shirt Dress (No Waist Seam)'
];
wardrobePeriodDetailed.forEach((w) => add(`Wardrobe Choice: ${w}`, 'period', 5.5));

const wardrobeOvulationDetailed = [
    'Backless Silk Halter Top', 'High-Slit Midi or Maxi Skirt', 'Leather or Pleather Fitted Trousers',
    'Bright Matching Crop Top & Bottom Set', 'Lace Trimmed Camisole Outing Wear',
    'Pointed-Toe High Heel Boots', 'Statement Red or Coral Lipstick',
    'Delicate Gold Belly Chain or Anklet', 'Deep V-Neck Sweater or Bodysuit',
    'Tailored Blazer Over Sheer Lace Bralette'
];
wardrobeOvulationDetailed.forEach((w) => add(`Wardrobe Choice: ${w}`, 'ovulation', 7.5));

// Somatic / Sensory markers
const sensoryPeriod = [
    'Hypersensitivity to Strong Perfumes / Cigarette Smoke',
    'Low Sound Tolerance / Muted TV Volume',
    'Need for Dimmed Warm Lighting Indoors',
    'Aversion to Scratchy Clothing Tags / Synthetic Fabrics',
    'Enhanced Gum Sensitivity When Brushing Teeth',
    'Sensitive Scalp When Brushing Hair',
    'Cold Feet Even Under Warm Duvet',
    'Heavy Eyelids & Eye Strain'
];
sensoryPeriod.forEach((s) => add(`Sensory Marker: ${s}`, 'period', 5.0));

// Additional granular indicators across daily habits, skincare, digestion, movement, communication:
const extraHabitsPeriod = [
    'Hot Water Bottle Placed on Abdomen', 8.5,
    'Herbal Heat Pack Around Lower Back', 8.0,
    'Avoiding High-Paced Cardio Workouts', 6.0,
    'Slow Walking Only in Nature / Park', 5.0,
    'Skipping Heavy Social Dinners', 6.5,
    'Canceling Weekend Party Attendance', 7.0,
    'Preferring Text Messages Over Voice Calls', 5.0,
    'Slipping Feet into Fluffy Fleece Socks', 5.5,
    'Wearing Thick Robe Over Clothes Indoors', 6.0,
    'Carrying Extra Emergency Menstrual Products in Coat', 7.5,
    'Applying Warming Balm / Tiger Balm to Abdomen', 7.0,
    'Refusing Any Pants with Zippers or Buttons', 7.0,
    'Feeling Clumsy / Dropping Objects Accidentally', 5.0,
    'Sore Throat or Mild Runny Nose (Period Flu)', 6.0,
    'Heavy Thirst for Warm Beverages Only', 5.0,
    'Refusal to Drink Iced Cold Water', 5.5,
    'Baking Comfort Pastries or Cookies at Home', 5.0,
    'Drinking Mug of Hot Bone Broth', 5.5,
    'Dimming Laptop Screen Brightness Down', 4.5,
    'Lying in Fetal Position with Knees Hugged to Chest', 8.0,
    'Elevating Legs with Pillows in Bed', 6.0,
    'Taking Warm Shower to Relieve Lower Back Strain', 6.5,
    'Refusal to Wear Underwire Bras of Any Kind', 7.0,
    'Complaining of Puffy Cheeks or Morning Face Bloat', 5.5,
    'Mild Nausea Upon Waking in Morning', 6.0,
    'Difficulty Deciding What to Wear (Nothing Feels Right)', 5.5,
    'Self-Conscious About Abdomen Profile in Outfits', 6.0,
    'Preferring Dark Dim Lighting in Bedroom', 4.5,
    'Canceling Group Fitness Class at Last Minute', 6.5,
    'Craving Warm Oatmeal with Honey and Cinnamon', 5.0,
    'Eating Warm Soup Instead of Crunchy Salad', 5.5,
    'Slow Sluggish Digestive Transit', 5.5,
    'Deep Sighing and Yawning Throughout Afternoon', 5.0,
    'Overwhelmed by Cluttered Desk or Messy Room', 5.0,
    'Withdrawing to Private Room During Social Gathering', 6.5,
    'Expressing Feelings of Being Underappreciated', 5.5,
    'Holding Tension in Neck, Shoulders and Trapezius', 5.0,
    'Craving Warm Melted Cheese Toast', 5.5,
    'Refusing to Go Shopping or Run Errands', 6.0,
    'Desire for Solitary Quiet Time with Pets', 5.0
];
for (let i = 0; i < extraHabitsPeriod.length; i += 2) {
    add(extraHabitsPeriod[i], 'period', extraHabitsPeriod[i + 1]);
}

const extraHabitsOvulation = [
    'Styling Hair in High Bouncy Ponytail or Waves', 6.0,
    'Applying Scented Shimmer Body Oil to Décolletage', 7.5,
    'Choosing Shorter Hemlines / Revealing Outfits', 8.0,
    'Wearing Sheer or Form-Accentuating Fabrics', 8.0,
    'Eager to Try New Social Spots / Rooftop Bars', 7.0,
    'Volunteering to Lead Discussion or Meeting', 6.0,
    'Sending Voice Notes with Upbeat Playful Inflection', 6.0,
    'Selecting Vibrant Nail Polish (Ruby Red / Magenta)', 5.5,
    'Smiling and Greeting Neighbors and Passersby', 5.5,
    'Walking with Upright, Confident, Sinuous Posture', 6.5,
    'Taking Selfies from Multiple Angles in Good Light', 6.5,
    'Applying Lip Plumper or High-Gloss Tint', 6.5,
    'Feeling Physically Light and Buoyant While Walking', 6.0,
    'Singing Along to Upbeat Pop or R&B Music in Car', 5.5,
    'Waking Up Ready to Attack the Day Without Coffee', 6.0,
    'Expressing Gratitude for Life and Opportunities', 5.5,
    'Ordering Colorful Cocktails / Martinis with Friends', 6.5,
    'Wearing Open-Toe Heeled Sandals or Strappy Shoes', 7.5,
    'Showing Exposed Collarbones and Shoulders', 7.0,
    'Lingering in Conversations with Magnetic Charm', 7.0,
    'Spritzing Luxury Floral or Amber Perfume on Neck', 6.5,
    'High Enthusiasm for Spontaneous Weekend Plans', 6.5,
    'High Physical Motivation During Gym Strength Sets', 6.5,
    'Feeling Sexually Alluring and Irresistible', 8.5,
    'Checking Reflection with Genuine Delight', 6.5,
    'Effortless Banter with Colleagues and Strangers', 6.0,
    'Excitement to Plan Vacation or Travel Dates', 5.5,
    'Choosing Bright Bold Accessories and Earrings', 6.0,
    'Engaging in Playful Touch or Physical Teasing', 7.5,
    'Feeling Receptive to Flirtatious Advances', 8.0,
    'Natural Flush on Cheeks Without Blush Makeup', 6.0,
    'Choosing Form-Fitting Gym Sets (Spandex / Shorts)', 7.0,
    'Feeling High Stamina on Long Walks or Dance Floors', 6.5,
    'Enjoying Fresh Crisp Salads and Citrus Drinks', 5.5,
    'Clear Mind with High Verbal Fluency and Wit', 6.0,
    'Feeling Youthful, Vibrant and Full of Vitality', 6.5,
    'Eagerness to Reconnect with Friends via Phone', 5.5,
    'Choosing Outfits That Accentuate the Waistline', 7.5,
    'Desire for Closeness, Romance and Deep Connection', 7.5,
    'Expressing Bold Ambitions Without Hesitation', 6.0
];
for (let i = 0; i < extraHabitsOvulation.length; i += 2) {
    add(extraHabitsOvulation[i], 'ovulation', extraHabitsOvulation[i + 1]);
}

const sensoryOvulation = [
    'Attraction to Deep Musky / Pheromone Fragrances',
    'Heightened Pleasure from Music Bass Vibrations',
    'Skin Warmth & Tingling Sensation',
    'Enjoyment of Vibrant Sunlight & Outdoor Spaces',
    'Enhanced Taste Perception for Sweet Flavors',
    'Pleasurable Sensitivity to Partner Caresses',
    'Heightened Visual Focus & Mental Clarity'
];
sensoryOvulation.forEach((s) => add(`Sensory Marker: ${s}`, 'ovulation', 6.0));

// Specific Clinical / Diagnostic / Cycle Logging markers
const clinicalPeriod = [
    'First Day of Red Blood (Cycle Day 1)', 10.0,
    'Heavy Menstrual Flow Day 2 (Super Pad / Regular Change)', 10.0,
    'Moderate Menstrual Flow Day 3', 9.5,
    'Tapering Menstrual Flow Day 4', 9.0,
    'Light Brown Flow Day 5', 8.5,
    'Pre-Menstrual Brown Discharge Day -1', 8.5,
    'Post-Menstrual Residual Spotting Day 6', 8.0,
    'Clotting Observed in Menstrual Blood', 8.0,
    'Progesterone Withdrawal Bleeding', 9.0,
    'Negative Urine Pregnancy Test Pre-Flow', 6.0,
    'Firm, Low, Tightly Closed Cervix', 7.5,
    'Thick Sticky White Cervical Discharge (Post-Luteal)', 7.0,
    'Cramps Requiring Ibuprofen / NSAIDs', 8.0,
    'Cramps Requiring Antispasmodic Medication', 8.5,
    'Tiredness Alleviated Only by Lying Flat', 6.5
];
for (let i = 0; i < clinicalPeriod.length; i += 2) {
    add(clinicalPeriod[i], 'period', clinicalPeriod[i + 1]);
}

const clinicalOvulation = [
    'Peak LH Urine Test Ratio > 1.0 (Premom / Clearblue Smile)', 10.0,
    'LH Rapid Test Color Equal or Darker Than Control Line', 10.0,
    'Translucent Stretchy Cervical Mucus (Stretches 2+ Inches)', 9.5,
    'Slippery Watery Discharge Sensation in Underwear', 9.0,
    'High Soft Cervix Reached with Difficulty (High in Pelvis)', 8.5,
    'Ferning Pattern Observed in Saliva Under Microscope', 8.5,
    'Ultrasound Verified Dominant Graafian Follicle (18-22mm)', 10.0,
    'Sharp Unilateral Lower Quadrant Stabbing Ache (Mittelschmerz)', 8.5,
    'Post-Ovulation 0.3°F to 0.5°F Sustained BBT Rise', 9.0,
    'Estrogen Surge Peak Lab Reading', 9.0,
    'Heightened Pupil Dilation in Photos', 5.5,
    'Increased Cervical Fluid Volume on Toilet Paper', 8.5
];
for (let i = 0; i < clinicalOvulation.length; i += 2) {
    add(clinicalOvulation[i], 'ovulation', clinicalOvulation[i + 1]);
}

// Write seed file
const lines = [
    '-- Predetermined system-wide indicators with calculation weights.',
    '-- Hundreds of granular physical, hormonal, lifestyle, aesthetic, and behavioral signals.',
    '-- High weight (>= 7.0) = strong explicit signal (immediate shift).',
    '-- Low weight (< 7.0) = subtle secondary signal (accumulates toward shift).',
    '',
    'INSERT INTO indicators_master (metric_name, phase_association, mathematical_weight) VALUES'
];

const valueLines = indicators.map((ind, idx) => {
    const isLast = idx === indicators.length - 1;
    const nameEscaped = ind.metric_name.replace(/'/g, "''");
    return `    ('${nameEscaped}', '${ind.phase_association}', ${ind.mathematical_weight.toFixed(1)})${isLast ? '' : ','}`;
});

lines.push(...valueLines);
lines.push('ON CONFLICT (metric_name) DO UPDATE SET');
lines.push('    phase_association = EXCLUDED.phase_association,');
lines.push('    mathematical_weight = EXCLUDED.mathematical_weight;');
lines.push('');

const outputPath = path.join(__dirname, '..', '..', '..', 'db', 'seed.sql');
fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');

console.log(`Generated ${indicators.length} indicators in db/seed.sql`);
console.log(`Period indicators: ${indicators.filter(i => i.phase_association === 'period').length}`);
console.log(`Ovulation indicators: ${indicators.filter(i => i.phase_association === 'ovulation').length}`);
