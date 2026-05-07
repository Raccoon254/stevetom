<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly, slide, scale } from 'svelte/transition';
    import { cubicInOut } from 'svelte/easing';
    import Cursor from "../components/Cursor.svelte";
    import { Search, X, RotateCcw, ExternalLink, Github, Check, Eye, Coffee, Zap, Heart, Sparkles, Rocket } from 'lucide-svelte';

    type Project = {
        id: string
        title: string
        description: string
        image: string
        projectUrl: string
        githubUrl: string
        tech: string[]
        year: string
        category: string
        features: string[]
        status: 'LIVE' | 'DEVELOPMENT' | 'ARCHIVED'
    }

    let projects: Project[] = [];
    let filteredProjects: Project[] = [];
    let loading = true;
    let searchQuery = '';
    let selectedCategory = 'all';
    let selectedStatus = 'all';
    let sortBy = 'newest';
    let scrollY = 0;
    let konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    let konamiProgress = 0;
    let easterEggActive = false;
    let mousePosition = { x: 0, y: 0 };
    let isScrollingDown = false;
    let lastScrollY = 0;

    // Filter and sort options
    let categories: string[] = [];
    let statuses = ['LIVE', 'DEVELOPMENT', 'ARCHIVED'];

    onMount(async () => {
        await fetchProjects();
        extractCategories();
        applyFilters();
        
        // Handle keyboard events for easter egg
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('mousemove', handleMouseMove);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    });

    function handleMouseMove(event) {
        mousePosition = { x: event.clientX, y: event.clientY };
    }

    function handleKeyDown(event) {
        if (event.code === konami[konamiProgress]) {
            konamiProgress++;
            if (konamiProgress === konami.length) {
                activateEasterEgg();
                konamiProgress = 0;
            }
        } else {
            konamiProgress = 0;
        }
    }

    function activateEasterEgg() {
        easterEggActive = true;
        setTimeout(() => {
            easterEggActive = false;
        }, 10000);
    }

    $: {
        if (scrollY > lastScrollY && scrollY > 100) {
            isScrollingDown = true;
        } else if (scrollY < lastScrollY) {
            isScrollingDown = false;
        }
        lastScrollY = scrollY;
    }

    async function fetchProjects() {
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            if (data.success) {
                projects = data.data;
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            loading = false;
        }
    }

    function extractCategories() {
        const uniqueCategories = [...new Set(projects.map(p => p.category))];
        categories = uniqueCategories.sort();
    }

    function applyFilters() {
        let filtered = [...projects];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(project => 
                project.title.toLowerCase().includes(query) ||
                project.description.toLowerCase().includes(query) ||
                project.tech.some(tech => tech.toLowerCase().includes(query)) ||
                project.category.toLowerCase().includes(query)
            );
        }

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(project => project.category === selectedCategory);
        }

        if (selectedStatus !== 'all') {
            filtered = filtered.filter(project => project.status === selectedStatus);
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return parseInt(b.year) - parseInt(a.year);
                case 'oldest':
                    return parseInt(a.year) - parseInt(b.year);
                case 'name':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        filteredProjects = filtered;
    }

    function clearFilters() {
        searchQuery = '';
        selectedCategory = 'all';
        selectedStatus = 'all';
        sortBy = 'newest';
        applyFilters();
    }

    function getStatusDot(status: string) {
        switch (status) {
            case 'LIVE': return '🟢';
            case 'DEVELOPMENT': return '🟡';
            case 'ARCHIVED': return '🔴';
            default: return '⚪';
        }
    }

    function getStatusColor(status: string) {
        switch (status) {
            case 'LIVE': return 'text-green-400';
            case 'DEVELOPMENT': return 'text-yellow-400';
            case 'ARCHIVED': return 'text-red-400';
            default: return 'text-gray-400';
        }
    }

    function getTechName(name: string) {
        if (name === "Tailwind") return 'tailwindcss';
        if (name === "HTML") return 'html5';
        if (name === "Material Design") return 'materialui';
        return name.toLowerCase().replace(/\s+/g, '');
    }

    function getRandomEmoji() {
        const emojis = ['✨', '🚀', '⚡', '💎', '🔥', '🌟', '💫', '🎯', '🎨', '🌈'];
        return emojis[Math.floor(Math.random() * emojis.length)];
    }

</script>

<svelte:head>
    <title>Projects | Creative Portfolio</title>
    <meta name="description" content="Explore my complete portfolio of innovative projects with creative layouts and hidden surprises." />
</svelte:head>

<svelte:window bind:scrollY />

<Cursor />

<!-- Floating background elements -->
<div class="bg-elements" class:active={easterEggActive}>
    {#each Array(15) as _, i}
        <div 
            class="floating-emoji" 
            style="
                left: {Math.random() * 100}%; 
                top: {Math.random() * 100}%;
                animation-delay: {Math.random() * 5}s;
                animation-duration: {5 + Math.random() * 10}s;
            "
        >
            {getRandomEmoji()}
        </div>
    {/each}
</div>

<!-- Hero Section with Parallax -->
<section class="hero-section" style="transform: translateY({scrollY * 0.5}px)">
    <div class="hero-content">
        <div class="hero-text" in:fly={{ y: 30, duration: 1000, easing: cubicInOut }}>
            <h1 class="hero-title">
                <span class="gradient-text">Creative</span>
                <span class="highlight-text">Projects</span>
                {#if easterEggActive}
                    <span class="easter-egg-sparkle" in:scale>✨🎉✨</span>
                {/if}
            </h1>
            <p class="hero-subtitle">
                Where innovation meets imagination - each project tells a unique story of problem-solving and creativity
                {#if easterEggActive}
                    <span class="secret-message"> • You found the secret! 🎊</span>
                {/if}
            </p>
            <div class="stats-row">
                <div class="stat-item">
                    <RotateCcw size="20" class="rotate-icon" />
                    <span class="stat-number">{projects.length}</span>
                    <span class="stat-label">Projects</span>
                </div>
                <div class="stat-item">
                    <Coffee size="20" class="coffee-icon" />
                    <span class="stat-number">∞</span>
                    <span class="stat-label">Coffee</span>
                </div>
                <div class="stat-item">
                    <Heart size="20" class="heart-icon" />
                    <span class="stat-number">{projects.filter(p => p.status === 'LIVE').length}</span>
                    <span class="stat-label">Live Apps</span>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Projects Section with Alternating Layout -->
<section class="projects-section">
    {#if loading}
        <div class="loading-container" in:fade>
            <div class="loading-spinner rainbow-spinner"></div>
            <p class="loading-text">Brewing something awesome... <Coffee size="16" /></p>
        </div>
    {:else if filteredProjects.length === 0}
        <div class="no-results" in:fade>
            <div class="no-results-icon">
                <Search size="64" />
            </div>
            <h3 class="no-results-title">No projects found 😅</h3>
            <p class="no-results-text">
                The magic formula didn't work this time. Try different ingredients!
            </p>
            <button class="clear-filters-btn rainbow-btn" on:click={clearFilters}>
                <Sparkles size="16" />
                <span>Cast New Spell</span>
            </button>
        </div>
    {:else}
        <div class="projects-container">
            {#each filteredProjects as project, index (project.id)}
                <!-- Alternating Layout -->
                <article 
                    class="project-showcase"
                    class:reverse={index % 2 === 1}
                    in:fly={{ 
                        y: 100, 
                        duration: 800, 
                        delay: index * 200,
                        easing: cubicInOut
                    }}
                >
                    <!-- Project Image Side -->
                    <div class="project-image-side">
                        <div class="image-container">
                            <!-- Status and Year Badges -->
                            <div class="project-badges">
                                <div class="status-badge">
                                    <span class="status-dot">{getStatusDot(project.status)}</span>
                                    <span class="status-text {getStatusColor(project.status)}">{project.status}</span>
                                </div>
                                <div class="year-badge">{project.year}</div>
                            </div>
                            
                            <!-- Project Image -->
                            <img 
                                src={project.image} 
                                alt={project.title} 
                                class="project-image" 
                                loading="lazy" 
                            />
                            
                            <!-- Hover Overlay -->
                            <div class="image-overlay">
                                <div class="overlay-actions">
                                    <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" class="overlay-btn primary">
                                        <Eye size="24" />
                                        <span>View Live</span>
                                    </a>
                                    {#if project.githubUrl !== '#'}
                                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" class="overlay-btn secondary">
                                            <Github size="24" />
                                            <span>Source</span>
                                        </a>
                                    {/if}
                                </div>
                                <div class="category-tag">{project.category}</div>
                            </div>
                        </div>
                        <!-- Easter Egg - Project Number -->
                        <div class="hidden md:block project-number" class:rainbow={easterEggActive}>
                            {String(index + 1).padStart(2, '0')}
                        </div>
                    </div>

                    <!-- Project Content Side -->
                    <div class="project-content-side">
                        <div class="content-container">
                            <!-- Project Title with Fun Animation -->
                            <h2 class="project-title">
                                {project.title}
                                <span class="title-decoration">
                                    {#if project.status === 'LIVE'}
                                        <Rocket size="20" />
                                    {:else if project.status === 'DEVELOPMENT'}
                                        <Zap size="20" />
                                    {:else}
                                        <Sparkles size="20" />
                                    {/if}
                                </span>
                            </h2>
                            
                            <!-- Project Description -->
                            <p class="project-description">{project.description}</p>
                            
                            <!-- Key Features -->
                            {#if project.features && project.features.length > 0}
                                <div class="features-section">
                                    <h3 class="section-title">
                                        <Sparkles size="16" />
                                        Key Features
                                    </h3>
                                    <ul class="features-list">
                                        {#each project.features.slice(0, 4) as feature, idx}
                                            <li 
                                                class="feature-item"
                                                in:slide={{ delay: idx * 100, duration: 500 }}
                                            >
                                                <Check size="16" class="feature-icon" />
                                                <span>{feature}</span>
                                            </li>
                                        {/each}
                                    </ul>
                                </div>
                            {/if}
                            
                            <!-- Tech Stack -->
                            <div class="tech-section">
                                <h3 class="section-title">
                                    <Coffee size="16" />
                                    Tech Stack
                                </h3>
                                <div class="tech-grid">
                                    {#each project.tech as tech, idx}
                                        <div 
                                            class="tech-item"
                                            in:scale={{ delay: idx * 50, duration: 300 }}
                                        >
                                            <i class={`devicon-${getTechName(tech)}-plain colored`}></i>
                                            <span class="hidden md:block">{tech}</span>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                            
                            <!-- Action Buttons -->
                            <div class="action-section">
                                <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" class="action-btn primary">
                                    <ExternalLink size="18" />
                                    <span>Launch Project</span>
                                </a>
                                {#if project.githubUrl !== '#'}
                                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" class="action-btn secondary">
                                        <Github size="18" />
                                        <span>View Code</span>
                                    </a>
                                {/if}
                            </div>
                        </div>
                    </div>
                </article>
            {/each}
        </div>
        
        <!-- Fun Footer Message -->
        <div class="projects-footer" in:fade={{ delay: 1000 }}>
            <p>
                Made with <Heart size="16" class="heart-pulse" /> and lots of <Coffee size="16" />
                {#if easterEggActive}
                    <span class="secret-footer"> • You're awesome! 🎉</span>
                {/if}
            </p>
            <p class="konami-hint">
                <em>Psst... try the Konami Code for a surprise! ↑↑↓↓←→←→BA</em>
            </p>
        </div>
    {/if}
</section>

<style>
    :global(html) {
        scroll-behavior: smooth;
    }

    /* Background Elements */
    .bg-elements {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: -1;
        opacity: 0.1;
        transition: opacity 0.5s ease;
    }

    .bg-elements.active {
        opacity: 0.8;
    }

    .floating-emoji {
        position: absolute;
        font-size: 1.5rem;
        animation: float-around 10s infinite linear;
    }

    @keyframes float-around {
        0% { transform: translateY(100vh) rotate(0deg); }
        100% { transform: translateY(-100px) rotate(360deg); }
    }

    /* Hero Section */
    .hero-section {
        position: relative;
        min-height: 70vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(
            135deg,
            rgba(59, 130, 246, 0.1) 0%,
            rgba(147, 51, 234, 0.1) 25%,
            rgba(236, 72, 153, 0.1) 50%,
            rgba(245, 158, 11, 0.1) 75%,
            rgba(16, 185, 129, 0.1) 100%
        );
        overflow: hidden;
        margin-top: 2rem;
    }

    .hero-content {
        text-align: center;
        position: relative;
        z-index: 10;
        max-width: 900px;
        margin: 0 auto;
        padding: 2rem;
    }

    .hero-title {
        font-size: clamp(3rem, 10vw, 6rem);
        font-weight: 900;
        margin-bottom: 2rem;
        line-height: 1.1;
    }

    .gradient-text {
        background: linear-gradient(135deg, #ffffff, #e5e7eb);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .highlight-text {
        background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: rainbow-shimmer 3s ease-in-out infinite;
    }

    .easter-egg-sparkle {
        display: inline-block;
        animation: bounce 1s ease-in-out infinite;
        margin-left: 1rem;
    }

    @keyframes rainbow-shimmer {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
    }

    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
    }

    .hero-subtitle {
        font-size: 1.35rem;
        color: rgba(255, 255, 255, 0.85);
        line-height: 1.6;
        max-width: 700px;
        margin: 0 auto 3rem;
    }

    .secret-message {
        color: #f59e0b;
        font-weight: 700;
        animation: pulse-glow 2s ease-in-out infinite;
    }

    @keyframes pulse-glow {
        0%, 100% { text-shadow: 0 0 5px rgba(245, 158, 11, 0.5); }
        50% { text-shadow: 0 0 20px rgba(245, 158, 11, 0.8); }
    }

    .stats-row {
        display: flex;
        justify-content: center;
        gap: 4rem;
        margin-top: 2rem;
    }

    .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
    }

    .stat-number {
        font-size: 2.5rem;
        font-weight: 800;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .stat-label {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.7);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-weight: 600;
    }

    .coffee-icon, .heart-icon {
        color: #f59e0b;
        animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }

    .clear-filters-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: rgba(147, 51, 234, 0.2);
        border: 1px solid rgba(147, 51, 234, 0.4);
        border-radius: 12px;
        color: white;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .clear-filters-btn:hover {
        background: rgba(147, 51, 234, 0.3);
        transform: translateY(-2px);
    }

    .rainbow-btn {
        background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b) !important;
        border: none !important;
        animation: rainbow-border 3s linear infinite;
    }

    @keyframes rainbow-border {
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
    }

    .results-info {
        text-align: center;
    }

    .results-text {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.95rem;
    }

    .sparkle {
        animation: sparkle-spin 2s ease-in-out infinite;
    }

    @keyframes sparkle-spin {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(180deg); }
    }

    /* Loading */
    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        padding: 6rem 2rem;
    }

    .loading-spinner {
        width: 60px;
        height: 60px;
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-top: 4px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .rainbow-spinner {
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-top: 4px solid #3b82f6;
        border-right: 4px solid #8b5cf6;
        border-bottom: 4px solid #ec4899;
        border-left: 4px solid #f59e0b;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .loading-text {
        color: rgba(255, 255, 255, 0.7);
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    /* No Results */
    .no-results {
        text-align: center;
        padding: 6rem 2rem;
    }

    .no-results-icon {
        color: rgba(255, 255, 255, 0.4);
        margin-bottom: 2rem;
    }

    .no-results-title {
        font-size: 2rem;
        color: white;
        margin-bottom: 1rem;
        font-weight: 700;
    }

    .no-results-text {
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 3rem;
        font-size: 1.1rem;
    }

    /* Projects Section */
    .projects-section {
        padding: 4rem 2rem;
        min-height: 50vh;
    }

    .projects-container {
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 8rem;
    }

    /* Project Showcase */
    .project-showcase {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4rem;
        align-items: start;
        position: relative;
        padding: 2rem;
        transition: all 0.5s ease;
        border-radius: 32px;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .project-showcase:hover {
        transform: translateY(-10px);
    }

    .project-showcase.reverse {
        direction: rtl;
    }

    .project-showcase.reverse .project-content-side {
        direction: ltr;
    }

    /* Image Side */
    .project-image-side {
        position: relative;
        height: 100%;
    }

    .image-container {
        position: relative;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
        transition: all 0.5s ease;
    }

    .image-container:hover {
        transform: scale(1.02);
        box-shadow: 0 35px 70px -12px rgba(0, 0, 0, 0.4);
    }

    .project-badges {
        position: absolute;
        top: 1rem;
        left: 1rem;
        right: 1rem;
        display: flex;
        justify-content: space-between;
        z-index: 20;
    }

    .status-badge {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 700;
    }

    .year-badge {
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        padding: 0.5rem 0.75rem;
        border-radius: 15px;
        font-size: 0.8rem;
        color: white;
        font-weight: 700;
    }

    .project-image {
        width: 100%;
        height: 350px;
        object-fit: cover;
        transition: transform 0.6s ease;
    }

    .image-container:hover .project-image {
        transform: scale(1.1);
    }

    .image-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7));
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        opacity: 0;
        transition: opacity 0.4s ease;
    }

    .image-container:hover .image-overlay {
        opacity: 1;
    }

    .overlay-actions {
        display: flex;
        gap: 1rem;
    }

    .overlay-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border-radius: 25px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.3s ease;
    }

    .overlay-btn.primary {
        background: rgba(59, 130, 246, 0.9);
        color: white;
    }

    .overlay-btn.secondary {
        background: rgba(0, 0, 0, 0.9);
        color: white;
    }

    .overlay-btn:hover {
        transform: scale(1.05);
    }

    .category-tag {
        background: rgba(255, 255, 255, 0.95);
        color: #000;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-weight: 700;
        font-size: 0.85rem;
    }

    .project-number {
        position: absolute;
        bottom: 20%;
        right: 50%;
        transform: translateX(50%);
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 8rem;
        font-weight: 900;
        color: black;
        text-shadow: -1px -1px 0 rgba(255, 255, 255, 0.1), 1px -1px 0 rgba(255, 255, 255, 0.1), -1px 1px 0 rgba(255, 255, 255, 0.1), 1px 1px 0 rgba(255, 255, 255, 0.1);
    }

    .project-number.rainbow {
        background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b);
        animation: rainbow-spin 2s linear infinite;
    }

    @keyframes rainbow-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Content Side */
    .project-content-side {
        padding: 2rem;
    }

    .content-container {
        max-width: 500px;
    }

    .project-title {
        font-size: 2.5rem;
        font-weight: 900;
        color: white;
        margin-bottom: 1.5rem;
        line-height: 1.2;
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .title-decoration {
        color: #3b82f6;
        animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }

    .project-description {
        color: rgba(255, 255, 255, 0.8);
        font-size: 1.1rem;
        line-height: 1.7;
        margin-bottom: 2rem;
    }

    .features-section, .tech-section {
        margin-bottom: 2rem;
    }

    .section-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1rem;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .features-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 0.75rem;
    }

    .feature-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.95rem;
    }

    .feature-icon {
        color: #10b981;
        flex-shrink: 0;
    }

    .tech-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
    }

    .tech-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.9);
        padding: 0.75rem 1rem;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 600;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
    }

    .tech-item:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
    }

    .tech-item i {
        font-size: 1.2rem;
    }

    .action-section {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
    }

    .action-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 2rem;
        border-radius: 25px;
        text-decoration: none;
        font-weight: 700;
        font-size: 0.95rem;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        flex: 1;
        justify-content: center;
    }

    .action-btn.primary {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
    }

    .action-btn.primary:hover {
        transform: translateY(-3px);
    }

    .action-btn.secondary {
        background: rgba(255, 255, 255, 0.08);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.2);
    }

    .action-btn.secondary:hover {
        background: rgba(255, 255, 255, 0.12);
        transform: translateY(-3px);
    }

    /* Projects Footer */
    .projects-footer {
        text-align: center;
        padding: 4rem 2rem;
        margin-top: 4rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .projects-footer p {
        color: rgba(255, 255, 255, 0.7);
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .heart-pulse {
        color: #ec4899;
        animation: pulse 1.5s ease-in-out infinite;
    }

    .secret-footer {
        color: #f59e0b;
        font-weight: 700;
        animation: pulse-glow 2s ease-in-out infinite;
    }

    .konami-hint {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.85rem;
        margin-top: 1rem;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
        .projects-container {
            gap: 6rem;
        }

        .project-showcase {
            gap: 3rem;
            padding: 1.5rem;
        }

        .project-title {
            font-size: 2.2rem;
        }

        .project-number {
            font-size: 6rem;
        }
    }

    @media (max-width: 768px) {
        /* Stack projects vertically on tablets and mobile */
        .project-showcase {
            grid-template-columns: 1fr;
            gap: 2rem;
            padding: 1.5rem;
            align-items: center;
        }

        .project-showcase.reverse {
            direction: ltr;
        }

        .project-content-side {
            padding: 1rem 0;
        }

        .content-container {
            max-width: none;
        }

        .project-title {
            font-size: 2rem;
            text-align: center;
        }

        .hero-title {
            font-size: clamp(2.5rem, 8vw, 4rem);
        }

        .hero-subtitle {
            font-size: 1.1rem;
        }

        .stats-row {
            gap: 2rem;
            flex-wrap: wrap;
        }

        .projects-container {
            gap: 4rem;
        }

        .project-number {
            font-size: 4rem;
            position: relative;
            bottom: auto;
            right: auto;
            transform: none;
            margin: 1rem auto 0;
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .image-container {
            max-height: 300px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .project-image {
            height: 300px;
        }

        .action-section {
            flex-direction: column;
        }

        .tech-grid {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        }
    }

    @media (max-width: 640px) {
        .hero-content {
            padding: 1rem;
        }

        .hero-title {
            font-size: clamp(2rem, 8vw, 3.5rem);
            margin-bottom: 1.5rem;
        }

        .hero-subtitle {
            font-size: 1rem;
            margin-bottom: 2rem;
        }

        .stats-row {
            flex-direction: column;
            gap: 1.5rem;
            align-items: center;
        }

        .stat-item {
            flex-direction: row;
            gap: 1rem;
            align-items: center;
        }

        .stat-number {
            font-size: 2rem;
        }

        .projects-section {
            padding: 2rem 1rem;
        }

        .projects-container {
            gap: 3rem;
        }

        .project-showcase {
            margin: 0;
            padding: 1rem;
            border-radius: 24px;
        }

        .project-title {
            font-size: 1.75rem;
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
        }

        .project-description {
            font-size: 1rem;
            text-align: center;
        }

        .section-title {
            font-size: 0.9rem;
            justify-content: center;
        }

        .features-section, .tech-section {
            text-align: center;
        }

        .feature-item {
            justify-content: start;
            text-align: left;
        }

        .tech-grid {
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
        }

        .tech-item {
            font-size: 0.8rem;
            padding: 0.75rem;
            display: flex;
            justify-content: center;
            text-align: center;
        }

        .action-btn {
            padding: 0.875rem 1.5rem;
            font-size: 0.9rem;
        }

        .project-number {
            display: none;
            font-size: 3rem;
            width: 60px;
            height: 60px;
        }

        .project-badges {
            position: static;
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 1rem;
            margin: 2px;
        }

        .status-badge {
            position: static;
        }

        .year-badge {
            position: static;
        }

        .image-overlay {
            position: static;
            opacity: 1;
            background: none;
            margin-top: 1rem;
        }

        .overlay-actions {
            justify-content: center;
        }

        .category-tag {
            margin-top: 1rem;
        }

        .projects-footer {
            padding: 3rem 1rem;
        }

        .projects-footer p {
            font-size: 1rem;
            flex-direction: column;
            gap: 0.75rem;
        }

        .konami-hint {
            font-size: 0.8rem;
        }

        .loading-container {
            padding: 4rem 1rem;
        }

        .no-results {
            padding: 4rem 1rem;
        }

        .no-results-title {
            font-size: 1.5rem;
        }
    }

    @media (max-width: 480px) {
        .hero-title {
            font-size: clamp(1.75rem, 8vw, 3rem);
        }

        .project-title {
            font-size: 1.5rem;
        }

        .project-number {
            font-size: 2.5rem;
            width: 50px;
            height: 50px;
        }

        .tech-grid {
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        }

        .stats-row {
            gap: 1rem;
        }

        .stat-number {
            font-size: 1.75rem;
        }

        .project-showcase {
            padding: 0.75rem;
        }

        .projects-container {
            gap: 2rem;
        }
    }
</style>