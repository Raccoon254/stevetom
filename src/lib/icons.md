# 🎨 Lucide Icons Migration Guide

## Installation
```bash
npm install lucide-svelte
```

## Usage in Svelte Components

### Import Icons
```typescript
import { 
  Home, User, Mail, Phone, Code, Palette, 
  ArrowRight, ArrowLeft, ExternalLink, Github,
  CheckCircle, AlertTriangle, Info, X
} from 'lucide-svelte';
```

### Use in Template
```svelte
<!-- Basic usage -->
<Home size="24" />

<!-- With color -->
<Mail size="20" color="#3b82f6" />

<!-- With custom classes -->
<Code size="32" class="text-blue-500" />

<!-- As dynamic component -->
<svelte:component this={iconComponent} size="24" />
```

## 📋 Complete Icon Mapping

### Font Awesome → Lucide Replacements

#### **Navigation & UI**
- `fa-home` → `Home`
- `fa-user` → `User`
- `fa-menu` → `Menu`
- `fa-bars` → `Menu`
- `fa-times` → `X`
- `fa-close` → `X`
- `fa-chevron-up` → `ChevronUp`
- `fa-chevron-down` → `ChevronDown`
- `fa-chevron-left` → `ChevronLeft`
- `fa-chevron-right` → `ChevronRight`
- `fa-arrow-up` → `ArrowUp`
- `fa-arrow-down` → `ArrowDown`
- `fa-arrow-left` → `ArrowLeft`
- `fa-arrow-right` → `ArrowRight`

#### **Communication**
- `fa-envelope` → `Mail`
- `fa-phone` → `Phone`
- `fa-message` → `MessageSquare`
- `fa-chat` → `MessageCircle`
- `fa-paper-plane` → `Send` or `PaperPlane`

#### **Location & Contact**
- `fa-map-marker` → `MapPin`
- `fa-map-marker-alt` → `MapPin`
- `fa-location` → `MapPin`
- `fa-globe` → `Globe`

#### **Technology & Development**
- `fa-code` → `Code`
- `fa-laptop` → `Laptop`
- `fa-desktop` → `Monitor`
- `fa-mobile` → `Smartphone`
- `fa-mobile-alt` → `Smartphone`
- `fa-tablet` → `Tablet`
- `fa-server` → `Server`
- `fa-database` → `Database`
- `fa-cloud` → `Cloud`

#### **Design & Creative**
- `fa-paint-brush` → `Palette` or `Paintbrush`
- `fa-palette` → `Palette`
- `fa-image` → `Image`
- `fa-camera` → `Camera`
- `fa-video` → `Video`
- `fa-music` → `Music`

#### **Business & Services**
- `fa-briefcase` → `Briefcase`
- `fa-building` → `Building`
- `fa-handshake` → `Handshake`
- `fa-chart-line` → `TrendingUp`
- `fa-chart-bar` → `BarChart`
- `fa-pie-chart` → `PieChart`

#### **Social Media**
- `fa-github` → `Github`
- `fa-linkedin` → `Linkedin`
- `fa-twitter` → `Twitter`
- `fa-facebook` → `Facebook`
- `fa-instagram` → `Instagram`
- `fa-youtube` → `Youtube`

#### **Actions & States**
- `fa-check` → `Check`
- `fa-check-circle` → `CheckCircle`
- `fa-times-circle` → `XCircle`
- `fa-exclamation-triangle` → `AlertTriangle`
- `fa-info-circle` → `Info`
- `fa-question-circle` → `HelpCircle`
- `fa-plus` → `Plus`
- `fa-minus` → `Minus`
- `fa-edit` → `Edit` or `Pencil`
- `fa-trash` → `Trash2`
- `fa-download` → `Download`
- `fa-upload` → `Upload`
- `fa-save` → `Save`
- `fa-copy` → `Copy`
- `fa-share` → `Share`
- `fa-external-link` → `ExternalLink`

#### **Media & Content**
- `fa-play` → `Play`
- `fa-pause` → `Pause`
- `fa-stop` → `Square`
- `fa-volume-up` → `Volume2`
- `fa-volume-down` → `Volume1`
- `fa-volume-mute` → `VolumeX`

#### **Files & Documents**
- `fa-file` → `File`
- `fa-file-text` → `FileText`
- `fa-folder` → `Folder`
- `fa-pdf` → `FileText`
- `fa-word` → `FileText`

#### **E-commerce & Shopping**
- `fa-shopping-cart` → `ShoppingCart`
- `fa-credit-card` → `CreditCard`
- `fa-money` → `DollarSign`
- `fa-tag` → `Tag`
- `fa-tags` → `Tags`

#### **Utilities & Tools**
- `fa-search` → `Search`
- `fa-filter` → `Filter`
- `fa-cog` → `Settings`
- `fa-gear` → `Settings`
- `fa-wrench` → `Wrench`
- `fa-tools` → `Wrench`
- `fa-lightbulb` → `Lightbulb`
- `fa-star` → `Star`
- `fa-heart` → `Heart`
- `fa-bookmark` → `Bookmark`

### **Emoji → Lucide Replacements**

#### **Common Emojis**
- 🔥 → `Flame`
- ⚡ → `Zap`
- 🚀 → `Rocket`
- ✨ → `Sparkles`
- 💎 → `Diamond`
- 🌟 → `Star`
- 🎯 → `Target`
- 💡 → `Lightbulb`
- 🎨 → `Palette`
- 💻 → `Laptop`
- 📱 → `Smartphone`
- 🔧 → `Wrench`
- ⚙️ → `Settings`
- 📊 → `BarChart`
- 📈 → `TrendingUp`

## 🔧 Advanced Usage Examples

### Dynamic Icon Component
```svelte
<script>
  import { Code, Palette, Smartphone } from 'lucide-svelte';
  
  const services = [
    { name: 'Development', icon: Code },
    { name: 'Design', icon: Palette },
    { name: 'Mobile', icon: Smartphone }
  ];
</script>

{#each services as service}
  <div class="service-item">
    <svelte:component this={service.icon} size="24" />
    <span>{service.name}</span>
  </div>
{/each}
```

### Conditional Icons
```svelte
<script>
  import { CheckCircle, AlertTriangle, Info } from 'lucide-svelte';
  
  export let status = 'info'; // 'success', 'warning', 'info'
  
  $: iconComponent = {
    success: CheckCircle,
    warning: AlertTriangle,
    info: Info
  }[status];
</script>

<div class="status-message">
  <svelte:component this={iconComponent} size="20" />
  <slot />
</div>
```

### Icon with Animation
```svelte
<style>
  .rotating-icon {
    animation: spin 2s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>

<Loader2 size="24" class="rotating-icon" />
```

## 🎨 Styling Tips

### CSS Classes
```css
.icon-primary { color: #3b82f6; }
.icon-success { color: #10b981; }
.icon-warning { color: #f59e0b; }
.icon-danger { color: #ef4444; }

.icon-small { width: 16px; height: 16px; }
.icon-medium { width: 24px; height: 24px; }
.icon-large { width: 32px; height: 32px; }
```

### Tailwind Classes
```svelte
<Mail size="20" class="text-blue-500 hover:text-blue-600" />
<Code size="24" class="text-green-500 drop-shadow-lg" />
<Smartphone size="32" class="text-purple-500 animate-pulse" />
```

## 📦 Recommended Icons for Common Sections

### **Navigation**
```typescript
import { Home, User, Mail, Briefcase, FileText } from 'lucide-svelte';
```

### **Contact Forms**
```typescript
import { Mail, Phone, MapPin, Send, User } from 'lucide-svelte';
```

### **Services/Skills**
```typescript
import { Code, Palette, Smartphone, Monitor, Database, Cloud } from 'lucide-svelte';
```

### **Social Media**
```typescript
import { Github, Linkedin, Twitter, ExternalLink } from 'lucide-svelte';
```

### **Project Actions**
```typescript
import { ExternalLink, Github, Eye, Download } from 'lucide-svelte';
```

This migration will give you consistent, scalable, and customizable icons throughout your website!