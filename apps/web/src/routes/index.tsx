import { createFileRoute } from "@tanstack/react-router";
import { FolderKanban, Users, Calendar, BarChart3, Zap, Shield, ArrowRight, Check, Target, Clock } from "lucide-react";

const features = [
  { 
    icon: FolderKanban, 
    title: "Project Management", 
    description: "Organize projects with kanban boards, timelines, and task management. Keep everything in one place." 
  },
  { 
    icon: Users, 
    title: "Team Collaboration", 
    description: "Assign tasks, track progress, and collaborate seamlessly with your team members." 
  },
  { 
    icon: Calendar, 
    title: "Timeline Planning", 
    description: "Plan projects with Gantt charts, set deadlines, and track milestones effortlessly." 
  },
  { 
    icon: Target, 
    title: "Goal Tracking", 
    description: "Set project goals, track KPIs, and measure success with comprehensive analytics." 
  },
  { 
    icon: Zap, 
    title: "Automation", 
    description: "Automate repetitive tasks and workflows to save time and increase productivity." 
  },
  { 
    icon: BarChart3, 
    title: "Analytics & Reports", 
    description: "Get insights into project performance, team productivity, and resource utilization." 
  },
];

const pricingPlans = [
  { 
    name: "Starter", 
    price: 29, 
    features: [
      "Up to 10 projects",
      "5 team members",
      "Basic task management",
      "File sharing",
      "Email support"
    ], 
    popular: false 
  },
  { 
    name: "Professional", 
    price: 79, 
    features: [
      "Unlimited projects",
      "Unlimited team members",
      "Advanced analytics",
      "Time tracking",
      "Custom workflows",
      "Priority support",
      "API access"
    ], 
    popular: true 
  },
  { 
    name: "Enterprise", 
    price: 199, 
    features: [
      "Unlimited everything",
      "Advanced security",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
      "Training & onboarding",
      "White-label option"
    ], 
    popular: false 
  },
];

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const handleGetStarted = () => {
    window.location.href = "/signup";
  };

  const handleTryDemo = () => {
    // Set demo mode and navigate to app
    localStorage.setItem("demo_mode", "true");
    window.location.href = "/app/projects";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Project Management
            <span className="text-primary"> That Works</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Plan, track, and deliver projects on time. Collaborate with your team and achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleTryDemo}
              className="bg-card text-primary px-8 py-3 rounded-lg font-semibold border-2 border-primary hover:bg-accent transition-colors"
            >
              Try Demo
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Everything You Need to Manage Projects
          </h2>
          <p className="text-xl text-muted-foreground">
            Powerful features to help you deliver projects successfully
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-card p-6 rounded-xl border border-border hover:border-primary/50 transition-all">
              <feature.icon className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-card-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="container mx-auto px-4 py-20 bg-secondary">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            Choose the plan that works for your team
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`bg-card p-8 rounded-xl border-2 transition-all ${
                plan.popular ? "border-primary scale-105" : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="bg-primary text-primary-foreground text-center py-1 rounded-t-lg -mt-8 -mx-8 mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-card-foreground mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleGetStarted}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-4 text-primary-foreground">Ready to Manage Projects Better?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join thousands of teams delivering projects on time and on budget
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-card text-primary px-8 py-3 rounded-lg font-semibold hover:bg-card/90 border border-border transition-colors"
          >
            Start Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}
