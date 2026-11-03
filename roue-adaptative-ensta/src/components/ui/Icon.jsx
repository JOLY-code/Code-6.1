import {
  AlertTriangle, ArrowRight, Award, BarChart3, BookOpen, Bot, Briefcase, Building2, Calculator,
  Calendar, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ClipboardList,
  Clock, Cloud, CloudOff, Cog, Compass, Copy, Database, Download, Euro, ExternalLink, Eye, FileCheck,
  FileJson, FileSpreadsheet, FileText, Film, FolderOpen, Gauge, Globe, GraduationCap, Handshake, HardHat,
  Home, Info, Layers, LayoutDashboard, Link2, ListOrdered, Lock, LogOut, Maximize2, Menu, MessageSquare,
  Minimize2, Pause, Pencil, Percent, Phone, Play, Plus, Presentation, Printer, QrCode, RefreshCw, Rocket,
  RotateCcw, Scale, Search, Server, Share2, ShieldAlert, ShieldCheck, Sliders, Sparkles, Table, Target,
  Tractor, Trash2, TrendingUp, Unlock, Upload, UserCheck, Users, Video, Wifi, WifiOff, Wrench, X, XCircle,
  Zap,
} from 'lucide-react';

const ICONS = {
  AlertTriangle, ArrowRight, Award, BarChart3, BookOpen, Bot, Briefcase, Building2, Calculator,
  Calendar, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ClipboardList,
  Clock, Cloud, CloudOff, Cog, Compass, Copy, Database, Download, Euro, ExternalLink, Eye, FileCheck,
  FileJson, FileSpreadsheet, FileText, Film, FolderOpen, Gauge, Globe, GraduationCap, Handshake, HardHat,
  Home, Info, Layers, LayoutDashboard, Link2, ListOrdered, Lock, LogOut, Maximize2, Menu, MessageSquare,
  Minimize2, Pause, Pencil, Percent, Phone, Play, Plus, Presentation, Printer, QrCode, RefreshCw, Rocket,
  RotateCcw, Scale, Search, Server, Share2, ShieldAlert, ShieldCheck, Sliders, Sparkles, Table, Target,
  Tractor, Trash2, TrendingUp, Unlock, Upload, UserCheck, Users, Video, Wifi, WifiOff, Wrench, X, XCircle,
  Zap,
};

/** Résout un nom d'icône (string issu de projectData.js) vers un composant lucide-react. */
export default function Icon({ name, size = 18, className = '', ...rest }) {
  const Cmp = ICONS[name] || Info;
  return <Cmp size={size} className={className} aria-hidden="true" {...rest} />;
}
