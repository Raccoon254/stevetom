<script lang="ts">
    // Import commonly used Lucide icons
    import {
        // Navigation & UI
        Home, User, Menu, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
        ArrowLeft, ArrowRight, ArrowUp, ArrowDown, MoreHorizontal,
        
        // Communication
        Mail, Phone, MessageSquare, MessageCircle, Send, PaperPlane,
        
        // Location & Contact
        MapPin, Globe,
        
        // Technology & Development
        Code, Laptop, Monitor, Smartphone, Tablet, Server, Database, Cloud,
        
        // Design & Creative
        Palette, Paintbrush, Image, Camera, Video, Music,
        
        // Business & Services
        Briefcase, Building, Handshake, TrendingUp, BarChart, PieChart,
        
        // Social Media
        Github, Linkedin, Twitter, Facebook, Instagram, Youtube,
        
        // Actions & States
        Check, CheckCircle, XCircle, AlertTriangle, Info, HelpCircle,
        Plus, Minus, Edit, Pencil, Trash2, Download, Upload, Save, Copy, Share, ExternalLink,
        
        // Media & Content
        Play, Pause, Square, Volume2, Volume1, VolumeX,
        
        // Files & Documents
        File, FileText, Folder,
        
        // E-commerce & Shopping
        ShoppingCart, CreditCard, DollarSign, Tag, Tags,
        
        // Utilities & Tools
        Search, Filter, Settings, Wrench, Lightbulb, Star, Heart, Bookmark,
        
        // Special Icons
        Flame, Zap, Rocket, Sparkles, Diamond, Target, Loader2, Eye
    } from 'lucide-svelte';

    // Props
    export let name: string;
    export let size: number | string = 24;
    export let color: string = 'currentColor';
    export let strokeWidth: number = 2;
    export let className: string = '';

    // Icon mapping object
    const iconMap = {
        // Navigation & UI
        home: Home,
        user: User,
        menu: Menu,
        close: X,
        'chevron-left': ChevronLeft,
        'chevron-right': ChevronRight,
        'chevron-up': ChevronUp,
        'chevron-down': ChevronDown,
        'arrow-left': ArrowLeft,
        'arrow-right': ArrowRight,
        'arrow-up': ArrowUp,
        'arrow-down': ArrowDown,
        'more-horizontal': MoreHorizontal,
        
        // Communication
        mail: Mail,
        phone: Phone,
        message: MessageSquare,
        chat: MessageCircle,
        send: Send,
        'paper-plane': PaperPlane,
        
        // Location & Contact
        'map-pin': MapPin,
        location: MapPin,
        globe: Globe,
        
        // Technology & Development
        code: Code,
        laptop: Laptop,
        desktop: Monitor,
        monitor: Monitor,
        mobile: Smartphone,
        smartphone: Smartphone,
        tablet: Tablet,
        server: Server,
        database: Database,
        cloud: Cloud,
        
        // Design & Creative
        palette: Palette,
        paintbrush: Paintbrush,
        image: Image,
        camera: Camera,
        video: Video,
        music: Music,
        
        // Business & Services
        briefcase: Briefcase,
        building: Building,
        handshake: Handshake,
        'trending-up': TrendingUp,
        'bar-chart': BarChart,
        'pie-chart': PieChart,
        
        // Social Media
        github: Github,
        linkedin: Linkedin,
        twitter: Twitter,
        facebook: Facebook,
        instagram: Instagram,
        youtube: Youtube,
        
        // Actions & States
        check: Check,
        'check-circle': CheckCircle,
        success: CheckCircle,
        'x-circle': XCircle,
        error: XCircle,
        'alert-triangle': AlertTriangle,
        warning: AlertTriangle,
        info: Info,
        help: HelpCircle,
        plus: Plus,
        add: Plus,
        minus: Minus,
        edit: Edit,
        pencil: Pencil,
        trash: Trash2,
        delete: Trash2,
        download: Download,
        upload: Upload,
        save: Save,
        copy: Copy,
        share: Share,
        'external-link': ExternalLink,
        external: ExternalLink,
        
        // Media & Content
        play: Play,
        pause: Pause,
        stop: Square,
        'volume-up': Volume2,
        'volume-down': Volume1,
        'volume-mute': VolumeX,
        
        // Files & Documents
        file: File,
        document: FileText,
        'file-text': FileText,
        folder: Folder,
        
        // E-commerce & Shopping
        cart: ShoppingCart,
        'shopping-cart': ShoppingCart,
        'credit-card': CreditCard,
        payment: CreditCard,
        money: DollarSign,
        dollar: DollarSign,
        tag: Tag,
        tags: Tags,
        
        // Utilities & Tools
        search: Search,
        filter: Filter,
        settings: Settings,
        gear: Settings,
        wrench: Wrench,
        tools: Wrench,
        lightbulb: Lightbulb,
        idea: Lightbulb,
        star: Star,
        favorite: Star,
        heart: Heart,
        love: Heart,
        bookmark: Bookmark,
        
        // Special Icons
        fire: Flame,
        flame: Flame,
        zap: Zap,
        lightning: Zap,
        rocket: Rocket,
        sparkles: Sparkles,
        magic: Sparkles,
        diamond: Diamond,
        gem: Diamond,
        target: Target,
        bullseye: Target,
        loading: Loader2,
        spinner: Loader2,
        eye: Eye,
        view: Eye
    };

    // Get the icon component
    $: iconComponent = iconMap[name.toLowerCase()];

    // Fallback to a default icon if not found
    $: finalIcon = iconComponent || HelpCircle;
</script>

<!-- Render the icon -->
<svelte:component 
    this={finalIcon} 
    {size} 
    {color}
    strokeWidth={strokeWidth}
    class={className}
    {...$$restProps}
/>