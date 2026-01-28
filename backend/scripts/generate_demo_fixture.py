import json
import random
from pathlib import Path
from typing import Tuple


ROOT = Path(__file__).resolve().parents[1]
FIXTURE_PATH = ROOT / "pharmacies" / "fixtures" / "demo_data.json"


HUBS = [
    ("Panaji", "Panaji", 15.4909, 73.8278),
    ("Mapusa", "Mapusa", 15.5900, 73.8080),
    ("Margao", "Margao", 15.2736, 73.9581),
    ("Vasco", "Vasco da Gama", 15.3984, 73.8120),
    ("Ponda", "Ponda", 15.4040, 74.0150),
    ("Porvorim", "Porvorim", 15.5330, 73.8300),
    ("Calangute", "Calangute", 15.5431, 73.7553),
    ("Bicholim", "Bicholim", 15.6000, 73.9500),
]


def jitter(lat: float, lon: float, scale: float = 0.006) -> Tuple[float, float]:
    return (lat + random.uniform(-scale, scale), lon + random.uniform(-scale, scale))


def main() -> None:
    data = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))

    # Extract medicines from existing fixture
    medicines = [obj for obj in data if obj.get("model") == "pharmacies.medicine"]
    if len(medicines) < 100:
        raise SystemExit(f"Need 100+ medicines in fixture, found {len(medicines)}")

    # Start fresh for pharmacies + stock; keep medicines as-is
    new_data: list[dict] = []
    new_data.extend([obj for obj in data if obj.get("model") == "pharmacies.medicine"])

    # Build pharmacy clusters, include a 24/7 Mega Pharmacy per hub stocking 100%
    pharmacy_pk = 1
    stock_pk = 1
    pharmacies: list[dict] = []
    stocks: list[dict] = []

    random.seed(42)

    for hub_area, hub_city, base_lat, base_lon in HUBS:
        # Mega pharmacy (fail-safe)
        lat, lon = jitter(base_lat, base_lon, 0.003)
        mega_pk = pharmacy_pk
        pharmacies.append(
            {
                "model": "pharmacies.pharmacy",
                "pk": mega_pk,
                "fields": {
                    "name": f"{hub_area} 24/7 Mega Pharmacy",
                    "area": hub_area,
                    "city": hub_city,
                    "latitude": round(lat, 6),
                    "longitude": round(lon, 6),
                    "delivery_available": True,
                    "contact": f"98{random.randint(10000000,99999999)}",
                },
            }
        )
        pharmacy_pk += 1

        # Other pharmacies (3-5)
        others_count = random.randint(3, 5)
        other_pks = []
        for i in range(others_count):
            lat, lon = jitter(base_lat, base_lon, 0.008)
            pk = pharmacy_pk
            other_pks.append(pk)
            # Use more realistic "brand-like" names per hub
            if hub_area.lower() == "panaji":
                name = ["Wellness Forever Panaji", "Care & Cure Panaji", "Panaji Central Pharmacy", "HealthPlus Panaji"][i % 4]
            elif hub_area.lower() == "margao":
                name = ["Apollo Pharmacy Margao", "Margao Wellness", "South Goa Medico", "Margao Care Pharmacy"][i % 4]
            elif hub_area.lower() == "mapusa":
                name = ["Union Pharmacy Mapusa", "Mapusa MedPlus", "Bardez Wellness", "Mapusa Family Pharmacy"][i % 4]
            else:
                name = f"{hub_area} Pharmacy {i+1}"

            pharmacies.append(
                {
                    "model": "pharmacies.pharmacy",
                    "pk": pk,
                    "fields": {
                        "name": name,
                        "area": hub_area,
                        "city": hub_city,
                        "latitude": round(lat, 6),
                        "longitude": round(lon, 6),
                        "delivery_available": bool((i + len(hub_area)) % 2),
                        "contact": f"98{random.randint(10000000,99999999)}",
                    },
                }
            )
            pharmacy_pk += 1

        # Stock assignment
        med_ids = [m["pk"] for m in medicines]

        # Mega: stock all
        for mid in med_ids:
            stocks.append(
                {
                    "model": "pharmacies.stock",
                    "pk": stock_pk,
                    "fields": {
                        "pharmacy": mega_pk,
                        "medicine": mid,
                        "quantity": random.randint(20, 120),
                    },
                }
            )
            stock_pk += 1

        # Ensure each medicine is present in 3–5 pharmacies overall within hub:
        # pick 2-4 of the other pharmacies for each medicine (mega makes it 3-5 total)
        for mid in med_ids:
            targets = random.sample(other_pks, k=min(len(other_pks), random.randint(2, 4)))
            for pk in targets:
                stocks.append(
                    {
                        "model": "pharmacies.stock",
                        "pk": stock_pk,
                        "fields": {
                            "pharmacy": pk,
                            "medicine": mid,
                            "quantity": random.randint(5, 60),
                        },
                    }
                )
                stock_pk += 1

    new_data.extend(pharmacies)
    new_data.extend(stocks)

    FIXTURE_PATH.write_text(json.dumps(new_data, indent=2), encoding="utf-8")
    print(f"Wrote fixture with {len(pharmacies)} pharmacies and {len(stocks)} stocks to {FIXTURE_PATH}")


if __name__ == "__main__":
    main()

