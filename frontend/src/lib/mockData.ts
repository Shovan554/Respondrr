type TrendPoint = {
  timestamp: string
  value: number
}

type TrendConfig = {
  base: number
  variance: number
  min: number
  max: number
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const trendConfigs: Record<string, TrendConfig> = {
  heart_rate: { base: 78, variance: 14, min: 55, max: 130 },
  blood_oxygen_saturation: { base: 97, variance: 2.2, min: 92, max: 100 },
  heart_rate_variability: { base: 52, variance: 10, min: 25, max: 120 },
  respiratory_rate: { base: 16, variance: 3.5, min: 10, max: 28 },
  step_count: { base: 5200, variance: 1400, min: 0, max: 12000 },
  active_energy: { base: 560, variance: 180, min: 120, max: 1100 },
  apple_exercise_time: { base: 42, variance: 12, min: 5, max: 90 }
}

const buildTrendSeries = (metric: string, days: number): TrendPoint[] => {
  const config = trendConfigs[metric] ?? { base: 60, variance: 12, min: 0, max: 140 }
  const points = days === 1 ? 24 : Math.min(Math.max(days, 3), 30)
  const stepMs = days === 1 ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000
  const now = Date.now()
  const seed = metric.length * 11 + days * 7

  return Array.from({ length: points }, (_, index) => {
    const offset = points - 1 - index
    const timestamp = new Date(now - offset * stepMs).toISOString()
    const wave = Math.sin((index + seed) / 2.6) * config.variance
    const drift = Math.cos((index + seed) / 4.7) * (config.variance * 0.35)
    const value = clamp(config.base + wave + drift, config.min, config.max)

    return { timestamp, value: Math.round(value * 10) / 10 }
  })
}

export const mockDashboardSummary = {
  latest: {
    heart_rate: { value: 82 },
    respiratory_rate: { value: 17 },
    blood_oxygen_saturation: { value: 97 }
  },
  today: {
    avg_hr: 79,
    avg_rr: 16,
    steps: 6840,
    active_energy: 610,
    daylight_min: 48,
    exercise_min: 35
  }
}

export const mockVitals = {
  heart_rate: { value: 81 },
  blood_oxygen_saturation: { value: 97.2 },
  heart_rate_variability: { value: 52 },
  respiratory_rate: { value: 16.4 },
  step_count: { value: 6820 },
  active_energy: { value: 612 },
  apple_exercise_time: { value: 38 },
  resting_heart_rate: { value: 62 },
  apple_sleeping_wrist_temperature: { value: 36.4 },
  basal_energy_burned: { value: 1480 },
  time_in_daylight: { value: 44 },
  apple_stand_time: { value: 72 },
  headphone_audio_exposure: { value: 72 }
}

export const buildMockTrends = (metric: string, days: number) => buildTrendSeries(metric, days)

export const mockActiveCases = [
  {
    id: 'case-101',
    name: 'John Doe',
    initials: 'JD',
    last_check_in_min: 2,
    heart_rate: 114,
    status: 'elevated'
  },
  {
    id: 'case-102',
    name: 'Maria Santos',
    initials: 'MS',
    last_check_in_min: 4,
    heart_rate: 108,
    status: 'monitoring'
  },
  {
    id: 'case-103',
    name: 'Alice Baker',
    initials: 'AB',
    last_check_in_min: 6,
    heart_rate: 102,
    status: 'stable'
  }
]

export const mockDispatchAlert = {
  id: 'dispatch-77',
  level: 2,
  zone: 'A',
  title: 'New Dispatch',
  description: 'Level 2 emergency detected in Zone A. Immediate response required.',
  response_eta_min: 3
}

export const mockRecentDoctors = [
  {
    id: 'doc-201',
    name: 'Dr. Anika Rao',
    specialty: 'Emergency Medicine',
    last_helped: '12 mins ago',
    rating: 4.9,
    location: 'Central District'
  },
  {
    id: 'doc-202',
    name: 'Dr. Samuel Lee',
    specialty: 'Cardiology',
    last_helped: '28 mins ago',
    rating: 4.7,
    location: 'North Wing'
  },
  {
    id: 'doc-203',
    name: 'Dr. Nora Blake',
    specialty: 'Critical Care',
    last_helped: '1 hr ago',
    rating: 4.8,
    location: 'Telemetry Hub'
  }
]

export const mockRecentPatients = [
  {
    id: 'patient-301',
    name: 'Ishan Gurung',
    age: 26,
    last_event: '5 mins ago',
    status: 'monitoring',
    location: 'Zone C'
  },
  {
    id: 'patient-302',
    name: 'Lila Carter',
    age: 34,
    last_event: '18 mins ago',
    status: 'stable',
    location: 'Zone A'
  },
  {
    id: 'patient-303',
    name: 'Marcus Hill',
    age: 42,
    last_event: '42 mins ago',
    status: 'follow-up',
    location: 'Zone B'
  }
]
