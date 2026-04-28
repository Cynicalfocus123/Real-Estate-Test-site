const services = [
  {
    icon: "/service-icons/1.png",
    title: "Global Reach",
  },
  {
    icon: "/service-icons/2.png",
    title: "Expert Guidance",
  },
  {
    icon: "/service-icons/3.png",
    title: "Specializing in Distressed Properties",
  },
  {
    icon: "/service-icons/4.png",
    title: "Escrow",
  },
  {
    icon: "/service-icons/5.png",
    title: "Guarantee Property Condition",
  },
  {
    icon: "/service-icons/6.png",
    title: "1-Year Home Warranty",
  },
  {
    icon: "/service-icons/7.png",
    title: "Free or Deeply Discounted Long-Term Stay Visa",
  },
  {
    icon: "/service-icons/8.png",
    title: "Global Financing for Foreign Buyers",
  },
];

export function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="mx-auto mb-12 max-w-4xl text-center">
        <h2 className="font-serif text-5xl font-normal leading-tight text-[#1f1f1f] sm:text-6xl">
          Why Choose Us
        </h2>
        <p className="mt-5 text-base leading-8 text-brand-gray sm:text-lg">
          Buy, rent, or lease premium properties with expert guidance, global reach, and secure
          transactions.
        </p>
      </div>

      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <article
            key={service.title}
            className="flex flex-col items-center px-2 text-center"
          >
            <img
              src={service.icon}
              alt={service.title}
              className="h-56 w-56 object-contain sm:h-64 sm:w-64 lg:h-72 lg:w-72"
            />
          </article>
        ))}
      </div>
    </section>
  );
}
