<script lang="ts">
// This component is now a simple donation form that posts to the backend
let amount: number = 5
let donorEmail: string = ''
let status: 'idle' | 'loading' | 'success' | 'error' = 'idle'
let errorMsg = ''

async function donate() {
  status = 'loading'
  errorMsg = ''
  try {
    const res = await fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, email: donorEmail })
    })
    const data = await res.json()
    if (res.ok && data.approvalUrl) {
      window.location.href = data.approvalUrl
    } else {
      status = 'error'
      errorMsg = data.error || 'Failed to initiate donation.'
    }
  } catch (e) {
    status = 'error'
    errorMsg = 'Network error.'
  }
}
</script>

<style>
.card { background: #1f1f1f; color: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 2px 16px #0006; max-width: 32rem; margin: 2rem auto; }
.heading { font-size: 2rem; font-weight: 600; margin-bottom: 0.5rem; }
.desc { font-size: 1rem; color: #ccc; margin-bottom: 1rem; }
.input { background: #111; border: 1px solid #555; border-radius: 0.5rem; padding: 0.5rem; color: white; margin-bottom: 1rem; width: 100%; }
.button { background: #ff6a00; color: white; border: none; border-radius: 0.5rem; padding: 0.75rem 1.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
.button:disabled { background: #888; cursor: not-allowed; }
.error { color: #ef4444; margin-top: 1rem; }
.success { color: #4ade80; margin-top: 1rem; font-weight: 500; }
</style>

<div class="card">
  <div class="heading">Support the project</div>
  <div class="desc">Enter your email and donation amount. You will be redirected to PayPal to complete your donation.</div>
  <input class="input" type="email" bind:value={donorEmail} placeholder="Your email (optional)" />
  <input class="input" type="number" min="1" step="0.01" bind:value={amount} placeholder="Amount (USD)" />
  <button class="button" on:click={donate} disabled={status === 'loading'}>
    {status === 'loading' ? 'Processing…' : 'Donate with PayPal'}
  </button>
  {#if status === 'error'}
    <div class="error">{errorMsg}</div>
  {/if}
</div>
