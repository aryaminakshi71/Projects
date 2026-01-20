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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Project Management
            <span className="text-purple-600"> That Works</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Plan, track, and deliver projects on time. Collaborate with your team and achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleTryDemo}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold border-2 border-purple-600 hover:bg-purple-50 transition-colors"
            >
              Try Demo
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Projects
          </h2>
          <p className="text-xl text-gray-600">
            Powerful features to help you deliver projects successfully
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <feature.icon className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="container mx-auto px-4 py-20 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Choose the plan that works for your team
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`bg-white p-8 rounded-xl shadow-lg border-2 ${
                plan.popular ? "border-purple-600 scale-105" : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="bg-purple-600 text-white text-center py-1 rounded-t-lg -mt-8 -mx-8 mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleGetStarted}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
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
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Manage Projects Better?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of teams delivering projects on time and on budget
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}
