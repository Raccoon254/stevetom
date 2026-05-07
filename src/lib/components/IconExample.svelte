<script>
    import Icon from './Icon.svelte';
</script>

<!-- Simple usage examples -->
<div class="icon-examples">
    <h2>Icon Usage Examples</h2>
    
    <!-- Basic icons -->
    <div class="example-section">
        <h3>Basic Icons</h3>
        <Icon name="home" size="24" />
        <Icon name="user" size="24" />
        <Icon name="mail" size="24" />
        <Icon name="code" size="24" />
    </div>
    
    <!-- Service icons -->
    <div class="example-section">
        <h3>Service Icons</h3>
        <Icon name="palette" size="32" color="#3b82f6" />
        <Icon name="code" size="32" color="#10b981" />
        <Icon name="smartphone" size="32" color="#f59e0b" />
        <Icon name="rocket" size="32" color="#ef4444" />
    </div>
    
    <!-- Action icons -->
    <div class="example-section">
        <h3>Action Icons</h3>
        <Icon name="arrow-left" size="20" />
        <Icon name="arrow-right" size="20" />
        <Icon name="external-link" size="20" />
        <Icon name="download" size="20" />
    </div>
    
    <!-- Status icons -->
    <div class="example-section">
        <h3>Status Icons</h3>
        <Icon name="check-circle" size="24" color="#10b981" />
        <Icon name="alert-triangle" size="24" color="#f59e0b" />
        <Icon name="x-circle" size="24" color="#ef4444" />
        <Icon name="info" size="24" color="#3b82f6" />
    </div>
</div>

<style>
    .icon-examples {
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
    }
    
    .example-section {
        margin-bottom: 2rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        display: flex;
        gap: 1rem;
        align-items: center;
        flex-wrap: wrap;
    }
    
    .example-section h3 {
        width: 100%;
        margin-bottom: 1rem;
        color: white;
        font-weight: 600;
    }
</style>