<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly, scale } from 'svelte/transition';
    // Import Lucide icons
    import { 
        Palette, Code, Smartphone, Sparkles, Lightbulb, Rocket,
        ArrowLeft, ArrowRight, Send as PaperPlane, Plus, CheckCircle,
        TriangleAlert as ExclamationTriangle, Mail, Phone, MapPin
    } from 'lucide-svelte';

    export let mode: 'contact' | 'quote' = 'quote';

    let selectedService = '';
    let formData = {
        name: '',
        email: '',
        company: '',
        phone: '',
        budget: '',
        timeline: '',
        message: '',
        captcha: ''
    };

    let currentStep = 1;
    let totalSteps = mode === 'quote' ? 4 : 2;
    let isSubmitting = false;
    let isSubmitted = false;
    let submitError = '';
    let parallaxElements: HTMLElement[] = [];
    let scrollY = 0;
    let availableServices: any[] = [];

    const services = [
        {
            id: 'web-design',
            title: 'Web Design',
            icon: Palette,
            description: 'Modern, responsive websites',
            color: '#3b82f6'
        },
        {
            id: 'development',
            title: 'Development',
            icon: Code,
            description: 'Full-stack applications',
            color: '#10b981'
        },
        {
            id: 'mobile-app',
            title: 'Mobile App',
            icon: Smartphone,
            description: 'iOS & Android apps',
            color: '#f59e0b'
        },
        {
            id: 'branding',
            title: 'Branding',
            icon: Sparkles,
            description: 'Brand identity & design',
            color: '#ef4444'
        },
        {
            id: 'consultation',
            title: 'Consultation',
            icon: Lightbulb,
            description: 'Technical guidance',
            color: '#8b5cf6'
        },
        {
            id: 'other',
            title: 'Other',
            icon: Rocket,
            description: 'Custom solutions',
            color: '#6b7280'
        }
    ];

    const budgetRanges = [
        '< $100',
        '$100 - $500',
        '$500 - $1000',
        '$1000 - $2500',
        '$2500+',
        'Let\'s discuss'
    ];

    const timelineOptions = [
        'ASAP',
        '1 week',
        '2-3 weeks',
        '1 month',
        '2-3 months',
        '3+ months',
        'Flexible'
    ];

    let captchaIcons = ['🔥', '🌟', '🚀', '💎', '⚡', '🎯'];
    let correctCaptcha = '🔥';
    let shuffledIcons = [...captchaIcons].sort(() => Math.random() - 0.5);

    onMount(async () => {
        // Initialize parallax elements
        parallaxElements = Array.from(document.querySelectorAll('.parallax-element'));

        // Load available services
        await loadServices();

        const handleScroll = () => {
            scrollY = window.scrollY;
            updateParallax();
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    });

    async function loadServices() {
        try {
            const response = await fetch('/api/services');
            const result = await response.json();
            if (result.success) {
                availableServices = result.data;
            }
        } catch (error) {
            console.error('Error loading services:', error);
        }
    }

    function updateParallax() {
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = scrollY * speed;
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    function selectService(serviceId: string) {
        selectedService = serviceId;
        if (mode === 'quote') {
            nextStep();
        }
    }

    function nextStep() {
        if (currentStep < totalSteps) {
            currentStep++;
        }
    }

    function prevStep() {
        if (currentStep > 1) {
            currentStep--;
        }
    }

    function handleCaptcha(icon: string) {
        formData.captcha = icon;
    }

    async function handleSubmit() {
        if (mode === 'quote' && formData.captcha !== correctCaptcha) {
            alert('Please select the fire emoji to prove you\'re human');
            return;
        }

        isSubmitting = true;

        try {
            // Create service request
            const requestData = {
                serviceId: mode === 'quote' && selectedService ? getServiceId(selectedService) : (availableServices[0]?.id || null),
                clientName: formData.name,
                clientEmail: formData.email,
                clientPhone: formData.phone || null,
                company: formData.company || null,
                projectTitle: mode === 'quote' ? `${getServiceName(selectedService)} Project` : 'General Inquiry',
                description: formData.message || `${mode === 'quote' ? 'Quote request for' : 'Contact inquiry about'} ${mode === 'quote' ? getServiceName(selectedService) : 'general services'}`,
                requirements: mode === 'quote' ? `Budget: ${formData.budget || 'Not specified'}, Timeline: ${formData.timeline || 'Not specified'}` : null,
                budget: mode === 'quote' && formData.budget ? parseBudget(formData.budget) : null,
                timeline: formData.timeline || null,
                status: 'PENDING'
            };

            const response = await fetch('/api/service-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to submit request');
            }

            isSubmitted = true;
        } catch (error) {
            console.error('Error submitting request:', error);
            submitError = error instanceof Error ? error.message : 'There was an error submitting your request. Please try again.';
        } finally {
            isSubmitting = false;
        }
    }

    function getServiceId(serviceKey: string): string {
        // Try to find matching service from loaded services
        const matchingService = availableServices.find(service => {
            const serviceName = service.name.toLowerCase();
            switch (serviceKey) {
                case 'web-design':
                case 'development':
                    return serviceName.includes('web') || serviceName.includes('development');
                case 'mobile-app':
                    return serviceName.includes('mobile') || serviceName.includes('app');
                case 'branding':
                    return serviceName.includes('brand');
                case 'consultation':
                    return serviceName.includes('consultation') || serviceName.includes('tutoring');
                case 'other':
                default:
                    return false;
            }
        });

        return matchingService?.id || availableServices[0]?.id || 'default-service';
    }

    function getServiceName(serviceKey: string): string {
        const service = services.find(s => s.id === serviceKey);
        return service?.title || 'Custom Service';
    }

    function parseBudget(budgetString: string): number | null {
        if (!budgetString || budgetString === 'Let\'s discuss') return null;

        // Extract numbers from budget string
        const match = budgetString.match(/\$?([\d,]+)/);
        if (match) {
            return parseInt(match[1].replace(/,/g, ''));
        }
        return null;
    }

    function resetForm() {
        formData = {
            name: '',
            email: '',
            company: '',
            phone: '',
            budget: '',
            timeline: '',
            message: '',
            captcha: ''
        };
        selectedService = '';
        currentStep = 1;
        isSubmitted = false;
        submitError = '';
    }
</script>

<svelte:window bind:scrollY />

<section class="contact-quote-section">
    <!-- Parallax Background Elements -->
    <div class="parallax-bg">
        <div class="parallax-element bg-element-1"></div>
        <div class="parallax-element bg-element-2"></div>
        <div class="parallax-element bg-element-3"></div>
        <div class="parallax-element bg-element-4"></div>
        <div class="parallax-element bg-element-5"></div>
    </div>

    <!-- Floating Particles -->
    <div class="particles-container">
        {#each Array(20) as _, i}
            <div
                class="particle"
                style="
                    left: {Math.random() * 100}%;
                    top: {Math.random() * 100}%;

                    animation-duration: {8 + Math.random() * 4}s;
                "
            ></div>
        {/each}
    </div>

    <div class="container">
        {#if !isSubmitted}
            <!-- Header -->
            <div class="header" in:fade={{ duration: 800 }}>
                <h1 class="main-title">
                    {#if mode === 'quote'}
                        Let's Build Something Amazing
                    {:else}
                        Get In Touch
                    {/if}
                </h1>
                <p class="subtitle">
                    {#if mode === 'quote'}
                        Tell us about your project and get a personalized quote
                    {:else}
                        Ready to start your next project? Let's discuss your vision
                    {/if}
                </p>

                {#if mode === 'quote'}
                    <!-- Progress Bar -->
                    <div class="progress-container" in:scale={{ duration: 600, delay: 400 }}>
                        <div class="progress-bar">
                            <div
                                class="progress-fill"
                                style="width: {(currentStep / totalSteps) * 100}%"
                            ></div>
                        </div>
                        <span class="progress-text">Step {currentStep} of {totalSteps}</span>
                    </div>
                {/if}
            </div>

            <!-- Form Content -->
            <div class="form-container">
                {#if mode === 'quote'}
                    <!-- Quote Form Steps -->
                    {#if currentStep === 1}
                        <!-- Service Selection -->
                        <div class="step-content" in:fly={{ x: 50, duration: 600 }}>
                            <h2 class="step-title">What do you need?</h2>
                            <div class="services-grid">
                                {#each services as service}
                                    <button
                                        class="service-card {selectedService === service.id ? 'selected' : ''}"
                                        on:click={() => selectService(service.id)}
                                        style="--service-color: {service.color}"
                                    >
                                        <div class="service-icon">
                                            <svelte:component this={service.icon} size="40" color={service.color} />
                                        </div>
                                        <h3 class="service-title">{service.title}</h3>
                                        <p class="service-description">{service.description}</p>
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {:else if currentStep === 2}
                        <!-- Personal Info -->
                        <div class="step-content" in:fly={{ x: 50, duration: 600 }}>
                            <h2 class="step-title">Tell us about you</h2>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="name">What is your name? *</label>
                                    <input
                                        id="name"
                                        type="text"
                                        bind:value={formData.name}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div class="form-group">
                                    <label for="email">Your email for contact *</label>
                                    <input
                                        id="email"
                                        type="email"
                                        bind:value={formData.email}
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>

                                <div class="form-group">
                                    <label for="company">Company/Organization</label>
                                    <input
                                        id="company"
                                        type="text"
                                        bind:value={formData.company}
                                        placeholder="Your Company"
                                    />
                                </div>

                                <div class="form-group">
                                    <label for="phone">Phone Number</label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        bind:value={formData.phone}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                            </div>

                            <div class="step-actions">
                                <button class="btn-secondary" on:click={prevStep}>
                                    <ArrowLeft size="16" />
                                    Back
                                </button>
                                <button class="btn-primary" on:click={nextStep} disabled={!formData.name || !formData.email}>
                                    Continue
                                    <ArrowRight size="16" />
                                </button>
                            </div>
                        </div>
                    {:else if currentStep === 3}
                        <!-- Project Details -->
                        <div class="step-content" in:fly={{ x: 50, duration: 600 }}>
                            <h2 class="step-title">Project Details</h2>
                            <div class="form-grid">
                                <div class="form-group full-width">
                                    <label for="budget">What's your budget range?</label>
                                    <div class="budget-options">
                                        {#each budgetRanges as budget}
                                            <button
                                                class="budget-option {formData.budget === budget ? 'selected' : ''}"
                                                on:click={() => formData.budget = budget}
                                            >
                                                {budget}
                                            </button>
                                        {/each}
                                    </div>
                                </div>

                                <div class="form-group full-width">
                                    <label for="timeline">When do you need this completed?</label>
                                    <div class="timeline-options">
                                        {#each timelineOptions as timeline}
                                            <button
                                                class="timeline-option {formData.timeline === timeline ? 'selected' : ''}"
                                                on:click={() => formData.timeline = timeline}
                                            >
                                                {timeline}
                                            </button>
                                        {/each}
                                    </div>
                                </div>

                                <div class="form-group full-width">
                                    <label for="message">Tell us about your project</label>
                                    <textarea
                                        id="message"
                                        bind:value={formData.message}
                                        placeholder="Describe your project, goals, and any specific requirements..."
                                        rows="5"
                                    ></textarea>
                                </div>
                            </div>

                            <div class="step-actions">
                                <button class="btn-secondary" on:click={prevStep}>
                                    <ArrowLeft size="16" />
                                    Back
                                </button>
                                <button class="btn-primary" on:click={nextStep}>
                                    Continue
                                    <ArrowRight size="16" />
                                </button>
                            </div>
                        </div>
                    {:else if currentStep === 4}
                        <!-- Captcha & Submit -->
                        <div class="step-content" in:fly={{ x: 50, duration: 600 }}>
                            <h2 class="step-title">Almost Done!</h2>

                            <div class="captcha-section">
                                <p class="captcha-instruction">
                                    Please prove you are a human by selecting the <strong>fire</strong> emoji:
                                </p>
                                <div class="captcha-options">
                                    {#each shuffledIcons as icon}
                                        <button
                                            class="captcha-option {formData.captcha === icon ? 'selected' : ''}"
                                            on:click={() => handleCaptcha(icon)}
                                        >
                                            {icon}
                                        </button>
                                    {/each}
                                </div>
                            </div>

                            {#if submitError}
                                <div class="error-message" in:fade>
                                    <ExclamationTriangle size="16" />
                                    {submitError}
                                </div>
                            {/if}

                            <div class="step-actions">
                                <button class="btn-secondary" on:click={prevStep}>
                                    <ArrowLeft size="16" />
                                    Back
                                </button>
                                <button
                                    class="btn-submit"
                                    on:click={handleSubmit}
                                    disabled={isSubmitting || formData.captcha !== correctCaptcha}
                                >
                                    {#if isSubmitting}
                                        <div class="loading-spinner"></div>
                                        Sending...
                                    {:else}
                                        <PaperPlane size="16" />
                                        Get My Quote
                                    {/if}
                                </button>
                            </div>
                        </div>
                    {/if}
                {:else}
                    <!-- Simple Contact Form -->
                    <div class="step-content" in:fly={{ y: 30, duration: 600 }}>
                        <div class="contact-info">
                            <div class="contact-methods">
                                <div class="contact-method">
                                    <div class="contact-icon">
                                        <Mail size="20" />
                                    </div>
                                    <div class="contact-details">
                                        <h3>Email</h3>
                                        <p>hello@stevetom.dev</p>
                                    </div>
                                </div>

                                <div class="contact-method">
                                    <div class="contact-icon">
                                        <Phone size="20" />
                                    </div>
                                    <div class="contact-details">
                                        <h3>Phone</h3>
                                        <p>+254 712 345 678</p>
                                    </div>
                                </div>

                                <div class="contact-method">
                                    <div class="contact-icon">
                                        <MapPin size="20" />
                                    </div>
                                    <div class="contact-details">
                                        <h3>Location</h3>
                                        <p>Nairobi, Kenya</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="contact-form">
                            <h2 class="form-title">Send a Message</h2>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="contact-name">Name *</label>
                                    <input
                                        id="contact-name"
                                        type="text"
                                        bind:value={formData.name}
                                        placeholder="Your Name"
                                        required
                                    />
                                </div>

                                <div class="form-group">
                                    <label for="contact-email">Email *</label>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        bind:value={formData.email}
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>

                                <div class="form-group full-width">
                                    <label for="contact-message">Message *</label>
                                    <textarea
                                        id="contact-message"
                                        bind:value={formData.message}
                                        placeholder="Tell me about your project or inquiry..."
                                        rows="5"
                                        required
                                    ></textarea>
                                </div>
                            </div>

                            {#if submitError}
                                <div class="error-message" in:fade>
                                    <ExclamationTriangle size="16" />
                                    {submitError}
                                </div>
                            {/if}

                            <button
                                class="btn-submit full-width"
                                on:click={handleSubmit}
                                disabled={isSubmitting || !formData.name || !formData.email || !formData.message}
                            >
                                {#if isSubmitting}
                                    <div class="loading-spinner"></div>
                                    Sending Message...
                                {:else}
                                    <PaperPlane size="16" />
                                    Send Message
                                {/if}
                            </button>
                        </div>
                    </div>
                {/if}
            </div>
        {:else}
            <!-- Success Message -->
            <div class="success-container" in:scale={{ duration: 800 }}>
                <div class="success-icon">
                    <CheckCircle size="64" />
                </div>
                <h2 class="success-title">
                    {mode === 'quote' ? 'Quote Request Sent!' : 'Message Sent!'}
                </h2>
                <p class="success-message">
                    {#if mode === 'quote'}
                        Thank you for your interest! I'll review your project details and get back to you within 24 hours with a personalized quote.
                    {:else}
                        Thank you for reaching out! I'll get back to you as soon as possible.
                    {/if}
                </p>
                <button class="btn-primary" on:click={resetForm}>
                    <Plus size="16" />
                    {mode === 'quote' ? 'Request Another Quote' : 'Send Another Message'}
                </button>
            </div>
        {/if}
    </div>
</section>

<style>
    .contact-quote-section {
        position: relative;
        min-height: 100vh;
        overflow: hidden;
    }

    /* Parallax Background */
    .parallax-bg {
        position: absolute;
        inset: 0;
        pointer-events: none;
    }

    .bg-element-1 {
        position: absolute;
        top: 10%;
        left: 5%;
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent);
        border-radius: 50%;
        filter: blur(40px);
    }

    .bg-element-2 {
        position: absolute;
        top: 60%;
        right: 10%;
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.1), transparent);
        border-radius: 50%;
        filter: blur(30px);
    }

    .bg-element-3 {
        position: absolute;
        top: 30%;
        left: 60%;
        width: 150px;
        height: 150px;
        background: radial-gradient(circle, rgba(245, 158, 11, 0.08), transparent);
        border-radius: 50%;
        filter: blur(25px);
    }

    .bg-element-4 {
        position: absolute;
        bottom: 20%;
        left: 20%;
        width: 250px;
        height: 250px;
        background: radial-gradient(circle, rgba(139, 92, 246, 0.08), transparent);
        border-radius: 50%;
        filter: blur(35px);
    }

    .bg-element-5 {
        position: absolute;
        top: 80%;
        right: 30%;
        width: 180px;
        height: 180px;
        background: radial-gradient(circle, rgba(239, 68, 68, 0.08), transparent);
        border-radius: 50%;
        filter: blur(20px);
    }

    /* Particles */
    .particles-container {
        position: absolute;
        inset: 0;
        pointer-events: none;
    }

    .particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        animation: float-particle linear infinite;
    }

    @keyframes float-particle {
        0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-20px) rotate(360deg);
            opacity: 0;
        }
    }

    /* Container */
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
        position: relative;
        z-index: 10;
    }

    /* Header */
    .header {
        text-align: center;
        margin-bottom: 4rem;
    }

    .main-title {
        font-size: clamp(2.5rem, 6vw, 4rem);
        font-weight: 800;
        color: white;
        margin-bottom: 1.5rem;
        background: linear-gradient(135deg, #ffffff, #3b82f6, #10b981);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        line-height: 1.1;
    }

    .subtitle {
        font-size: 1.25rem;
        color: rgba(255, 255, 255, 0.8);
        max-width: 600px;
        margin: 0 auto 2rem;
        line-height: 1.6;
    }

    /* Progress Bar */
    .progress-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .progress-bar {
        width: 300px;
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6, #10b981);
        transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 3px;
    }

    .progress-text {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.875rem;
        font-weight: 500;
    }

    /* Form Container */
    .form-container {
        backdrop-filter: blur(20px);
    }

    .step-content {
        min-height: 400px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .step-title {
        font-size: 2rem;
        font-weight: 700;
        color: white;
        margin-bottom: 2rem;
        text-align: center;
    }

    /* Services Grid */
    .services-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .service-card {
        position: relative;
        background: rgba(255, 255, 255, 0.01);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        padding: 2rem 1.5rem;
        text-align: start;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        overflow: hidden;
    }

    .service-card:hover {
        transform: translateY(-5px);
        border-color: var(--service-color);
    }

    .service-card.selected {
        border-color: var(--service-color);
        background: rgba(255, 255, 255, 0.08);
    }

    .service-icon {
        font-size: 2.5rem;
        color: var(--service-color);
        margin-bottom: 1rem;
    }

    .service-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: white;
        margin-bottom: 0.5rem;
    }

    .service-description {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.875rem;
    }

    /* Form Elements */
    .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-group.full-width {
        grid-column: 1 / -1;
    }

    .form-group label {
        color: rgba(255, 255, 255, 0.9);
        font-weight: 500;
        font-size: 0.875rem;
    }

    .form-group input,
    .form-group textarea {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 1rem;
        color: white;
        font-size: 1rem;
        transition: all 0.3s ease;
    }

    .form-group input:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        background: rgba(255, 255, 255, 0.08);
    }

    .form-group input::placeholder,
    .form-group textarea::placeholder {
        color: rgba(255, 255, 255, 0.4);
    }

    /* Budget & Timeline Options */
    .budget-options,
    .timeline-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
    }

    .budget-option,
    .timeline-option {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 0.75rem 1.5rem;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.875rem;
    }

    .budget-option:hover,
    .timeline-option:hover {
        border-color: rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.08);
    }

    .budget-option.selected,
    .timeline-option.selected {
        background: #3b82f6;
        border-color: #3b82f6;
        color: white;
    }

    /* Captcha */
    .captcha-section {
        text-align: center;
        margin-bottom: 2rem;
    }

    .captcha-instruction {
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 1rem;
    }

    .captcha-options {
        display: flex;
        justify-content: center;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .captcha-option {
        width: 60px;
        height: 60px;
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        font-size: 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .captcha-option:hover {
        border-color: rgba(255, 255, 255, 0.3);
        transform: scale(1.05);
    }

    .captcha-option.selected {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.2);
    }

    /* Buttons */
    .step-actions {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin-top: 2rem;
    }

    .btn-primary,
    .btn-secondary,
    .btn-submit {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 2rem;
        border-radius: 25px;
        font-weight: 600;
        font-size: 1rem;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        cursor: pointer;
        border: none;
    }

    .btn-primary {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.4);
    }

    .btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px 0 rgba(59, 130, 246, 0.6);
    }

    .btn-secondary {
        background: rgba(255, 255, 255, 0.08);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.12);
        transform: translateY(-2px);
    }

    .btn-submit {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.4);
        min-width: 150px;
        justify-content: center;
    }

    .btn-submit:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px 0 rgba(16, 185, 129, 0.6);
    }

    .btn-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .btn-submit.full-width {
        width: 100%;
        margin-top: 1rem;
    }

    /* Loading Spinner */
    .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Contact Info */
    .contact-info {
        margin-bottom: 3rem;
    }

    .contact-methods {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 2rem;
    }

    .contact-method {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
    }

    .contact-method:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.3);
    }

    .contact-icon {
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        color: white;
    }

    .contact-details h3 {
        color: white;
        font-weight: 600;
        margin-bottom: 0.25rem;
    }

    .contact-details p {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.875rem;
    }

    .form-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: white;
        margin-bottom: 1.5rem;
        text-align: center;
    }

    /* Success State */
    .success-container {
        text-align: center;
        padding: 4rem 2rem;
    }

    .success-icon {
        font-size: 4rem;
        color: #10b981;
        margin-bottom: 1.5rem;
        animation: success-bounce 0.6s ease-out;
    }

    @keyframes success-bounce {
        0% { transform: scale(0) rotate(0deg); }
        50% { transform: scale(1.2) rotate(180deg); }
        100% { transform: scale(1) rotate(360deg); }
    }

    .success-title {
        font-size: 2rem;
        font-weight: 700;
        color: white;
        margin-bottom: 1rem;
    }

    .success-message {
        color: rgba(255, 255, 255, 0.8);
        font-size: 1.125rem;
        line-height: 1.6;
        max-width: 600px;
        margin: 0 auto 2rem;
    }

    /* Error Message */
    .error-message {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 12px;
        padding: 1rem;
        color: #fca5a5;
        font-size: 0.875rem;
        margin-bottom: 1.5rem;
    }

    .error-message i {
        color: #ef4444;
        flex-shrink: 0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .form-container {
            padding: 2rem;
        }

        .services-grid {
            grid-template-columns: 1fr;
        }

        .form-grid {
            grid-template-columns: 1fr;
        }

        .step-actions {
            flex-direction: column;
        }

        .captcha-options {
            gap: 0.5rem;
        }

        .captcha-option {
            width: 50px;
            height: 50px;
            font-size: 1.25rem;
        }

        .contact-methods {
            grid-template-columns: 1fr;
        }

        .budget-options,
        .timeline-options {
            justify-content: center;
        }
    }

    @media (max-width: 480px) {
        .container {
            padding: 0 1rem;
        }

        .form-container {
            padding: 1.5rem;
        }

        .step-title {
            font-size: 1.5rem;
        }

        .service-card {
            padding: 1.5rem 1rem;
        }
    }
</style>