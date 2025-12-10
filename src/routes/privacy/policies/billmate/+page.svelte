<script lang="ts">
    import Cursor from '../../../components/Cursor.svelte';
</script>

<svelte:head>
    <title>Privacy Policy | BillMate - Bill & Subscription Tracker</title>
    <meta name="description" content="BillMate Privacy Policy - Learn how we protect your privacy with local-first, offline storage. No data collection, no tracking, complete privacy." />
</svelte:head>

<Cursor />

<div class="min-h-screen bg-base-100">
    <div class="max-w-4xl mx-auto px-6 py-16">
        <!-- Header with Logo -->
        <div class="flex flex-col items-center mb-12">
            <img
                src="/billmate_logo.png"
                alt="BillMate Logo"
                class="w-24 h-24 mb-6"
            />
            <h1 class="text-4xl md:text-5xl font-bold text-center mb-2">Privacy Policy</h1>
            <p class="text-xl text-base-content/60">BillMate - Bill & Subscription Tracker</p>
            <p class="text-sm text-base-content/50 mt-2">Last updated: December 10, 2025</p>
        </div>

        <!-- Privacy Policy Content -->
        <div class="prose prose-lg max-w-none">
            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Our Commitment to Privacy</h2>
                <p class="text-base-content/80 mb-4">
                    At BillMate, your privacy is our highest priority. We understand that bill and subscription information is sensitive financial data. That's why we've built BillMate with a privacy-first approach where all your data stays exclusively on your device.
                </p>
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">What Data We Collect</h2>
                <p class="text-base-content/80 mb-4">
                    <strong>None.</strong> We do not collect, transmit, or store any of your personal or financial information on external servers. Zero data collection means zero privacy concerns.
                </p>
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">How Your Data is Stored</h2>
                <p class="text-base-content/80 mb-4">
                    BillMate uses local storage exclusively:
                </p>
                <ul class="list-disc list-inside text-base-content/80 mb-4 space-y-2">
                    <li><strong>Local Database:</strong> All your bills, subscriptions, payment history, and reminders are stored locally on your device using SQLite database.</li>
                    <li><strong>No Cloud Sync:</strong> Your financial data never leaves your device. No internet connection required.</li>
                    <li><strong>Device Security:</strong> Your data is protected by your device's built-in security features (lock screen, encryption).</li>
                    <li><strong>Automatic Deletion:</strong> When you uninstall the app, all data is automatically removed from your device.</li>
                </ul>
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Reminders and Notifications</h2>
                <p class="text-base-content/80 mb-4">
                    BillMate uses local notifications to remind you about upcoming bills:
                </p>
                <ul class="list-disc list-inside text-base-content/80 mb-4 space-y-2">
                    <li>All reminders are generated locally on your device</li>
                    <li>No external notification services are used</li>
                    <li>No data is sent to any servers to schedule reminders</li>
                    <li>You have complete control over notification settings</li>
                </ul>
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">No Third-Party Services</h2>
                <p class="text-base-content/80 mb-4">
                    BillMate does not integrate with any third-party services:
                </p>
                <ul class="list-disc list-inside text-base-content/80 mb-4 space-y-2">
                    <li>No analytics or tracking services</li>
                    <li>No advertising networks</li>
                    <li>No cloud storage providers</li>
                    <li>No payment processors or bank connections</li>
                    <li>No crash reporting services</li>
                    <li>No social media integrations</li>
                </ul>
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Internet Usage</h2>
                <p class="text-base-content/80 mb-4">
                    BillMate does not require an internet connection to function. The app works completely offline. No internet permissions are requested or used.
                </p>
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Permissions</h2>
                <p class="text-base-content/80 mb-4">
                    BillMate only requests the following permissions:
                </p>
                <ul class="list-disc list-inside text-base-content/80 mb-4 space-y-2">
                    <li><strong>Notifications:</strong> To send you local reminders about upcoming bills and due dates</li>
                    <li><strong>Storage:</strong> To save and load backup files when you choose to export or import your data (optional)</li>
                </ul>
                <p class="text-base-content/80 mb-4">
                    These permissions are only used locally on your device and never transmit data externally.
                </p>
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Data Export and Backup</h2>
                <p class="text-base-content/80 mb-4">
                    You have complete control over your data:
                </p>
                <ul class="list-disc list-inside text-base-content/80 mb-4 space-y-2">
                    <li>Export all your bills and payment history as a backup file</li>
                    <li>Import data from backup files to restore or transfer</li>
                    <li>Backup files are stored locally and under your control</li>
                    <li>Delete any bill or payment record at any time</li>
                </ul>
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Financial Data Security</h2>
                <p class="text-base-content/80 mb-4">
                    Your financial information is sensitive, and we take its security seriously:
                </p>
                <ul class="list-disc list-inside text-base-content/80 mb-4 space-y-2">
                    <li>No credit card or payment information is ever collected</li>
                    <li>Bill amounts and payment details stay exclusively on your device</li>
                    <li>No external access to your financial data</li>
                    <li>Your device's security features protect your data</li>
                </ul>
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Children's Privacy</h2>
                <p class="text-base-content/80 mb-4">
                    BillMate does not collect any personal information from anyone, including children under 13. The app is designed for users 18 and over, but we don't collect age information or any other personal data.
                </p>
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Changes to This Privacy Policy</h2>
                <p class="text-base-content/80 mb-4">
                    We may update this privacy policy from time to time. We will notify you of any changes by updating the "Last updated" date at the top of this policy. Since we don't collect any contact information, we recommend checking this page periodically for updates.
                </p>
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Contact Us</h2>
                <p class="text-base-content/80 mb-4">
                    If you have any questions about this Privacy Policy, you can contact us at:
                </p>
                <p class="text-base-content/80">
                    <strong>Email:</strong> <a href="mailto:tomsteve187@gmail.com" class="text-[#4CAF50] hover:text-[#388E3C] transition-colors">tomsteve187@gmail.com</a>
                </p>
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Summary</h2>
                <div class="bg-[#4CAF50]/10 border-l-4 border-[#4CAF50] p-6 rounded-r-lg">
                    <p class="text-base-content/90 font-medium mb-2">In simple terms:</p>
                    <ul class="list-disc list-inside text-base-content/80 space-y-2">
                        <li>We don't collect any financial or personal data</li>
                        <li>All your bills and payment info stay on your device</li>
                        <li>No internet required, no cloud servers</li>
                        <li>Local reminders only, no external services</li>
                        <li>You control your data 100%</li>
                        <li>No ads, no tracking, no analytics</li>
                    </ul>
                </div>
            </section>
        </div>

        <!-- Back to Top -->
        <div class="flex justify-center mt-12">
            <a href="/" class="btn btn-primary">
                Back to Home
            </a>
        </div>
    </div>
</div>