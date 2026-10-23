import { fireEvent,render,screen,waitFor } from "@testing-library/react";
import { QueryClient,QueryClientProvider } from "@tanstack/react-query";
import { describe,expect,it,vi } from "vitest";
import { ReportForm } from "@/components/ReportForm";
const insert=vi.hoisted(()=>vi.fn().mockResolvedValue({error:null}));
vi.mock("@/integrations/supabase/client",()=>({supabase:{from:vi.fn(()=>({insert}))}}));
vi.mock("sonner",()=>({toast:{success:vi.fn(),error:vi.fn()}}));
describe("report submissions",()=>{
 it("sends a general report under the signed-in student's ID",async()=>{
  render(<QueryClientProvider client={new QueryClient()}><ReportForm userId="student-123"/></QueryClientProvider>);
  fireEvent.click(screen.getByRole("button",{name:"আমাদের জানাও"}));
  fireEvent.change(screen.getByRole("textbox",{name:"আপনার বার্তা"}),{target:{value:"  একটি প্রশ্ন আছে  "}});
  fireEvent.click(screen.getByRole("button",{name:"পাঠাও"}));
  await waitFor(()=>expect(insert).toHaveBeenCalledWith({user_id:"student-123",question_id:null,kind:"general",message:"একটি প্রশ্ন আছে"}));
 });
 it("links a question-error report to the supplied question",async()=>{
  render(<QueryClientProvider client={new QueryClient()}><ReportForm userId="student-123" questionId="question-456"/></QueryClientProvider>);
  fireEvent.click(screen.getByRole("button",{name:"ভুল রিপোর্ট করো"}));
  fireEvent.change(screen.getByRole("textbox",{name:"আপনার বার্তা"}),{target:{value:"উত্তরে ভুল"}});
  fireEvent.click(screen.getByRole("button",{name:"পাঠাও"}));
  await waitFor(()=>expect(insert).toHaveBeenCalledWith({user_id:"student-123",question_id:"question-456",kind:"question_error",message:"উত্তরে ভুল"}));
 });
});