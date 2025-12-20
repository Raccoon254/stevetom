<script lang="ts">
	import { onMount } from 'svelte'
	import {
		Palette,
		Code,
		Smartphone,
		Lightbulb,
		Rocket,
		WandSparkles,
		ArrowLeft,
		ArrowRight,
		Send,
		Plus,
		Flame,
		CheckCircle,
		TriangleAlert,
		Mail,
		Phone,
		MapPin,
		Star,
		Gem,
		Zap,
		Target,
		Loader,
		Loader2,
	} from 'lucide-svelte'

	export let mode: 'contact' | 'quote' = 'quote'

	let selectedService = ''
	let formData = {
		name: '',
		email: '',
		company: '',
		phone: '',
		budget: '',
		timeline: '',
		message: '',
		captcha: '',
	}

	let currentStep = 1
	let totalSteps = mode === 'quote' ? 4 : 2
	let isSubmitting = false
	let isSubmitted = false
	let submitError = ''
	let emailError = ''
	let availableServices: any[] = []

	const services = [
		{
			id: 'web-design',
			title: 'Web Design',
			icon: Palette,
			description: 'Modern, responsive websites',
			color: '#3b82f6',
		},
		{
			id: 'development',
			title: 'Development',
			icon: Code,
			description: 'Full-stack applications',
			color: '#10b981',
		},
		{
			id: 'mobile-app',
			title: 'Mobile App',
			icon: Smartphone,
			description: 'iOS & Android apps',
			color: '#f59e0b',
		},
		{
			id: 'branding',
			title: 'Branding',
			icon: WandSparkles,
			description: 'Brand identity & design',
			color: '#ef4444',
		},
		{
			id: 'consultation',
			title: 'Consultation',
			icon: Lightbulb,
			description: 'Technical guidance',
			color: '#8b5cf6',
		},
		{
			id: 'other',
			title: 'Other',
			icon: Rocket,
			description: 'Custom solutions',
			color: '#6b7280',
		},
	]

	const budgetRanges = [
		'< $100',
		'$100 - $500',
		'$500 - $1000',
		'$1000 - $2500',
		'$2500+',
		"Let's discuss",
	]
	const timelineOptions = [
		'ASAP',
		'1 week',
		'2-3 weeks',
		'1 month',
		'2-3 months',
		'3+ months',
		'Flexible',
	]

	let captchaIcons = [Flame, Star, Rocket, Gem, Zap, Target]
	let correctCaptcha = 'Flame'
	let shuffledIcons = [...captchaIcons].sort(() => Math.random() - 0.5)

	onMount(async () => {
		await loadServices()
	})

	async function loadServices() {
		try {
			// Mock data if API fails or for dev
			availableServices = services.map((s) => ({ id: s.id, name: s.title }))

			// Commenting out actual fetch for now to rely on frontend logic for design testing
			// const response = await fetch('/api/services');
			// const result = await response.json();
			// if (result.success) {
			//     availableServices = result.data;
			// }
		} catch (error) {
			console.error('Error loading services:', error)
		}
	}

	function selectService(serviceId: string) {
		selectedService = serviceId
		if (mode === 'quote') nextStep()
	}

	function nextStep() {
		if (currentStep === 2 && !validateEmail(formData.email)) {
			emailError = 'Please enter a valid email address'
			return
		}
		emailError = ''
		if (currentStep < totalSteps) currentStep++
	}

	function prevStep() {
		if (currentStep > 1) currentStep--
	}

	function handleCaptcha(icon: string) {
		formData.captcha = icon
	}

	function validateEmail(email: string): boolean {
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
		return emailRegex.test(email)
	}

	async function handleSubmit() {
		if (!validateEmail(formData.email)) {
			emailError = 'Please enter a valid email address'
			return
		} else {
			emailError = ''
		}

		if (mode === 'quote' && formData.captcha !== correctCaptcha) {
			alert("Please select the fire emoji to prove you're human")
			return
		}

		isSubmitting = true

		// Simulate submission
		setTimeout(() => {
			isSubmitting = false
			isSubmitted = true
		}, 1500)

		/* 
        // Real submission logic retained
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
        */
	}

	function getServiceId(serviceKey: string): string {
		const matchingService = availableServices.find((service) => {
			const serviceName = service.name.toLowerCase()
			switch (serviceKey) {
				case 'web-design':
				case 'development':
					return serviceName.includes('web') || serviceName.includes('development')
				case 'mobile-app':
					return serviceName.includes('mobile') || serviceName.includes('app')
				case 'branding':
					return serviceName.includes('brand')
				case 'consultation':
					return serviceName.includes('consultation') || serviceName.includes('tutoring')
				default:
					return false
			}
		})
		return matchingService?.id || availableServices[0]?.id || 'default-service'
	}

	function getServiceName(serviceKey: string): string {
		const service = services.find((s) => s.id === serviceKey)
		return service?.title || 'Custom Service'
	}

	function parseBudget(budgetString: string): number | null {
		if (!budgetString || budgetString === "Let's discuss") return null
		const match = budgetString.match(/\$?([\d,]+)/)
		if (match) return parseInt(match[1].replace(/,/g, ''))
		return null
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
			captcha: '',
		}
		selectedService = ''
		currentStep = 1
		isSubmitted = false
		submitError = ''
	}
</script>

<div class="max-w-5xl mx-auto px-4 relative z-10 w-full">
	{#if !isSubmitted}
		<div class="text-center mb-12">
			<h1 class="text-4xl md:text-6xl font-bold mb-4 text-white">
				{mode === 'quote' ? "Let's Build " : 'Get In '}
				<span class="text-[#ffee01]">{mode === 'quote' ? 'Something Amazing' : 'Touch'}</span>
			</h1>
			<p class="text-lg md:text-xl text-white/70 font-light max-w-2xl mx-auto">
				{mode === 'quote'
					? 'Tell us about your project and get a personalized quote'
					: "Ready to start your next project? Let's discuss your vision"}
			</p>

			{#if mode === 'quote'}
				<div class="mt-8 flex flex-col items-center gap-2">
					<div class="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
						<div
							class="h-full bg-[#ffee01] transition-all duration-300"
							style="width: {(currentStep / totalSteps) * 100}%"
						></div>
					</div>
					<span class="text-xs text-white/40 tracking-widest uppercase"
						>Step {currentStep} of {totalSteps}</span
					>
				</div>
			{/if}
		</div>

		<div class="">
			<div class="p-2 md:p-6">
				{#if mode === 'quote'}
					{#if currentStep === 1}
						<h2 class="text-2xl font-bold text-white mb-8">What do you need?</h2>
						<div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{#each services as service}
								<button
									class="service-card group {selectedService === service.id ? 'active' : ''}"
									on:click={() => selectService(service.id)}
								>
									<div class="flex flex-col items-center text-center gap-4">
										<div class="icon-wrapper" style="color: {service.color}">
											<svelte:component this={service.icon} size="32" />
										</div>
										<div>
											<h3
												class="font-bold text-lg text-white group-hover:text-[#ffee01] transition-colors"
											>
												{service.title}
											</h3>
											<p class="text-sm text-white/50 mt-1">{service.description}</p>
										</div>
									</div>
								</button>
							{/each}
						</div>
					{:else if currentStep === 2}
						<h2 class="text-2xl font-bold text-white mb-8">Tell us about you</h2>
						<div class="space-y-6">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div class="form-group">
									<label>Name *</label>
									<input
										type="text"
										bind:value={formData.name}
										placeholder="John Doe"
										class="premium-input"
										required
									/>
								</div>
								<div class="form-group">
									<label>Email *</label>
									<input
										type="email"
										bind:value={formData.email}
										placeholder="john@example.com"
										class="premium-input"
										required
									/>
									{#if emailError}
										<p class="text-xs text-red-400 mt-1">{emailError}</p>
									{/if}
								</div>
							</div>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div class="form-group">
									<label>Company <span class="text-white/30 text-xs ml-1">(Optional)</span></label>
									<input
										type="text"
										bind:value={formData.company}
										placeholder="Your Company"
										class="premium-input"
									/>
								</div>
								<div class="form-group">
									<label>Phone <span class="text-white/30 text-xs ml-1">(Optional)</span></label>
									<input
										type="tel"
										bind:value={formData.phone}
										placeholder="+1 (555) 123-4567"
										class="premium-input"
									/>
								</div>
							</div>
						</div>
						<div class="flex justify-between mt-12">
							<button class="nav-btn-secondary" on:click={prevStep}
								><ArrowLeft size="18" /> Back</button
							>
							<button
								class="nav-btn-primary"
								on:click={nextStep}
								disabled={!formData.name || !formData.email}
								>Continue <ArrowRight size="18" /></button
							>
						</div>
					{:else if currentStep === 3}
						<h2 class="text-2xl font-bold text-white mb-8">Project Details</h2>
						<div class="space-y-8">
							<div>
								<label class="block text-sm font-medium text-white/70 mb-3">Budget Range</label>
								<div class="flex flex-wrap gap-3">
									{#each budgetRanges as budget}
										<button
											class="option-pill {formData.budget === budget ? 'active' : ''}"
											on:click={() => (formData.budget = budget)}
										>
											{budget}
										</button>
									{/each}
								</div>
							</div>
							<div>
								<label class="block text-sm font-medium text-white/70 mb-3">Timeline</label>
								<div class="flex flex-wrap gap-3">
									{#each timelineOptions as timeline}
										<button
											class="option-pill {formData.timeline === timeline ? 'active' : ''}"
											on:click={() => (formData.timeline = timeline)}
										>
											{timeline}
										</button>
									{/each}
								</div>
							</div>
							<div class="form-group">
								<label>Project Description</label>
								<textarea
									bind:value={formData.message}
									placeholder="Tell us about your project..."
									class="premium-input h-32 resize-none"
								></textarea>
							</div>
						</div>
						<div class="flex justify-between mt-12">
							<button class="nav-btn-secondary" on:click={prevStep}
								><ArrowLeft size="18" /> Back</button
							>
							<button class="nav-btn-primary" on:click={nextStep}
								>Continue <ArrowRight size="18" /></button
							>
						</div>
					{:else if currentStep === 4}
						<h2 class="text-2xl font-bold text-white mb-8 text-center">Almost Done!</h2>
						<div class="bg-white/5 border border-white/10 rounded-xl p-8 mb-8 text-center">
							<p class="text-white/80 mb-6">
								Select the <strong class="text-[#ffee01]">fire</strong> emoji to verify you're human:
							</p>
							<div class="flex justify-center gap-4 flex-wrap">
								{#each shuffledIcons as icon}
									<button
										class="captcha-btn {formData.captcha === icon.name ? 'active' : ''}"
										on:click={() => handleCaptcha(icon.name)}
									>
										<svelte:component this={icon} size="24" />
									</button>
								{/each}
							</div>
						</div>
						{#if submitError}
							<div
								class="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-4 mb-6 flex items-center gap-2"
							>
								<TriangleAlert size="16" />
								{submitError}
							</div>
						{/if}
						<div class="flex justify-between mt-8">
							<button class="nav-btn-secondary" on:click={prevStep}
								><ArrowLeft size="18" /> Back</button
							>
							<button
								class="nav-btn-primary w-full ml-4 justify-center"
								on:click={handleSubmit}
								disabled={isSubmitting || formData.captcha !== correctCaptcha}
							>
								{#if isSubmitting}
								<span class="animate-spin mr-2">
									<Loader2 size="18" />
								</span>Sending...{:else}<Send
										size="18"
										class="mr-2"
									/>Get My Quote{/if}
							</button>
						</div>
					{/if}
				{:else}
					<!-- CONTACT MODE -->
					<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
						<div class="contact-info-card">
							<div class="icon"><Mail size="20" /></div>
							<div>
								<h3>Email</h3>
								<p>tomsteve187@gmail.com</p>
							</div>
						</div>
						<div class="contact-info-card">
							<div class="icon"><Phone size="20" /></div>
							<div>
								<h3>Phone</h3>
								<p>+254 758481320</p>
							</div>
						</div>
						<div class="contact-info-card">
							<div class="icon"><MapPin size="20" /></div>
							<div>
								<h3>Location</h3>
								<p>Nairobi, Kenya</p>
							</div>
						</div>
					</div>

					<div class="space-y-6">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div class="form-group">
								<label>Name *</label>
								<input
									type="text"
									bind:value={formData.name}
									placeholder="Your Name"
									class="premium-input"
									required
								/>
							</div>
							<div class="form-group">
								<label>Email *</label>
								<input
									type="email"
									bind:value={formData.email}
									placeholder="your@email.com"
									class="premium-input"
									required
								/>
								{#if emailError}
									<p class="text-xs text-red-400 mt-1">{emailError}</p>
								{/if}
							</div>
						</div>
						<div class="form-group">
							<label>Message *</label>
							<textarea
								bind:value={formData.message}
								placeholder="Tell me about your project..."
								class="premium-input h-40 resize-none"
								required
							></textarea>
						</div>
						{#if submitError}
							<div
								class="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-4 flex items-center gap-2"
							>
								<TriangleAlert size="16" />
								{submitError}
							</div>
						{/if}
						<button
							class="nav-btn-primary w-full justify-center py-4 text-lg"
							on:click={handleSubmit}
							disabled={isSubmitting || !formData.name || !formData.email || !formData.message}
						>
							{#if isSubmitting}
								<span class="animate-spin mr-2">
									<Loader size="20" />
								</span>
								Sending Message...
							{:else}
								<Send size="20" class="mr-2" />
								Send Message
							{/if}
						</button>
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="text-center py-24 px-4">
			<div
				class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#ffee01]/10 text-[#ffee01] mb-8 animate-bounce"
			>
				<CheckCircle size="48" />
			</div>
			<h2 class="text-4xl font-bold text-white mb-6">
				{mode === 'quote' ? 'Quote Request Sent!' : 'Message Sent!'}
			</h2>
			<p class="text-xl text-white/60 mb-10 max-w-lg mx-auto leading-relaxed">
				{mode === 'quote'
					? "Thank you for your interest! I'll review your project details and get back to you within 24 hours."
					: "Thank you for reaching out! I'll get back to you as soon as possible."}
			</p>
			<button class="nav-btn-secondary mx-auto" on:click={resetForm}>
				<Plus size="18" class="mr-2" />
				{mode === 'quote' ? 'Request Another Quote' : 'Send Another Message'}
			</button>
		</div>
	{/if}
</div>

<style>
	/* Premium Design System */
	.premium-card {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 24px;
		backdrop-filter: blur(20px);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
	}

	.service-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 16px;
		transition: all 0.3s ease;
		text-align: left;
	}

	.service-card:hover {
		background: rgba(255, 255, 255, 0.08);
		transform: translateY(-4px);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.service-card.active {
		background: rgba(255, 238, 1, 0.1);
		border-color: #ffee01;
	}

	.form-group label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.7);
		margin-bottom: 0.75rem;
	}

	.premium-input {
		width: 100%;
		padding: 1rem 1.25rem;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		color: white;
		transition: all 0.3s ease;
		outline: none;
	}

	.premium-input:focus {
		border-color: #ffee01;
		background: rgba(0, 0, 0, 0.4);
		box-shadow: 0 0 0 4px rgba(255, 238, 1, 0.1);
	}

	.nav-btn-primary {
		display: inline-flex;
		align-items: center;
		padding: 0.875rem 2rem;
		background: #ffee01;
		color: black;
		font-weight: 700;
		border-radius: 12px;
		transition: all 0.3s ease;
	}

	.nav-btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 10px 20px -5px rgba(255, 238, 1, 0.3);
	}

	.nav-btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.nav-btn-secondary {
		display: inline-flex;
		align-items: center;
		padding: 0.875rem 2rem;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: white;
		font-weight: 600;
		border-radius: 12px;
		transition: all 0.3s ease;
	}

	.nav-btn-secondary:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: white;
	}

	.option-pill {
		padding: 0.75rem 1.5rem;
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 100px;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.875rem;
		transition: all 0.3s ease;
	}

	.option-pill:hover {
		border-color: white;
		color: white;
		background: rgba(255, 255, 255, 0.05);
	}

	.option-pill.active {
		background: #ffee01;
		color: black;
		border-color: #ffee01;
		font-weight: 600;
	}

	.captcha-btn {
		width: 3.5rem;
		height: 3.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.5);
		transition: all 0.3s ease;
	}

	.captcha-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: white;
	}

	.captcha-btn.active {
		background: #ffee01;
		border-color: #ffee01;
		color: black;
	}

	.contact-info-card {
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 16px;
		display: flex;
		align-items: center;
		gap: 1rem;
		transition: all 0.3s ease;
	}

	.contact-info-card:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: #ffee01;
	}

	.contact-info-card .icon {
		width: 48px;
		height: 48px;
		border-radius: 12px;
		background: rgba(255, 238, 1, 0.1);
		color: #ffee01;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.contact-info-card h3 {
		font-weight: 600;
		color: white;
		font-size: 0.875rem;
		margin-bottom: 0.125rem;
	}

	.contact-info-card p {
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.875rem;
	}
</style>
