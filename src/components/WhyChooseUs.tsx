import { assetPath } from "../utils/assets";

const services = [
  {
    icon: "images/service-icons/1.png",
    title: "Global Reach",
  },
  {
    icon: "images/service-icons/2.png",
    title: "Expert Guidance",
  },
  {
    icon: "images/service-icons/3.png",
    title: "Specializing in Distressed Properties",
  },
  {
    icon: "images/service-icons/4.png",
    title: "Escrow",
  },
  {
    icon: "images/service-icons/5.png",
    title: "Guarantee Property Condition",
  },
  {
    icon: "images/service-icons/6.png",
    title: "1-Year Home Warranty",
  },
  {
    icon: "images/service-icons/7.png",
    title: "Free or Deeply Discounted Long-Term Stay Visa",
  },
  {
    icon: "images/service-icons/8.png",
    title: "Global Financing for Foreign Buyers",
  },
];

export function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <h2 className="font-serif text-4xl font-normal leading-tight text-[#1f1f1f] sm:text-5xl">
          Why Choose Us
        </h2>
        <p className="mt-4 text-sm leading-7 text-brand-gray sm:text-base">
          Buy, rent, or lease premium properties with expert guidance, global reach, and secure
          transactions.
        </p>
      </div>

      <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <article
            key={service.title}
            className="flex flex-col items-center px-2 text-center"
          >
            <img
              src={assetPath(service.icon)}
              alt={service.title}
              className="h-64 w-64 max-w-full object-contain sm:h-72 sm:w-72 lg:h-80 lg:w-80"
            />
          </article>
        ))}
      </div>
    </section>
  );
}
