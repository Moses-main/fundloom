import React from 'react';
import { CreditCard, Zap, ShieldCheck, Users, ArrowRight } from 'lucide-react';


interface Feature {
  icon: React.ReactElement<any>;
  title: string;
  description: string;
  color: string;
  bg: string;
}

type FeatureCardProps = Feature;

const features: Feature[] = [
  {
    icon: <CreditCard className="w-6 h-6 text-indigo-400" />,
    title: 'Accept Crypto & Fiat',
    description: 'Seamless payments with multi-currency support.',
    color: 'from-indigo-500 to-blue-500',
    bg: 'bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20'
  },
  {
    icon: <Zap className="w-6 h-6 text-green-400" />,
    title: 'Instant Campaign Creation',
    description: 'Launch a campaign in minutes, no technical knowledge needed.',
    color: 'from-green-500 to-emerald-500',
    bg: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20'
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-purple-400" />,
    title: 'Transparent & Secure',
    description: 'Blockchain ensures trust and accountability.',
    color: 'from-purple-500 to-fuchsia-500',
    bg: 'bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20'
  },
  {
    icon: <Users className="w-6 h-6 text-amber-400" />,
    title: 'Community-Driven',
    description: 'Grow your project with global supporters.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20'
  }
];

const FeatureCard = ({ icon, title, description, color, bg }: FeatureCardProps) => {
  return (
    <div
            className={`group relative overflow-hidden p-0.5 rounded-xl ${bg} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                      >
      <div className="relative z-10 bg-white p-6 rounded-xl h-full">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${bg}`}>
          {React.cloneElement(icon, { className: `w-6 h-6 ${color.replace('from-', 'text-').split(' ')[0]}` })}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
        <div className="flex items-center text-sm font-medium text-indigo-600 group-hover:text-indigo-700 transition-colors">
          <span>Learn more</span>
          <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
    </div>
  );
};

const FeaturesSection = () => {

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0icGF0dGVybiIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjxwYXRoIGQ9Ik0gMTAgMCBMIDAgMCBMIDAgMTAgWiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-sm font-medium text-indigo-400 bg-indigo-500/10 rounded-full mb-4 border border-indigo-500/20">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need to Succeed
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full mx-auto mb-8"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Fundloom provides all the tools you need to launch and manage your campaign with confidence.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
      
      {/* Stats section */}
      <div className="mt-24 bg-white/5 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-5xl mx-4 sm:mx-auto border border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: '10K+', label: 'Campaigns' },
            { number: '$50M+', label: 'Raised' },
            { number: '500K+', label: 'Backers' },
            { number: '99.9%', label: 'Uptime' }
          ].map((stat, index) => (
            <div 
              key={stat.label}
              className="p-4"
                                                                    >
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-gray-500 mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { FeaturesSection };
