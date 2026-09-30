import {
  Activity,
  Apple,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  Clock,
  ChevronDown,
  ClipboardList,
  CloudOff,
  Construction,
  Droplet,
  Flag,
  Gavel,
  Hammer,
  HandHeart,
  Handshake,
  HardHat,
  HeartPulse,
  History,
  Home,
  House,
  Inbox,
  Info,
  List,
  Lock,
  LifeBuoy,
  LogIn,
  LogOut,
  MapPin,
  Map as MapIcon,
  Megaphone,
  Menu,
  RotateCcw,
  Send,
  Search,
  Shield,
  Siren,
  Store,
  Tent,
  TrafficCone,
  Truck,
  Minus,
  Plus,
  Trash2,
  User,
  UserPlus,
  Users,
  Warehouse,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'

/**
 * Íconos SVG empaquetados en el bundle (lucide-react).
 * No dependen de fuentes externas: se ven igual con conexión débil o si Google Fonts falla.
 * Los nombres siguen la convención de Material Symbols usada en los diseños de Stitch.
 */
const ICONS: Record<string, LucideIcon> = {
  map: MapIcon,
  shield: Shield,
  home: Home,
  cottage: House,
  monitoring: Activity,
  sos: LifeBuoy,
  volunteer_activism: HandHeart,
  close: X,
  menu: Menu,
  search: Search,
  location_on: MapPin,
  emergency: Siren,
  emergency_home: AlertTriangle,
  arrow_forward: ArrowRight,
  inventory_2: Inbox,
  handshake: Handshake,
  traffic: TrafficCone,
  storefront: Store,
  family_restroom: Users,
  verified_user: BadgeCheck,
  lock: Lock,
  flag: Flag,
  location_city: Building2,
  list: List,
  assignment: ClipboardList,
  warehouse: Warehouse,
  local_shipping: Truck,
  bolt: Zap,
  construction: Construction,
  engineering: HardHat,
  handyman: Hammer,
  campaign: Megaphone,
  person: User,
  person_add: UserPlus,
  login: LogIn,
  logout: LogOut,
  restart_alt: RotateCcw,
  expand_more: ChevronDown,
  check: Check,
  info: Info,
  cloud_off: CloudOff,
  arrow_back: ArrowLeft,
  schedule: Clock,
  history: History,
  send: Send,
  water_drop: Droplet,
  nutrition: Apple,
  camping: Tent,
  health: HeartPulse,
  gavel: Gavel,
  add: Plus,
  remove: Minus,
  delete: Trash2,
}

export type IconName = keyof typeof ICONS

interface IconProps {
  name: string
  filled?: boolean
  className?: string
}

/** El tamaño se controla con clases `text-[Npx]` (1em) igual que antes. */
export function Icon({ name, filled = false, className = '' }: IconProps) {
  const Cmp = ICONS[name] ?? Shield
  return (
    <Cmp
      aria-hidden="true"
      className={`inline-block h-[1em] w-[1em] shrink-0 ${className}`}
      style={{ fontSize: className.includes('text-[') ? undefined : 22 }}
      strokeWidth={2}
      fill={filled ? 'currentColor' : 'none'}
      fillOpacity={filled ? 0.18 : undefined}
    />
  )
}
