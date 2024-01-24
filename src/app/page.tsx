import Image from "next/image";

export default function Home() {
  const data = ["Software Developer", "UI/UX Designer", "Digital Marketer"];

  return (
    <div className="flex flex-col lg:flex-row h-full justify-evenly items-center px-8 sm:px-16 pt-24 lg:mt-0">
      <Image src="/face2.svg" alt="My SVG" width={400} height={400} />
      <div className="lg:h-full flex flex-col justify-center">
        <div className="hidden lg:block">
          <p className="text-[64px] font-[500] leading-[80px]">Hey,</p>
          <div className="flex flex-row gap-[20px] text-[80px] font-[300] leading-[80px]">
            <p>I am</p>
            <p className="font-[700] bg-gradient-to-r from-[#FFCA30] via-[#FF01A2] to-[#B94DDC] bg-clip-text text-transparent">
              Avilash
            </p>
          </div>
        </div>
        <div className="block lg:hidden">
          <p className="text-[60px] sm:text-[80px] font-[300] text-center leading-[80px]">
            <span className="font-[500]">Hey,</span> I am{" "}
            <span className="font-[700] bg-gradient-to-r from-[#FFCA30] via-[#FF01A2] to-[#B94DDC] bg-clip-text text-transparent">
              Avilash
            </span>
          </p>
        </div>
        <div className="flex flex-row gap-[20px] text-[20px] font-[600] mt-[20px] justify-center">
          {data.map((item, i) => (
            <>
              <p key={item} className="text-center">
                {item}
              </p>
              {i !== data.length - 1 && (
                <Image src="/dot.svg" alt="My SVG" width={10} height={10} />
              )}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
