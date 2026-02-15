import React from "react";
import Image from "next/image";

const ProcessSection = () => {
  const steps = [
    {
      number: 1,
      title: "Find your visa",
      description:
        "Use our visa checker to know exactly what's needed — no confusion.",
      icon: "/images/home/step1-icon.png",
      bgColor: "bg-[#62E9C9]",
    },
    {
      number: 2,
      title: "Apply and pay in minutes",
      description:
        "Enter your travel details, pay securely, and upload the required documents",
      icon: "/images/home/step2-icon.png",
      bgColor: "bg-[#CDEFBE]",
    },
    {
      number: 3,
      title: "We take care of everything",
      description:
        "Our smart technology and expert team review your application to ensure smooth approval.",
      icon: "/images/home/step3-icon.png",
      bgColor: "bg-[#62E9C9]",
    },
  ];

  return (
    <div className="py-12 md:py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Side - Image */}
          <div className="relative flex justify-center lg:justify-start order-2 lg:order-1">
            <div className="relative w-full max-w-[400px] md:max-w-[500px]">
              <Image
                src="/images/home/process.png"
                alt="Happy traveler"
                width={500}
                height={600}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Right Side - Process Steps */}
          <div className="order-1 lg:order-2">
            <h2 className="text-[22px] md:text-[28px] lg:text-[36px] font-medium text-black mb-6 md:mb-12">
              Our easy Process
            </h2>

            <div className="space-y-6 md:space-y-8">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="flex gap-4 md:gap-6 items-start"
                >
                  {/* Icon Circle */}
                  <div
                    className={`${step.bgColor} rounded-full w-16 md:w-20 h-16 md:h-20 flex items-center justify-center flex-shrink-0`}
                  >
                    <Image
                      src={step.icon}
                      alt={step.title}
                      width={40}
                      height={40}
                      className="w-10 h-10"
                    />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 pt-1 md:pt-2">
                    <h3 className="text-[13px] md:text-[14px] font-bold text-black mb-1 md:mb-2">
                      {step.number}. {step.title}
                    </h3>
                    <p className="text-[12px] md:text-[14px] font-medium text-black leading-[20px] md:leading-[25px]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessSection;
