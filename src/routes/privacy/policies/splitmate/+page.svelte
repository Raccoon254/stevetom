<script lang="ts">
    import Cursor from '../../../components/Cursor.svelte';
</script>

<svelte:head>
    <title>Privacy Policy | SplitMate - Group Expense Tracker</title>
    <meta name="description" content="SplitMate Privacy Policy - Learn how we protect your privacy with local-first, offline storage. No data collection, no tracking, complete privacy." />
</svelte:head>

<Cursor />

<div class="min-h-screen bg-base-100">
    <div class="max-w-4xl mx-auto px-6 py-16">
        <!-- Header with Logo -->
        <div class="flex flex-col items-center mb-12">
            <img
                src="/splitmate_logo.png"
                alt="SplitMate Logo"
                class="w-24 h-24 mb-6"
            />
            <h1 class="text-4xl md:text-5xl font-bold text-center mb-2">Privacy Policy</h1>
            <p class="text-xl text-base-content/60">SplitMate - Group Expense Tracker</p>
            <p class="text-sm text-base-content/50 mt-2">Last updated: December 10, 2025</p>
        </div>

        <!-- Privacy Policy Content -->
        <div class="prose prose-lg max-w-none">
            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Our Commitment to Privacy</h2>
                <p class="text-base-content/80 mb-4">
                    At SplitMate, your privacy is our top priority. We've built the app from the ground up with a privacy-first approach. This means we don't collect, store, or transmit any of your personal data to external servers.
                </p>
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">What Data We Collect</h2>
                <p class="text-base-content/80 mb-4">
                    <strong>None.</strong> We do not collect any personal information, usage data, or analytics. All your data stays on your device.
                </p>
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">How Your Data is Stored</h2>
                <p class="text-base-content/80 mb-4">
                    SplitMate uses local storage exclusively:
                </p>
                <ul class="list-disc list-inside text-base-content/80 mb-4 space-y-2">
                    <li><strong>Local Database:</strong> All your groups, expenses, members, and settlements are stored locally on your device using SQLite database.</li>
                    <li><strong>No Cloud Sync:</strong> Your data never leaves your device unless you explicitly choose to export it.</li>
                    <li><strong>Device Security:</strong> Your data is protected by your device's built-in security features (lock screen, encryption).</li>
                    <li><strong>Automatic Deletion:</strong> When you uninstall the app, all data is automatically removed from your device.</li>
                </ul>
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Group Sharing via QR Codes</h2>
                <p class="text-base-content/80 mb-4">
                    When you choose to share a group:
                </p>
                <ul class="list-disc list-inside text-base-content/80 mb-4 space-y-2">
                    <li>The app exports your group data as a JSON file on your device</li>
                    <li>A QR code is generated locally containing this data</li>
                    <li>Only the person scanning the QR code receives the data</li>
                    <li>No data is sent to any external servers or cloud services</li>
                    <li>You have complete control over who gets access to your group data</li>
                </ul>
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">No Third-Party Services</h2>
                <p class="text-base-content/80 mb-4">
                    SplitMate does not integrate with any third-party services:
                </p>
                <ul class="list-disc list-inside text-base-content/80 mb-4 space-y-2">
                    <li>No analytics or tracking services</li>
                    <li>No advertising networks</li>
                    <li>No cloud storage providers</li>
                    <li>No social media integrations</li>
                    <li>No crash reporting services</li>
                </ul>
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Internet Usage</h2>
                <p class="text-base-content/80 mb-4">
                    SplitMate does not require an internet connection to function. The app works completely offline. No internet permissions are requested or used.
                </p>
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Permissions</h2>
                <p class="text-base-content/80 mb-4">
                    SplitMate only requests the following permissions:
                </p>
                <ul class="list-disc list-inside text-base-content/80 mb-4 space-y-2">
                    <li><strong>Storage:</strong> To save and load group export files when you choose to backup or restore data</li>
                    <li><strong>Camera:</strong> Only used for scanning QR codes when joining a group (optional feature)</li>
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
                    <li>Export any group as a JSON file for backup</li>
                    <li>Import groups from backup files</li>
                    <li>Share groups with friends via QR codes or files</li>
                    <li>Delete any data at any time</li>
                </ul>
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Children's Privacy</h2>
                <p class="text-base-content/80 mb-4">
                    SplitMate does not collect any personal information from anyone, including children under 13. The app is designed for users 18 and over, but we don't collect age information or any other personal data.
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
                    <strong>Email:</strong> <a href="mailto:tomsteve187@gmail.com" class="text-[#7C4DFF] hover:text-[#5E35B1] transition-colors">tomsteve187@gmail.com</a>
                </p>
            </section>

            <section class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Summary</h2>
                <div class="bg-[#7C4DFF]/10 border-l-4 border-[#7C4DFF] p-6 rounded-r-lg">
                    <p class="text-base-content/90 font-medium mb-2">In simple terms:</p>
                    <ul class="list-disc list-inside text-base-content/80 space-y-2">
                        <li>We don't collect any data about you</li>
                        <li>Everything stays on your device</li>
                        <li>No internet required, no cloud servers</li>
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
