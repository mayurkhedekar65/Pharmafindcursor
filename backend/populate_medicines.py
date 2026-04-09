import os
import django
import random
from datetime import timedelta
from django.utils import timezone

# Setup Django environment
import sys
sys.path.append('c:\\Users\\mayur\\OneDrive\\Desktop\\Pharmafindcursor\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pharmafind_backend.settings')
django.setup()

from pharmacies.models import Medicine, Pharmacy, Stock

MEDICINE_DATA = {
    "medicine": [
        ("Dolo 650mg", "Paracetamol for fever and pain relief", 30.00),
        ("Crocin Advance", "Fast acting pain relief", 25.00),
        ("Allegra 120mg", "Anti-allergy medication", 180.00),
        ("Augmentin 625 Duo", "Broad spectrum antibiotic", 220.00),
        ("Combiflam", "Ibuprofen and Paracetamol combination", 45.00),
        ("Zyrtec", "Antihistamine for allergies", 90.00),
        ("Metformin 500mg", "Control blood sugar in type 2 diabetes", 15.00),
        ("Atorvastatin 10mg", "Lower cholesterol and triglycerides", 70.00),
        ("Amlodipine 5mg", "Treat high blood pressure", 12.00),
        ("Azithromycin 500mg", "Antibiotic for respiratory infections", 110.00),
    ],
    "skincare": [
        ("CeraVe Moisturizing Cream", "Hydrating cream for dry skin", 1200.00),
        ("La Roche-Posay Effaclar", "Cleansing gel for oily skin", 950.00),
        ("Neutrogena Hydro Boost", "Water gel moisturizer", 850.00),
        ("Sebamed Clear Face Gel", "Ph balanced oil-free gel", 450.00),
        ("Sunscreen Spf 50+", "High protection sunblock", 600.00),
        ("Cetaphil Gentle Cleanser", "For sensitive and dry skin", 350.00),
    ],
    "personal_care": [
        ("Sensodyne Toothpaste", "For sensitive teeth", 190.00),
        ("Listerine Mouthwash", "Antiseptic mouth rinse", 250.00),
        ("Head & Shoulders", "Anti-dandruff shampoo", 320.00),
        ("Dettol Liquid Handwash", "Anti-bacterial hand protection", 110.00),
        ("Gillette Mach 3 Razor", "Manual shaving system", 450.00),
    ],
    "baby_care": [
        ("Pampers Baby Wipes", "Gentle wipes for babies", 200.00),
        ("Himalaya Baby Powder", "Cooling and refreshing", 150.00),
        ("Johnson's Baby Shampoo", "No more tears formula", 180.00),
        ("Mamaearth Dusting Powder", "Natural corn starch based", 300.00),
        ("MamyPoko Pants", "Extra absorb diapers", 750.00),
    ],
    "vitamins": [
        ("Revital H", "Daily health supplement", 350.00),
        ("Becosules Z", "B-complex with Zinc", 45.00),
        ("Shelcal 500", "Calcium and Vitamin D3", 95.00),
        ("Neurobion Forte", "Vitamin B12 supplement", 35.00),
        ("Evion 400", "Vitamin E supplement", 25.00),
        ("Limcee 500mg", "Vitamin C chewable tablets", 30.00),
    ],
    "healthcare_devices": [
        ("Omron BP Monitor", "Digital blood pressure monitor", 2500.00),
        ("Accu-Chek Active", "Blood glucose monitoring system", 1500.00),
        ("Digital Thermometer", "Instant read thermometer", 250.00),
        ("Pulse Oximeter", "Oxygen saturation monitor", 1200.00),
        ("Nebulizer Machine", "For respiratory treatment", 2200.00),
        ("Dr Trust Scale", "Body weight weighing scale", 1100.00),
    ]
}

def populate():
    pharmacies = Pharmacy.objects.all()
    if not pharmacies:
        print("No pharmacies found. Please create some first.")
        return

    print(f"Starting population for {len(pharmacies)} pharmacies...")
    today = timezone.now().date()

    for category, meds in MEDICINE_DATA.items():
        for name, desc, price in meds:
            # Get or create medicine
            medicine, m_created = Medicine.objects.get_or_create(
                name=name,
                defaults={"description": desc, "category": category, "price": price}
            )
            if m_created:
                print(f"Created medicine: {name}")

            # Add to each pharmacy
            for pharmacy in pharmacies:
                # Add random quantity and batch
                qty = random.randint(5, 100)
                batch = f"BT{random.randint(1000, 9999)}P"
                expiry = today + timedelta(days=random.randint(30, 730))
                
                # We try to vary quantity/expiry per pharmacy for realism
                stock, s_created = Stock.objects.get_or_create(
                    pharmacy=pharmacy,
                    medicine=medicine,
                    defaults={
                        "quantity": qty,
                        "batch_number": batch,
                        "expiry_date": expiry,
                        "low_stock_threshold": 10,
                        "cost_price": price * 0.7,
                        "selling_price": price
                    }
                )
                if not s_created:
                    # Update if already exists
                    stock.quantity += random.randint(1, 20)
                    stock.save()

    print("Success! Database populated with realistic medicine products.")

if __name__ == "__main__":
    populate()
