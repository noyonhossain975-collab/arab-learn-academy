import { describe,expect,it } from "vitest";
import { contactHref,unreadReply,validateWhatsApp } from "@/lib/site-settings";
describe("reports and contact rules",()=>{
 it("opens email contacts through mailto",()=>{expect(contactHref("email","teacher@example.com")).toBe("mailto:teacher@example.com");});
 it("shows unread replies until the student marks them read",()=>{expect(unreadReply({admin_reply:"উত্তর",reply_seen_by_student:false})).toBe(true);expect(unreadReply({admin_reply:"উত্তর",reply_seen_by_student:true})).toBe(false);expect(unreadReply({admin_reply:null,reply_seen_by_student:false})).toBe(false);});
 it("requires the plan price name and email placeholders",()=>{const template="{plan} {price} {name} {email}";expect(validateWhatsApp("8801700000000",template)).toBeNull();for(const key of ["plan","price","name","email"])expect(validateWhatsApp("8801700000000",template.replace(`{${key}}`,""))).not.toBeNull();});
 it("rejects executable contact links",()=>{expect(contactHref("other","javascript:alert(1)")).toBeNull();expect(contactHref("other","https://example.com")).toBe("https://example.com/");});
 it("opens a WhatsApp number as a wa.me link",()=>{expect(contactHref("whatsapp","+880 1700-000000")).toBe("https://wa.me/8801700000000");});
});