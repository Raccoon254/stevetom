<script lang="ts">
    import { onMount } from 'svelte';
    import {
        Palette, Code, Smartphone, Lightbulb, Rocket, WandSparkles,
        ArrowLeft, ArrowRight, Send, Plus, Flame, CheckCircle, TriangleAlert, Mail, Phone, MapPin, Star, Gem, Zap, Target
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
    let emailError = '';
    let availableServices: any[] = [];

    const services = [
        { id: 'web-design', title: 'Web Design', icon: Palette, description: 'Modern, responsive websites', color: '#3b82f6' },
        { id: 'development', title: 'Development', icon: Code, description: 'Full-stack applications', color: '#10b981' },
        { id: 'mobile-app', title: 'Mobile App', icon: Smartphone, description: 'iOS & Android apps', color: '#f59e0b' },
        { id: 'branding', title: 'Branding', icon: WandSparkles, description: 'Brand identity & design', color: '#ef4444' },
        { id: 'consultation', title: 'Consultation', icon: Lightbulb, description: 'Technical guidance', color: '#8b5cf6' },
        { id: 'other', title: 'Other', icon: Rocket, description: 'Custom solutions', color: '#6b7280' }
    ];

    const budgetRanges = ['< $100', '$100 - $500', '$500 - $1000', '$1000 - $2500', '$2500+', 'Let\'s discuss'];
    const timelineOptions = ['ASAP', '1 week', '2-3 weeks', '1 month', '2-3 months', '3+ months', 'Flexible'];

    let captchaIcons = [Flame, Star, Rocket, Gem, Zap, Target];
    let correctCaptcha = 'Flame';
    let shuffledIcons = [...captchaIcons].sort(() => Math.random() - 0.5);

    onMount(async () => {
        await loadServices();
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

    function selectService(serviceId: string) {
        selectedService = serviceId;
        if (mode === 'quote') nextStep();
    }

    function nextStep() {
        if (currentStep === 2 && !validateEmail(formData.email)) {
            emailError = 'Please enter a valid email address';
            return;
        }
        emailError = '';
        if (currentStep < totalSteps) currentStep++;
    }

    function prevStep() {
        if (currentStep > 1) currentStep--;
    }

    function handleCaptcha(icon: string) {
        formData.captcha = icon;
    }

    function validateEmail(email: string): boolean {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    async function handleSubmit() {
        if (!validateEmail(formData.email)) {
            emailError = 'Please enter a valid email address';
            return;
        } else {
            emailError = '';
        }

        if (mode === 'quote' && formData.captcha !== correctCaptcha) {
            alert('Please select the fire emoji to prove you\'re human');
            return;
        }

        isSubmitting = true;

        try {
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();
            if (!result.success) throw new Error(result.error || 'Failed to submit request');

            isSubmitted = true;
        } catch (error) {
            console.error('Error submitting request:', error);
            submitError = error instanceof Error ? error.message : 'There was an error submitting your request. Please try again.';
        } finally {
            isSubmitting = false;
        }
    }

    function getServiceId(serviceKey: string): string {
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
        const match = budgetString.match(/\$?([\d,]+)/);
        if (match) return parseInt(match[1].replace(/,/g, ''));
        return null;
    }

    function resetForm() {
        formData = { name: '', email: '', company: '', phone: '', budget: '', timeline: '', message: '', captcha: '' };
        selectedService = '';
        currentStep = 1;
        isSubmitted = false;
        submitError = '';
    }
</script>

<section class="min-h-screen bg-base-100 py-16 relative overflow-hidden">
    <div class="container max-w-5xl mx-auto px-4 relative z-10">
        {#if !isSubmitted}
            <div class="text-center mb-12">
                <h1 class="text-4xl text-interactive md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {mode === 'quote' ? 'Let\'s Build Something Amazing' : 'Get In Touch'}
                </h1>
                <p class="text-lg text-base-content/70">
                    {mode === 'quote' ? 'Tell us about your project and get a personalized quote' : 'Ready to start your next project? Let\'s discuss your vision'}
                </p>

                {#if mode === 'quote'}
                    <div class="mt-8 flex flex-col items-center gap-2">
                        <div class="w-64 h-2 bg-base-300 rounded-full overflow-hidden">
                            <div class="h-full bg-primary transition-all duration-300" style="width: {(currentStep / totalSteps) * 100}%"></div>
                        </div>
                        <span class="text-sm text-base-content/60">Step {currentStep} of {totalSteps}</span>
                    </div>
                {/if}
            </div>

            <div class="backdrop-blur-sm">
                <div class="p-6 md:p-8">
                    {#if mode === 'quote'}
                        {#if currentStep === 1}
                            <h2 class="text-2xl font-semibold mb-6">What do you need?</h2>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {#each services as service}
                                    <button
                                        class="bg-base-100 border border-base-300 rounded-xl p-6 ring-gray-900/5 dark:ring-gray-100/5 ring-1 ring-offset-2 text-interactive dark:ring-offset-base-100 transition-all hover:border-primary hover:bg-base-200 dark:border-white/20 {selectedService === service.id ? 'border-primary bg-base-200' : ''}"
                                        on:click={() => selectService(service.id)}
                                    >
                                        <div class="flex flex-col items-center text-center gap-3">
                                            <svelte:component this={service.icon} size="40" color={service.color} />
                                            <h3 class="font-semibold text-lg">{service.title}</h3>
                                            <p class="text-sm text-base-content/60">{service.description}</p>
                                        </div>
                                    </button>
                                {/each}
                            </div>
                        {:else if currentStep === 2}
                            <h2 class="text-2xl font-semibold mb-6">Tell us about you</h2>
                            <div class="space-y-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="flex justify-between items-center mb-2">
                                            <span class="text-sm font-medium">Name *</span>
                                        </label>
                                        <input
                                            type="text"
                                            bind:value={formData.name}
                                            placeholder="John Doe"
                                            class="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label class="flex justify-between items-center mb-2">
                                            <span class="text-sm font-medium">Email *</span>
                                        </label>
                                        <input
                                            type="email"
                                            bind:value={formData.email}
                                            placeholder="john@example.com"
                                            class="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            required
                                        />
                                        {#if emailError}
                                            <p class="text-sm text-error mt-1">{emailError}</p>
                                        {/if}
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="flex justify-between items-center mb-2">
                                            <span class="text-sm font-medium">Company</span>
                                            <span class="text-xs text-base-content/50">Optional</span>
                                        </label>
                                        <input
                                            type="text"
                                            bind:value={formData.company}
                                            placeholder="Your Company"
                                            class="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label class="flex justify-between items-center mb-2">
                                            <span class="text-sm font-medium">Phone</span>
                                            <span class="text-xs text-base-content/50">Optional</span>
                                        </label>
                                        <input
                                            type="tel"
                                            bind:value={formData.phone}
                                            placeholder="+1 (555) 123-4567"
                                            class="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div class="flex justify-between mt-8">
                                <button class="px-6 py-3 border border-base-300 rounded-lg hover:border-primary hover:bg-base-100 transition-all flex items-center gap-2" on:click={prevStep}><ArrowLeft size="16" />Back</button>
                                <button class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" on:click={nextStep} disabled={!formData.name || !formData.email}>Continue<ArrowRight size="16" /></button>
                            </div>
                        {:else if currentStep === 3}
                            <h2 class="text-2xl font-semibold mb-6">Project Details</h2>
                            <div class="space-y-6">
                                <div>
                                    <label class="flex justify-between items-center mb-3">
                                        <span class="text-sm font-medium">Budget Range</span>
                                        <span class="text-xs text-base-content/50">Optional</span>
                                    </label>
                                    <div class="flex flex-wrap gap-2">
                                        {#each budgetRanges as budget}
                                            <button
                                                class="px-4 py-2 text-sm rounded-lg border transition-all {formData.budget === budget ? 'bg-primary text-white border-primary' : 'border-base-300 hover:border-primary hover:bg-base-100'}"
                                                on:click={() => formData.budget = budget}
                                            >
                                                {budget}
                                            </button>
                                        {/each}
                                    </div>
                                </div>
                                <div>
                                    <label class="flex justify-between items-center mb-3">
                                        <span class="text-sm font-medium">Timeline</span>
                                        <span class="text-xs text-base-content/50">Optional</span>
                                    </label>
                                    <div class="flex flex-wrap gap-2">
                                        {#each timelineOptions as timeline}
                                            <button
                                                class="px-4 py-2 text-sm rounded-lg border transition-all {formData.timeline === timeline ? 'bg-primary text-white border-primary' : 'border-base-300 hover:border-primary hover:bg-base-100'}"
                                                on:click={() => formData.timeline = timeline}
                                            >
                                                {timeline}
                                            </button>
                                        {/each}
                                    </div>
                                </div>
                                <div>
                                    <label class="flex justify-between items-center mb-2">
                                        <span class="text-sm font-medium">Project Description</span>
                                        <span class="text-xs text-base-content/50">Optional</span>
                                    </label>
                                    <textarea
                                        bind:value={formData.message}
                                        placeholder="Tell us about your project..."
                                        class="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 h-32 resize-none transition-all"
                                    ></textarea>
                                </div>
                            </div>
                            <div class="flex justify-between mt-8">
                                <button class="px-6 py-3 border border-base-300 rounded-lg hover:border-primary hover:bg-base-100 transition-all flex items-center gap-2" on:click={prevStep}><ArrowLeft size="16" />Back</button>
                                <button class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2" on:click={nextStep}>Continue<ArrowRight size="16" /></button>
                            </div>
                        {:else if currentStep === 4}
                            <h2 class="text-2xl font-semibold mb-6 text-center">Almost Done!</h2>
                            <div class="bg-base-200/20 border border-base-300 rounded-xl p-6 md:p-8 mb-6">
                                <p class="text-center mb-6 text-base-content/80">Select the <strong class="text-primary">fire</strong> emoji to verify you're human:</p>
                                <div class="flex justify-center gap-3 flex-wrap">
                                    {#each shuffledIcons as icon}
                                        <button
                                            class="px-6 py-4 text-2xl rounded-lg border transition-all {formData.captcha === icon.name ? 'bg-primary text-white border-primary' : 'border-base-300 hover:border-primary hover:bg-base-100'}"
                                            on:click={() => handleCaptcha(icon.name)}
                                        >
                                            <svelte:component this={icon} />
                                        </button>
                                    {/each}
                                </div>
                            </div>
                            {#if submitError}
                                <div class="bg-error/10 border border-error/20 text-error rounded-lg p-4 mb-6 flex items-center gap-2">
                                    <TriangleAlert size="16" />
                                    {submitError}
                                </div>
                            {/if}
                            <div class="flex justify-between mt-8">
                                <button class="px-6 py-3 border border-base-300 rounded-lg hover:border-primary hover:bg-base-100 transition-all flex items-center gap-2" on:click={prevStep}><ArrowLeft size="16" />Back</button>
                                <button class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" on:click={handleSubmit} disabled={isSubmitting || formData.captcha !== correctCaptcha}>
                                    {#if isSubmitting}<span class="animate-spin">⏳</span>Sending...{:else}<Send size="16" />Get My Quote{/if}
                                </button>
                            </div>
                        {/if}
                    {:else}
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                            <div class="flex items-center gap-3 p-4 bg-base-200/30 border border-base-300 rounded-lg hover:border-primary/50 transition-colors">
                                <div class="bg-primary/10 p-3 rounded-lg"><Mail size="20" class="text-primary" /></div>
                                <div>
                                    <h3 class="font-semibold text-sm">Email</h3>
                                    <p class="text-sm text-base-content/60">hello@stevetom.dev</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3 p-4 bg-base-200/30 border border-base-300 rounded-lg hover:border-primary/50 transition-colors">
                                <div class="bg-primary/10 p-3 rounded-lg"><Phone size="20" class="text-primary" /></div>
                                <div>
                                    <h3 class="font-semibold text-sm">Phone</h3>
                                    <p class="text-sm text-base-content/60">+254 712 345 678</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3 p-4 bg-base-200/30 border border-base-300 rounded-lg hover:border-primary/50 transition-colors">
                                <div class="bg-primary/10 p-3 rounded-lg"><MapPin size="20" class="text-primary" /></div>
                                <div>
                                    <h3 class="font-semibold text-sm">Location</h3>
                                    <p class="text-sm text-base-content/60">Nairobi, Kenya</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-base-200/20 border border-base-300 rounded-xl p-6 md:p-8">
                            <div class="space-y-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block mb-2">
                                            <span class="text-sm font-medium">Name *</span>
                                        </label>
                                        <input
                                            type="text"
                                            bind:value={formData.name}
                                            placeholder="Your Name"
                                            class="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label class="block mb-2">
                                            <span class="text-sm font-medium">Email *</span>
                                        </label>
                                        <input
                                            type="email"
                                            bind:value={formData.email}
                                            placeholder="your@email.com"
                                            class="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            required
                                        />
                                        {#if emailError}
                                            <p class="text-sm text-error mt-1">{emailError}</p>
                                        {/if}
                                    </div>
                                </div>
                                <div>
                                    <label class="block mb-2">
                                        <span class="text-sm font-medium">Message *</span>
                                    </label>
                                    <textarea
                                        bind:value={formData.message}
                                        placeholder="Tell me about your project..."
                                        class="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 h-32 resize-none transition-all"
                                        required
                                    ></textarea>
                                </div>
                                {#if submitError}
                                    <div class="bg-error/10 border border-error/20 text-error rounded-lg p-4 flex items-center gap-2">
                                        <TriangleAlert size="16" />
                                        {submitError}
                                    </div>
                                {/if}
                                <button
                                    class="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    on:click={handleSubmit}
                                    disabled={isSubmitting || !formData.name || !formData.email || !formData.message}
                                >
                                    {#if isSubmitting}
                                        <span class="animate-spin">⏳</span>
                                        Sending Message...
                                    {:else}
                                        <Send size="16" />
                                        Send Message
                                    {/if}
                                </button>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        {:else}
            <div class="text-center py-20">
                <div class="text-secondary mb-6 flex justify-center"><CheckCircle size="64" /></div>
                <h2 class="text-3xl font-bold mb-4">{mode === 'quote' ? 'Quote Request Sent!' : 'Message Sent!'}</h2>
                <p class="text-lg text-base-content/70 mb-8">
                    {mode === 'quote' ? 'Thank you for your interest! I\'ll review your project details and get back to you within 24 hours.' : 'Thank you for reaching out! I\'ll get back to you as soon as possible.'}
                </p>
                <button class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 mx-auto" on:click={resetForm}><Plus size="16" />{mode === 'quote' ? 'Request Another Quote' : 'Send Another Message'}</button>
            </div>
        {/if}
    </div>
</section>