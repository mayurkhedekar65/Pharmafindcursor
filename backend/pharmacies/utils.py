from __future__ import annotations

import json
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Iterable, List, Optional, Tuple

from .models import Pharmacy

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "PharmaFind/1.0 (Location search engine)"
_NOMINATIM_CACHE: dict[str, Tuple[float, float, str]] = {}
_NOMINATIM_CACHE_MAX = 100


@dataclass
class LocationReference:
    name: str
    latitude: float
    longitude: float
    aliases: List[str]


GOA_LOCATIONS: List[LocationReference] = [
    # North Goa - Major Cities
    LocationReference("Panaji", 15.4909, 73.8278, ["Panjim", "Panaji City", "Panjim City"]),
    LocationReference("Mapusa", 15.5900, 73.8080, ["Mapuca", "Mapusa Market"]),
    LocationReference("Vasco", 15.3984, 73.8120, ["Vasco da Gama", "Vasco-Da-Gama"]),
    LocationReference("Ponda", 15.4040, 74.0150, ["Ponda City"]),
    LocationReference("Bicholim", 15.6000, 73.9500, ["Bicholim Town"]),
    LocationReference("Pernem", 15.7167, 73.8000, ["Pernem Town"]),
    LocationReference("Sanquelim", 15.5780, 74.0000, ["Sanquelim Town"]),
    
    # North Goa - Panaji Area
    LocationReference("Taleigao", 15.4800, 73.8200, ["Taleigao"]),
    LocationReference("Dona Paula", 15.4567, 73.8000, ["Dona Paula"]),
    LocationReference("Miramar", 15.4700, 73.8100, ["Miramar Beach"]),
    LocationReference("Campal", 15.4850, 73.8250, ["Campal"]),
    LocationReference("Altinho", 15.4950, 73.8300, ["Altinho"]),
    LocationReference("Fontainhas", 15.4920, 73.8280, ["Fontainhas"]),
    LocationReference("Ribandar", 15.5000, 73.8400, ["Ribandar"]),
    LocationReference("St. Inez", 15.4880, 73.8220, ["St. Inez"]),
    
    # North Goa - Bardez Taluka
    LocationReference("Calangute", 15.5431, 73.7553, ["Calangute Beach"]),
    LocationReference("Candolim", 15.5200, 73.7600, ["Candolim Beach"]),
    LocationReference("Baga", 15.5500, 73.7500, ["Baga Beach"]),
    LocationReference("Anjuna", 15.5700, 73.7400, ["Anjuna Beach"]),
    LocationReference("Vagator", 15.5800, 73.7300, ["Vagator Beach"]),
    LocationReference("Chapora", 15.5900, 73.7200, ["Chapora"]),
    LocationReference("Arambol", 15.6900, 73.7000, ["Arambol Beach"]),
    LocationReference("Mandrem", 15.6800, 73.7100, ["Mandrem Beach"]),
    LocationReference("Morjim", 15.6400, 73.7200, ["Morjim Beach"]),
    LocationReference("Ashwem", 15.6600, 73.7100, ["Ashwem Beach"]),
    LocationReference("Siolim", 15.6100, 73.7800, ["Siolim"]),
    LocationReference("Saligao", 15.5600, 73.7700, ["Saligao"]),
    LocationReference("Nagoa", 15.5400, 73.7650, ["Nagoa"]),
    LocationReference("Arpora", 15.5550, 73.7450, ["Arpora"]),
    LocationReference("Parra", 15.5700, 73.7600, ["Parra"]),
    LocationReference("Sodiem", 15.5800, 73.7500, ["Sodiem"]),
    
    # North Goa - Tiswadi Taluka
    LocationReference("Chorao", 15.5200, 73.8500, ["Chorao Island"]),
    LocationReference("Divar", 15.5300, 73.8600, ["Divar Island"]),
    LocationReference("Old Goa", 15.5000, 73.9000, ["Velha Goa", "Old Goa"]),
    LocationReference("Agassaim", 15.4800, 73.8700, ["Agassaim"]),
    LocationReference("Bambolim", 15.4600, 73.8500, ["Bambolim"]),
    LocationReference("Carambolim", 15.5100, 73.8800, ["Carambolim"]),
    LocationReference("Chimbel", 15.4900, 73.8400, ["Chimbel"]),
    LocationReference("Cortalim", 15.4400, 73.8600, ["Cortalim"]),
    LocationReference("Goa Velha", 15.4700, 73.8900, ["Goa Velha"]),
    LocationReference("Merces", 15.4850, 73.8350, ["Merces"]),
    LocationReference("Navelim", 15.4750, 73.8400, ["Navelim"]),
    LocationReference("Neura", 15.4650, 73.8550, ["Neura"]),
    LocationReference("Pilerne", 15.5500, 73.7900, ["Pilerne"]),
    LocationReference("St. Cruz", 15.4950, 73.8450, ["St. Cruz"]),
    
    # North Goa - Bicholim Taluka
    LocationReference("Pale", 15.6200, 73.9600, ["Pale"]),
    LocationReference("Surla", 15.6300, 73.9700, ["Surla"]),
    LocationReference("Mayem", 15.6100, 73.9400, ["Mayem"]),
    LocationReference("Naroa", 15.5900, 73.9300, ["Naroa"]),
    LocationReference("Pirna", 15.6000, 73.9500, ["Pirna"]),
    LocationReference("Sattari", 15.6500, 74.0000, ["Sattari"]),
    LocationReference("Valpoi", 15.6400, 74.0100, ["Valpoi"]),
    
    # North Goa - Pernem Taluka
    LocationReference("Arambol", 15.6900, 73.7000, ["Arambol Beach"]),
    LocationReference("Mandrem", 15.6800, 73.7100, ["Mandrem Beach"]),
    LocationReference("Kerim", 15.7000, 73.7500, ["Kerim"]),
    LocationReference("Tivim", 15.6500, 73.8200, ["Tivim"]),
    LocationReference("Colvale", 15.6400, 73.8300, ["Colvale"]),
    LocationReference("Nerul", 15.6300, 73.8400, ["Nerul"]),
    LocationReference("Reis Magos", 15.6200, 73.8500, ["Reis Magos"]),
    
    # North Goa - Ponda Taluka
    LocationReference("Khandepar", 15.4200, 74.0200, ["Khandepar"]),
    LocationReference("Keri", 15.4100, 74.0300, ["Keri"]),
    LocationReference("Marcela", 15.4000, 74.0100, ["Marcela"]),
    LocationReference("Querim", 15.3900, 74.0000, ["Querim"]),
    LocationReference("Shiroda", 15.3800, 73.9900, ["Shiroda"]),
    LocationReference("Usgao", 15.3700, 73.9800, ["Usgao"]),
    LocationReference("Bandora", 15.3900, 74.0100, ["Bandora"]),
    LocationReference("Borim", 15.4000, 74.0200, ["Borim"]),
    LocationReference("Curti", 15.4100, 74.0000, ["Curti"]),
    LocationReference("Dabhal", 15.3800, 74.0000, ["Dabhal"]),
    LocationReference("Kavlem", 15.4200, 74.0100, ["Kavlem"]),
    LocationReference("Navelim", 15.4300, 74.0000, ["Navelim Ponda"]),
    LocationReference("Priol", 15.4400, 74.0100, ["Priol"]),
    LocationReference("Savoi Verem", 15.4500, 74.0200, ["Savoi Verem"]),
    
    # South Goa - Major Cities
    LocationReference("Margao", 15.2736, 73.9581, ["Madgaon", "Margao City"]),
    LocationReference("Quepem", 15.2100, 73.9900, ["Quepem Town"]),
    LocationReference("Canacona", 15.0200, 74.0500, ["Canacona Town"]),
    LocationReference("Curchorem", 15.2600, 74.0200, ["Curchorem"]),
    LocationReference("Sanguem", 15.2300, 74.1500, ["Sanguem"]),
    
    # South Goa - Salcete Taluka (Margao Area)
    LocationReference("Fatorda", 15.2800, 73.9600, ["Fatorda"]),
    LocationReference("Navelim", 15.2700, 73.9500, ["Navelim Salcete"]),
    LocationReference("Benaulim", 15.2500, 73.9200, ["Benaulim Beach"]),
    LocationReference("Colva", 15.2600, 73.9100, ["Colva Beach"]),
    LocationReference("Betalbatim", 15.2700, 73.9000, ["Betalbatim"]),
    LocationReference("Majorda", 15.2800, 73.8900, ["Majorda Beach"]),
    LocationReference("Utorda", 15.2900, 73.8800, ["Utorda Beach"]),
    LocationReference("Varca", 15.3000, 73.8700, ["Varca Beach"]),
    LocationReference("Cavelossim", 15.3100, 73.8600, ["Cavelossim Beach"]),
    LocationReference("Mobor", 15.3200, 73.8500, ["Mobor Beach"]),
    LocationReference("Carmona", 15.2400, 73.9300, ["Carmona"]),
    LocationReference("Chinchinim", 15.2300, 73.9400, ["Chinchinim"]),
    LocationReference("Cuncolim", 15.2200, 73.9500, ["Cuncolim"]),
    LocationReference("Assolna", 15.2100, 73.9600, ["Assolna"]),
    LocationReference("Velim", 15.2000, 73.9700, ["Velim"]),
    LocationReference("Ambelim", 15.1900, 73.9800, ["Ambelim"]),
    LocationReference("Benaulim", 15.2500, 73.9200, ["Benaulim"]),
    LocationReference("Cana", 15.2400, 73.9400, ["Cana"]),
    LocationReference("Chandor", 15.2300, 73.9500, ["Chandor"]),
    LocationReference("Curtorim", 15.2200, 73.9600, ["Curtorim"]),
    LocationReference("Davorlim", 15.2600, 73.9700, ["Davorlim"]),
    LocationReference("Gonsua", 15.2500, 73.9800, ["Gonsua"]),
    LocationReference("Guirdolim", 15.2400, 73.9900, ["Guirdolim"]),
    LocationReference("Loutolim", 15.2300, 74.0000, ["Loutolim"]),
    LocationReference("Macasana", 15.2200, 74.0100, ["Macasana"]),
    LocationReference("Nuvem", 15.2800, 73.9200, ["Nuvem"]),
    LocationReference("Orlim", 15.2700, 73.9300, ["Orlim"]),
    LocationReference("Raia", 15.2600, 73.9400, ["Raia"]),
    LocationReference("Seraulim", 15.2500, 73.9500, ["Seraulim"]),
    LocationReference("Verna", 15.3500, 73.9000, ["Verna"]),
    
    # South Goa - Mormugao Taluka (Vasco Area)
    LocationReference("Dabolim", 15.3800, 73.8400, ["Dabolim Airport"]),
    LocationReference("Chicalim", 15.3700, 73.8300, ["Chicalim"]),
    LocationReference("Sancoale", 15.3600, 73.8200, ["Sancoale"]),
    LocationReference("Cortalim", 15.3500, 73.8100, ["Cortalim South"]),
    LocationReference("Velsao", 15.3400, 73.8000, ["Velsao"]),
    LocationReference("Cansaulim", 15.3300, 73.7900, ["Cansaulim"]),
    LocationReference("Arossim", 15.3200, 73.7800, ["Arossim"]),
    LocationReference("Majorda", 15.3100, 73.7700, ["Majorda"]),
    
    # South Goa - Quepem Taluka
    LocationReference("Balli", 15.2000, 74.0000, ["Balli"]),
    LocationReference("Cacora", 15.1900, 74.0100, ["Cacora"]),
    LocationReference("Cana", 15.1800, 74.0200, ["Cana Quepem"]),
    LocationReference("Chandor", 15.1700, 74.0300, ["Chandor Quepem"]),
    LocationReference("Curdi", 15.1600, 74.0400, ["Curdi"]),
    LocationReference("Davorlim", 15.1500, 74.0500, ["Davorlim Quepem"]),
    LocationReference("Guleli", 15.1400, 74.0600, ["Guleli"]),
    LocationReference("Quitol", 15.1300, 74.0700, ["Quitol"]),
    LocationReference("Xeldem", 15.1200, 74.0800, ["Xeldem"]),
    
    # South Goa - Canacona Taluka
    LocationReference("Palolem", 15.0100, 74.0200, ["Palolem Beach"]),
    LocationReference("Agonda", 15.0000, 74.0300, ["Agonda Beach"]),
    LocationReference("Patnem", 15.0200, 74.0100, ["Patnem Beach"]),
    LocationReference("Rajbag", 15.0300, 74.0000, ["Rajbag Beach"]),
    LocationReference("Cola", 15.0400, 73.9900, ["Cola Beach"]),
    LocationReference("Chaudi", 15.0000, 74.0400, ["Chaudi"]),
    LocationReference("Loliem", 14.9900, 74.0500, ["Loliem"]),
    LocationReference("Poinguinim", 14.9800, 74.0600, ["Poinguinim"]),
    LocationReference("Gaondongrim", 14.9700, 74.0700, ["Gaondongrim"]),
    
    # South Goa - Sanguem Taluka
    LocationReference("Neturlim", 15.2400, 74.1600, ["Neturlim"]),
    LocationReference("Rivona", 15.2500, 74.1700, ["Rivona"]),
    LocationReference("Sancordem", 15.2600, 74.1800, ["Sancordem"]),
    LocationReference("Uguem", 15.2700, 74.1900, ["Uguem"]),
    LocationReference("Vaddem", 15.2800, 74.2000, ["Vaddem"]),
]


def _normalize(text: str) -> str:
    return "".join(ch.lower() for ch in text if ch.isalnum() or ch.isspace()).strip()


def geocode_nominatim(user_location: str) -> Optional[Tuple[float, float, str]]:
    """
    Resolve user-entered location text to (lat, lon, display_name) using
    OpenStreetMap Nominatim (free). Returns None on failure or no results.
    Uses a small in-memory cache to avoid excessive API calls.
    """
    if not user_location or not str(user_location).strip():
        return None
    q = str(user_location).strip()
    cache_key = q.lower()
    if cache_key in _NOMINATIM_CACHE:
        return _NOMINATIM_CACHE[cache_key]
    params = {"format": "json", "q": q, "limit": 1}
    url = NOMINATIM_URL + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
    except Exception:
        return None
    if not data or not isinstance(data, list):
        return None
    first = data[0]
    if not isinstance(first, dict):
        return None
    try:
        lat = float(first.get("lat"))
        lon = float(first.get("lon"))
        name = str(first.get("display_name", first.get("name", q)))[:200]
    except (TypeError, ValueError):
        return None
    result = (lat, lon, name)
    if len(_NOMINATIM_CACHE) >= _NOMINATIM_CACHE_MAX:
        _NOMINATIM_CACHE.clear()
    _NOMINATIM_CACHE[cache_key] = result
    return result


def _fallback_to_nearest_goa(user_lat: float, user_lon: float) -> Tuple[float, float, str]:
    """Map given coordinates to the nearest predefined Goa location."""
    from math import inf

    best_ref = GOA_LOCATIONS[0]
    best_d = inf
    for ref in GOA_LOCATIONS:
        d = (ref.latitude - user_lat) ** 2 + (ref.longitude - user_lon) ** 2
        if d < best_d:
            best_d = d
            best_ref = ref
    return best_ref.latitude, best_ref.longitude, best_ref.name


def identify_location(user_location: str) -> Tuple[float, float, str]:
    """
    Resolve user-entered location to (lat, lon, resolved_area).

    1. If empty, return Panaji.
    2. Try OpenStreetMap Nominatim geocoding.
    3. If Nominatim succeeds, use returned coords; if in/around Goa, use them
       as-is; otherwise map to nearest predefined Goa location.
    4. If Nominatim fails, use predefined Goa names/aliases (exact then partial).
    5. Final fallback: Panaji.
    """
    loc = (user_location or "").strip()
    if not loc:
        ref = GOA_LOCATIONS[0]
        return ref.latitude, ref.longitude, ref.name

    # Try Nominatim first
    result = geocode_nominatim(loc)
    if result is not None:
        lat, lon, name = result
        # If result is inside Goa bounds (rough), use it; else map to nearest Goa
        if 14.9 <= lat <= 16.0 and 73.6 <= lon <= 74.2:
            return lat, lon, name
        return _fallback_to_nearest_goa(lat, lon)

    # Fallback: predefined Goa locations (existing logic)
    normalized_input = _normalize(loc)
    for ref in GOA_LOCATIONS:
        if normalized_input == _normalize(ref.name):
            return ref.latitude, ref.longitude, ref.name
        for alias in ref.aliases:
            if normalized_input == _normalize(alias):
                return ref.latitude, ref.longitude, ref.name
    for ref in GOA_LOCATIONS:
        if normalized_input in _normalize(ref.name):
            return ref.latitude, ref.longitude, ref.name
        for alias in ref.aliases:
            if normalized_input in _normalize(alias):
                return ref.latitude, ref.longitude, ref.name

    ref = GOA_LOCATIONS[0]
    return ref.latitude, ref.longitude, ref.name


def haversine_distance_km(
    lat1: float, lon1: float, lat2: float, lon2: float
) -> float:
    """
    Calculate distance between two latitude/longitude pairs in kilometres.
    """
    from math import asin, cos, radians, sin, sqrt

    r = 6371.0  # Earth radius in km

    d_lat = radians(lat2 - lat1)
    d_lon = radians(lon2 - lon1)
    a = (
        sin(d_lat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lon / 2) ** 2
    )
    c = 2 * asin(sqrt(a))
    return r * c


def pharmacies_with_distances(
    user_lat: float, user_lon: float, pharmacies: Iterable[Pharmacy]
) -> List[Tuple[Pharmacy, float]]:
    """
    Return a list of (pharmacy, distance_km) sorted by nearest distance.
    """
    result: List[Tuple[Pharmacy, float]] = []
    for pharmacy in pharmacies:
        distance = haversine_distance_km(
            user_lat,
            user_lon,
            float(pharmacy.latitude),
            float(pharmacy.longitude),
        )
        result.append((pharmacy, distance))

    result.sort(key=lambda item: item[1])
    return result

