import type { LucideIcon, LucideProps } from 'lucide-react';
import {
  Code,
  Database,
  Globe,
  Network,
  Shield,
  Cloud,
  Cpu,
  GitBranch,
  Layers,
  BarChart2,
  Brain,
  MoreHorizontal,
  Server,
  Lock,
  Wifi,
  Terminal,
  Bug,
  Boxes,
  Container,
  Infinity,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Database,
  Globe,
  Network,
  Shield,
  Cloud,
  Cpu,
  GitBranch,
  Layers,
  BarChart2,
  Brain,
  MoreHorizontal,
  Server,
  Lock,
  Wifi,
  Terminal,
  Bug,
  Boxes,
  Container,
  Infinity,
};

interface CategoryIconProps extends Omit<LucideProps, 'color'> {
  icon?: string | null;
  color?: string | null;
  size?: number;
}

export function CategoryIcon({
  icon,
  color,
  size = 18,
  className,
  ...rest
}: CategoryIconProps) {
  const Icon = ICON_MAP[icon ?? 'Code'] ?? Code;
  return (
    <Icon
      size={size}
      className={className}
      style={{ ...(color ? { color } : undefined) }}
      {...rest}
    />
  );
}