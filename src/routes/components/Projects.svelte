<script lang="ts">
    import {onMount} from 'svelte';
    import Cursor from "./Cursor.svelte";
    import { ExternalLink, Github, ArrowRight } from 'lucide-svelte';

    // Define a type for our project objects
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
    let loading = true;
    let carouselContainer: HTMLElement;

    onMount(async () => {
        await fetchProjects();
    });

    async function fetchProjects() {
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            if (data.success) {
                const liveProjects = data.data.filter((p: Project) => p.status === 'LIVE');
                // Duplicate projects for seamless infinite scroll (like skills scroll)
                projects = [...liveProjects, ...liveProjects];
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            loading = false;
        }
    }

    function getStatusDot(status: string) {
        switch (status) {
            case 'LIVE':
                return '🟢';
            case 'DEVELOPMENT':
                return '🟡';
            case 'ARCHIVED':
                return '🔴';
            default:
                return '⚪';
        }
    }

    function getTechName(name: string) {
        if (name === "Tailwind") return 'tailwindcss';
        if (name === "HTML") return 'html5';
        if (name === "Material Design") return 'materialui';
        return name.toLowerCase().replace(/\s+/g, '');
    }

    function formatDescription(description: string) {
        if (description.length > 70) {
            return description.slice(0, 70) + '...';
        }
        return description;
    }
</script>

<section class="pt-16 md:pt-32 relative overflow-hidden">
    <!-- Section Header -->
    <div class="text-center mb-16 md:mb-24 relative z-10">
        <div class="header-animation">
            <h2 data-aos="fade-up" class="text-4xl md:text-6xl text-interactive font-bold mb-4 tracking-tight">
                <span class="gradient-text">Featured</span>
                <span class="text-glitch" data-text="Projects">Projects</span>
            </h2>
            <div class="subtitle-container" data-aos="fade-in" data-aos-delay="200">
                <p class="text-lg interactive text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    A curated collection of my live digital creations, showcasing innovation,
                    problem-solving, and technical excellence in action.
                </p>
                <div class="decorative-line"></div>
            </div>
        </div>
    </div>

    {#if loading}
        <div class="text-center py-20">
            <div class="loading-spinner-custom mx-auto mb-4"></div>
            <p class="text-gray-400">Loading amazing projects...</p>
        </div>
    {:else if projects.length === 0}
        <div class="text-center py-20">
            <p class="text-gray-400">No live projects to display at the moment.</p>
        </div>
    {:else}
        <!-- Projects Carousel -->
        <div class="projects-scroll-container" bind:this={carouselContainer}>
            <div class="projects-scroll">
                {#each projects as project, index}
                    <div class="project-slide">
                        <div class="project-card-carousel" data-aos="fade-up" data-aos-delay={index * 50}>
                            <!-- Project Header -->
                            <div class="project-header">
                                <div class="status-indicator">
                                    <span class="status-dot">{getStatusDot(project.status)}</span>
                                    <span class="status-text">{project.status}</span>
                                </div>
                                <div class="year-badge">{project.year}</div>
                            </div>

                            <!-- Project Image -->
                            <div class="project-image-container">
                                <img src={project.image} alt={project.title} class="project-image" loading="lazy"/>
                                <div class="image-overlay">
                                    <div class="overlay-content">
                                        <span class="category-tag">{project.category}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Project Content -->
                            <div class="project-content">
                                <h3 class="project-title">{project.title}</h3>
                                <p class="project-description">{formatDescription(project.description)}</p>

                                <!-- Tech Stack -->
                                <div class="tech-stack">
                                    {#each project.tech.slice(0, 4) as tech}
                                            <span class="tech-tag">
                                                <i class={`devicon-${getTechName(tech)}-plain colored`}></i>
                                            </span>
                                    {/each}
                                    {#if project.tech.length > 4}
                                        <span class="tech-more">+{project.tech.length - 4}</span>
                                    {/if}
                                </div>

                                <!-- Action Buttons -->
                                <div class="action-buttons">
                                    <a href={project.projectUrl} target="_blank" rel="noopener noreferrer"
                                       class="btn-primary">
                                        <ExternalLink size="16" />
                                        <span>Live Demo</span>
                                    </a>
                                    {#if project.githubUrl !== '#'}
                                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                                           class="btn-secondary">
                                            <Github size="16" />
                                            <span>Code</span>
                                        </a>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- View All Projects Link -->
        <div class="text-center interactive mt-16 relative z-10">
            <a
                    href="/projects"
                    class="view-all-btn interactive"
                    data-aos="fade-up"
                    data-aos-delay="300"
            >
                <span>Explore All Projects</span>
                <ArrowRight size="16" />
            </a>
            <p class="text-gray-500 text-sm mt-4">
                Discover my complete portfolio of web, mobile, and desktop applications
            </p>
        </div>
    {/if}
</section>

<style>
    @keyframes float {
        0%, 100% {
            transform: translateY(0px) rotate(0deg);
        }
        25% {
            transform: translateY(-20px) rotate(90deg);
        }
        50% {
            transform: translateY(-10px) rotate(180deg);
        }
        75% {
            transform: translateY(-30px) rotate(270deg);
        }
    }

    /* Loading Spinner */
    .loading-spinner-custom {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-top: 3px solid rgba(74, 222, 128, 0.8);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    /* Projects Infinite Scroll Styles */
    .projects-scroll-container {
        overflow: hidden;
        white-space: nowrap;
        width: 100%;
        max-width: 100vw;
        position: relative;
    }

    .projects-scroll {
        display: inline-block;
        animation: projectsScroll 30s linear infinite;
    }

    .projects-scroll-container:hover .projects-scroll {
        animation-play-state: paused;
    }

    .project-slide {
        display: inline-block;
        margin-right: 2rem;
        white-space: normal;
        vertical-align: top;
        width: 380px;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .project-slide {
            width: 320px;
            margin-right: 1.5rem;
        }

        .projects-scroll {
            animation: projectsScroll 20s linear infinite;
        }
    }

    @media (max-width: 480px) {
        .project-slide {
            width: 280px;
            margin-right: 1rem;
        }

        .projects-scroll {
            animation: projectsScroll 15s linear infinite;
        }
    }

    @keyframes projectsScroll {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(-50%);
        }
    }

    .project-card-carousel {
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        overflow: hidden;
        width: 100%;
        max-width: 380px;
        position: relative;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .project-card-carousel:hover {
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        border-color: rgba(255, 255, 255, 0.2);
    }

    .project-header {
        position: absolute;
        top: 1rem;
        left: 1rem;
        right: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 20;
    }

    .status-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(10px);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.875rem;
        color: white;
    }

    .status-dot {
        font-size: 0.75rem;
    }

    .year-badge {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        padding: 0.5rem 0.75rem;
        border-radius: 15px;
        font-size: 0.875rem;
        color: white;
        font-weight: 600;
    }

    .project-image-container {
        position: relative;
        height: 180px;
        overflow: hidden;
    }

    .project-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s ease;
    }

    .project-card-carousel:hover .project-image {
        transform: scale(1.05);
    }

    .image-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
                135deg,
                rgba(0, 0, 0, 0.1),
                rgba(0, 0, 0, 0.7)
        );
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.4s ease;
    }

    .project-card-carousel:hover .image-overlay {
        opacity: 1;
    }

    .category-tag {
        background: rgba(255, 255, 255, 0.9);
        color: #000;
        padding: 0.5rem 1rem;
        border-radius: 25px;
        font-weight: 600;
        font-size: 0.875rem;
        transform: translateY(20px);
        transition: transform 0.3s ease 0.1s;
    }

    .project-card-carousel:hover .category-tag {
        transform: translateY(0);
    }

    .project-content {
        padding: 1.5rem;
        background: linear-gradient(
                180deg,
                rgba(255, 255, 255, 0.04),
                rgba(255, 255, 255, 0.02)
        );
    }

    .project-title {
        font-size: 1.25rem;
        font-weight: bold;
        color: white;
        margin-bottom: 0.75rem;
        line-height: 1.3;
    }

    .project-description {
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.875rem;
        line-height: 1.5;
        margin-bottom: 1rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .tech-stack {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
    }

    .tech-tag {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 25px;
        width: 25px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border-radius: 12px;
        font-size: 0.75rem;
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;
    }

    .tech-tag:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-2px);
    }

    .tech-more {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 16px;
        font-size: 0.875rem;
        font-weight: 600;
    }

    .action-buttons {
        display: flex;
        gap: 0.75rem;
    }

    .btn-primary,
    .btn-secondary {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.625rem 1rem;
        border-radius: 20px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.75rem;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
        overflow: hidden;
        flex: 1;
        justify-content: center;
    }

    .btn-primary {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        border: none;
        box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.4);
    }

    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px 0 rgba(59, 130, 246, 0.6);
    }

    .btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
    }

    .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px 0 rgba(255, 255, 255, 0.1);
    }


    /* View All Button */
    .view-all-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 2rem;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        text-decoration: none;
        border-radius: 30px;
        font-weight: 600;
        font-size: 1rem;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
        overflow: hidden;
    }

    .view-all-btn:hover {
        transform: translateY(-3px) scale(1.02);
    }

    .view-all-btn:hover i {
        transform: translateX(4px);
    }

    .view-all-btn i {
        transition: transform 0.3s ease;
    }

    /* Header Animations */
    .gradient-text {
        background: linear-gradient(45deg, #ffffff, #888);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: shimmer 3s infinite;
    }

    @keyframes shimmer {
        0% {
            background-position: -200% center;
        }
        100% {
            background-position: 200% center;
        }
    }

    .text-glitch {
        position: relative;
        animation: glitch 4s infinite;
    }

    .text-glitch::before,
    .text-glitch::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0;
    }

    @keyframes glitch {
        0%, 90%, 100% {
            opacity: 1;
        }
        91%, 99% {
            opacity: 0.8;
        }
    }

    .decorative-line {
        width: 200px;
        height: 1px;
        background: linear-gradient(90deg, transparent, white, transparent);
        margin: 20px auto;
        animation: expand 2s ease-out;
    }

    @keyframes expand {
        from {
            width: 0;
        }
        to {
            width: 200px;
        }
    }

    @keyframes slideInUp {
        to {
            opacity: 1;
            transform: translateY(0) rotateX(0deg);
        }
    }

    /* Status Indicator */
    .status-indicator {
        position: absolute;
        top: 15px;
        right: 15px;
        z-index: 20;
        display: flex;
        align-items: center;
        gap: 5px;
        background: rgba(0, 0, 0, 0.7);
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 12px;
        backdrop-filter: blur(10px);
    }

    .year-badge {
        position: absolute;
        top: 15px;
        left: 15px;
        z-index: 20;
        background: rgba(255, 255, 255, 0.1);
        padding: 5px 12px;
        border-radius: 15px;
        font-size: 12px;
        font-weight: bold;
        backdrop-filter: blur(10px);
    }

    /* Card Inner */
    .card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        transition: transform 0.6s;
        border-radius: 20px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .card-front,
    .card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        border-radius: 20px;
        overflow: hidden;
    }

    .card-back {
        transform: rotateY(180deg);
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(20px);
        padding: 30px;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    /* Image Container */
    .image-container {
        position: relative;
        height: 60%;
        overflow: hidden;
    }

    .project-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.8s ease;
    }

    .project-card:hover .project-image {
        transform: scale(1.1) rotate(2deg);
    }

    .image-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7));
        opacity: 0;
        transition: opacity 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .project-card:hover .image-overlay {
        opacity: 1;
    }

    .category-tag {
        background: rgba(255, 255, 255, 0.9);
        color: #000;
        padding: 8px 16px;
        border-radius: 25px;
        font-weight: bold;
        font-size: 14px;
        transform: translateY(20px);
        transition: transform 0.3s ease 0.1s;
    }

    .project-card:hover .category-tag {
        transform: translateY(0);
    }

    /* Content Section */
    .content-section {
        padding: 25px;
        height: 40%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        backdrop-filter: blur(10px);
    }

    .project-title {
        font-size: 1.5rem;
        font-weight: bold;
        color: white;
        margin-bottom: 10px;
        line-height: 1.2;
    }

    .project-description {
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.9rem;
        line-height: 1.5;
        margin-bottom: 15px;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    /* Tech Stack */
    .tech-stack {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: auto;
    }

    .tech-tag {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .tech-more {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
    }

    /* Card Back Content */
    .back-title {
        font-size: 1.3rem;
        font-weight: bold;
        color: white;
        margin-bottom: 20px;
        text-align: center;
    }

    .features-list {
        list-style: none;
        padding: 0;
        margin-bottom: 25px;
    }

    .feature-item {
        display: flex;
        align-items: center;
        gap: 10px;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 12px;
        font-size: 14px;
    }

    .feature-icon {
        color: #4ade80;
        font-weight: bold;
    }

    .tech-title {
        font-size: 1rem;
        font-weight: bold;
        color: white;
        margin-bottom: 15px;
        text-align: center;
    }

    .tech-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 8px;
    }

    .tech-pill {
        background: rgba(255, 255, 255, 0.15);
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 11px;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    /* Action Buttons */
    .action-buttons {
        position: absolute;
        bottom: 20px;
        left: 20px;
        right: 20px;
        display: flex;
        gap: 10px;
        z-index: 10;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
    }

    .project-card:hover .action-buttons {
        opacity: 1;
        transform: translateY(0);
    }

    .action-btn {
        position: relative;
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px;
        border-radius: 25px;
        text-decoration: none;
        font-weight: bold;
        font-size: 14px;
        transition: all 0.3s ease;
        overflow: hidden;
        backdrop-filter: blur(10px);
    }

    .github-btn {
        background: rgba(0, 0, 0, 0.8);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .demo-btn {
        background: rgba(59, 130, 246, 0.8);
        color: white;
        border: 1px solid rgba(59, 130, 246, 0.4);
    }

    .action-btn:hover {
        transform: translateY(-2px);
    }

    .btn-glow {
        position: absolute;
        inset: 0;
        background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transform: translateX(-100%);
        transition: transform 0.6s;
    }

    .action-btn:hover .btn-glow {
        transform: translateX(100%);
    }

    /* Card Effects */
    .card-glow {
        position: absolute;
        inset: -2px;
        background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
        border-radius: 22px;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: -1;
    }

    .project-card:hover .card-glow {
        opacity: 1;
    }

    /* Particle System */
    .particle-system {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
        border-radius: 20px;
    }

    .particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        opacity: 0;
        animation: particleFloat 3s infinite ease-in-out;
        animation-delay: calc(var(--i) * 0.5s);
    }

    .project-card:hover .particle {
        opacity: 1;
    }

    @keyframes particleFloat {
        0% {
            transform: translateY(100%) translateX(0);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-20px) translateX(50px);
            opacity: 0;
        }
    }

    /* Loading Section */
    .loading-section {
        padding: 40px;
        text-align: center;
    }

    .typewriter {
        overflow: hidden;
        border-right: 2px solid rgba(255, 255, 255, 0.75);
        white-space: nowrap;
        animation: typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite;
    }

    @keyframes typing {
        from {
            width: 0;
        }
        to {
            width: 100%;
        }
    }

    @keyframes blink-caret {
        from, to {
            border-color: transparent;
        }
        50% {
            border-color: rgba(255, 255, 255, 0.75);
        }
    }

    .loading-animation {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin: 20px 0;
    }

    .pulse-circle {
        width: 12px;
        height: 12px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.5);
            opacity: 0.5;
        }
    }

    .coming-soon {
        color: rgba(255, 255, 255, 0.6);
        font-style: italic;
        margin-top: 10px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .project-card {
            height: 450px;
        }

        .content-section {
            padding: 20px;
        }

        .project-title {
            font-size: 1.3rem;
        }

        .action-buttons {
            position: static;
            opacity: 1;
            transform: none;
            margin-top: 15px;
        }
    }
</style>