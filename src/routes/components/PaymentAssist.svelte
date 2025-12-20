<script lang="ts">
import Icon from '../../lib/components/Icon.svelte';
let amount: number = 5;
let donorEmail: string = '';
let status: 'idle' | 'loading' | 'success' | 'error' = 'idle';
let errorMsg = '';

function openPayPal() {
  status = 'loading';
  errorMsg = '';
  fetch('/api/donations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, email: donorEmail })
  })
    .then(res => res.json())
    .then(data => {
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        status = 'error';
        errorMsg = data.error || 'Failed to initiate PayPal payment.';
      }
    })
    .catch(() => {
      status = 'error';
      errorMsg = 'Network error.';
    });
}

function openPaystack() {
  // Placeholder for Paystack integration
  alert('Paystack integration coming soon!');
}
</script>

<style>
.payment-card {
  background: #1f1f1f;
  color: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 2px 16px #0006;
  max-width: 32rem;
  margin: 2rem auto;
}
.heading {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.desc {
  font-size: 1rem;
  color: #ccc;
  margin-bottom: 1rem;
}
.input {
  background: #111;
  border: 1px solid #555;
  border-radius: 0.5rem;
  padding: 0.5rem;
  color: white;
  margin-bottom: 1rem;
  width: 100%;
}
.pay-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #ff6a00;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;
  justify-content: center;
}
.pay-btn.paystack {
  background: #08c18a;
}
.pay-btn:disabled {
  background: #888;
  cursor: not-allowed;
}
.error {
  color: #ef4444;
  margin-top: 1rem;
}
.success {
  color: #4ade80;
  margin-top: 1rem;
  font-weight: 500;
}
.icon {
  vertical-align: middle;
}
</style>

<div class="payment-card">
  <div class="heading">
    <Icon name="payment" size={28} color="#ff6a00" />
    Support the project
  </div>
  <div class="desc">Choose your payment method and amount. You will be redirected to complete your donation securely.</div>
  <input class="input" type="email" bind:value={donorEmail} placeholder="Your email (optional)" />
  <input class="input" type="number" min="1" step="0.01" bind:value={amount} placeholder="Amount (USD)" />
  <button class="pay-btn" on:click={openPayPal} disabled={status === 'loading'}>
    <Icon name="paypal" size={22} color="white" className="icon" />
    {status === 'loading' ? 'Processing…' : 'Donate with PayPal'}
  </button>
  <button class="pay-btn paystack" on:click={openPaystack}>
    <Icon name="credit-card" size={22} color="white" className="icon" />
    Donate with Paystack
  </button>
  {#if status === 'error'}
    <div class="error">{errorMsg}</div>
  {/if}
  {#if status === 'success'}
    <div class="success">Thank you for your support!</div>
  {/if}
</div>
