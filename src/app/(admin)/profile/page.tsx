import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ChangePassword from "@/components/Auth/ChangePassword";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[970px]">
      <Breadcrumb pageName="Profile" />
      <ChangePassword />
    </div>
  );
}
