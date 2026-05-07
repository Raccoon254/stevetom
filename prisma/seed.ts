import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load environment variables
config()

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data (optional - remove if you want to keep existing data)
  await prisma.serviceRequest.deleteMany()
  await prisma.service.deleteMany()
  await prisma.project.deleteMany()

  // Seed Services
  console.log('📦 Seeding services...')
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Web Development',
        description: 'Full-stack web development using modern technologies like React, Next.js, SvelteKit, Laravel, and more. From simple landing pages to complex web applications.',
        price: 1500.00,
        duration: '2-6 weeks',
        technologies: ['React', 'Next.js', 'SvelteKit', 'Node.js', 'TypeScript', 'Tailwind CSS', 'Prisma'],
        isActive: true
      }
    }),

    prisma.service.create({
      data: {
        name: 'Mobile App Development',
        description: 'Native and cross-platform mobile applications for iOS and Android. Using React Native, Flutter, or native development with Kotlin and Swift.',
        price: 2500.00,
        duration: '3-8 weeks',
        technologies: ['React Native', 'Flutter', 'Kotlin', 'Swift', 'Firebase', 'SQLite'],
        isActive: true
      }
    }),

    prisma.service.create({
      data: {
        name: 'Desktop Applications',
        description: 'Cross-platform desktop applications using Electron, Tauri, or native frameworks. Perfect for productivity tools and business applications.',
        price: 2000.00,
        duration: '4-10 weeks',
        technologies: ['Electron', 'Tauri', 'C#', '.NET', 'Python', 'Qt'],
        isActive: true
      }
    }),

    prisma.service.create({
      data: {
        name: 'Technical Consultation',
        description: 'Expert technical consultation for architecture design, technology stack selection, code reviews, and development strategy planning.',
        price: 100.00,
        duration: '1-2 hours',
        technologies: ['Architecture Design', 'Code Review', 'Performance Optimization', 'Best Practices'],
        isActive: true
      }
    }),

    prisma.service.create({
      data: {
        name: 'Programming Tutoring & Training',
        description: 'One-on-one or group programming lessons covering various languages and frameworks. From beginner to advanced levels.',
        price: 50.00,
        duration: '1 hour sessions',
        technologies: ['JavaScript', 'TypeScript', 'Python', 'React', 'Node.js', 'Database Design', 'Git'],
        isActive: true
      }
    }),

    prisma.service.create({
      data: {
        name: 'API Development & Integration',
        description: 'RESTful API development, GraphQL APIs, third-party integrations, and microservices architecture implementation.',
        price: 1000.00,
        duration: '1-4 weeks',
        technologies: ['REST API', 'GraphQL', 'Node.js', 'Express', 'Fastify', 'PostgreSQL', 'MongoDB'],
        isActive: true
      }
    })
  ])

  console.log(`✅ Created ${services.length} services`)

  // Seed Projects
  console.log('🚀 Seeding projects...')
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        title: "Skillkenya",
        description: "Join thousands of Kenyans learning in-demand tech skills from industry experts. Start your journey to a brighter future today.",
        image: 'https://kentom.co.ke/skillkenya.png',
        projectUrl: 'https://www.skillkenya.com/',
        githubUrl: '#',
        tech: ['React', 'NodeJs', 'MySQL', 'NextJs', 'Prisma'],
        year: '2024',
        category: 'Education Platform',
        features: ['Video Streaming', 'Payment Integration', 'User Analytics', 'Course Management'],
        status: 'LIVE'
      }
    }),

    prisma.project.create({
      data: {
        title: 'Status Saver',
        description: 'An android kotlin application that allows users to save statuses from WhatsApp. It also allows users to share statuses with friends and manage saved statuses.',
        image: 'https://kentom.co.ke/status-saver.png',
        projectUrl: 'https://status-saver.vercel.app',
        githubUrl: 'https://github.com/Raccoon254/status-saver-docs',
        tech: ['Kotlin', 'Android Studio', 'SQLite', 'Material Design'],
        year: '2023',
        category: 'Mobile Application',
        features: ['Auto-detection', 'Batch Operations', 'Auto Refresh', 'Share Integration'],
        status: 'LIVE'
      }
    }),

    prisma.project.create({
      data: {
        title: 'JeStorm',
        description: 'A project management tool for developers. Features include real-time chat, payment processing, and notification systems.',
        image: 'https://kentom.co.ke/jestorm.png',
        projectUrl: 'https://jestorm.vercel.app',
        githubUrl: 'https://github.com/Raccoon254/',
        tech: ['NextJs', 'TypeScript', 'Prisma', 'Socket.io'],
        year: '2024',
        category: 'Project Management',
        features: ['Real-time Collaboration', 'Task Automation', 'Time Tracking', 'Team Analytics'],
        status: 'DEVELOPMENT'
      }
    }),

    prisma.project.create({
      data: {
        title: 'Scholarspace',
        description: 'A Laravel-based web application facilitating assignment help services. Features include real-time chat, payment processing, and notification systems.',
        image: 'https://kentom.co.ke/scholarspace.png',
        projectUrl: 'https://scholarspace.me',
        githubUrl: 'https://github.com/Raccoon254/Scholarspace.io',
        tech: ['Laravel', 'PHP', 'MySQL', 'Livewire'],
        year: '2023',
        category: 'Academic Platform',
        features: ['Assignment Matching', 'Secure Payments', 'Live Chat', 'Document Management'],
        status: 'DEVELOPMENT'
      }
    }),

    prisma.project.create({
      data: {
        title: 'Project InternLink',
        description: 'A revolutionary platform connecting students with internship opportunities. Simplifies the application process and bridges students with their future careers.',
        image: 'https://kentom.co.ke/internlink.png',
        projectUrl: 'https://intern.co.ke',
        githubUrl: 'https://github.com/FutureSpace-Kenya/InternLink',
        tech: ['React', 'NextJs', 'PostgreSQL', 'Vercel'],
        year: '2024',
        category: 'Career Platform',
        features: ['Application Tracking', 'Interview Scheduling', 'Portfolio Builder'],
        status: 'DEVELOPMENT'
      }
    }),

    prisma.project.create({
      data: {
        title: 'FutureSpace',
        description: "A digital innovation company focusing on solving today's challenges. Services include digital innovation, automation, cybersecurity, and web development.",
        image: 'https://kentom.co.ke/futurespace.png',
        projectUrl: 'https://futurespace.vercel.app/',
        githubUrl: 'https://github.com/FutureSpace-Kenya',
        tech: ['NextJs', 'Tailwind', 'HTML', 'Vercel'],
        year: '2024',
        category: 'Corporate Website',
        features: ['Interactive Animations', 'Service Showcase', 'Contact Forms', 'Portfolio Gallery'],
        status: 'LIVE'
      }
    }),

    prisma.project.create({
      data: {
        title: 'Crown Chambers',
        description: 'Transform your legal challenges into opportunities with our comprehensive and reliable legal expertise. We provide trusted counsel that builds confidence in complex legal matters.',
        image: 'https://kentom.co.ke/crown-chambers.png',
        projectUrl: 'https://crown-chambers.vercel.app/',
        githubUrl: 'https://github.com/Raccoon254/',
        tech: ['React', 'TypeScript', 'Vercel', 'TailwindCSS'],
        year: '2025',
        category: 'Legal Services',
        features: ['Case Management', 'Client Portal', 'Document Templates', 'Appointment Booking'],
        status: 'LIVE'
      }
    }),

    prisma.project.create({
      data: {
        title: 'Cline',
        description: 'A comprehensive client management tool for freelancers. Streamlines operations, improves efficiency, and enhances communication with clients.',
        image: 'https://kentom.co.ke/cline.png',
        projectUrl: '#',
        githubUrl: 'https://github.com/Raccoon254/cline',
        tech: ['Laravel', 'Livewire', 'MySQL', 'TailwindCSS'],
        year: '2023',
        category: 'Business Tool',
        features: ['Client Dashboard', 'Invoice Generation', 'Project Tracking', 'Communication Hub'],
        status: 'DEVELOPMENT'
      }
    }),

    prisma.project.create({
      data: {
        title: 'ZidiPlay',
        description: 'The ultimate peer-to-peer gaming rental platform. Rent the latest gaming gear or earn by lending yours. From consoles to accessories, with bank-level security and instant delivery.',
        image: 'https://kentom.co.ke/zidiplay.png',
        projectUrl: 'https://zidiplay.vercel.app/',
        githubUrl: '#',
        tech: ['React', 'NextJs', 'Tailwind', 'Vercel'],
        year: '2025',
        category: 'Gaming Platform',
        features: ['P2P Rental System', 'Secure Payment', 'Instant Delivery', 'Gear Marketplace'],
        status: 'LIVE',
        featured: true
      }
    }),

    prisma.project.create({
      data: {
        title: 'Qailly',
        description: 'Ship apps that actually work. Connect with verified testers worldwide. Get professional app testing from $49, or earn money by testing the latest apps from top developers.',
        image: 'https://kentom.co.ke/qailly.png',
        projectUrl: 'https://qailly.vercel.app/',
        githubUrl: '#',
        tech: ['React', 'NextJs', 'TypeScript', 'TailwindCSS'],
        year: '2025',
        category: 'Testing Platform',
        features: ['AI-Powered Matching', 'Video Evidence', 'Global Tester Network', '24hr Turnaround'],
        status: 'LIVE',
        featured: true
      }
    }),

    prisma.project.create({
      data: {
        title: 'Dev Cleaner',
        description: 'A cross-platform JavaFX application to manage project storage by cleaning build artifacts like node_modules, target directories, and other unnecessary files to free up disk space.',
        image: 'https://kentom.co.ke/dev-cleaner.png',
        projectUrl: '#',
        githubUrl: 'https://github.com/Raccoon254/Dev-Cleaner',
        tech: ['Java', 'Css', 'SQLite', 'Xml', 'Intellij'],
        year: '2024',
        category: 'Desktop Application',
        features: ['Multi-platform Support', 'Batch Cleaning', 'Storage Analytics', 'Safe Deletion'],
        status: 'LIVE',
          featured: true
      }
    }),

    prisma.project.create({
      data: {
        title: 'InvenTree',
        description: 'Complete inventory management solution for small to medium businesses. Track stock, manage sales, and get detailed analytics - all for free. Multi-shop support with secure data protection.',
        image: 'https://kentom.co.ke/inventree.png',
        projectUrl: 'https://inventreez.vercel.app/',
        githubUrl: 'https://github.com/Raccoon254/stockmanager',
        tech: ['React', 'NextJs', 'Prisma', 'PostgreSQL'],
        year: '2025',
        category: 'Business Management',
        features: ['Inventory Tracking', 'Sales Management', 'Analytics & Reports', 'Multi-Shop Support'],
        status: 'LIVE',
        featured: true
      }
    })
  ])

  console.log(`✅ Created ${projects.length} projects`)

  // Create a few sample service requests for demonstration
  console.log('📋 Creating sample service requests...')
  const sampleRequests = await Promise.all([
    prisma.serviceRequest.create({
      data: {
        serviceId: services[0].id, // Web Development
        clientName: 'John Doe',
        clientEmail: 'john.doe@example.com',
        clientPhone: '+254712345678',
        company: 'Tech Innovations Ltd',
        projectTitle: 'E-commerce Website',
        description: 'We need a modern e-commerce website with payment integration, user authentication, and admin dashboard.',
        requirements: 'Must support mobile payments, inventory management, and have SEO optimization.',
        budget: 5000,
        timeline: '6-8 weeks',
        status: 'PENDING'
      }
    }),

    prisma.serviceRequest.create({
      data: {
        serviceId: services[1].id, // Mobile App Development
        clientName: 'Sarah Wilson',
        clientEmail: 'sarah.wilson@startup.co',
        company: 'StartupCo',
        projectTitle: 'Fitness Tracking App',
        description: 'A mobile app for tracking workouts, nutrition, and connecting with fitness communities.',
        budget: 7000,
        timeline: '10-12 weeks',
        status: 'IN_REVIEW'
      }
    }),

    prisma.serviceRequest.create({
      data: {
        serviceId: services[3].id, // Technical Consultation
        clientName: 'Michael Chen',
        clientEmail: 'michael.chen@corp.com',
        company: 'Enterprise Corp',
        projectTitle: 'Architecture Review',
        description: 'Need consultation on microservices architecture and technology stack recommendations for scaling our platform.',
        budget: 300,
        timeline: '2 sessions',
        status: 'ACCEPTED'
      }
    })
  ])

  console.log(`✅ Created ${sampleRequests.length} sample service requests`)

  console.log('🎉 Database seeding completed successfully!')
  console.log(`
  📊 Summary:
  - Projects: ${projects.length}
  - Services: ${services.length}
  - Sample Requests: ${sampleRequests.length}
  `)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await prisma.$disconnect()
    //process.exit(1)
  })