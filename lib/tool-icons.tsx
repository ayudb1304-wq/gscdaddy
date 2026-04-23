import type { ComponentType } from "react"
import {
  HeartPulse,
  TrendingUp,
  Eye,
  Code,
  Share2,
  Link as LinkIcon,
  Bot,
  BarChart3,
  BookOpen,
} from "lucide-react"

type IconComponent = ComponentType<{ className?: string }>

// Keyed by the `icon` string stored on each tool in lib/tools.ts so both the
// public /tools grid and the authenticated app sidebar resolve to the same
// lucide component without duplicating the map.
export const TOOL_ICONS: Record<string, IconComponent> = {
  HeartPulse,
  TrendingUp,
  Eye,
  Code,
  Share2,
  Link: LinkIcon,
  Bot,
  BarChart3,
  BookOpen,
}
