"use client"
import React from 'react';
import { Activity, Bell, Shield, Clock,  ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

function App() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">

      <main>
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              Monitor Your Services with Confidence
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Get instant alerts and detailed insights when your services go down. Keep your business running 24/7 with enterprise-grade monitoring.
            </p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => router.push('/dashboard')} className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors">
                <span>Start Monitoring</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="border border-gray-700 hover:border-gray-600 px-6 py-3 rounded-lg transition-colors">
                View Demo
              </button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-gray-800/50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose UptimeGuard?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Bell className="w-6 h-6 text-blue-500" />}
                title="Instant Alerts"
                description="Get notified immediately when your services experience downtime through multiple channels."
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6 text-blue-500" />}
                title="99.9% Uptime"
                description="Our monitoring infrastructure is built for reliability and high availability."
              />
              <FeatureCard
                icon={<Clock className="w-6 h-6 text-blue-500" />}
                title="24/7 Monitoring"
                description="Round-the-clock monitoring from multiple global locations for accurate results."
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <StatCard number="99.9%" label="Average Uptime" />
              <StatCard number="150+" label="Monitoring Locations" />
              <StatCard number="10,000+" label="Active Users" />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-900/50 to-purple-900/50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Start Monitoring?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of companies who trust UptimeGuard for their monitoring needs.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg flex items-center space-x-2 mx-auto transition-colors">
              <span>Get Started for Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="w-6 h-6 text-blue-500" />
                <span className="text-xl font-bold">UptimeGuard</span>
              </div>
              <p className="text-gray-400">
                Enterprise-grade monitoring for modern businesses.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 rounded-lg bg-gray-800 border border-gray-700">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function StatCard({ number, label }) {
  return (
    <div className="p-6 rounded-lg bg-gray-800 border border-gray-700">
      <div className="text-4xl font-bold text-blue-500 mb-2">{number}</div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
}

export default App;