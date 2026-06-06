# BOW — Budget On Work 💴✈️

**Budget On Work (BOW)** is an ultra-modern, automated productivity and earnings tracker designed explicitly for part-time workers in Japan (such as international students or visa holders navigating strict operational limits). 

The platform optimizes shift logging, ensures complete legal immigration compliance, calculates night shift premiums automatically, and bridges the gap between active working hours and long-term tech/savings goals.

---

## ✨ Features

- **🎯 Legal 28-Hour Safety Tracker:** Stay fully compliant with Japanese student visa regulations effortlessly via automated hourly caps monitoring.
- **💴 Smart Auto-Earnings Calculations:** Instant real-time gross payout estimations directly using configured branch contract base wages.
- **🌙 Statutory Night Premium Multipliers:** Automated 25% statutory wage adjustments for late-night shifts worked between 22:00 and 05:00.
- **⏱️ Advanced Work Logs with Break Tracking:** Support for fluid clock-in/clock-out timestamps, break durations, and overnight shift transitions.
- **🎯 Savings Allocation Ecosystem:** Link your hard-earned income streams to customized financial goals (e.g., tech upgrades, device purchases, or budgets).
- **🎨 Premium Dark UI UX:** Built with glassmorphism layouts, custom interactive previews, dynamic inputs, and a fully fluid, sleek responsive sidebar viewport.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router architecture)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Custom UI layouts, animations, and typography elements)
- **Database & Authentication:** [Supabase](https://supabase.com/) (Real-time schema streaming, relational data mapping, and identity isolation management)
- **Language:** TypeScript

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your local setup environment.

### 2. Installation
Clone the repository and install the project's dependencies:
```bash
git clone <your-github-repo-url>
cd bow
npm install

3. Environment Configurations

Create a .env.local file in the root directory of your project and configure your Supabase cluster tokens:
Code snippet

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key

4. Running Locally

Spin up the Next.js development server local viewport:
Bash

npm run dev

Open http://localhost:3000 inside your web browser to interact with the platform layout interface!
📂 Project Architecture
Plaintext

app/
├── (auth)/              # Authentication view ports
│   ├── login/
│   └── register/
├── dashboard/           # Main workspace shell
│   ├── layout.tsx       # Core sticky side-navbar wrapper layout
│   ├── page.tsx         # Dashboard metrics analytics summary view
│   ├── jobs/            # Active contract parameter profiles panel
│   ├── shifts/          # Historical work log entries page
│   └── settings/        # Compliance thresholds and display criteria configuration
components/
└── Sidebar.tsx          # Dynamic pathname-tracking navigation dashboard sidebar
lib/
└── supabase/            # Client initialization wrappers and database adapters

🤝 License

This project is built as a custom full-stack utility ecosystem. All rights reserved.


### 💡 Tips for using this file:
1. Create a file named **`README.md`** exactly in the root directory of your project (the same place where your `package.json` file is).
2. Paste the code block above into it.
3. Replace `<your-github-repo-url>` with your actual repository link once it's created on GitHub, and it will look highly polished on your repository dashboard.