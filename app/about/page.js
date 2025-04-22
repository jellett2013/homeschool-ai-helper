'use client';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="max-w-3xl mx-auto mt-16">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">About Homeschool Help</h1>
        <p className="mb-6 text-lg leading-relaxed">
          <strong>Homeschool Help</strong> is your all-in-one curriculum planning assistant —
          built for busy homeschool parents who want less overwhelm and more clarity.
        </p>

        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-1">🎯 Our Mission</h2>
            <p>
              We believe every family deserves a simpler, smarter way to homeschool.
              Our mission is to give parents their time back — to spend less of it researching curriculum
              and more of it creating meaningful experiences with their children.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-1">🧠 How It Works</h2>
            <p>
              We use AI to recommend personalized homeschool curriculum options, align them to your state's
              requirements (if you choose), and generate a printable weekly schedule that fits your family's rhythm.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-1">👩‍🏫 Who It's For</h2>
            <p>
              Whether you're brand new to homeschooling or a seasoned pro looking to streamline things,
              Homeschool Help is designed for parents who want structure without the stress.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-1">🌱 What’s Next</h2>
            <p>
              We're actively building features to support multiple student profiles, track progress, and
              integrate with your favorite resources. Stay tuned — this is just the beginning.
            </p>
          </div>
        </section>

        <div className="mt-10">
          <Link href="/">
            <button className="px-5 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
              ← Back to Home
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
