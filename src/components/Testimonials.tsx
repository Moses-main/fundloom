import React from "react";
import { motion } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Founder, EcoCrypto",
    content:
      "Fundloom helped us raise $50,000 in just 2 weeks for our green energy project. The platform made it easy to connect with backers who care about sustainability.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    stars: 5,
    amount: "$50K",
    time: "2 weeks",
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "Indie Game Developer",
    content:
      "As a solo developer, I was skeptical about running a campaign, but Fundloom made it simple. We hit our $25K goal in 10 days and the community support was incredible!",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    stars: 5,
    amount: "$25K",
    time: "10 days",
  },
  {
    id: 3,
    name: "Aisha Johnson",
    role: "Community Leader",
    content:
      "Our DAO used Fundloom to fund a community education program. The transparency features built on blockchain gave our backers confidence in how funds were being used.",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    stars: 4,
    amount: "$15K",
    time: "3 weeks",
  },
  {
    id: 4,
    name: "David Kim",
    role: "Open Source Developer",
    content:
      "The multi-currency support is a game-changer. We received contributions in ETH, USDC, and even traditional payments - all seamlessly integrated.",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    stars: 5,
    amount: "$32K",
    time: "1 month",
  },
];

const TestimonialCard = ({ testimonial, active, onClick }) => {
  return (
    <motion.div
      className={`relative bg-gray-800 p-8 rounded-2xl border border-gray-700 transition-all duration-300 cursor-pointer ${
        active
          ? "scale-100 opacity-100 shadow-xl"
          : "scale-95 opacity-70 hover:opacity-90"
      }`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: active ? 1 : 0.7, y: active ? 0 : 30 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
    >
      <Quote className="absolute top-6 right-6 h-8 w-8 text-indigo-500/20" />

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center">
          <div className="relative">
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500/30"
            />
            <div className="absolute -bottom-1 -right-1 bg-indigo-500 rounded-full p-1">
              <div className="bg-gray-900 p-0.5 rounded-full">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-blue-400 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="ml-4">
            <h4 className="font-bold text-white">{testimonial.name}</h4>
            <p className="text-sm text-gray-400">{testimonial.role}</p>
          </div>
        </div>
        <div className="bg-indigo-500/10 px-3 py-1 rounded-full text-sm font-medium text-indigo-400">
          {testimonial.amount} in {testimonial.time}
        </div>
      </div>

      <p className="text-gray-300 mb-6 leading-relaxed">
        "{testimonial.content}"
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < testimonial.stars
                  ? "text-yellow-400 fill-current"
                  : "text-gray-600"
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-gray-400">
            {testimonial.stars}.0/5.0
          </span>
        </div>
        <div className="text-indigo-400 hover:text-indigo-300 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  return (
    <section className="relative py-20 bg-gray-900 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0icGF0dGVybiIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjxwYXRoIGQ9Ik0gMTAgMCBMIDAgMCBMIDAgMTAgWiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 text-sm font-medium text-indigo-400 bg-indigo-500/10 rounded-full mb-4 border border-indigo-500/20">
            Success Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trusted by Innovators
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full mx-auto mb-8"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Join thousands of creators who've turned their ideas into reality
            with Fundloom
          </p>
        </motion.div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                active={index === activeIndex}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-white shadow-md text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === activeIndex ? "bg-indigo-600 w-8" : "bg-gray-300"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-white shadow-md text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: "10,000+", label: "Active Users" },
            { number: "$50M+", label: "Raised" },
            { number: "95%", label: "Success Rate" },
            { number: "24/7", label: "Support" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="p-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-gray-500 mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
