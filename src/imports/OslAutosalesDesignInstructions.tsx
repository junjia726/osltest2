import svgPaths from "./svg-osifl47v9h";
import imgImageMyvi from "figma:asset/4969cb98e1bd2ac64d221130f22df4c533324d01.png";
import imgImageKevinTan from "figma:asset/f10297b134ab753bec5538c1fb2e7eb7a98506a1.png";
import imgImageAhmadRazak from "figma:asset/87bb5eabdc9bc57da293e9890e54a98b91e17c35.png";
import imgImageNurulAisyah from "figma:asset/607db698cd92cede0e49afb8cc576e6756237bde.png";
import imgImageSitiFatimah from "figma:asset/8e77556fbd80c40daf79895064709c4348053e87.png";
import imgImageJessicaWong from "figma:asset/79abb86e407d9ba62b0f389efd332214a2dedb8c.png";

function ImageMyvi() {
  return (
    <div className="absolute h-[256px] left-0 top-0 w-[430px]" data-name="Image (Myvi)">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImageMyvi} />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p33f6b680} id="Vector" stroke="var(--stroke-0, #222222)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M15.8333 10H4.16667" id="Vector_2" stroke="var(--stroke-0, #222222)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.9)] content-stretch flex items-center justify-center left-[16px] rounded-[26843500px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.1)] size-[40px] top-[16px]" data-name="Button">
      <Icon />
    </div>
  );
}

function Container() {
  return (
    <div className="h-[256px] relative shrink-0 w-full" data-name="Container">
      <ImageMyvi />
      <Button />
    </div>
  );
}

function Heading() {
  return (
    <div className="absolute h-[36px] left-[20px] top-[24px] w-[390px]" data-name="Heading 1">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[36px] left-0 not-italic text-[#222] text-[24px] top-[-0.8px]">Myvi</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute h-[24px] left-[20px] top-[64px] w-[390px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#717182] text-[16px] top-[-0.6px]">The King of the Road</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="absolute h-[24px] left-[20px] top-[96px] w-[390px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#d32f2f] text-[16px] top-[-0.6px]">RM 46,800 - RM 58,800</p>
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Heading 4">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] left-0 not-italic text-[#222] text-[16px] top-[-0.6px]">Select Variant</p>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-[#d32f2f] border-[#d32f2f] border-[0.8px] border-solid h-[37.6px] left-0 rounded-[16px] top-0 w-[88.725px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-[44.5px] not-italic text-[14px] text-center text-white top-[8.6px]">1.3G MT</p>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-white border-[0.8px] border-[rgba(0,0,0,0.08)] border-solid h-[37.6px] left-[96.73px] rounded-[16px] top-0 w-[84.063px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-[41.5px] not-italic text-[#222] text-[14px] text-center top-[8.6px]">1.3X AT</p>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute bg-white border-[0.8px] border-[rgba(0,0,0,0.08)] border-solid h-[37.6px] left-[188.79px] rounded-[16px] top-0 w-[84.6px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-[41.5px] not-italic text-[#222] text-[14px] text-center top-[8.6px]">1.5H AT</p>
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute bg-white border-[0.8px] border-[rgba(0,0,0,0.08)] border-solid h-[37.6px] left-[281.39px] rounded-[16px] top-0 w-[97.013px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-[48px] not-italic text-[#222] text-[14px] text-center top-[8.6px]">1.5 AV AT</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[37.6px] relative shrink-0 w-full" data-name="Container">
      <Button1 />
      <Button2 />
      <Button3 />
      <Button4 />
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#717182] text-[14px] top-[0.6px]">Selected price</p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-0 not-italic text-[#222] text-[20px] top-[-0.4px]">RM 46,800</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="bg-[#f5f5f5] h-[80px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start pt-[16px] px-[16px] relative size-full">
        <Paragraph2 />
        <Paragraph3 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] h-[165.6px] items-start left-[20px] top-[144px] w-[390px]" data-name="Container">
      <Heading2 />
      <Container3 />
      <Container4 />
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[15.988px] relative shrink-0 w-[116.188px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#717182] text-[12px]">Select Sales Advisor</p>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[47.03px] size-[12px] top-[1.99px]" data-name="Icon">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d="M4.5 9L7.5 6L4.5 3" id="Vector" stroke="var(--stroke-0, #D32F2F)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="h-[15.988px] relative shrink-0 w-[59.025px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-[23px] not-italic text-[#d32f2f] text-[12px] text-center top-0">Change</p>
        <Icon1 />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[15.988px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Paragraph4 />
          <Button5 />
        </div>
      </div>
    </div>
  );
}

function ImageKevinTan() {
  return (
    <div className="relative rounded-[26843500px] shrink-0 size-[40px]" data-name="Image (Kevin Tan)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-cover pointer-events-none rounded-[26843500px] size-full" src={imgImageKevinTan} />
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#222] text-[14px] top-[0.6px]">Kevin Tan</p>
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-0 size-[12px] top-[1.99px]" data-name="Icon">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p2023d200} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p2d617c80} id="Vector_2" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[15.988px] relative shrink-0 w-full" data-name="Container">
      <Icon2 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[16px] not-italic text-[#717182] text-[12px] top-0">Johor Bahru</p>
    </div>
  );
}

function Container8() {
  return (
    <div className="flex-[1_0_0] h-[35.987px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Paragraph5 />
        <Container9 />
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p39be50} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container10() {
  return (
    <div className="bg-[#d32f2f] relative rounded-[26843500px] shrink-0 size-[24px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon3 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex gap-[12px] h-[40px] items-center relative shrink-0 w-full" data-name="Container">
      <ImageKevinTan />
      <Container8 />
      <Container10 />
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[8px] h-[97.588px] items-start left-[20px] pb-[0.8px] pt-[16.8px] px-[16.8px] rounded-[16px] top-[333.6px] w-[390px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.08)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <Container6 />
      <Container7 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute left-[109.65px] size-[20px] top-[16px]" data-name="Icon">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.ped54800} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p3b27f100} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Link() {
  return (
    <div className="bg-[#d32f2f] h-[52px] relative rounded-[16px] shrink-0 w-full" data-name="Link">
      <Icon4 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[137.65px] not-italic text-[16px] text-white top-[13.4px]">Configure This Car</p>
    </div>
  );
}

function Icon5() {
  return (
    <div className="absolute left-[124.93px] size-[20px] top-[16px]" data-name="Icon">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p2fb29300} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M6.66667 5H13.3333" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M13.3333 11.6667V15" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M13.3333 8.33333H13.3417" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10 8.33333H10.0083" id="Vector_5" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M6.66667 8.33333H6.675" id="Vector_6" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10 11.6667H10.0083" id="Vector_7" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M6.66667 11.6667H6.675" id="Vector_8" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10 15H10.0083" id="Vector_9" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M6.66667 15H6.675" id="Vector_10" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Link1() {
  return (
    <div className="bg-[#222] h-[52px] relative rounded-[16px] shrink-0 w-full" data-name="Link">
      <Icon5 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[152.93px] not-italic text-[16px] text-white top-[13.4px]">Calculate Loan</p>
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] h-[116px] items-start left-[20px] top-[463.19px] w-[390px]" data-name="Container">
      <Link />
      <Link1 />
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[603.188px] relative shrink-0 w-full" data-name="Container">
      <Heading />
      <Paragraph />
      <Paragraph1 />
      <Container2 />
      <Container5 />
      <Container11 />
    </div>
  );
}

function MainContent() {
  return (
    <div className="content-stretch flex flex-col h-[859.188px] items-start relative shrink-0 w-full" data-name="Main Content">
      <Container />
      <Container1 />
    </div>
  );
}

function Section() {
  return <div className="h-0 shrink-0 w-full" data-name="Section" />;
}

function Ty() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[80px] h-[594.4px] items-start left-0 px-[295px] top-0 w-[1020px]" data-name="TY">
      <MainContent />
      <Section />
    </div>
  );
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.p1023c700} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="absolute bg-[#25d366] content-stretch flex items-center justify-center left-[948px] rounded-[26843500px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] size-[56px] top-[586.4px]" data-name="Button">
      <Icon6 />
    </div>
  );
}

function Container13() {
  return <div className="absolute bg-[rgba(0,0,0,0.4)] h-[594.4px] left-0 top-0 w-[1020px]" data-name="Container" />;
}

function Heading1() {
  return (
    <div className="h-[27px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[27px] left-0 not-italic text-[#222] text-[18px] top-[0.4px]">Select Your Sales Advisor</p>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="content-stretch flex h-[15.988px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[16px] min-h-px min-w-px not-italic relative text-[#717182] text-[12px] whitespace-pre-wrap">Choose an SA to assist you</p>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[44.987px] relative shrink-0 w-[223.113px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative size-full">
        <Heading1 />
        <Paragraph6 />
      </div>
    </div>
  );
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M15 5L5 15" id="Vector" stroke="var(--stroke-0, #222222)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M5 5L15 15" id="Vector_2" stroke="var(--stroke-0, #222222)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button7() {
  return (
    <div className="relative rounded-[26843500px] shrink-0 size-[32px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon7 />
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[77.787px] relative shrink-0 w-[430px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.08)] border-b-[0.8px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pb-[0.8px] px-[20px] relative size-full">
        <Container16 />
        <Button7 />
      </div>
    </div>
  );
}

function Option() {
  return <div className="absolute left-[-315px] size-0 top-[-178.95px]" data-name="Option" />;
}

function Option1() {
  return <div className="absolute left-[-315px] size-0 top-[-178.95px]" data-name="Option" />;
}

function Option2() {
  return <div className="absolute left-[-315px] size-0 top-[-178.95px]" data-name="Option" />;
}

function Option3() {
  return <div className="absolute left-[-315px] size-0 top-[-178.95px]" data-name="Option" />;
}

function Option4() {
  return <div className="absolute left-[-315px] size-0 top-[-178.95px]" data-name="Option" />;
}

function Option5() {
  return <div className="absolute left-[-315px] size-0 top-[-178.95px]" data-name="Option" />;
}

function Dropdown() {
  return (
    <div className="bg-[#f5f5f5] h-[37.6px] relative rounded-[16px] shrink-0 w-full" data-name="Dropdown">
      <div aria-hidden="true" className="absolute border-[0.8px] border-[rgba(0,0,0,0.08)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <Option />
      <Option1 />
      <Option2 />
      <Option3 />
      <Option4 />
      <Option5 />
    </div>
  );
}

function Container17() {
  return (
    <div className="h-[62.4px] relative shrink-0 w-[430px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.08)] border-b-[0.8px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[0.8px] pt-[12px] px-[20px] relative size-full">
        <Dropdown />
      </div>
    </div>
  );
}

function ImageAhmadRazak() {
  return (
    <div className="relative rounded-[26843500px] shrink-0 size-[48px]" data-name="Image (Ahmad Razak)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-cover pointer-events-none rounded-[26843500px] size-full" src={imgImageAhmadRazak} />
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[20px] relative shrink-0 w-[92.713px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-0 not-italic text-[#222] text-[14px] top-[0.6px]">Ahmad Razak</p>
      </div>
    </div>
  );
}

function Icon8() {
  return (
    <div className="absolute left-[6px] size-[10px] top-[4.5px]" data-name="Icon">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
        <g id="Icon">
          <path d={svgPaths.p57a9580} id="Vector" stroke="var(--stroke-0, #D32F2F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333" />
          <path d={svgPaths.p2926d600} id="Vector_2" stroke="var(--stroke-0, #D32F2F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333" />
        </g>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="bg-[rgba(211,47,47,0.1)] h-[19px] relative rounded-[26843500px] shrink-0 w-[121.5px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon8 />
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[15px] left-[18px] not-italic text-[#d32f2f] text-[10px] top-[1.8px]">Top Performer 2025</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex gap-[8px] h-[20px] items-center relative shrink-0 w-full" data-name="Container">
      <Paragraph7 />
      <Text />
    </div>
  );
}

function Icon9() {
  return (
    <div className="absolute left-0 size-[12px] top-[1.99px]" data-name="Icon">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p2023d200} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p2d617c80} id="Vector_2" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Container22() {
  return (
    <div className="h-[15.988px] relative shrink-0 w-full" data-name="Container">
      <Icon9 />
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-[16px] not-italic text-[#717182] text-[12px] top-0">Kuala Lumpur City Centre, Kuala Lumpur</p>
    </div>
  );
}

function Container20() {
  return (
    <div className="flex-[1_0_0] h-[37.987px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative size-full">
        <Container21 />
        <Container22 />
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[48px] items-center left-[17.6px] top-[17.6px] w-[339.6px]" data-name="Container">
      <ImageAhmadRazak />
      <Container20 />
    </div>
  );
}

function Button8() {
  return (
    <div className="h-[83.2px] relative rounded-[16px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[1.6px] border-[rgba(0,0,0,0.08)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <Container19 />
    </div>
  );
}

function ImageNurulAisyah() {
  return (
    <div className="relative rounded-[26843500px] shrink-0 size-[48px]" data-name="Image (Nurul Aisyah)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-cover pointer-events-none rounded-[26843500px] size-full" src={imgImageNurulAisyah} />
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="h-[20px] relative shrink-0 w-[86.85px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-0 not-italic text-[#222] text-[14px] top-[0.6px]">Nurul Aisyah</p>
      </div>
    </div>
  );
}

function Icon10() {
  return (
    <div className="absolute left-[6px] size-[10px] top-[4.5px]" data-name="Icon">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
        <g id="Icon">
          <path d={svgPaths.p57a9580} id="Vector" stroke="var(--stroke-0, #D32F2F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333" />
          <path d={svgPaths.p2926d600} id="Vector_2" stroke="var(--stroke-0, #D32F2F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333" />
        </g>
      </svg>
    </div>
  );
}

function Text1() {
  return (
    <div className="bg-[rgba(211,47,47,0.1)] h-[19px] relative rounded-[26843500px] shrink-0 w-[116.55px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon10 />
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[15px] left-[18px] not-italic text-[#d32f2f] text-[10px] top-[1.8px]">{`Customer's Choice`}</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex gap-[8px] h-[20px] items-center relative shrink-0 w-full" data-name="Container">
      <Paragraph8 />
      <Text1 />
    </div>
  );
}

function Icon11() {
  return (
    <div className="absolute left-0 size-[12px] top-[1.99px]" data-name="Icon">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p2023d200} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p2d617c80} id="Vector_2" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Container26() {
  return (
    <div className="h-[15.988px] relative shrink-0 w-full" data-name="Container">
      <Icon11 />
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-[16px] not-italic text-[#717182] text-[12px] top-0">George Town, Penang</p>
    </div>
  );
}

function Container24() {
  return (
    <div className="flex-[1_0_0] h-[37.987px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative size-full">
        <Container25 />
        <Container26 />
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[48px] items-center left-[17.6px] top-[17.6px] w-[339.6px]" data-name="Container">
      <ImageNurulAisyah />
      <Container24 />
    </div>
  );
}

function Button9() {
  return (
    <div className="h-[83.2px] relative rounded-[16px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[1.6px] border-[rgba(0,0,0,0.08)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <Container23 />
    </div>
  );
}

function ImageKevinTan1() {
  return (
    <div className="relative rounded-[26843500px] shrink-0 size-[48px]" data-name="Image (Kevin Tan)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-cover pointer-events-none rounded-[26843500px] size-full" src={imgImageKevinTan} />
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[20px] relative shrink-0 w-[66.113px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-0 not-italic text-[#222] text-[14px] top-[0.6px]">Kevin Tan</p>
      </div>
    </div>
  );
}

function Icon12() {
  return (
    <div className="absolute left-[6px] size-[10px] top-[4.5px]" data-name="Icon">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
        <g id="Icon">
          <path d={svgPaths.p57a9580} id="Vector" stroke="var(--stroke-0, #D32F2F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333" />
          <path d={svgPaths.p2926d600} id="Vector_2" stroke="var(--stroke-0, #D32F2F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333" />
        </g>
      </svg>
    </div>
  );
}

function Text2() {
  return (
    <div className="bg-[rgba(211,47,47,0.1)] h-[19px] relative rounded-[26843500px] shrink-0 w-[75.95px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon12 />
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[15px] left-[18px] not-italic text-[#d32f2f] text-[10px] top-[1.8px]">Rising Star</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex gap-[8px] h-[20px] items-center relative shrink-0 w-full" data-name="Container">
      <Paragraph9 />
      <Text2 />
    </div>
  );
}

function Icon13() {
  return (
    <div className="absolute left-0 size-[12px] top-[1.99px]" data-name="Icon">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p2023d200} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p2d617c80} id="Vector_2" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Container30() {
  return (
    <div className="h-[15.988px] relative shrink-0 w-full" data-name="Container">
      <Icon13 />
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-[16px] not-italic text-[#717182] text-[12px] top-0">Johor Bahru, Johor</p>
    </div>
  );
}

function Container28() {
  return (
    <div className="flex-[1_0_0] h-[37.987px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative size-full">
        <Container29 />
        <Container30 />
      </div>
    </div>
  );
}

function Icon14() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p39be50} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container31() {
  return (
    <div className="bg-[#d32f2f] relative rounded-[26843500px] shrink-0 size-[24px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon14 />
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[48px] items-center left-[17.6px] top-[17.6px] w-[339.6px]" data-name="Container">
      <ImageKevinTan1 />
      <Container28 />
      <Container31 />
    </div>
  );
}

function Button10() {
  return (
    <div className="bg-[rgba(211,47,47,0.05)] h-[83.2px] relative rounded-[16px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#d32f2f] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <Container27 />
    </div>
  );
}

function ImageSitiFatimah() {
  return (
    <div className="relative rounded-[26843500px] shrink-0 size-[48px]" data-name="Image (Siti Fatimah)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-cover pointer-events-none rounded-[26843500px] size-full" src={imgImageSitiFatimah} />
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="h-[20px] relative shrink-0 w-[78.738px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-0 not-italic text-[#222] text-[14px] top-[0.6px]">Siti Fatimah</p>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex h-[20px] items-center relative shrink-0 w-full" data-name="Container">
      <Paragraph10 />
    </div>
  );
}

function Icon15() {
  return (
    <div className="absolute left-0 size-[12px] top-[1.99px]" data-name="Icon">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p2023d200} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p2d617c80} id="Vector_2" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Container35() {
  return (
    <div className="h-[15.988px] relative shrink-0 w-full" data-name="Container">
      <Icon15 />
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-[16px] not-italic text-[#717182] text-[12px] top-0">Kuantan, Pahang</p>
    </div>
  );
}

function Container33() {
  return (
    <div className="flex-[1_0_0] h-[37.987px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative size-full">
        <Container34 />
        <Container35 />
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[48px] items-center left-[17.6px] top-[17.6px] w-[339.6px]" data-name="Container">
      <ImageSitiFatimah />
      <Container33 />
    </div>
  );
}

function Button11() {
  return (
    <div className="h-[83.2px] relative rounded-[16px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[1.6px] border-[rgba(0,0,0,0.08)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <Container32 />
    </div>
  );
}

function ImageJessicaWong() {
  return (
    <div className="relative rounded-[26843500px] shrink-0 size-[48px]" data-name="Image (Jessica Wong)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-cover pointer-events-none rounded-[26843500px] size-full" src={imgImageJessicaWong} />
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="h-[20px] relative shrink-0 w-[94.725px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-0 not-italic text-[#222] text-[14px] top-[0.6px]">Jessica Wong</p>
      </div>
    </div>
  );
}

function Icon16() {
  return (
    <div className="absolute left-[6px] size-[10px] top-[4.5px]" data-name="Icon">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
        <g id="Icon">
          <path d={svgPaths.p57a9580} id="Vector" stroke="var(--stroke-0, #D32F2F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333" />
          <path d={svgPaths.p2926d600} id="Vector_2" stroke="var(--stroke-0, #D32F2F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333" />
        </g>
      </svg>
    </div>
  );
}

function Text3() {
  return (
    <div className="bg-[rgba(211,47,47,0.1)] h-[19px] relative rounded-[26843500px] shrink-0 w-[114.45px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon16 />
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[15px] left-[18px] not-italic text-[#d32f2f] text-[10px] top-[1.8px]">Multilingual Expert</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex gap-[8px] h-[20px] items-center relative shrink-0 w-full" data-name="Container">
      <Paragraph11 />
      <Text3 />
    </div>
  );
}

function Icon17() {
  return (
    <div className="absolute left-0 size-[12px] top-[1.99px]" data-name="Icon">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p2023d200} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p2d617c80} id="Vector_2" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Container39() {
  return (
    <div className="h-[15.988px] relative shrink-0 w-full" data-name="Container">
      <Icon17 />
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-[16px] not-italic text-[#717182] text-[12px] top-0">Kota Kinabalu, Sabah</p>
    </div>
  );
}

function Container37() {
  return (
    <div className="flex-[1_0_0] h-[37.987px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative size-full">
        <Container38 />
        <Container39 />
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[48px] items-center left-[17.6px] top-[17.6px] w-[339.6px]" data-name="Container">
      <ImageJessicaWong />
      <Container37 />
    </div>
  );
}

function Button12() {
  return (
    <div className="h-[83.2px] relative rounded-[16px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[1.6px] border-[rgba(0,0,0,0.08)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <Container36 />
    </div>
  );
}

function Container18() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[430px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start overflow-clip pl-[20px] pr-[35.2px] pt-[16px] relative rounded-[inherit] size-full">
        <Button8 />
        <Button9 />
        <Button10 />
        <Button11 />
        <Button12 />
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[505.238px] items-start left-[295px] rounded-tl-[16px] rounded-tr-[16px] top-[89.16px] w-[430px]" data-name="Container">
      <Container15 />
      <Container17 />
      <Container18 />
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute h-[594.4px] left-0 top-[128px] w-[1020px]" data-name="Container">
      <Container13 />
      <Container14 />
    </div>
  );
}

function Icon18() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[20px]" data-name="Icon">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute bottom-[12.5%] left-[37.5%] right-[37.5%] top-1/2" data-name="Vector">
          <div className="absolute inset-[-8.33%_-12.5%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.25 8.75">
              <path d={svgPaths.p24471a00} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[8.34%_12.5%_12.5%_12.5%]" data-name="Vector">
          <div className="absolute inset-[-3.95%_-4.17%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.25 17.0829">
              <path d={svgPaths.p111c8880} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[30.825px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] left-0 not-italic text-[#717182] text-[11px] top-[0.6px]">Home</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="h-[56.5px] relative shrink-0 w-[62.825px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-center py-[8px] relative size-full">
        <Icon18 />
        <Text4 />
      </div>
    </div>
  );
}

function Icon19() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[20px]" data-name="Icon">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute inset-[29.17%_8.33%]" data-name="Vector">
          <div className="absolute inset-[-7.5%_-3.75%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.9167 9.58333">
              <path d={svgPaths.p1b431798} id="Vector" stroke="var(--stroke-0, #D32F2F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[62.5%_62.5%_20.83%_20.83%]" data-name="Vector">
          <div className="absolute inset-[-18.75%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.58333 4.58333">
              <path d={svgPaths.p3eebe600} id="Vector" stroke="var(--stroke-0, #D32F2F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[70.83%_37.5%_29.17%_37.5%]" data-name="Vector">
          <div className="absolute inset-[-0.63px_-12.5%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.25 1.25">
              <path d="M0.625 0.625H5.625" id="Vector" stroke="var(--stroke-0, #D32F2F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[62.5%_20.83%_20.83%_62.5%]" data-name="Vector">
          <div className="absolute inset-[-18.75%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.58333 4.58333">
              <path d={svgPaths.p3eebe600} id="Vector" stroke="var(--stroke-0, #D32F2F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[38.163px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] left-0 not-italic text-[#d32f2f] text-[11px] top-[0.6px]">Models</p>
      </div>
    </div>
  );
}

function Link3() {
  return (
    <div className="h-[56.5px] relative shrink-0 w-[70.162px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-center py-[8px] relative size-full">
        <Icon19 />
        <Text5 />
      </div>
    </div>
  );
}

function Icon20() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[20px]" data-name="Icon">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute inset-[8.33%_16.67%]" data-name="Vector">
          <div className="absolute inset-[-3.75%_-4.69%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.5833 17.9167">
              <path d={svgPaths.p309a7f00} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-3/4 left-[33.33%] right-[33.33%] top-1/4" data-name="Vector">
          <div className="absolute inset-[-0.63px_-9.38%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.91667 1.25">
              <path d="M0.625 0.625H7.29167" id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-1/4 left-[66.67%] right-[33.33%] top-[58.33%]" data-name="Vector">
          <div className="absolute inset-[-18.75%_-0.63px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.25 4.58333">
              <path d="M0.625 0.625V3.95833" id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[41.67%_33.29%_58.33%_66.67%]" data-name="Vector">
          <div className="absolute inset-[-0.63px_-0.62px_-0.63px_-0.63px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.25833 1.25">
              <path d="M0.625 0.625H0.633334" id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-[58.33%] left-1/2 right-[49.96%] top-[41.67%]" data-name="Vector">
          <div className="absolute inset-[-0.63px_-0.62px_-0.63px_-0.63px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.25833 1.25">
              <path d="M0.625 0.625H0.633334" id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[41.67%_66.62%_58.33%_33.33%]" data-name="Vector">
          <div className="absolute inset-[-0.63px_-0.62px_-0.63px_-0.63px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.25833 1.25">
              <path d="M0.625 0.625H0.633334" id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-[41.67%] left-1/2 right-[49.96%] top-[58.33%]" data-name="Vector">
          <div className="absolute inset-[-0.63px_-0.62px_-0.63px_-0.63px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.25833 1.25">
              <path d="M0.625 0.625H0.633334" id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[58.33%_66.62%_41.67%_33.33%]" data-name="Vector">
          <div className="absolute inset-[-0.63px_-0.62px_-0.63px_-0.63px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.25833 1.25">
              <path d="M0.625 0.625H0.633334" id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-1/4 left-1/2 right-[49.96%] top-3/4" data-name="Vector">
          <div className="absolute inset-[-0.63px_-0.62px_-0.63px_-0.63px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.25833 1.25">
              <path d="M0.625 0.625H0.633334" id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-1/4 left-[33.33%] right-[66.62%] top-3/4" data-name="Vector">
          <div className="absolute inset-[-0.63px_-0.62px_-0.63px_-0.63px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.25833 1.25">
              <path d="M0.625 0.625H0.633334" id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Text6() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[52.737px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] left-0 not-italic text-[#717182] text-[11px] top-[0.6px]">Calculator</p>
      </div>
    </div>
  );
}

function Link4() {
  return (
    <div className="h-[56.5px] relative shrink-0 w-[84.738px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-center py-[8px] relative size-full">
        <Icon20 />
        <Text6 />
      </div>
    </div>
  );
}

function Icon21() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[20px]" data-name="Icon">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute inset-[62.5%_20.83%_12.5%_20.83%]" data-name="Vector">
          <div className="absolute inset-[-12.5%_-5.36%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.9167 6.25">
              <path d={svgPaths.p3035fba0} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[12.5%_33.33%_54.17%_33.33%]" data-name="Vector">
          <div className="absolute inset-[-9.38%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.91667 7.91667">
              <path d={svgPaths.p216f0100} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Text7() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[33.4px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] left-0 not-italic text-[#717182] text-[11px] top-[0.6px]">Profile</p>
      </div>
    </div>
  );
}

function Link5() {
  return (
    <div className="h-[56.5px] relative shrink-0 w-[65.4px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-center py-[8px] relative size-full">
        <Icon21 />
        <Text7 />
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="h-[64px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pl-[18.35px] pr-[18.363px] relative size-full">
          <Link2 />
          <Link3 />
          <Link4 />
          <Link5 />
        </div>
      </div>
    </div>
  );
}

function Navigation() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[64.8px] items-start left-0 pt-[0.8px] px-[295px] top-[657.6px] w-[1020px]" data-name="Navigation">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.08)] border-solid border-t-[0.8px] inset-0 pointer-events-none" />
      <Container40 />
    </div>
  );
}

export default function OslAutosalesDesignInstructions() {
  return (
    <div className="bg-white relative size-full" data-name="OSL AUTOSALES Design Instructions">
      <Ty />
      <Button6 />
      <Container12 />
      <Navigation />
    </div>
  );
}