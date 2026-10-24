import { AdminTitle } from "@/components/admin/AdminUI";
import { Tabs,TabsList,TabsTrigger,TabsContent } from "@/components/ui/tabs";
import { SiteContacts,WhatsAppSettings } from "@/components/admin/SiteContacts";
import { BlogAdmin } from "@/components/admin/BlogAdmin";
import { AnnouncementsAdmin } from "@/components/admin/AnnouncementsAdmin";
export function SiteSettingsAdmin(){return <><AdminTitle title="সাইট সেটিংস"/><Tabs defaultValue="announcements"><TabsList className="mb-6 flex h-auto w-fit flex-wrap"><TabsTrigger value="announcements">ঘোষণা বোর্ড</TabsTrigger><TabsTrigger value="contacts">যোগাযোগ</TabsTrigger><TabsTrigger value="whatsapp">পেমেন্টের WhatsApp</TabsTrigger><TabsTrigger value="blog">ব্লগ ও আর্টিকেল</TabsTrigger></TabsList><TabsContent value="announcements"><AnnouncementsAdmin/></TabsContent><TabsContent value="contacts"><SiteContacts/></TabsContent><TabsContent value="whatsapp"><WhatsAppSettings/></TabsContent><TabsContent value="blog"><BlogAdmin/></TabsContent></Tabs></>;}
