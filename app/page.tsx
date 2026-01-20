"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SignUpButton, useUser } from "@clerk/nextjs";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckSquare,
  Users,
  Shield,
  ArrowRight,
  Layout,
  Clock,
  MessageCircle,
  FileUp,
  Tags,
  ListTodo,
  BarChart3,
  ChevronRight,
  Star,
  Layers,
  Target,
  Sparkles,
  Play,
} from "lucide-react";
import Navbar from "@/components/navbar";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleOnHover = {
  scale: 1.05,
  transition: { duration: 0.2 }
};

export default function HomePage() {
  const { isSignedIn } = useUser();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    {
      icon: CheckSquare,
      title: "Task Management",
      description: "Organize tasks with intuitive drag-and-drop boards",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together in real-time with your team",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: MessageCircle,
      title: "Team Chat",
      description: "Instant messaging for seamless communication",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: FileUp,
      title: "File Attachments",
      description: "Upload and share files directly with tasks",
      color: "from-orange-500 to-amber-500",
    },
    {
      icon: Tags,
      title: "Smart Tags",
      description: "Organize with color-coded labels and tags",
      color: "from-red-500 to-rose-500",
    },
    {
      icon: ListTodo,
      title: "Checklists",
      description: "Break tasks into actionable checklists",
      color: "from-indigo-500 to-violet-500",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Track progress with detailed insights",
      color: "from-teal-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption and compliance",
      color: "from-slate-500 to-gray-600",
    },
  ];

  const stats = [
    { value: "100%", label: "Free Forever", icon: Star },
    { value: "∞", label: "Unlimited Boards", icon: Layers },
    { value: "24/7", label: "Available", icon: Clock },
    { value: "0", label: "Hidden Fees", icon: Target },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      content: "This tool transformed how our team collaborates. Best project management app ever!",
      avatar: "SJ",
      color: "bg-blue-500",
    },
    {
      name: "Ahmed Hassan",
      role: "Team Lead",
      content: "The real-time features and beautiful design make work enjoyable. Highly recommended!",
      avatar: "AH",
      color: "bg-purple-500",
    },
    {
      name: "Maria Garcia",
      role: "Startup Founder",
      content: "Finally, a free tool with all premium features. Our productivity increased 10x!",
      avatar: "MG",
      color: "bg-green-500",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[900px] h-[900px] rounded-full bg-gradient-to-r from-violet-600/30 via-fuchsia-500/20 to-pink-500/30 blur-3xl"
          animate={{
            x: mousePosition.x - 450,
            y: mousePosition.y - 450,
          }}
          transition={{ type: "spring", stiffness: 40, damping: 15 }}
          style={{ position: "fixed", top: 0, left: 0 }}
        />
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-indigo-500/15 blur-3xl"
          animate={{
            x: mousePosition.x - 350,
            y: mousePosition.y - 350,
          }}
          transition={{ type: "spring", stiffness: 25, damping: 20, delay: 0.1 }}
          style={{ position: "fixed", top: 0, left: 0 }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 blur-3xl"
          animate={{
            x: mousePosition.x - 250,
            y: mousePosition.y - 250,
          }}
          transition={{ type: "spring", stiffness: 35, damping: 25, delay: 0.2 }}
          style={{ position: "fixed", top: 0, left: 0 }}
        />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20 md:py-32 lg:py-40 text-center">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="max-w-6xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8"
          >
            <Sparkles className="h-4 w-4" />
            <span>Now with AI-powered features</span>
            <ChevronRight className="h-4 w-4" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Organize your work,{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              achieve more
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            The ultimate project management tool for modern teams. Create boards, 
            organize tasks, collaborate seamlessly. All features, all free, forever.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
          >
            {isSignedIn ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="text-lg px-10 h-14 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 shadow-xl shadow-fuchsia-500/25 border-0" asChild>
                  <a href="/dashboard" className="flex items-center gap-2">
                    Go to Dashboard <ArrowRight className="h-5 w-5" />
                  </a>
                </Button>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <SignUpButton>
                  <Button size="lg" className="text-lg px-10 h-14 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 shadow-xl shadow-fuchsia-500/25 border-0">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignUpButton>
              </motion.div>
            )}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="lg" className="text-lg px-8 h-14 border-2 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm rounded-xl">
                <Play className="mr-2 h-5 w-5" /> Watch Demo
              </Button>
            </motion.div>
          </motion.div>

           {/* Stats */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${index % 2 === 0 ? 'from-violet-500 to-fuchsia-500' : 'from-cyan-500 to-blue-500'} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative container mx-auto px-4 py-24">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {/* Section Header */}
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to boost your productivity and streamline your workflow.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={scaleOnHover}
                viewport={{ once: true }}
              >
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 h-full group overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-15 transition-opacity duration-300`} />
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />
                  <CardHeader className="relative z-10 pt-6">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg shadow-black/20`}
                    >
                      <feature.icon className="h-7 w-7 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl text-white text-center group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-cyan-400 group-hover:to-fuchsia-400 transition-all duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-center text-gray-400 group-hover:text-gray-300 transition-colors">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="relative container mx-auto px-4 py-24">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Get started in minutes with our intuitive workflow
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { step: "01", title: "Create Board", desc: "Start by creating your first project board", icon: Layout },
              { step: "02", title: "Add Tasks", desc: "Organize work with columns and tasks", icon: CheckSquare },
              { step: "03", title: "Collaborate", desc: "Work together in real-time with your team", icon: Users },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="relative p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 text-center group overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${index === 0 ? 'from-violet-500/10' : index === 1 ? 'from-fuchsia-500/10' : 'from-pink-500/10'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.4 }}
                  className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${index === 0 ? 'from-violet-600 to-fuchsia-600' : index === 1 ? 'from-fuchsia-600 to-pink-600' : 'from-pink-600 to-rose-600'} flex items-center justify-center shadow-xl shadow-black/20`}
                >
                  <item.icon className="h-10 w-10 text-white" />
                </motion.div>
                <div className="text-6xl font-bold text-white/5 mb-4 absolute top-4 right-4">{item.step}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="relative container mx-auto px-4 py-24">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Loved by thousands
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              See what our users are saying about us
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`w-14 h-14 rounded-2xl ${testimonial.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                  >
                    {testimonial.avatar}
                  </motion.div>
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex gap-1 mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative container mx-auto px-4 py-24">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeInUp}
            className="relative p-16 rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 overflow-hidden"
          >
            {/* Animated background elements */}
            <motion.div
              className="absolute top-0 left-0 w-80 h-80 rounded-full bg-white/10 blur-3xl"
              animate={{
                x: [0, 150, 0],
                y: [0, 75, 0],
              }}
              transition={{ duration: 15, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/10 blur-3xl"
              animate={{
                x: [0, -150, 0],
                y: [0, -75, 0],
              }}
              transition={{ duration: 18, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />

            <div className="relative z-10 text-center">
              <motion.h2
                variants={fadeInUp}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                Ready to boost your productivity?
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-xl text-white/80 max-w-2xl mx-auto mb-10"
              >
                Join thousands of teams already using our platform to organize their work and achieve more.
              </motion.p>
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                {isSignedIn ? (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="text-lg px-10 h-14 bg-white text-violet-600 hover:bg-gray-100 shadow-2xl rounded-xl" asChild>
                      <a href="/dashboard" className="flex items-center gap-2">
                        Go to Dashboard <ArrowRight className="h-5 w-5" />
                      </a>
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <SignUpButton>
                      <Button size="lg" className="text-lg px-10 h-14 bg-white text-violet-600 hover:bg-gray-100 shadow-2xl rounded-xl">
                        Start Free Forever <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </SignUpButton>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
