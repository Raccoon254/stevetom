<script lang="ts">
    import { onMount } from 'svelte';

    // Define a type for our project objects
    type Project = {
        title: string
        description: string
        image: string
        projectUrl: string
        githubUrl: string
        tech: string[]
        year: string
        category: string
        features: string[]
        status: 'live' | 'development' | 'archived'
    }

    const projects: Project[] = [
        {
            title: "Skillkenya",
            description: "Join thousands of Kenyans learning in-demand tech skills from industry experts. Start your journey to a brighter future today.",
            image: 'skillkenya.png',
            projectUrl: 'https://www.skillkenya.com/',
            githubUrl: '#',
            tech: ['React', 'Node.js', 'MongoDB', 'Express'],
            year: '2024',
            category: 'Education Platform',
            features: ['Video Streaming', 'Payment Integration', 'User Analytics', 'Course Management'],
            status: 'live'
        },
        {
            title: 'Status Saver',
            description: 'An android kotlin application that allows users to save statuses from WhatsApp. It also allows users to share statuses with friends and manage saved statuses.',
            image: 'status-saver.png',
            projectUrl: 'https://status-saver.vercel.app',
            githubUrl: 'https://github.com/Raccoon254/status-saver-docs',
            tech: ['Kotlin', 'Android Studio', 'SQLite', 'Material Design'],
            year: '2023',
            category: 'Mobile Application',
            features: ['Auto-detection', 'Batch Operations', 'Cloud Backup', 'Share Integration'],
            status: 'live'
        },
        {
            title: 'JeStorm',
            description: 'A project management tool for developers. Features include real-time chat, payment processing, and notification systems.',
            image: 'jestorm.png',
            projectUrl: 'https://jestorm.vercel.app',
            githubUrl: 'https://github.com/Raccoon254/',
            tech: ['Next.js', 'TypeScript', 'Prisma', 'Socket.io'],
            year: '2024',
            category: 'Project Management',
            features: ['Real-time Collaboration', 'Task Automation', 'Time Tracking', 'Team Analytics'],
            status: 'development'
        },
        {
            title: 'Scholarspace',
            description: 'A Laravel-based web application facilitating assignment help services. Features include real-time chat, payment processing, and notification systems.',
            image: 'scholarspace.png',
            projectUrl: 'https://scholarspace.me',
            githubUrl: 'https://github.com/Raccoon254/Scholarspace.io',
            tech: ['Laravel', 'PHP', 'MySQL', 'Vue.js'],
            year: '2023',
            category: 'Academic Platform',
            features: ['Assignment Matching', 'Secure Payments', 'Live Chat', 'Document Management'],
            status: 'live'
        },
        {
            title: 'Project InternLink',
            description: 'A revolutionary platform connecting students with internship opportunities. Simplifies the application process and bridges students with their future careers.',
            image: 'internlink.png',
            projectUrl: 'https://intern.co.ke',
            githubUrl: 'https://github.com/FutureSpace-Kenya/InternLink',
            tech: ['React', 'Express', 'PostgreSQL', 'AWS'],
            year: '2024',
            category: 'Career Platform',
            features: ['AI Matching', 'Application Tracking', 'Interview Scheduling', 'Portfolio Builder'],
            status: 'live'
        },
        {
            title: 'FutureSpace',
            description: "A digital innovation company focusing on solving today's challenges. Services include digital innovation, automation, cybersecurity, and web development.",
            image: 'futurespace.png',
            projectUrl: 'https://futurespace.vercel.app/',
            githubUrl: 'https://github.com/FutureSpace-Kenya',
            tech: ['Next.js', 'Tailwind', 'Framer Motion', 'Vercel'],
            year: '2024',
            category: 'Corporate Website',
            features: ['Interactive Animations', 'Service Showcase', 'Contact Forms', 'Portfolio Gallery'],
            status: 'live'
        },
        {
            title: 'Crown Chambers',
            description: 'Transform your legal challenges into opportunities with our comprehensive and reliable legal expertise. We provide trusted counsel that builds confidence in complex legal matters.',
            image: 'crown-chambers.png',
            projectUrl: 'https://crown-chambers.vercel.app/',
            githubUrl: 'https://github.com/Raccoon254/',
            tech: ['React', 'TypeScript', 'Sanity CMS', 'Stripe'],
            year: '2024',
            category: 'Legal Services',
            features: ['Case Management', 'Client Portal', 'Document Templates', 'Appointment Booking'],
            status: 'live'
        },
        {
            title: 'Cline',
            description: 'A comprehensive client management tool for freelancers. Streamlines operations, improves efficiency, and enhances communication with clients.',
            image: 'cline.png',
            projectUrl: '#',
            githubUrl: 'https://github.com/Raccoon254/cline',
            tech: ['Svelte', 'SvelteKit', 'Supabase', 'TailwindCSS'],
            year: '2024',
            category: 'Business Tool',
            features: ['Client Dashboard', 'Invoice Generation', 'Project Tracking', 'Communication Hub'],
            status: 'development'
        }
    ]

    let hoveredProject: number | null = null;
    let scrollY: number = 0;
    let projectsContainer: HTMLElement;

    onMount(() => {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.project-card').forEach((card) => {
            observer.observe(card);
        });

        return () => observer.disconnect();
    });

    function getStatusDot(status: string) {
        switch(status) {
            case 'live': return '🟢';
            case 'development': return '🟡';
            case 'archived': return '🔴';
            default: return '⚪';
        }
    }

    function handleProjectHover(index: number) {
        hoveredProject = index;
    }

    function handleProjectLeave() {
        hoveredProject = null;
    }
</script>

<svelte:window bind:scrollY />

<section class="pt-16 md:pt-32 relative overflow-hidden">
    <!-- Floating background elements -->
    <div class="absolute inset-0 pointer-events-none">
        <div class="floating-element" style="top: 10%; left: 10%; animation-delay: 0s;"></div>
        <div class="floating-element" style="top: 30%; right: 15%; animation-delay: 2s;"></div>
        <div class="floating-element" style="top: 60%; left: 20%; animation-delay: 4s;"></div>
        <div class="floating-element" style="top: 80%; right: 25%; animation-delay: 6s;"></div>
    </div>

    <!-- Section Header -->
    <div class="text-center mb-16 md:mb-24 relative z-10">
        <div class="header-animation">
            <h2 data-aos="fade-up" class="text-4xl md:text-6xl text-interactive font-bold mb-4 tracking-tight">
                <span class="gradient-text">Featured</span>
                <span class="text-glitch" data-text="Projects">Projects</span>
            </h2>
            <div class="subtitle-container" data-aos="fade-in" data-aos-delay="200">
                <p class="text-lg interactive text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    A curated collection of my digital creations, each telling a unique story of innovation,
                    problem-solving, and technical excellence. Hover to explore the details.
                </p>
                <div class="decorative-line"></div>
            </div>
        </div>
    </div>

    <!-- Projects Grid -->
    <div class="projects-container" bind:this={projectsContainer}>
        {#each projects as project, index}
            <div
                    class="project-card"
                    style="--delay: {index * 0.1}s"
                    on:mouseenter={() => handleProjectHover(index)}
                    on:mouseleave={handleProjectLeave}
                    class:is-hovered={hoveredProject === index}
                    class:is-adjacent={hoveredProject !== null && Math.abs(hoveredProject - index) === 1}
            >
                <!-- Project Status Indicator -->
                <div class="status-indicator">
                    <span class="status-dot">{getStatusDot(project.status)}</span>
                    <span class="status-text">{project.status}</span>
                </div>

                <!-- Project Year Badge -->
                <div class="year-badge">{project.year}</div>

                <!-- Main Card Content -->
                <div class="card-inner" class:flipped={hoveredProject === index}>
                    <!-- Front of card -->
                    <div class="card-front">
                        <div class="image-container">
                            <img
                                    src={project.image}
                                    alt={project.title}
                                    class="project-image"
                                    loading="lazy"
                            />
                            <div class="image-overlay">
                                <div class="overlay-content">
                                    <span class="category-tag">{project.category}</span>
                                </div>
                            </div>
                        </div>

                        <div class="content-section">
                            <h3 class="project-title">{project.title}</h3>
                            <p class="project-description">{project.description}</p>

                            <!-- Tech Stack -->
                            <div class="tech-stack">
                                {#each project.tech.slice(0, 3) as tech}
                                    <span class="tech-tag">{tech}</span>
                                {/each}
                                {#if project.tech.length > 3}
                                    <span class="tech-more">+{project.tech.length - 3}</span>
                                {/if}
                            </div>
                        </div>
                    </div>

                    <!-- Back of card (revealed on hover) -->
                    <div class="card-back">
                        <div class="back-content">
                            <h4 class="back-title">Key Features</h4>
                            <ul class="features-list">
                                {#each project.features as feature}
                                    <li class="feature-item">
                                        <span class="feature-icon">→</span>
                                        {feature}
                                    </li>
                                {/each}
                            </ul>

                            <div class="full-tech-stack">
                                <h5 class="tech-title">Tech Stack</h5>
                                <div class="tech-grid">
                                    {#each project.tech as tech}
                                        <span class="tech-pill">{tech}</span>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons">
                    <a
                            href={project.githubUrl}
                            class="action-btn github-btn"
                            target="_blank"
                            rel="noopener noreferrer"
                    >
                        <i class="fab fa-github"></i>
                        <span>Code</span>
                        <div class="btn-glow"></div>
                    </a>
                    <a
                            href={project.projectUrl}
                            class="action-btn demo-btn"
                            target="_blank"
                            rel="noopener noreferrer"
                    >
                        <i class="fas fa-external-link-alt"></i>
                        <span>Live Demo</span>
                        <div class="btn-glow"></div>
                    </a>
                </div>

                <!-- Hover Effects -->
                <div class="card-glow"></div>
                <div class="particle-system">
                    {#each Array(6) as _, i}
                        <div class="particle" style="--i: {i}"></div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>

    <!-- Loading Section -->
    <div class="text-center mt-16 relative z-10">
        <div class="loading-section">
            <p class="loading-text">
                <span class="typewriter">This section is evolving...</span>
            </p>
            <div class="loading-animation">
                <div class="pulse-circle"></div>
                <div class="pulse-circle" style="animation-delay: 0.5s;"></div>
                <div class="pulse-circle" style="animation-delay: 1s;"></div>
            </div>
            <p class="coming-soon">More innovative projects launching soon</p>
        </div>
    </div>
</section>

<style>
    /* Floating background elements */
    .floating-element {
        position: absolute;
        width: 20px;
        height: 20px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        animation: float 8s infinite ease-in-out;
    }

    @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        25% { transform: translateY(-20px) rotate(90deg); }
        50% { transform: translateY(-10px) rotate(180deg); }
        75% { transform: translateY(-30px) rotate(270deg); }
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
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
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
        0%, 90%, 100% { opacity: 1; }
        91%, 99% { opacity: 0.8; }
    }

    .decorative-line {
        width: 100px;
        height: 2px;
        background: linear-gradient(90deg, transparent, white, transparent);
        margin: 20px auto;
        animation: expand 2s ease-out;
    }

    @keyframes expand {
        from { width: 0; }
        to { width: 100px; }
    }

    /* Projects Container */
    .projects-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 3rem;
        perspective: 1000px;
    }

    @media (max-width: 768px) {
        .projects-container {
            grid-template-columns: 1fr;
            gap: 2rem;
        }
    }

    /* Project Cards */
    .project-card {
        position: relative;
        height: 500px;
        transform-style: preserve-3d;
        transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        opacity: 0;
        transform: translateY(50px) rotateX(10deg);
        animation: slideInUp 0.8s ease-out calc(var(--delay) + 0.2s) forwards;
    }

    .project-card.animate-in {
        opacity: 1;
        transform: translateY(0) rotateX(0deg);
    }

    .project-card:hover {
        transform: translateY(-15px) rotateX(5deg) rotateY(5deg);
    }

    .project-card.is-adjacent {
        transform: translateY(-5px) scale(1.02);
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
        from { width: 0; }
        to { width: 100%; }
    }

    @keyframes blink-caret {
        from, to { border-color: transparent; }
        50% { border-color: rgba(255, 255, 255, 0.75); }
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