<script lang="ts">
	import { tick } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { sessionId, visitorId } from '$lib/analytics';
	import SponsorBadgeArt from '$lib/components/kenfolio/SponsorBadgeArt.svelte';
	import SponsorLinkArt from '$lib/components/kenfolio/SponsorLinkArt.svelte';
	import SponsorPageArt from '$lib/components/kenfolio/SponsorPageArt.svelte';

	type TierKey = 'standard' | 'workshop';
	type Cadence = 'RECURRING' | 'ONE_TIME';
	type OtpStage = 'idle' | 'sent' | 'verified' | 'skipped';

	/**
	 * Prices in USD. These mirror TIER_THRESHOLDS in src/lib/server/sponsors.ts,
	 * and the benefit lines mirror what the thank-you email promises. If any of
	 * the three drift apart, someone gets told they bought something they did
	 * not, so they are deliberately written to match word for word.
	 */
	const TIERS: Record<
		TierKey,
		{ label: string; monthly: number; oneTime: number; blurb: string; gets: string[] }
	> = {
		standard: {
			label: 'Standard',
			monthly: 5,
			oneTime: 25,
			blurb: 'Your name on the wall, and the note that says where it went.',
			gets: [
				'Listed on the partners page by name, with a link',
				'A page of your own at /partners/you',
				'The quarterly note on what the money paid for'
			]
		},
		workshop: {
			label: 'Workshop',
			monthly: 15,
			oneTime: 100,
			blurb: 'Everything in Standard, plus a logo on the wall and a line on the homepage.',
			gets: [
				'Your logo on the partners page',
				'A line on the homepage',
				'Logo slide at SkillKenya sessions while you sponsor',
				'Everything in Standard'
			]
		}
	};

	const STEPS = [
		{ label: 'Tier', heading: 'Tier and billing' },
		{ label: 'You', heading: 'Your listing' },
		{ label: 'Email', heading: 'Email address' },
		{ label: 'Review', heading: 'Review and pay' }
	];

	/* ─── wizard state ─── */
	let stepIndex = 0;
	let furthest = 0;
	let dir = 1;
	let headingEl: HTMLHeadingElement | null = null;

	/* ─── the offer ─── */
	let tier: TierKey = 'standard';
	let cadence: Cadence = 'RECURRING';

	/* ─── who they are ─── */
	let displayName = '';
	let orgName = '';
	let websiteUrl = '';
	let anonymous = false;
	let nameEl: HTMLInputElement | null = null;
	let errName = '';
	let errUrl = '';

	/* ─── email + verification ─── */
	let email = '';
	let emailEl: HTMLInputElement | null = null;
	let errEmail = '';
	let otpStage: OtpStage = 'idle';
	let otpBusy = false;
	let otpError = '';
	let otpNote = '';
	let token = '';
	let verifiedEmail = '';
	let digits: string[] = ['', '', '', '', '', ''];
	let inputs: HTMLInputElement[] = [];

	/* ─── payment ─── */
	let paying = false;
	let payError = '';
	/** Set only when a monthly plan could not be created, see notSubscription. */
	let oneOffFallbackUrl = '';

	$: preset = TIERS[tier];
	$: amount = cadence === 'RECURRING' ? preset.monthly : preset.oneTime;
	$: tierKeys = Object.keys(TIERS) as TierKey[];
	$: code = digits.join('');
	$: listedAs = anonymous ? 'Anonymous' : orgName.trim() || displayName.trim() || 'Your name';
	$: previewSlug =
		(anonymous ? 'your-name' : orgName.trim() || displayName.trim() || 'your-name')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'your-name';

	/* ─── navigation ─── */
	async function goTo(i: number) {
		if (i === stepIndex || i < 0 || i >= STEPS.length) return;
		dir = i > stepIndex ? 1 : -1;
		stepIndex = i;
		if (i > furthest) furthest = i;
		await tick();
		headingEl?.focus();
	}

	function validEmail(v: string): boolean {
		const s = v.trim();
		return s.length > 4 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
	}

	async function validateAndAdvance() {
		if (stepIndex === 1) {
			errName = '';
			errUrl = '';
			if (!anonymous && !displayName.trim()) {
				errName = 'Tell me the name to list you under, or choose to sponsor quietly.';
				await tick();
				nameEl?.focus();
				return;
			}
			const u = websiteUrl.trim();
			if (!anonymous && u && !/^https?:\/\/.+\..+/i.test(u)) {
				errUrl = 'Links need the full address, starting with https://';
				return;
			}
		}
		if (stepIndex === 2) {
			errEmail = '';
			if (!validEmail(email)) {
				errEmail = 'Enter an email I can send the receipt to.';
				await tick();
				emailEl?.focus();
				return;
			}
		}
		goTo(stepIndex + 1);
	}

	function onEmailInput() {
		errEmail = '';
		// changing the address invalidates anything already proved about it
		if (otpStage !== 'idle' && email.trim().toLowerCase() !== verifiedEmail) {
			otpStage = 'idle';
			otpError = '';
			otpNote = '';
			token = '';
			verifiedEmail = '';
			digits = ['', '', '', '', '', ''];
		}
	}

	/* ─── OTP, the same two-call flow the newsletter form uses ─── */
	async function sendCode(resent = false) {
		if (otpBusy) return;
		errEmail = '';
		otpError = '';
		otpNote = '';
		if (!validEmail(email)) {
			errEmail = 'Enter an email I can send the receipt to.';
			await tick();
			emailEl?.focus();
			return;
		}
		otpBusy = true;
		try {
			const res = await fetch('/api/verify/start', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: email.trim(), mode: 'sponsor' })
			});
			const data = await res.json();
			if (res.ok && data.success) {
				token = data.token;
				digits = ['', '', '', '', '', ''];
				otpStage = 'sent';
				otpNote = resent ? 'Sent again. It can take a minute to land.' : '';
				await tick();
				inputs[0]?.focus();
			} else {
				otpError = data.error || 'Could not send the code. Try again.';
			}
		} catch {
			otpError = 'Network error. Please try again.';
		} finally {
			otpBusy = false;
		}
	}

	async function confirmCode() {
		if (otpBusy || code.length !== 6) return;
		otpBusy = true;
		otpError = '';
		otpNote = '';
		try {
			const res = await fetch('/api/verify/confirm', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token, code })
			});
			const data = await res.json();
			if (res.ok && data.success) {
				verifiedEmail = String(data.email || email).trim().toLowerCase();
				email = verifiedEmail;
				otpStage = 'verified';
			} else {
				otpError = data.error || 'That code is not correct.';
				digits = ['', '', '', '', '', ''];
				await tick();
				inputs[0]?.focus();
			}
		} catch {
			otpError = 'Network error. Please try again.';
		} finally {
			otpBusy = false;
		}
	}

	/**
	 * Escape hatch. Verification is a courtesy check on the contact address, not
	 * a gate on the money: Paystack collects and confirms an email of its own and
	 * the webhook is what creates the sponsor. Nobody gets stuck behind an
	 * undelivered code.
	 */
	async function skipVerification() {
		errEmail = '';
		if (!validEmail(email)) {
			errEmail = 'Enter an email I can send the receipt to.';
			await tick();
			emailEl?.focus();
			return;
		}
		otpStage = 'skipped';
		otpError = '';
		goTo(3);
	}

	function onDigit(i: number, e: Event) {
		const el = e.target as HTMLInputElement;
		const raw = el.value.replace(/\D/g, '');
		if (raw.length > 1) {
			// whole code pasted into one box
			const chars = raw.slice(0, 6).split('');
			digits = Array.from({ length: 6 }, (_, k) => chars[k] ?? '');
			inputs[Math.min(chars.length, 5)]?.focus();
		} else {
			digits[i] = raw;
			digits = digits;
			if (raw && i < 5) inputs[i + 1]?.focus();
		}
		if (digits.join('').length === 6) confirmCode();
	}

	function onDigitKey(i: number, e: KeyboardEvent) {
		if (e.key === 'Backspace' && !digits[i] && i > 0) inputs[i - 1]?.focus();
		if (e.key === 'ArrowLeft' && i > 0) inputs[i - 1]?.focus();
		if (e.key === 'ArrowRight' && i < 5) inputs[i + 1]?.focus();
	}

	/* ─── payment ─── */
	async function pay() {
		if (paying) return;
		payError = '';
		oneOffFallbackUrl = '';
		if (!validEmail(email)) {
			payError = 'Enter an email I can send the receipt to.';
			goTo(2);
			return;
		}
		paying = true;
		try {
			const res = await fetch('/api/paystack-donations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					amount,
					email: email.trim(),
					currency: 'USD',
					cadence,
					sessionId: sessionId(),
					visitorId: visitorId(),
					sponsor: {
						listed: !anonymous,
						anonymous,
						displayName: displayName.trim() || null,
						orgName: orgName.trim() || null,
						websiteUrl: websiteUrl.trim() || null
					}
				})
			});
			const data = await res.json();
			if (res.ok && data.authorizationUrl) {
				// The API reports recurring:false when a monthly plan could not be
				// created. Never send someone to a one-off checkout believing they
				// set up a subscription: stop and say so first.
				if (cadence === 'RECURRING' && data.recurring === false) {
					oneOffFallbackUrl = data.authorizationUrl;
					paying = false;
					return;
				}
				window.location.href = data.authorizationUrl;
			} else {
				payError = data.error || 'Could not start the payment.';
				paying = false;
			}
		} catch {
			payError = 'Network error. Please try again.';
			paying = false;
		}
	}

	function continueAsOneOff() {
		if (!oneOffFallbackUrl) return;
		paying = true;
		window.location.href = oneOffFallbackUrl;
	}
</script>

<Seo
	title="Sponsor kenTom"
	description="Sponsor kenTom: the two tiers, what each one costs, what it gets you, and how to start."
	path="/partners/join"
	keywords="sponsor kenTom, sponsor a developer Kenya, partner with kenTom"
	breadcrumbs={[
		{ name: 'Partners', path: '/partners' },
		{ name: 'Sponsor', path: '/partners/join' }
	]}
/>

<div class="page join-page">
	<div class="shell">
		<a class="back r r-0" href="/partners">
			<span class="ar" aria-hidden="true"><Icon name="arrow-left4" size={13} /></span>
			<span>Partners</span>
		</a>

		<header class="head">
			<!-- the mark, drawn inline so it takes var(--ink) in either theme and
			     never trips the global img[src="/logo-light.png"] swap rule -->
			<div class="brandmark r r-1">
				<svg class="mark" viewBox="0 0 576 596" aria-hidden="true" focusable="false">
					<path
						d="M 0 0 L 319.02 -1 L 318.946 402.932 L 158 595 L 158 183 L -1 183 L 0 0 Z"
						fill="currentColor"
						transform="translate(1,1)"
					/>
					<path
						d="M 0 0 C 110.421 0 191.846 0 191.846 0 L 0 183.628 C 0 183.628 0 65.96 0 0 Z"
						fill="currentColor"
						transform="translate(384,0)"
					/>
				</svg>
				<span class="wordmark">kenTom</span>
				<span class="slash" aria-hidden="true">/</span>
				<span class="brand-crumb">Sponsorship</span>
			</div>

			<h1 class="r r-2">Sponsor <em>kenTom</em>.</h1>
			<p class="lede r r-3">
				Two tiers, no calls, no contract. Pick one, tell me what to call you, and your listing goes
				up when the payment clears.
			</p>
		</header>

		<div class="split">
			<section class="wiz r r-4" aria-label="Sponsorship signup">
				<div class="card">
					<div class="card-top">
						<span class="step-count">Step {stepIndex + 1} of {STEPS.length}</span>
						<span class="stub">
							<span class="stub-amt">${amount}</span>
							<span class="stub-per">{cadence === 'RECURRING' ? '/mo' : 'once'}</span>
							<span class="stub-sep" aria-hidden="true">·</span>
							<span class="stub-tier">{preset.label}</span>
						</span>
					</div>

					{#key stepIndex}
						<div class="pane" class:rev={dir === -1}>
							{#if stepIndex === 0}
								<h2 class="step-h" tabindex="-1" bind:this={headingEl}>{STEPS[0].heading}</h2>
								<p class="step-sub">
									Monthly keeps you on the wall for as long as you stay. A one-off gift runs for
									twelve months.
								</p>

								<div class="seg" role="group" aria-label="Billing frequency">
									<button
										type="button"
										class:on={cadence === 'RECURRING'}
										aria-pressed={cadence === 'RECURRING'}
										on:click={() => (cadence = 'RECURRING')}>Monthly</button
									>
									<button
										type="button"
										class:on={cadence === 'ONE_TIME'}
										aria-pressed={cadence === 'ONE_TIME'}
										on:click={() => (cadence = 'ONE_TIME')}>One-off</button
									>
								</div>

								<div class="tiers" role="group" aria-label="Sponsorship tier">
									{#each tierKeys as key}
										<button
											type="button"
											class="tier"
											class:on={tier === key}
											aria-pressed={tier === key}
											on:click={() => (tier = key)}
										>
											<span class="t-top">
												<span class="t-label">{TIERS[key].label}</span>
												{#if tier === key}
													<span class="t-tick" aria-hidden="true"
														><Icon name="tick-circle" size={15} /></span
													>
												{/if}
											</span>
											<span class="t-price">
												<span class="t-cur">$</span><span class="t-num"
													>{cadence === 'RECURRING'
														? TIERS[key].monthly
														: TIERS[key].oneTime}</span
												>
												<span class="t-per">{cadence === 'RECURRING' ? '/mo' : 'once'}</span>
											</span>
											<span class="t-blurb">{TIERS[key].blurb}</span>
										</button>
									{/each}
								</div>

								<div class="nav-row">
									<span></span>
									<button type="button" class="go" on:click={validateAndAdvance}>
										<span>Continue</span>
										<span class="ar" aria-hidden="true"><Icon name="arrow-right4" size={14} /></span>
									</button>
								</div>
							{:else if stepIndex === 1}
								<h2 class="step-h" tabindex="-1" bind:this={headingEl}>{STEPS[1].heading}</h2>
								<p class="step-sub">
									This is the name that goes on the wall and on your own page. You can change it
									later by replying to the receipt.
								</p>

								<label class="check">
									<input type="checkbox" bind:checked={anonymous} />
									<span>Sponsor quietly, do not list me anywhere</span>
								</label>

								{#if anonymous}
									<p class="quiet-note">
										Nothing public: no wall listing, no page, no logo. You still get the quarterly
										note and the receipt.
									</p>
								{:else}
									<div class="fields">
										<div class="field">
											<label for="j-name">Name to list you under</label>
											<input
												id="j-name"
												type="text"
												bind:value={displayName}
												bind:this={nameEl}
												on:input={() => (errName = '')}
												autocomplete="name"
												aria-invalid={errName ? 'true' : undefined}
												aria-describedby={errName ? 'j-name-err' : undefined}
												placeholder="Your name, or your brand"
											/>
											{#if errName}
												<p class="err" id="j-name-err" role="alert">{errName}</p>
											{/if}
										</div>
										<div class="two">
											<div class="field">
												<label for="j-org">Company <span class="opt">optional</span></label>
												<input
													id="j-org"
													type="text"
													bind:value={orgName}
													autocomplete="organization"
													placeholder="Acme Ltd"
												/>
											</div>
											<div class="field">
												<label for="j-url">Link <span class="opt">optional</span></label>
												<input
													id="j-url"
													type="url"
													bind:value={websiteUrl}
													on:input={() => (errUrl = '')}
													autocomplete="url"
													inputmode="url"
													aria-invalid={errUrl ? 'true' : undefined}
													aria-describedby={errUrl ? 'j-url-err' : undefined}
													placeholder="https://acme.com"
												/>
												{#if errUrl}
													<p class="err" id="j-url-err" role="alert">{errUrl}</p>
												{/if}
											</div>
										</div>
									</div>

									<figure class="live">
										<figcaption class="live-cap">
											<span class="mini-label">Live preview</span>
											<span>Your page at /partners/{previewSlug}</span>
										</figcaption>
										<div class="live-art">
											<SponsorPageArt
												name={orgName.trim() || displayName.trim() || 'Your name'}
												tierLabel={preset.label}
												showLogo={tier === 'workshop'}
											/>
										</div>
										{#if tier === 'standard'}
											<p class="live-note">
												Logos are a Workshop thing. On Standard your page is name, blurb and link.
											</p>
										{/if}
									</figure>
								{/if}

								<div class="nav-row">
									<button type="button" class="ghost" on:click={() => goTo(0)}>
										<span class="ar" aria-hidden="true"><Icon name="arrow-left4" size={13} /></span>
										<span>Back</span>
									</button>
									<button type="button" class="go" on:click={validateAndAdvance}>
										<span>Continue</span>
										<span class="ar" aria-hidden="true"><Icon name="arrow-right4" size={14} /></span>
									</button>
								</div>
							{:else if stepIndex === 2}
								<h2 class="step-h" tabindex="-1" bind:this={headingEl}>{STEPS[2].heading}</h2>

								{#if otpStage === 'verified'}
									<p class="step-sub">
										Confirmed. Receipts, the quarterly note and anything about your listing go to
										<strong>{email}</strong>.
									</p>
									<p class="ok" role="status">
										<span class="ok-ic" aria-hidden="true"><Icon name="verify" size={16} /></span>
										<span>Email verified</span>
									</p>
									<div class="vlinks">
										<button
											type="button"
											class="link"
											on:click={() => {
												otpStage = 'idle';
												token = '';
												verifiedEmail = '';
												digits = ['', '', '', '', '', ''];
											}}>Use a different email</button
										>
									</div>
								{:else if otpStage === 'sent'}
									<p class="step-sub">
										I sent a 6-digit code to <strong>{email}</strong>. Enter it below. It only
										confirms this inbox is reachable.
									</p>

									<div class="otp-group" role="group" aria-labelledby="otp-label">
										<span class="otp-label" id="otp-label">Verification code, 6 digits</span>
										<div class="otp" class:shake={otpError}>
											{#each digits as d, i}
												<input
													bind:this={inputs[i]}
													bind:value={digits[i]}
													on:input={(e) => onDigit(i, e)}
													on:keydown={(e) => onDigitKey(i, e)}
													type="text"
													inputmode="numeric"
													pattern="[0-9]*"
													autocomplete={i === 0 ? 'one-time-code' : 'off'}
													maxlength="6"
													aria-label="Digit {i + 1} of 6"
													aria-invalid={otpError ? 'true' : undefined}
													aria-describedby={otpError ? 'otp-err' : undefined}
												/>
											{/each}
										</div>
									</div>

									{#if otpError}<p class="err" id="otp-err" role="alert">{otpError}</p>{/if}
									{#if otpNote}<p class="note" role="status">{otpNote}</p>{/if}

									<div class="vlinks">
										<button type="button" class="link" on:click={() => sendCode(true)} disabled={otpBusy}
											>Resend code</button
										>
										<span class="dot" aria-hidden="true">·</span>
										<button
											type="button"
											class="link"
											on:click={() => {
												otpStage = 'idle';
												otpError = '';
												otpNote = '';
											}}>Change email</button
										>
									</div>

									<div class="nav-row">
										<button type="button" class="ghost" on:click={() => goTo(1)}>
											<span class="ar" aria-hidden="true"
												><Icon name="arrow-left4" size={13} /></span
											>
											<span>Back</span>
										</button>
										<button
											type="button"
											class="go"
											on:click={confirmCode}
											disabled={otpBusy || code.length !== 6}
										>
											<span>{otpBusy ? 'Checking' : 'Verify'}</span>
											<span class="ar" aria-hidden="true"><Icon name="tick-circle" size={14} /></span>
										</button>
									</div>

									<p class="hatch">
										Code not arriving? <button type="button" class="link" on:click={skipVerification}
											>Continue without verifying</button
										>. Payment still works, I just will not have proved the address.
									</p>
								{:else}
									<p class="step-sub">
										One address, used for the receipt, the quarterly note and anything about your
										listing. I send a 6-digit code to check it is reachable.
									</p>

									<div class="fields">
										<div class="field">
											<label for="j-email">Email</label>
											<input
												id="j-email"
												type="email"
												bind:value={email}
												bind:this={emailEl}
												on:input={onEmailInput}
												autocomplete="email"
												inputmode="email"
												aria-invalid={errEmail ? 'true' : undefined}
												aria-describedby={errEmail ? 'j-email-err' : undefined}
												placeholder="you@company.com"
											/>
											{#if errEmail}
												<p class="err" id="j-email-err" role="alert">{errEmail}</p>
											{/if}
										</div>
									</div>

									{#if otpError}<p class="err" role="alert">{otpError}</p>{/if}

									<div class="nav-row">
										<button type="button" class="ghost" on:click={() => goTo(1)}>
											<span class="ar" aria-hidden="true"
												><Icon name="arrow-left4" size={13} /></span
											>
											<span>Back</span>
										</button>
										<button type="button" class="go" on:click={() => sendCode(false)} disabled={otpBusy}>
											<span>{otpBusy ? 'Sending' : 'Send the code'}</span>
											<span class="ar" aria-hidden="true"><Icon name="sms" size={14} /></span>
										</button>
									</div>

									<p class="hatch">
										Rather not? <button type="button" class="link" on:click={skipVerification}
											>Continue without verifying</button
										>. Payment still works, I just will not have proved the address.
									</p>
								{/if}
							{:else}
								<h2 class="step-h" tabindex="-1" bind:this={headingEl}>{STEPS[3].heading}</h2>
								<p class="step-sub">
									Check this over. Paystack takes it from here, and your listing goes up when the
									payment clears.
								</p>

								<dl class="review">
									<div>
										<dt>Tier</dt>
										<dd>{preset.label}</dd>
									</div>
									<div>
										<dt>Billing</dt>
										<dd>{cadence === 'RECURRING' ? 'Monthly' : 'One-off'}</dd>
									</div>
									<div>
										<dt>Amount</dt>
										<dd>${amount} {cadence === 'RECURRING' ? 'every month' : 'once'}</dd>
									</div>
									<div>
										<dt>Listed as</dt>
										<dd>{listedAs}</dd>
									</div>
									{#if !anonymous && orgName.trim() && displayName.trim()}
										<div>
											<dt>Contact</dt>
											<dd>{displayName.trim()}</dd>
										</div>
									{/if}
									{#if !anonymous && websiteUrl.trim()}
										<div>
											<dt>Link</dt>
											<dd class="trunc">{websiteUrl.trim()}</dd>
										</div>
									{/if}
									<div>
										<dt>Email</dt>
										<dd class="trunc">
											{email}
											{#if otpStage === 'verified'}
												<span class="chip chip--ok">Verified</span>
											{:else}
												<span class="chip">Not verified</span>
											{/if}
										</dd>
									</div>
								</dl>

								{#if otpStage !== 'verified'}
									<p class="note">
										You skipped the code, so I have not proved that address is reachable.
										<button type="button" class="link" on:click={() => goTo(2)}>Verify it now</button
										>, or carry on and Paystack will confirm an address of its own for the receipt.
									</p>
								{/if}

								{#if oneOffFallbackUrl}
									<div class="warn" role="alert">
										<p class="warn-title">This will not be a subscription.</p>
										<p>
											A monthly plan could not be set up just now. If you carry on, Paystack charges
											<strong>${amount} once</strong> and nothing repeats. Your listing then runs for
											twelve months, the same as any one-off gift. You can try monthly again later.
										</p>
										<div class="warn-row">
											<button type="button" class="go" on:click={continueAsOneOff}>
												<span>Continue as a one-off ${amount}</span>
												<span class="ar" aria-hidden="true"
													><Icon name="card-send" size={15} /></span
												>
											</button>
											<button
												type="button"
												class="ghost"
												on:click={() => {
													oneOffFallbackUrl = '';
													cadence = 'ONE_TIME';
													goTo(0);
												}}
											>
												<span>Change my choice</span>
											</button>
										</div>
									</div>
								{:else}
									{#if payError}<p class="err" role="alert">{payError}</p>{/if}

									<div class="nav-row">
										<button type="button" class="ghost" on:click={() => goTo(2)}>
											<span class="ar" aria-hidden="true"
												><Icon name="arrow-left4" size={13} /></span
											>
											<span>Back</span>
										</button>
										<button type="button" class="go" on:click={pay} disabled={paying}>
											<span>{paying ? 'Taking you to Paystack' : 'Continue to payment'}</span>
											<span class="ar" aria-hidden="true"><Icon name="card-send" size={15} /></span>
										</button>
									</div>
								{/if}

								<p class="fine">
									Charged in KES at today's rate.
									{#if cadence === 'RECURRING'}
										Repeats monthly until you stop it. Reply to any email I send you and it stops.
									{:else}
										Your listing runs for twelve months.
									{/if}
								</p>
								<span class="secure"
									><Icon name="shield-tick" size={13} /> Secured by Paystack</span
								>
							{/if}
						</div>
					{/key}
				</div>
			</section>

			<!-- live summary -->
			<aside class="summary r r-5" aria-live="polite">
				<div class="s-inner">
					<div class="s-label">You are buying</div>
					<div class="s-amount">
						<span class="s-cur">$</span>{amount}
						<span class="s-per">{cadence === 'RECURRING' ? 'every month' : 'once'}</span>
					</div>
					<div class="s-tier">{preset.label} tier</div>

					<ul class="s-gets">
						{#each preset.gets as g}
							<li>
								<span class="s-ic" aria-hidden="true"><Icon name="tick-circle" size={13} /></span>
								<span>{g}</span>
							</li>
						{/each}
					</ul>

					{#if anonymous}
						<p class="s-note">
							You chose not to be listed, so none of the public placement above applies. You still
							get the quarterly note.
						</p>
					{/if}

					<p class="s-fine">
						Charged in KES at today's rate.
						{#if cadence === 'RECURRING'}
							Repeats monthly until you stop it. Reply to any email I send you and it stops.
						{:else}
							Your listing runs for twelve months.
						{/if}
					</p>
					<span class="s-secure"
						><Icon name="shield-tick" size={13} /> Secured by Paystack</span
					>
				</div>
			</aside>
		</div>

		<!-- what a sponsorship actually looks like -->
		<section class="gallery r r-6" aria-labelledby="gal-h">
			<div class="gal-head">
				<span class="mini-label">What a sponsorship looks like</span>
				<h2 id="gal-h">What a sponsor gets</h2>
			</div>

			<div class="gal-grid">
				<figure class="gal">
					<div class="gal-art"><SponsorBadgeArt /></div>
					<figcaption>
						<h3>Badge for your site</h3>
						<p>
							A "Sponsoring kenTom" badge for your footer, drawn here as it is meant to look. It
							is not built yet: there is nothing to copy and no date for it, so count it as
							something coming rather than something you are buying.
						</p>
					</figcaption>
				</figure>

				<figure class="gal">
					<div class="gal-art">
						<SponsorPageArt
							name={anonymous ? 'Your name' : orgName.trim() || displayName.trim() || 'Your name'}
							tierLabel={preset.label}
							showLogo={tier === 'workshop'}
						/>
					</div>
					<figcaption>
						<h3>Your sponsor page</h3>
						<p>
							Live at /partners/you: your name, a short blurb, the tier, the month you started,
							whether you are current, and a button out to your site. Logos appear on Workshop.
						</p>
					</figcaption>
				</figure>
				<figure class="gal gal--wide">
					<div class="gal-art"><SponsorLinkArt /></div>
					<figcaption>
						<h3>Links back to you</h3>
						<p>
							The partners wall points at your page, and your page links out to you. That outbound
							link carries <code>rel="sponsored"</code>, so what you get is referral traffic, not
							search ranking.
						</p>
					</figcaption>
				</figure>

			</div>
		</section>
	</div>
</div>

<style>
	.join-page {
		--rail: 1px solid var(--hairline);
	}
	.shell {
		width: 100%;
		max-width: 1000px;
	}

	/* Entrance: one orchestrated cascade rather than scattered effects. */
	.r {
		opacity: 0;
		transform: translateY(10px);
		animation: rise 0.62s cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}
	.r-0 { animation-delay: 0.02s; }
	.r-1 { animation-delay: 0.06s; }
	.r-2 { animation-delay: 0.12s; }
	.r-3 { animation-delay: 0.18s; }
	.r-4 { animation-delay: 0.26s; }
	.r-5 { animation-delay: 0.32s; }
	.r-6 { animation-delay: 0.4s; }
	@keyframes rise {
		to { opacity: 1; transform: none; }
	}

	.back {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
		text-decoration: none;
		margin-bottom: 28px;
		transition: color 0.2s ease;
	}
	.back:hover { color: var(--ink); }
	.ar { display: inline-flex; line-height: 0; }

	/* brand */
	.brandmark {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 20px;
		color: var(--ink);
	}
	.mark {
		width: 24px;
		height: 24px;
		display: block;
		flex: 0 0 auto;
	}
	.wordmark,
	.brand-crumb,
	.slash {
		font-family: var(--mono);
		font-size: 10px;
		line-height: 1;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		/* letter-spacing adds a trailing gap after the last glyph, which reads as
		   a misalignment against the item after it */
		margin-right: -0.26em;
	}
	.wordmark { color: var(--ink); }
	.slash { color: var(--mute-2); }
	.brand-crumb { color: var(--mute); }

	.head { margin-bottom: 40px; }
	h1 {
		font-size: clamp(34px, 6vw, 62px);
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0 0 16px;
		color: var(--ink);
		font-weight: 500;
	}
	h1 em { font-style: normal; color: var(--spark); }
	.lede {
		margin: 0;
		max-width: 42ch;
		font-size: clamp(15px, 1.6vw, 17px);
		line-height: 1.6;
		color: var(--ink-2);
	}

	.split {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: clamp(24px, 4vw, 52px);
		align-items: start;
	}

	/* ─────────── the card ─────────── */
	.card {
		/* No panel around the step. The tier cards inside are the only things
		   that need a border, because selecting one is a real choice; wrapping
		   them in a second frame just boxed a box. */
		background: none;
	}
	.card-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
		padding-bottom: 16px;
		margin-bottom: 20px;
		border-bottom: var(--rail);
	}
	.step-count,
	.stub {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.stub {
		display: inline-flex;
		align-items: baseline;
		gap: 6px;
	}
	.stub-amt { color: var(--ink); font-size: 12px; letter-spacing: 0.06em; }
	.stub-sep { color: var(--mute-2); }
	.stub-tier { color: var(--spark); }

	.pane {
		animation: pane-in 0.44s cubic-bezier(0.22, 1, 0.36, 1) both;
	}
	.pane.rev { animation-name: pane-in-rev; }
	@keyframes pane-in {
		from { opacity: 0; transform: translateX(16px); }
		to { opacity: 1; transform: none; }
	}
	@keyframes pane-in-rev {
		from { opacity: 0; transform: translateX(-16px); }
		to { opacity: 1; transform: none; }
	}

	.step-h {
		margin: 0 0 8px;
		font-size: clamp(21px, 2.8vw, 28px);
		line-height: 1.12;
		letter-spacing: -0.02em;
		font-weight: 500;
		color: var(--ink);
	}
	.step-h:focus { outline: none; }
	.step-h:focus-visible { outline: 1px solid var(--mute); outline-offset: 4px; }
	.step-sub {
		margin: 0 0 22px;
		max-width: 50ch;
		font-size: 14px;
		line-height: 1.6;
		color: var(--ink-2);
	}
	.step-sub strong { color: var(--ink); font-weight: 500; }

	/* frequency toggle */
	.seg {
		display: inline-flex;
		padding: 3px;
		border: var(--rail);
		border-radius: 999px;
		margin-bottom: 18px;
	}
	.seg button {
		padding: 8px 20px;
		border: 0;
		border-radius: 999px;
		background: none;
		color: var(--mute);
		font: inherit;
		font-size: 13px;
		cursor: pointer;
		transition: color 0.25s ease, background-color 0.25s ease;
	}
	.seg button.on { background: var(--mute-3); color: var(--ink); }

	/* tier cards, price as the hero */
	.tiers {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
	.tier {
		position: relative;
		display: grid;
		gap: 10px;
		padding: 20px;
		text-align: left;
		border: var(--rail);
		border-radius: 14px;
		background: none;
		color: var(--ink-2);
		font: inherit;
		cursor: pointer;
		transition: border-color 0.25s ease, transform 0.25s ease, background-color 0.25s ease;
	}
	.tier:hover { transform: translateY(-2px); border-color: var(--hairline-2); }
	.tier.on { border-color: var(--spark); background: rgba(var(--bg-rgb), 0.5); }
	.t-top { display: flex; align-items: center; justify-content: space-between; }
	.t-label {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.t-tick { display: inline-flex; line-height: 0; color: var(--spark); }
	.t-price { display: flex; align-items: baseline; gap: 3px; color: var(--ink); }
	.t-cur { font-size: 17px; color: var(--mute); }
	.t-num {
		font-size: clamp(30px, 4.6vw, 40px);
		line-height: 1;
		letter-spacing: -0.03em;
		font-variant-numeric: tabular-nums;
	}
	.t-per { font-size: 12px; color: var(--mute); margin-left: 2px; }
	.t-blurb { font-size: 13px; line-height: 1.5; color: var(--mute); }

	/* fields */
	.fields { display: grid; gap: 14px; }
	.two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
	.field { display: grid; gap: 7px; }
	.field label {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.opt { text-transform: none; letter-spacing: 0.06em; opacity: 0.7; }
	.field input {
		padding: 12px 14px;
		border: var(--rail);
		border-radius: 10px;
		background: none;
		color: var(--ink);
		font: inherit;
		font-size: 16px;
		transition: border-color 0.2s ease;
	}
	.field input::placeholder { color: var(--mute); opacity: 0.65; }
	.field input:focus { outline: none; border-color: var(--spark); }
	.field input[aria-invalid='true'] { border-color: var(--error); }

	.check {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 14px;
		color: var(--ink-2);
		cursor: pointer;
		margin-bottom: 18px;
	}
	.check input { width: 16px; height: 16px; accent-color: var(--spark); flex: 0 0 auto; }
	.quiet-note {
		margin: 0 0 6px;
		font-size: 13px;
		line-height: 1.6;
		color: var(--mute);
		border-left: 2px solid var(--mute-3);
		padding-left: 14px;
	}

	/* live preview of their page */
	.live { margin: 24px 0 0; }
	.live-cap {
		display: flex;
		align-items: baseline;
		gap: 10px;
		flex-wrap: wrap;
		margin-bottom: 12px;
		font-size: 12px;
		color: var(--mute);
	}
	.mini-label {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--spark);
	}
	.live-art {
		max-width: 300px;
	}
	.live-note { margin: 12px 0 0; font-size: 12px; line-height: 1.55; color: var(--mute); }

	/* OTP */
	.otp-group { display: grid; gap: 10px; }
	.otp-label {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.otp { display: flex; gap: clamp(6px, 1.6vw, 12px); flex-wrap: wrap; }
	.otp input {
		width: clamp(40px, 8.5vw, 54px);
		height: clamp(50px, 10vw, 62px);
		text-align: center;
		font-family: var(--sans);
		font-weight: 500;
		font-size: clamp(20px, 3vw, 26px);
		color: var(--ink);
		background: rgba(var(--bg-rgb), 0.5);
		border: 1px solid var(--hairline-2);
		border-radius: 12px;
		outline: none;
		transition: border-color 0.2s, background 0.2s;
	}
	.otp input:focus { border-color: var(--spark); background: rgba(var(--bg-rgb), 0.9); }
	.otp.shake { animation: j-shake 0.32s ease; }
	@keyframes j-shake {
		25% { transform: translateX(-5px); }
		75% { transform: translateX(5px); }
	}

	.ok {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		margin: 0;
		font-size: 14px;
		color: var(--ink);
	}
	.ok-ic { display: inline-flex; line-height: 0; color: var(--spark); }

	.vlinks {
		margin-top: 14px;
		display: flex;
		align-items: center;
		gap: 12px;
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		flex-wrap: wrap;
	}
	.vlinks .dot { color: var(--mute-2); }
	.link {
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		color: var(--ink-2);
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 3px;
		text-decoration-color: var(--mute-2);
		transition: color 0.2s;
	}
	.link:hover:not(:disabled) { color: var(--spark); }
	.link:disabled { opacity: 0.5; cursor: not-allowed; }
	.hatch {
		margin: 18px 0 0;
		padding-top: 16px;
		border-top: var(--rail);
		font-size: 12.5px;
		line-height: 1.6;
		color: var(--mute);
	}

	/* review */
	.review {
		display: grid;
		gap: 1px;
		margin: 0 0 20px;
		background: var(--hairline);
		border: var(--rail);
		border-radius: 12px;
		overflow: hidden;
	}
	.review > div {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 16px;
		padding: 12px 15px;
		background: var(--bg);
	}
	.review dt {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--mute);
		flex: 0 0 auto;
	}
	.review dd {
		margin: 0;
		font-size: 14px;
		color: var(--ink);
		text-align: right;
		min-width: 0;
	}
	.trunc { overflow-wrap: anywhere; }
	.chip {
		display: inline-block;
		margin-left: 8px;
		padding: 2px 8px;
		border: var(--rail);
		border-radius: 999px;
		font-family: var(--mono);
		font-size: 9px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--mute);
		white-space: nowrap;
	}
	.chip--ok { color: var(--spark); border-color: var(--spark); }

	.warn {
		border: 1px solid var(--error);
		border-radius: 12px;
		padding: 16px 18px;
		margin: 0 0 18px;
	}
	.warn p { margin: 0 0 8px; font-size: 13px; line-height: 1.6; color: var(--ink-2); }
	.warn p:last-of-type { margin-bottom: 14px; }
	.warn strong { color: var(--ink); font-weight: 500; }
	.warn-title { color: var(--ink) !important; font-size: 14px !important; font-weight: 500; }
	.warn-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }

	.fine { margin: 18px 0 8px; font-size: 12px; line-height: 1.55; color: var(--mute); }
	.secure {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-size: 11px;
		color: var(--mute);
	}

	/* buttons */
	.nav-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-top: 26px;
		padding-top: 20px;
		border-top: var(--rail);
	}
	.go {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 12px 20px;
		border: 1px solid var(--ink);
		border-radius: 999px;
		background: var(--ink);
		color: var(--bg);
		font: inherit;
		font-size: 14px;
		cursor: pointer;
		transition: background-color 0.22s ease, border-color 0.22s ease, transform 0.22s ease;
	}
	.go:hover:not(:disabled) {
		background: var(--spark);
		border-color: var(--spark);
		transform: translateY(-1px);
	}
	.go:disabled { opacity: 0.45; cursor: not-allowed; }
	.ghost {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		padding: 12px 18px;
		border: var(--rail);
		border-radius: 999px;
		background: none;
		color: var(--mute);
		font: inherit;
		font-size: 14px;
		cursor: pointer;
		transition: color 0.22s ease, border-color 0.22s ease;
	}
	.ghost:hover { color: var(--ink); border-color: var(--hairline-2); }

	.err {
		margin: 0;
		font-size: 12.5px;
		line-height: 1.5;
		color: var(--error);
	}
	.note {
		margin: 10px 0 0;
		font-size: 12.5px;
		line-height: 1.6;
		color: var(--mute);
	}

	/* summary rail */
	.summary { position: sticky; top: 96px; }
	.s-inner {
		border: var(--rail);
		border-radius: 16px;
		padding: 24px;
		display: grid;
		gap: 12px;
	}
	.s-label {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.s-amount {
		display: flex;
		align-items: baseline;
		gap: 4px;
		font-size: clamp(32px, 4vw, 40px);
		line-height: 1;
		letter-spacing: -0.03em;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}
	.s-cur { font-size: 18px; color: var(--mute); }
	.s-per { font-size: 12px; color: var(--mute); letter-spacing: 0; margin-left: 4px; }
	.s-tier { font-size: 13px; color: var(--spark); }
	.s-gets {
		list-style: none;
		margin: 6px 0 0;
		padding: 14px 0 0;
		border-top: var(--rail);
		display: grid;
		gap: 9px;
	}
	.s-gets li {
		display: flex;
		gap: 9px;
		align-items: flex-start;
		font-size: 13px;
		line-height: 1.5;
		color: var(--ink-2);
	}
	.s-ic { display: inline-flex; line-height: 0; color: var(--mute); margin-top: 2px; flex: 0 0 auto; }
	.s-note, .s-fine { margin: 0; font-size: 12px; line-height: 1.55; color: var(--mute); }
	.s-secure {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-size: 11px;
		color: var(--mute);
	}

	/* ─────────── gallery ─────────── */
	.gallery {
		margin-top: clamp(56px, 9vh, 96px);
		padding-top: clamp(30px, 5vh, 44px);
		border-top: var(--rail);
	}
	.gal-head { margin-bottom: 26px; }
	.gal-head h2 {
		margin: 10px 0 0;
		font-size: clamp(22px, 3vw, 30px);
		line-height: 1.1;
		letter-spacing: -0.02em;
		font-weight: 500;
		color: var(--ink);
	}
	.gal-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: clamp(16px, 2.4vw, 26px);
	}
	/* No card border. The illustrations already carry their own frames, so a
	   wrapper border put three nested outlines around the same content. The
	   artwork and the caption are enough to separate one from the next. */
	.gal {
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.gal--wide { grid-column: 1 / -1; }
	.gal-art {
		display: grid;
		place-items: center;
		border-radius: 12px;
		background: rgba(var(--bg-rgb), 0.5);
		padding: clamp(10px, 1.6vw, 16px);
		/* Every illustration occupies the same box, so the captions below them
		   sit on one line instead of stepping down with the artwork's height. */
		aspect-ratio: 2 / 1;
	}
	.gal--wide .gal-art { max-width: 620px; margin: 0 auto; width: 100%; }
	.gal figcaption {
		margin-top: auto;
	}
	.gal figcaption h3 {
		margin: 0 0 7px;
		font-size: 15px;
		font-weight: 500;
		letter-spacing: -0.01em;
		color: var(--ink);
	}
	.gal figcaption p {
		margin: 0;
		font-size: 13px;
		line-height: 1.6;
		color: var(--mute);
		max-width: 56ch;
	}
	.gal code {
		font-family: var(--mono);
		font-size: 11.5px;
		color: var(--ink-2);
	}

	@media (max-width: 900px) {
		.split { grid-template-columns: 1fr; }
		.summary { position: static; order: 2; }
		.gal--wide .gal-art { max-width: none; }
	}
	@media (max-width: 640px) {
		.gal-grid { grid-template-columns: 1fr; }
		.live-art { max-width: none; }
	}
	@media (max-width: 520px) {
		.tiers, .two { grid-template-columns: 1fr; }
		.nav-row { flex-direction: column-reverse; align-items: stretch; }
		.nav-row .go, .nav-row .ghost { justify-content: center; }
		.warn-row { flex-direction: column; align-items: stretch; }
		.warn-row .go, .warn-row .ghost { justify-content: center; }
	}

	@media (prefers-reduced-motion: reduce) {
		.r { animation: none; opacity: 1; transform: none; }
		.pane, .pane.rev { animation: none; }
		.otp.shake { animation: none; }
		.tier:hover, .go:hover:not(:disabled) { transform: none; }
		.tier, .go, .ghost, .seg button, .gal { transition: none; }
	}
</style>
