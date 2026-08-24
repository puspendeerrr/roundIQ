import { PrismaClient, Role, UserStatus, VerificationStatus, Currency } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Platform Settings
  await prisma.platformSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      commissionPercentage: 20.0,
      gstPercentage: 18.0,
      minWithdrawalAmount: 500.0,
      currency: Currency.INR,
      autoApproveWithdrawals: false,
      invoicePrefix: 'INV',
      paymentTimeoutMins: 30,
    },
  });
  console.log('✅ Seeded Platform Settings');

  // 2. Seed Categories
  const categoriesData = [
    { name: 'DSA & Algorithms', slug: 'dsa', description: 'Data Structures, Algorithms, Problem Solving, Complexity Analysis' },
    { name: 'Frontend Engineering', slug: 'frontend', description: 'React, Next.js, JavaScript/TypeScript, Web Performance, HTML/CSS' },
    { name: 'Backend Engineering', slug: 'backend', description: 'Node.js, Express, Microservices, API Design, Databases' },
    { name: 'System Design', slug: 'system-design', description: 'High Availability, Scalability, Distributed Systems, Caching, DB Sharding' },
    { name: 'DevOps & Cloud', slug: 'devops', description: 'Docker, Kubernetes, AWS/GCP, CI/CD, Infrastructure as Code' },
    { name: 'QA & Automation', slug: 'qa', description: 'Automation Testing, Cypress, Jest, E2E Testing, Quality Assurance' },
    { name: 'Cyber Security', slug: 'cyber-security', description: 'Application Security, Pen Testing, OWASP, Cryptography' },
    { name: 'Behavioral & HR', slug: 'hr', description: 'Leadership Principles, STAR Method, Conflict Resolution, Culture Fit' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Seeded Categories');

  // 3. Seed Skills
  const skillsData = [
    { name: 'React.js', slug: 'react' },
    { name: 'Next.js', slug: 'nextjs' },
    { name: 'Node.js', slug: 'nodejs' },
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'Python', slug: 'python' },
    { name: 'Java', slug: 'java' },
    { name: 'PostgreSQL', slug: 'postgresql' },
    { name: 'Redis', slug: 'redis' },
    { name: 'Docker', slug: 'docker' },
    { name: 'AWS', slug: 'aws' },
    { name: 'System Architecture', slug: 'system-architecture' },
    { name: 'Dynamic Programming', slug: 'dp' },
    { name: 'Graphs & Trees', slug: 'graphs-trees' },
  ];

  for (const sk of skillsData) {
    await prisma.skill.upsert({
      where: { slug: sk.slug },
      update: {},
      create: sk,
    });
  }
  console.log('✅ Seeded Skills');

  // 4. Seed Admin User
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@roundiq.com' },
    update: {},
    create: {
      email: 'admin@roundiq.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      wallet: { create: {} },
    },
  });
  console.log('✅ Seeded Admin User:', adminUser.email);

  // 5. Seed Sample Student
  const studentPasswordHash = await bcrypt.hash('Student123!', 10);
  const studentUser = await prisma.user.upsert({
    where: { email: 'ananya@gmail.com' },
    update: {},
    create: {
      email: 'ananya@gmail.com',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      wallet: { create: {} },
      studentProfile: {
        create: {
          fullName: 'Ananya Sharma',
          college: 'PEC Chandigarh',
          degree: 'B.Tech Computer Science',
          experience: 'Final Year Student',
          bio: 'Passionate CS undergrad preparing for tier-1 SDE roles.',
        },
      },
    },
  });
  console.log('✅ Seeded Sample Student:', studentUser.email);

  // 6. Seed Sample Approved Interviewer
  const interviewerPasswordHash = await bcrypt.hash('Interviewer123!', 10);
  const categoryDSA = await prisma.category.findUnique({ where: { slug: 'dsa' } });
  const categoryFrontend = await prisma.category.findUnique({ where: { slug: 'frontend' } });

  const interviewerUser = await prisma.user.upsert({
    where: { email: 'priya.verma@gmail.com' },
    update: {},
    create: {
      email: 'priya.verma@gmail.com',
      passwordHash: interviewerPasswordHash,
      role: Role.INTERVIEWER,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      wallet: { create: {} },
      interviewerProfile: {
        create: {
          fullName: 'Priya Verma',
          headline: 'Senior SDE @ Flipkart | Ex-Amazon',
          bio: 'Conducted 120+ technical interviews at Flipkart and Amazon.',
          currentCompany: 'Flipkart',
          previousCompanies: ['Amazon', 'Swiggy'],
          yearsOfExperience: 8,
          languages: ['English', 'Hindi'],
          linkedinUrl: 'https://linkedin.com',
          githubUrl: 'https://github.com',
          verificationStatus: VerificationStatus.APPROVED,
          verifiedAt: new Date(),
          ...(categoryDSA && categoryFrontend && {
            categories: {
              create: [
                { categoryId: categoryDSA.id },
                { categoryId: categoryFrontend.id },
              ],
            },
          }),
        },
      },
    },
  });
  console.log('✅ Seeded Approved Interviewer:', interviewerUser.email);

  // Ensure wallets exist for all users
  const usersWithoutWallet = await prisma.user.findMany({
    where: { wallet: null },
  });

  for (const u of usersWithoutWallet) {
    await prisma.wallet.create({
      data: { userId: u.id },
    });
  }

  // 7. Seed Achievements Badges Catalog
  const achievementsData = [
    { badgeName: 'Top Rated', description: 'Maintains an average rating above 4.8 stars', icon: 'Star', criteria: 'AVG_RATING_4_8', level: 'GOLD' },
    { badgeName: 'Top Mentor', description: 'Completed over 50 verified technical interviews', icon: 'Award', criteria: 'COMPLETED_50', level: 'GOLD' },
    { badgeName: '100 Interviews', description: 'Completed 100+ interviews on RoundIQ platform', icon: 'ShieldCheck', criteria: 'COMPLETED_100', level: 'PLATINUM' },
    { badgeName: 'Fast Responder', description: 'Responds to booking requests within 2 hours', icon: 'Zap', criteria: 'RESPONSE_TIME_2H', level: 'SILVER' },
    { badgeName: 'Trusted Expert', description: 'Zero cancellation rate across all bookings', icon: 'CheckCircle2', criteria: 'ZERO_CANCELLATION', level: 'GOLD' },
  ];

  for (const ach of achievementsData) {
    await prisma.achievement.upsert({
      where: { badgeName: ach.badgeName },
      update: {},
      create: ach,
    });
  }
  console.log('✅ Seeded Achievements Catalog');

  // Ensure reputation records exist for all users
  const allUsers = await prisma.user.findMany({
    include: { reputation: true },
  });

  for (const u of allUsers) {
    if (!u.reputation) {
      await prisma.reputation.create({
        data: { userId: u.id },
      });
    }
  }
  console.log('✅ Seeded Reputation Records');

  // 8. Seed Verified Companies & Sample Recruiter
  const companyFlipkart = await prisma.company.upsert({
    where: { slug: 'flipkart' },
    update: {},
    create: {
      name: 'Flipkart',
      slug: 'flipkart',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
      website: 'https://flipkart.com',
      description: 'India leading e-commerce marketplace platform empowering millions of sellers and buyers.',
      industry: 'E-Commerce / Technology',
      companySize: '10,000+ employees',
      headquarters: 'Bengaluru, Karnataka',
      foundedYear: 2007,
      verified: true,
    },
  });

  const recruiterPasswordHash = await bcrypt.hash('Recruiter123!', 10);
  const recruiterUser = await prisma.user.upsert({
    where: { email: 'recruiter@flipkart.com' },
    update: {},
    create: {
      email: 'recruiter@flipkart.com',
      passwordHash: recruiterPasswordHash,
      role: Role.RECRUITER,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      wallet: { create: {} },
      reputation: { create: {} },
      recruiterProfile: {
        create: {
          companyId: companyFlipkart.id,
          designation: 'Lead Technical Recruiter',
          workEmail: 'recruiter@flipkart.com',
          phone: '+919876543210',
          verificationStatus: VerificationStatus.APPROVED,
        },
      },
    },
  });
  console.log('✅ Seeded Verified Company & Recruiter:', recruiterUser.email);

  // 9. Seed Discount Coupons
  await prisma.coupon.upsert({
    where: { code: 'ROUNDIQ10' },
    update: {},
    create: {
      code: 'ROUNDIQ10',
      type: 'PERCENTAGE',
      discountValue: 10.0,
      minBookingValue: 500,
      maxUses: 500,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'WELCOME500' },
    update: {},
    create: {
      code: 'WELCOME500',
      type: 'FIXED_AMOUNT',
      discountValue: 200.0,
      minBookingValue: 1000,
      maxUses: 1000,
    },
  });
  console.log('✅ Seeded Discount Coupons');

  // 10. Seed Email Templates
  await prisma.emailTemplate.upsert({
    where: { templateKey: 'BOOKING_CONFIRMED' },
    update: {},
    create: {
      templateKey: 'BOOKING_CONFIRMED',
      subject: 'Your RoundIQ Technical Interview is Confirmed!',
      htmlBody: '<h1>Session Confirmed</h1><p>Your mock interview session is confirmed. Meeting link: {{meetingUrl}}</p>',
      variables: ['studentName', 'interviewerName', 'scheduledStart', 'meetingUrl'],
    },
  });
  console.log('✅ Seeded Default Email Templates');

  // 11. Seed CMS Legal Pages
  const cmsPages = [
    {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      category: 'LEGAL',
      content: '<h2>RoundIQ Privacy Policy</h2><p>Your privacy is important to us. We handle personal data strictly in compliance with GDPR standards...</p>',
    },
    {
      slug: 'terms-of-service',
      title: 'Terms of Service',
      category: 'LEGAL',
      content: '<h2>RoundIQ Terms of Service</h2><p>By using the RoundIQ platform, you agree to our marketplace conduct and booking rules...</p>',
    },
    {
      slug: 'refund-policy',
      title: 'Cancellation & Refund Policy',
      category: 'LEGAL',
      content: '<h2>RoundIQ Refund Policy</h2><p>Bookings cancelled over 48 hours prior to scheduled start are eligible for 100% full refund...</p>',
    },
  ];

  for (const page of cmsPages) {
    await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }
  console.log('✅ Seeded CMS Legal Pages');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
