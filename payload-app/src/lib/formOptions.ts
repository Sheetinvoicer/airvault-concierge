/**
 * Shared option lists that back the client-facing dropdowns across the app.
 *
 * These pick-lists let travellers select valid values (airports, countries,
 * luggage size, delay length, seats) instead of typing free text — which
 * removes an entire class of "invalid input" failures.
 */

export interface Airport {
  code: string
  city: string
}

/** Airports offered in the flight search origin/destination pickers. */
export const AIRPORTS: Airport[] = [
  { code: 'JFK', city: 'New York (JFK)' },
  { code: 'LAX', city: 'Los Angeles (LAX)' },
  { code: 'ORD', city: 'Chicago (ORD)' },
  { code: 'ATL', city: 'Atlanta (ATL)' },
  { code: 'SFO', city: 'San Francisco (SFO)' },
  { code: 'MIA', city: 'Miami (MIA)' },
  { code: 'SEA', city: 'Seattle (SEA)' },
  { code: 'BOS', city: 'Boston (BOS)' },
  { code: 'DFW', city: 'Dallas (DFW)' },
  { code: 'DEN', city: 'Denver (DEN)' },
  { code: 'LHR', city: 'London (LHR)' },
  { code: 'CDG', city: 'Paris (CDG)' },
  { code: 'FRA', city: 'Frankfurt (FRA)' },
  { code: 'DXB', city: 'Dubai (DXB)' },
  { code: 'SYD', city: 'Sydney (SYD)' },
  { code: 'NRT', city: 'Tokyo (NRT)' },
  { code: 'SIN', city: 'Singapore (SIN)' },
  { code: 'YYZ', city: 'Toronto (YYZ)' },
]

export interface Country {
  code: string
  name: string
}

/** Countries offered in the pet-checklist origin/destination pickers. */
export const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'BR', name: 'Brazil' },
  { code: 'IN', name: 'India' },
]

/** Common pickup/dropoff points offered in the ride request pickers. */
export const RIDE_LOCATIONS: string[] = [
  'JFK Airport - Terminal 1',
  'JFK Airport - Terminal 4',
  'JFK Airport - Terminal 8',
  'LAX Airport - Terminal B',
  'LAX Airport - Terminal 4',
  'ORD Airport - Terminal 2',
  'SFO Airport - International Terminal',
  'Manhattan - Midtown',
  'Manhattan - Downtown',
  'Brooklyn - Downtown',
  'Downtown Los Angeles',
  'Santa Monica',
  'Chicago - The Loop',
  'Boston - Back Bay',
  'San Francisco - Union Square',
]

export interface LuggageOption {
  label: string
  volume: number
  weight: number
}

/**
 * Luggage presets for the ride request form. Each maps to a representative
 * volume (L) and weight (lbs) that the ride-matching API uses to pick a vehicle.
 * Values are kept within the largest vehicle's capacity (80 L / 100 lbs) so a
 * vehicle can always be matched.
 */
export const LUGGAGE_OPTIONS: LuggageOption[] = [
  { label: 'Carry-on only (1 small bag)', volume: 20, weight: 15 },
  { label: '1 checked bag (medium)', volume: 40, weight: 35 },
  { label: '2 checked bags (large)', volume: 60, weight: 60 },
  { label: '3+ bags / oversized', volume: 80, weight: 90 },
]

export interface DelayOption {
  label: string
  value: number
}

/**
 * Delay presets for the claim form. Only qualifying delays (>= 60 min) are
 * offered, so a claim can never be filed for a non-qualifying delay.
 */
export const DELAY_OPTIONS: DelayOption[] = [
  { label: '1 to 2 hours (~90 min)', value: 90 },
  { label: '2 to 4 hours (~180 min)', value: 180 },
  { label: '4 to 6 hours (~300 min)', value: 300 },
  { label: 'More than 6 hours (~420 min)', value: 420 },
]

/** Cabin rows offered in the meal seat picker. */
export const SEAT_ROWS: number[] = Array.from({ length: 30 }, (_, i) => i + 1)

/** Seat letters offered in the meal seat picker. */
export const SEAT_LETTERS: string[] = ['A', 'B', 'C', 'D', 'E', 'F']
