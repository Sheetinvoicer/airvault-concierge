from typing import List, Dict

def match_vehicle(vehicles: List[Dict], volume_liters: float, weight_lbs: float) -> Dict:
    """Filter vehicles by cargo capacity."""
    for v in vehicles:
        if v['cargo_volume'] >= volume_liters and v['cargo_weight'] >= weight_lbs:
            return v
    return None
