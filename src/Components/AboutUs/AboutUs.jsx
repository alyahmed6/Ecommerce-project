import React from "react";

const AboutUs = () => {
  const team = [
    { name: "Alex", role: "Founder" },
    { name: "Jordan", role: "Head of Operations" },
    { name: "Taylor", role: "Product" },
    { name: "Morgan", role: "Customer Success" },
  ];

  return (
    <main className="pt-28 bg-gradient from-white to-zinc-50 text-zinc-900 min-h-screen">
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">We make great shopping simple</h1>
            <p className="text-zinc-600 mb-6 max-w-xl">
              Thoughtfully curated products, fast delivery, and human-first
              customer support. We build an experience that puts you first.
            </p>
            <div className="flex gap-4">
              <a href="/product" className="inline-block bg-blue-600 text-white px-5 py-3 rounded-lg shadow hover:bg-blue-700 transition">Shop Products</a>
              <a href="/Contact" className="inline-block border border-zinc-200 px-5 py-3 rounded-lg text-zinc-700 hover:bg-zinc-100 transition">Contact Us</a>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Our Promise</h3>
                <p className="text-zinc-600 mb-4">Quality, transparency, and fast support — always.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-zinc-50 rounded-lg text-center">
                    <div className="text-lg font-semibold">99%</div>
                    <div className="text-sm text-zinc-500">Satisfaction</div>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-lg text-center">
                    <div className="text-lg font-semibold">Fast</div>
                    <div className="text-sm text-zinc-500">Shipping</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid sm:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <h4 className="font-semibold mb-2">Curated Selection</h4>
            <p className="text-sm text-zinc-600">We hand-pick items to ensure quality and value.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <h4 className="font-semibold mb-2">Secure Checkout</h4>
            <p className="text-sm text-zinc-600">Your payment information is protected and private.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <h4 className="font-semibold mb-2">Support Team</h4>
            <p className="text-sm text-zinc-600">Real people ready to help with orders and returns.</p>
          </div>
        </div>

        <div className="mt-16">
          <h3 className="text-2xl font-bold mb-6 text-center">Meet the Team</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="bg-white p-6 rounded-xl text-center shadow-sm">
                <div className="w-20 h-20 rounded-full bg-blue-50 mx-auto flex items-center justify-center text-2xl font-bold text-blue-700">{member.name[0]}</div>
                <h4 className="mt-4 font-semibold">{member.name}</h4>
                <p className="text-sm text-zinc-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-gradient from-blue-50 to-white p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-xl font-bold">Want to partner with us?</h4>
            <p className="text-zinc-600">We'd love to hear from brands and creators.</p>
          </div>
          <a href="/Contact" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition">Get in touch</a>
        </div>
      </section>
    </main>
  );
};

export default AboutUs;